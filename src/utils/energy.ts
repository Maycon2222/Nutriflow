import {
  ActivityLevel,
  EnergyFormula,
  MacroMethod,
  PatientObjective,
  Sex,
} from "@prisma/client";
import { ACTIVITY_LEVEL_OPTIONS } from "@/models/patient";

type EnergyInput = {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  objective: PatientObjective;
  formula: EnergyFormula;
};

type MacroInput = {
  method: MacroMethod;
  carbsInput: number;
  proteinInput: number;
  fatInput: number;
  suggestedKcal: number;
  weightKg: number;
};

export function calculateBasalMetabolism({ weightKg, heightCm, age, sex, formula }: Omit<EnergyInput, "activityLevel" | "objective">) {
  if (formula === EnergyFormula.HARRIS_BENEDICT) {
    if (sex === Sex.MALE) {
      return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
    }
    return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === Sex.MALE ? base + 5 : base - 161;
}

export function calculateEnergy({ weightKg, heightCm, age, sex, activityLevel, objective, formula }: EnergyInput) {
  const basalMetabolism = calculateBasalMetabolism({ weightKg, heightCm, age, sex, formula });
  const activityFactor = ACTIVITY_LEVEL_OPTIONS.find((item) => item.value === activityLevel)?.factor ?? 1.2;
  const totalEnergySpend = basalMetabolism * activityFactor;

  let suggestedKcal = totalEnergySpend;
  let objectiveExplanation = "calorias de manutencao";

  if (objective === PatientObjective.WEIGHT_LOSS) {
    suggestedKcal = totalEnergySpend * 0.8;
    objectiveExplanation = "deficit calorico moderado de 20%";
  } else if (objective === PatientObjective.HYPERTROPHY) {
    suggestedKcal = totalEnergySpend * 1.12;
    objectiveExplanation = "superavit calorico moderado de 12%";
  }

  const formulaLabel = formula === EnergyFormula.HARRIS_BENEDICT ? "Harris-Benedict" : "Mifflin-St Jeor";
  const explanation = `TMB pelo metodo ${formulaLabel}, fator de atividade ${activityFactor} e ${objectiveExplanation}.`;

  return {
    basalMetabolism,
    activityFactor,
    totalEnergySpend,
    suggestedKcal,
    explanation,
  };
}

export function calculateMacros({ method, carbsInput, proteinInput, fatInput, suggestedKcal, weightKg }: MacroInput) {
  let carbsGrams = 0;
  let proteinGrams = 0;
  let fatGrams = 0;

  if (method === MacroMethod.PERCENTAGE) {
    carbsGrams = (suggestedKcal * (carbsInput / 100)) / 4;
    proteinGrams = (suggestedKcal * (proteinInput / 100)) / 4;
    fatGrams = (suggestedKcal * (fatInput / 100)) / 9;
  } else {
    carbsGrams = carbsInput * weightKg;
    proteinGrams = proteinInput * weightKg;
    fatGrams = fatInput * weightKg;
  }

  const carbsKcal = carbsGrams * 4;
  const proteinKcal = proteinGrams * 4;
  const fatKcal = fatGrams * 9;

  return {
    carbsGrams,
    proteinGrams,
    fatGrams,
    carbsKcal,
    proteinKcal,
    fatKcal,
  };
}
