import { SkinfoldProtocol } from "@prisma/client";

export const SKINFOLD_PROTOCOL_OPTIONS = [
  { value: SkinfoldProtocol.POLLOCK_7, label: "Pollock 7 dobras" },
  { value: SkinfoldProtocol.GUEDES_3, label: "Guedes 3 dobras" },
  { value: SkinfoldProtocol.PETROSKI_4, label: "Petroski 4 dobras" },
];

export const PROTOCOL_FOLDS: Record<SkinfoldProtocol, Array<{ key: string; label: string }>> = {
  POLLOCK_7: [
    { key: "chest", label: "Peitoral" },
    { key: "midaxillary", label: "Axilar media" },
    { key: "triceps", label: "Triceps" },
    { key: "subscapular", label: "Subescapular" },
    { key: "abdomen", label: "Abdominal" },
    { key: "suprailiac", label: "Suprailiaca" },
    { key: "thigh", label: "Coxa" },
  ],
  GUEDES_3: [
    { key: "triceps", label: "Triceps" },
    { key: "suprailiac", label: "Suprailiaca" },
    { key: "abdomen", label: "Abdominal" },
  ],
  PETROSKI_4: [
    { key: "triceps", label: "Triceps" },
    { key: "subscapular", label: "Subescapular" },
    { key: "suprailiac", label: "Suprailiaca" },
    { key: "calf", label: "Panturrilha medial" },
  ],
};
