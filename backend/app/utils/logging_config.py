import logging.config
from app.config.settings import settings

def setup_logging():
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "level": settings.LOG_LEVEL,
            }
        },
        "loggers": {
            "": {
                "handlers": ["console"],
                "level": settings.LOG_LEVEL,
                "propagate": True
            }
        }
    }
    logging.config.dictConfig(logging_config)
