import { ActivityLevel, EnergyFormula, MacroMethod, PatientObjective } from "@prisma/client";

export const objectiveLabel: Record<PatientObjective, string> = {
  WEIGHT_LOSS: "Emagrecimento",
  HYPERTROPHY: "Hipertrofia",
  MAINTENANCE: "Manutencao",
  HEALTH: "Saude",
  PERFORMANCE: "Performance",
  OTHER: "Outro",
};

export const activityLabel: Record<ActivityLevel, string> = {
  SEDENTARY: "Sedentario",
  LIGHT: "Leve",
  MODERATE: "Moderado",
  INTENSE: "Intenso",
  VERY_INTENSE: "Muito intenso",
};

export const energyFormulaLabel: Record<EnergyFormula, string> = {
  MIFFLIN_ST_JEOR: "Mifflin-St Jeor",
  HARRIS_BENEDICT: "Harris-Benedict",
};

export const macroMethodLabel: Record<MacroMethod, string> = {
  PERCENTAGE: "Percentual",
  G_PER_KG: "g/kg",
};
