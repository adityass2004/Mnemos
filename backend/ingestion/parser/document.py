from dataclasses import dataclass, field
from typing import Any

@dataclass
class Document:
    title: str
    content: str
    metadata: dict[str, Any] = field(default_factory=dict)
    source_type: str = "unknown"
