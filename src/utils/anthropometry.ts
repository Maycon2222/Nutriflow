import { Sex, SkinfoldProtocol } from "@prisma/client";
import { PROTOCOL_FOLDS } from "@/models/anthropometry";

export type FoldMap = Record<string, number>;

type Input = {
  protocol: SkinfoldProtocol;
  sex: Sex;
  age: number;
  bodyWeightKg: number;
  folds: FoldMap;
};

function sumProtocolFolds(protocol: SkinfoldProtocol, folds: FoldMap) {
  const keys = PROTOCOL_FOLDS[protocol].map((item) => item.key);
  return keys.reduce((acc, key) => acc + Number(folds[key] ?? 0), 0);
}

function calcDensity(protocol: SkinfoldProtocol, sex: Sex, age: number, sum: number) {
  if (protocol === SkinfoldProtocol.POLLOCK_7) {
    if (sex === Sex.MALE) {
      return 1.112 - 0.00043499 * sum + 0.00000055 * sum ** 2 - 0.00028826 * age;
    }
    return 1.097 - 0.00046971 * sum + 0.00000056 * sum ** 2 - 0.00012828 * age;
  }

  if (protocol === SkinfoldProtocol.GUEDES_3) {
    if (sum <= 0) throw new Error("Somatorio de dobras invalido para Guedes.");
    if (sex === Sex.MALE) {
      return 1.17136 - 0.06706 * Math.log10(sum);
    }
    return 1.1665 - 0.07063 * Math.log10(sum);
  }

  // Petroski 4 dobras (estimativa com ajuste por idade)
  if (sex === Sex.MALE) {
    return 1.10726863 - 0.00081201 * sum + 0.00000212 * sum ** 2 - 0.00041761 * age;
  }
  return 1.02902361 - 0.00067159 * sum + 0.00000242 * sum ** 2 - 0.00026073 * age;
}

export function calculateAnthropometricAssessment({ protocol, sex, age, bodyWeightKg, folds }: Input) {
  const sumOfFolds = sumProtocolFolds(protocol, folds);
  if (sumOfFolds <= 0) throw new Error("Informe as dobras para o protocolo selecionado.");

  const bodyDensity = calcDensity(protocol, sex, age, sumOfFolds);
  const bodyFatPercent = (495 / bodyDensity) - 450;
  const leanMassKg = bodyWeightKg * (1 - bodyFatPercent / 100);

  return {
    sumOfFolds,
    bodyDensity,
    bodyFatPercent,
    leanMassKg,
  };
}

export function parseFoldsJson(raw?: string | null): FoldMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as FoldMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}
