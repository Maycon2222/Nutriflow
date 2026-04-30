from dataclasses import dataclass
from typing import Dict


@dataclass
class AnthropometryInput:
    protocol: str
    sex: str
    age: int
    body_weight_kg: float
    folds_mm: Dict[str, float]


@dataclass
class AnthropometryResult:
    sum_of_folds: float
    body_density: float
    body_fat_percent: float
    lean_mass_kg: float
