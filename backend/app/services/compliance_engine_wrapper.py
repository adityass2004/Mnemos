class ComplianceEngineWrapper:
    async def evaluate_procedure(self, procedure_text: str, rules: list[str]) -> dict[str, list[str]]:
        return {
            "passed_rules": ["Rule OSHA-1", "Rule OSHA-2"],
            "failed_rules": []
        }
