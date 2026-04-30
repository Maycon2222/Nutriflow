from dataclasses import asdict
from typing import Any, Dict


class JsonReportBuilder:
    @staticmethod
    def anthropometry_payload(result: Any, metadata: Dict[str, Any]) -> Dict[str, Any]:
        payload = {"metadata": metadata, "result": asdict(result)}
        return payload
