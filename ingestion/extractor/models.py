from dataclasses import dataclass, field
from typing import Any

@dataclass
class ExtractedEntities:
    equipment: list[str] = field(default_factory=list)
    incidents: list[str] = field(default_factory=list)
    regulations: list[str] = field(default_factory=list)
    dates: list[str] = field(default_factory=list)
    technicians: list[str] = field(default_factory=list)
    parameters: dict[str, Any] = field(default_factory=dict)

@dataclass
class ChunkResult:
    chunk_id: str
    text: str
    entities: ExtractedEntities
