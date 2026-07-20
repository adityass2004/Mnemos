from pydantic import BaseModel

class CopilotOutput(BaseModel):
    message: str
    suggested_steps: list[str]

class RcaOutput(BaseModel):
    possible_causes: list[str]
    confidence_scores: dict[str, float]
    recommended_tests: list[str]

class LessonsOutput(BaseModel):
    historical_incidents: list[str]
    preventative_measures: list[str]

class ComplianceOutput(BaseModel):
    standards_checked: list[str]
    violations: list[str]
    passed: bool
