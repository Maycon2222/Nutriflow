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

type AnthropometryMacroInput = {
  objective: PatientObjective;
  suggestedKcal: number;
  weightKg: number;
  leanMassKg: number;
  bodyFatPercent: number;
};

export type GoalPreset = "HYPERTROPHY" | "WEIGHT_LOSS" | "MAINTENANCE" | "RECOMPOSITION";
export type ProfilePreset = "UNDERWEIGHT" | "NORMAL" | "OVERWEIGHT" | "OBESE" | "ATHLETE";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export function calculateBasalMetabolism({ weightKg, heightCm, age, sex, formula }: Omit<EnergyInput, "activityLevel" | "objective">) {
  if (formula === EnergyFormula.HARRIS_BENEDICT) {
    if (sex === Sex.MALE) return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
    return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === Sex.MALE ? base + 5 : base - 161;
}

export function mapObjectiveToGoalPreset(objective: PatientObjective): GoalPreset {
  if (objective === PatientObjective.HYPERTROPHY || objective === PatientObjective.PERFORMANCE) return "HYPERTROPHY";
  if (objective === PatientObjective.WEIGHT_LOSS) return "WEIGHT_LOSS";
  if (objective === PatientObjective.MAINTENANCE) return "MAINTENANCE";
  return "RECOMPOSITION";
}

export function inferProfilePreset(weightKg: number, heightCm: number, activityLevel: ActivityLevel): ProfilePreset {
  const bmi = weightKg / (heightCm / 100) ** 2;
  if (activityLevel === ActivityLevel.VERY_INTENSE && bmi <= 27) return "ATHLETE";
  if (bmi < 18.5) return "UNDERWEIGHT";
  if (bmi < 25) return "NORMAL";
  if (bmi < 30) return "OVERWEIGHT";
  return "OBESE";
}

export function applyGoalCalories(getKcal: number, goal: GoalPreset, profile: ProfilePreset) {
  if (goal === "MAINTENANCE") {
    return { suggestedKcal: getKcal, strategyLabel: "Manutencao calorica (GET)." };
  }

  if (goal === "HYPERTROPHY") {
    const surplus = profile === "UNDERWEIGHT" ? 0.15 : profile === "ATHLETE" ? 0.12 : 0.1;
    return { suggestedKcal: getKcal * (1 + surplus), strategyLabel: `Superavit moderado de ${(surplus * 100).toFixed(0)}%.` };
  }

  if (goal === "WEIGHT_LOSS") {
    const deficit = profile === "OBESE" ? 0.2 : profile === "OVERWEIGHT" ? 0.15 : 0.12;
    return { suggestedKcal: getKcal * (1 - deficit), strategyLabel: `Deficit moderado de ${(deficit * 100).toFixed(0)}%.` };
  }

  const delta = profile === "UNDERWEIGHT" ? 0.05 : profile === "OBESE" ? -0.06 : -0.02;
  return {
    suggestedKcal: getKcal * (1 + delta),
    strategyLabel:
      delta >= 0
        ? `Recomposicao com leve superavit de ${(delta * 100).toFixed(0)}%.`
        : `Recomposicao com leve deficit de ${(Math.abs(delta) * 100).toFixed(0)}%.`,
  };
}

export function computeConfidenceLevel(input: {
  hasAnamnese: boolean;
  hasAnthropometry: boolean;
  hasBodyFat: boolean;
  hasMeasurements: boolean;
}): ConfidenceLevel {
  if (input.hasAnamnese && input.hasAnthropometry && input.hasBodyFat && input.hasMeasurements) return "HIGH";
  if (input.hasAnamnese || input.hasMeasurements || input.hasAnthropometry) return "MEDIUM";
  return "LOW";
}

export function calculateEnergy({ weightKg, heightCm, age, sex, activityLevel, objective, formula }: EnergyInput) {
  const basalMetabolism = calculateBasalMetabolism({ weightKg, heightCm, age, sex, formula });
  const activityFactor = ACTIVITY_LEVEL_OPTIONS.find((item) => item.value === activityLevel)?.factor ?? 1.2;
  const totalEnergySpend = basalMetabolism * activityFactor;

  const goal = mapObjectiveToGoalPreset(objective);
  const profile = inferProfilePreset(weightKg, heightCm, activityLevel);
  const calibrated = applyGoalCalories(totalEnergySpend, goal, profile);

  const formulaLabel = formula === EnergyFormula.HARRIS_BENEDICT ? "Harris-Benedict" : "Mifflin-St Jeor";
  const explanation = `TMB pelo metodo ${formulaLabel}, atividade ${activityFactor} e estrategia ${calibrated.strategyLabel.toLowerCase()}`;

  return {
    basalMetabolism,
    activityFactor,
    totalEnergySpend,
    suggestedKcal: calibrated.suggestedKcal,
    strategyLabel: calibrated.strategyLabel,
    goalPreset: goal,
    profilePreset: profile,
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
  const totalKcal = carbsKcal + proteinKcal + fatKcal;
  const diffKcal = totalKcal - suggestedKcal;
  const diffPercent = suggestedKcal > 0 ? (diffKcal / suggestedKcal) * 100 : 0;

  const carbsPercent = totalKcal > 0 ? (carbsKcal / totalKcal) * 100 : 0;
  const proteinPercent = totalKcal > 0 ? (proteinKcal / totalKcal) * 100 : 0;
  const fatPercent = totalKcal > 0 ? (fatKcal / totalKcal) * 100 : 0;

  return {
    carbsGrams,
    proteinGrams,
    fatGrams,
    carbsKcal,
    proteinKcal,
    fatKcal,
    totalKcal,
    diffKcal,
    diffPercent,
    carbsPercent,
    proteinPercent,
    fatPercent,
  };
}

export function calculateMacrosFromAnthropometry({
  objective,
  suggestedKcal,
  weightKg,
  leanMassKg,
  bodyFatPercent,
}: AnthropometryMacroInput) {
  const proteinFactorByObjective: Record<PatientObjective, number> = {
    [PatientObjective.WEIGHT_LOSS]: 2.4,
    [PatientObjective.HYPERTROPHY]: 2.2,
    [PatientObjective.MAINTENANCE]: 2.0,
    [PatientObjective.HEALTH]: 1.9,
    [PatientObjective.PERFORMANCE]: 2.1,
    [PatientObjective.OTHER]: 1.9,
  };
  const fatFactorByObjective: Record<PatientObjective, number> = {
    [PatientObjective.WEIGHT_LOSS]: 0.7,
    [PatientObjective.HYPERTROPHY]: 0.9,
    [PatientObjective.MAINTENANCE]: 0.8,
    [PatientObjective.HEALTH]: 0.8,
    [PatientObjective.PERFORMANCE]: 0.85,
    [PatientObjective.OTHER]: 0.8,
  };

  const proteinGrams = leanMassKg * proteinFactorByObjective[objective];
  const fatGrams = Math.max(weightKg * 0.6, weightKg * fatFactorByObjective[objective]);
  const remainingKcal = Math.max(0, suggestedKcal - (proteinGrams * 4 + fatGrams * 9));
  const carbsGrams = Math.max(weightKg * 0.5, remainingKcal / 4);

  const macros = calculateMacros({
    method: MacroMethod.G_PER_KG,
    carbsInput: carbsGrams / weightKg,
    proteinInput: proteinGrams / weightKg,
    fatInput: fatGrams / weightKg,
    suggestedKcal,
    weightKg,
  });

  return {
    ...macros,
    explanation:
      "Macros por composicao corporal: proteina por massa magra, gordura por peso e carboidrato pelo restante calorico.",
  };
}

export function convertPercentToGkg(input: {
  carbsPercent: number;
  proteinPercent: number;
  fatPercent: number;
  kcal: number;
  weightKg: number;
}) {
  return {
    carbs: (input.kcal * (input.carbsPercent / 100)) / 4 / input.weightKg,
    protein: (input.kcal * (input.proteinPercent / 100)) / 4 / input.weightKg,
    fat: (input.kcal * (input.fatPercent / 100)) / 9 / input.weightKg,
  };
}

export function convertGkgToPercent(input: {
  carbsGkg: number;
  proteinGkg: number;
  fatGkg: number;
  weightKg: number;
}) {
  const carbsKcal = input.carbsGkg * input.weightKg * 4;
  const proteinKcal = input.proteinGkg * input.weightKg * 4;
  const fatKcal = input.fatGkg * input.weightKg * 9;
  const total = carbsKcal + proteinKcal + fatKcal || 1;
  return {
    carbs: (carbsKcal / total) * 100,
    protein: (proteinKcal / total) * 100,
    fat: (fatKcal / total) * 100,
  };
}

export function buildMacroPresetByGoal(input: {
  goal: GoalPreset;
  profile: ProfilePreset;
}) {
  if (input.goal === "WEIGHT_LOSS") return { carbs: 3.2, protein: 2.2, fat: 0.8 };
  if (input.goal === "HYPERTROPHY") {
    if (input.profile === "UNDERWEIGHT") return { carbs: 6.0, protein: 2.0, fat: 1.0 };
    if (input.profile === "ATHLETE") return { carbs: 6.5, protein: 2.2, fat: 0.9 };
    return { carbs: 5.0, protein: 2.0, fat: 0.9 };
  }
  if (input.goal === "MAINTENANCE") return { carbs: 4.0, protein: 1.8, fat: 0.9 };
  if (input.profile === "OBESE") return { carbs: 2.8, protein: 2.2, fat: 0.8 };
  return { carbs: 4.2, protein: 2.0, fat: 0.9 };
}

export function validateGkgRanges(input: { carbs: number; protein: number; fat: number }) {
  const warnings: string[] = [];
  if (input.protein < 1.6 || input.protein > 2.4) warnings.push("Proteina fora da faixa usual (1.6 a 2.4 g/kg).");
  if (input.fat < 0.6 || input.fat > 1.3) warnings.push("Gordura fora da faixa usual (0.6 a 1.3 g/kg).");
  if (input.carbs < 3 || input.carbs > 7) warnings.push("Carboidrato fora da faixa usual (3 a 7 g/kg).");
  if (input.carbs > 12 || input.protein > 5 || input.fat > 4) warnings.push("Macro com valor extremo detectado. Revise.");
  return warnings;
}

export function clampMacroGkgValues(input: { carbs: number; protein: number; fat: number }) {
  return {
    carbs: Math.min(10, Math.max(1.5, input.carbs)),
    protein: Math.min(3.2, Math.max(1.2, input.protein)),
    fat: Math.min(2, Math.max(0.5, input.fat)),
  };
}
