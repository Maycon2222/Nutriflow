export const BODY_MEASUREMENT_OPTIONS = [
  { value: "ABDOMEN", label: "Abdominal" },
  { value: "WAIST", label: "Cintura" },
  { value: "HIP", label: "Quadril" },
  { value: "CHEST", label: "Peitoral" },
  { value: "ARM", label: "Braço relaxado" },
  { value: "TRICEPS", label: "Tríceps" },
  { value: "BACK", label: "Dorsal/Subescapular" },
  { value: "THIGH", label: "Coxa" },
  { value: "CALF", label: "Panturrilha" },
  { value: "NECK", label: "Pescoço" },
];

export const BODY_MEASUREMENT_UNITS = [
  { value: "cm", label: "cm" },
  { value: "mm", label: "mm" },
  { value: "%", label: "%" },
] as const;

export const alcoholOptions = [
  "Não consome",
  "Social (eventual)",
  "Semanal (1-2x por semana)",
  "Frequente (3x+ por semana)",
];

export const smokingOptions = ["Nunca fumou", "Ex-tabagista", "Tabagista ativo"];

export const bowelOptions = ["Regular", "Constipação", "Diarreia", "Alternado"];

export const physicalActivityOptions = ["Não pratica", "Pratica"];

export const physicalActivityFrequencyOptions = [
  "Não se aplica",
  "1-2x por semana",
  "3-4x por semana",
  "5x+ por semana",
];
