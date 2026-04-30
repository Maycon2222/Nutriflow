import { BODY_MEASUREMENT_OPTIONS } from "@/models/clinical";

export type BodyMeasurementEntry = {
  type: string;
  value: number;
  unit: "cm" | "mm" | "%";
};

const measurementLabelMap = BODY_MEASUREMENT_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function parseBodyMeasurements(raw?: string | null): BodyMeasurementEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BodyMeasurementEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.type && Number(item.value) > 0);
  } catch {
    return [];
  }
}

export function getMeasurementLabel(type: string) {
  return measurementLabelMap[type] ?? type;
}
