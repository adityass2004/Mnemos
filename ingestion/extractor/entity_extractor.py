import re
from typing import Any
from ingestion.extractor.models import ExtractedEntities

class EntityExtractor:
    def extract_from_chunk(self, chunk_text: str) -> ExtractedEntities:
        equipment_patterns = [r"(boiler-\d+)", r"(pump-\d+)", r"(valve-\d+)", r"(heater-\d+)"]
        incident_patterns = [r"(INC-\d+)", r"(leak\w*)", r"(rupture\w*)", r"(spike\w*)"]
        regulation_patterns = [r"(OSHA\s*\d+\.\d+)", r"(ISO\s*\d+)"]
        date_patterns = [r"(\b\d{4}-\d{2}-\d{2}\b)", r"(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b)"]
        technician_patterns = [r"(Operator\s+[A-Z][a-z]+)", r"(Technician\s+[A-Z][a-z]+)"]
        
        equipment = []
        for p in equipment_patterns:
            equipment.extend(re.findall(p, chunk_text, re.IGNORECASE))
            
        incidents = []
        for p in incident_patterns:
            incidents.extend(re.findall(p, chunk_text, re.IGNORECASE))
            
        regulations = []
        for p in regulation_patterns:
            regulations.extend(re.findall(p, chunk_text, re.IGNORECASE))
            
        dates = []
        for p in date_patterns:
            dates.extend(re.findall(p, chunk_text, re.IGNORECASE))
            
        technicians = []
        for p in technician_patterns:
            technicians.extend(re.findall(p, chunk_text, re.IGNORECASE))

        parameters: dict[str, Any] = {}
        pressure_match = re.search(r"(\d+)\s*psi", chunk_text, re.IGNORECASE)
        if pressure_match:
            parameters["pressure"] = f"{pressure_match.group(1)} psi"
            
        temp_match = re.search(r"(\d+)\s*(?:°C|deg\s*C)", chunk_text, re.IGNORECASE)
        if temp_match:
            parameters["temperature"] = f"{temp_match.group(1)} °C"

        return ExtractedEntities(
            equipment=list(set(equipment)),
            incidents=list(set(incidents)),
            regulations=list(set(regulations)),
            dates=list(set(dates)),
            technicians=list(set(technicians)),
            parameters=parameters
        )
