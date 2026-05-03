export const GOAL_PRESET_OPTIONS = [
  { value: "HYPERTROPHY", label: "Hipertrofia" },
  { value: "WEIGHT_LOSS", label: "Emagrecimento" },
  { value: "MAINTENANCE", label: "Manutencao" },
  { value: "RECOMPOSITION", label: "Recomposicao corporal" },
] as const;

export const PROFILE_PRESET_OPTIONS = [
  { value: "UNDERWEIGHT", label: "Magro / baixo peso" },
  { value: "NORMAL", label: "Peso normal" },
  { value: "OVERWEIGHT", label: "Sobrepeso" },
  { value: "OBESE", label: "Obesidade" },
  { value: "ATHLETE", label: "Atleta / muito ativo" },
] as const;

export const STAGE_OPTIONS = [
  { value: "INITIAL_ESTIMATE", label: "Estimativa inicial" },
  { value: "FINAL_PRESCRIPTION", label: "Prescricao final" },
] as const;

export const CONFIDENCE_LABEL = {
  LOW: "Baixa",
  MEDIUM: "Media",
  HIGH: "Alta",
} as const;

