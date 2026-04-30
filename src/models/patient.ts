import {
  ActivityLevel,
  EnergyFormula,
  MacroMethod,
  PatientObjective,
  PatientStatus,
  Sex,
  SleepQuality,
  StressLevel,
} from "@prisma/client";

export const SEX_OPTIONS = [
  { label: "Feminino", value: Sex.FEMALE },
  { label: "Masculino", value: Sex.MALE },
  { label: "Outro", value: Sex.OTHER },
];

export const OBJECTIVE_OPTIONS = [
  { label: "Emagrecimento", value: PatientObjective.WEIGHT_LOSS },
  { label: "Hipertrofia", value: PatientObjective.HYPERTROPHY },
  { label: "Manutenção", value: PatientObjective.MAINTENANCE },
  { label: "Saúde", value: PatientObjective.HEALTH },
  { label: "Performance", value: PatientObjective.PERFORMANCE },
  { label: "Outro", value: PatientObjective.OTHER },
];

export const STATUS_OPTIONS = [
  { label: "Ativo", value: PatientStatus.ACTIVE },
  { label: "Inativo", value: PatientStatus.INACTIVE },
  { label: "Retorno pendente", value: PatientStatus.PENDING_RETURN },
];

export const ACTIVITY_LEVEL_OPTIONS = [
  { label: "Sedentário", value: ActivityLevel.SEDENTARY, factor: 1.2 },
  { label: "Leve (1-3x/semana)", value: ActivityLevel.LIGHT, factor: 1.375 },
  { label: "Moderado (3-5x/semana)", value: ActivityLevel.MODERATE, factor: 1.55 },
  { label: "Intenso (6-7x/semana)", value: ActivityLevel.INTENSE, factor: 1.725 },
  { label: "Muito intenso", value: ActivityLevel.VERY_INTENSE, factor: 1.9 },
];

export const SLEEP_QUALITY_OPTIONS = [
  { label: "Ruim", value: SleepQuality.POOR },
  { label: "Regular", value: SleepQuality.FAIR },
  { label: "Boa", value: SleepQuality.GOOD },
  { label: "Excelente", value: SleepQuality.EXCELLENT },
];

export const STRESS_LEVEL_OPTIONS = [
  { label: "Baixo", value: StressLevel.LOW },
  { label: "Moderado", value: StressLevel.MODERATE },
  { label: "Alto", value: StressLevel.HIGH },
];

export const ENERGY_FORMULA_OPTIONS = [
  { label: "Mifflin-St Jeor", value: EnergyFormula.MIFFLIN_ST_JEOR },
  { label: "Harris-Benedict", value: EnergyFormula.HARRIS_BENEDICT },
];

export const MACRO_METHOD_OPTIONS = [
  { label: "Percentual (%)", value: MacroMethod.PERCENTAGE },
  { label: "Gramas por kg (g/kg)", value: MacroMethod.G_PER_KG },
];

export const OBJECTIVE_TAG_OPTIONS = [
  { label: "Emagrecimento", value: "emagrecimento" },
  { label: "Hipertrofia", value: "hipertrofia" },
  { label: "Performance", value: "performance" },
  { label: "Saude metabolica", value: "saude-metabolica" },
  { label: "Reeducacao alimentar", value: "reeducacao" },
  { label: "Condicao clinica", value: "clinico" },
];
