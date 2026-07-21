import inspect
import json
import logging.config
import time
from typing import Any, Callable
from app.config.settings import settings


class CustomJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "name": record.name,
            "levelname": record.levelname,
            "message": record.getMessage()
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        # Add extra variables if any
        for key, val in record.__dict__.items():
            if key not in [
                "args", "asctime", "created", "exc_info", "exc_text", "filename",
                "funcName", "levelname", "levelno", "lineno", "module", "msecs",
                "message", "msg", "name", "pathname", "process", "processName",
                "relativeCreated", "stack_info", "thread", "threadName"
            ]:
                log_record[key] = val
                
        return json.dumps(log_record)


def setup_logging():
    # Use json formatter in production, or if configured
    use_json = settings.LOG_FORMAT == "json" or settings.APP_ENV == "production"
    handler_name = "json_console" if use_json else "console"

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            },
            "json": {
                "()": "app.utils.logging_config.CustomJsonFormatter"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "level": settings.LOG_LEVEL,
            },
            "json_console": {
                "class": "logging.StreamHandler",
                "formatter": "json",
                "level": settings.LOG_LEVEL,
            }
        },
        "loggers": {
            "": {
                "handlers": [handler_name],
                "level": settings.LOG_LEVEL,
                "propagate": True
            },
            "Mnemos": {
                "handlers": [handler_name],
                "level": settings.LOG_LEVEL,
                "propagate": False
            }
        }
    }
    logging.config.dictConfig(logging_config)


class PerformanceMetrics:
    def __init__(self):
        self.metrics: dict[str, list[float]] = {}
        self.logger = logging.getLogger("Mnemos.Metrics")

    def record(self, metric_name: str, duration_seconds: float):
        if metric_name not in self.metrics:
            self.metrics[metric_name] = []
        self.metrics[metric_name].append(duration_seconds)
        self.logger.debug(
            "Metric recorded",
            extra={"metric": metric_name, "duration_seconds": duration_seconds}
        )

    def get_stats(self, metric_name: str) -> dict[str, Any] | None:
        if metric_name not in self.metrics or len(self.metrics[metric_name]) == 0:
            return None
        durations = self.metrics[metric_name]
        return {
            "count": len(durations),
            "min": min(durations),
            "max": max(durations),
            "mean": sum(durations) / len(durations),
            "total": sum(durations)
        }

    def get_all_stats(self) -> dict[str, dict[str, Any]]:
        return {name: self.get_stats(name) for name in self.metrics}

    def timeit(self, metric_name: str) -> Callable:
        def decorator(func: Callable) -> Callable:
            if inspect.iscoroutinefunction(func):
                async def async_wrapper(*args, **kwargs):
                    start = time.perf_counter()
                    try:
                        return await func(*args, **kwargs)
                    finally:
                        self.record(metric_name, time.perf_counter() - start)
                return async_wrapper
            else:
                def sync_wrapper(*args, **kwargs):
                    start = time.perf_counter()
                    try:
                        return func(*args, **kwargs)
                    finally:
                        self.record(metric_name, time.perf_counter() - start)
                return sync_wrapper
        return decorator


# Initialize global metrics
performance_metrics = PerformanceMetrics()

