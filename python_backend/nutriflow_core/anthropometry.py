import math
from .models import AnthropometryInput, AnthropometryResult


class AnthropometryCalculator:
    PROTOCOL_FOLDS = {
        "POLLOCK_7": ["chest", "midaxillary", "triceps", "subscapular", "abdomen", "suprailiac", "thigh"],
        "GUEDES_3": ["triceps", "suprailiac", "abdomen"],
        "PETROSKI_4": ["triceps", "subscapular", "suprailiac", "calf"],
    }

    @classmethod
    def calculate(cls, data: AnthropometryInput) -> AnthropometryResult:
        keys = cls.PROTOCOL_FOLDS[data.protocol]
        sum_of_folds = sum(float(data.folds_mm.get(key, 0)) for key in keys)

        if data.protocol == "POLLOCK_7":
            if data.sex == "MALE":
                density = 1.112 - 0.00043499 * sum_of_folds + 0.00000055 * (sum_of_folds ** 2) - 0.00028826 * data.age
            else:
                density = 1.097 - 0.00046971 * sum_of_folds + 0.00000056 * (sum_of_folds ** 2) - 0.00012828 * data.age
        elif data.protocol == "GUEDES_3":
            if data.sex == "MALE":
                density = 1.17136 - 0.06706 * math.log10(sum_of_folds)
            else:
                density = 1.16650 - 0.07063 * math.log10(sum_of_folds)
        else:
            if data.sex == "MALE":
                density = 1.10726863 - 0.00081201 * sum_of_folds + 0.00000212 * (sum_of_folds ** 2) - 0.00041761 * data.age
            else:
                density = 1.02902361 - 0.00067159 * sum_of_folds + 0.00000242 * (sum_of_folds ** 2) - 0.00026073 * data.age

        body_fat = (495 / density) - 450
        lean_mass = data.body_weight_kg * (1 - body_fat / 100)

        return AnthropometryResult(
            sum_of_folds=sum_of_folds,
            body_density=density,
            body_fat_percent=body_fat,
            lean_mass_kg=lean_mass,
        )
