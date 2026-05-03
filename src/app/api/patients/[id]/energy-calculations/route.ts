import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { calculateEnergy, calculateMacros, computeConfidenceLevel } from "@/utils/energy";
import { energyCalculationSchema } from "@/utils/validation";
import { apiError } from "@/app/api/_helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = energyCalculationSchema.parse(body);

    const patient = await prisma.patient.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        anamneses: { select: { id: true }, take: 1 },
        assessments: { select: { bodyFatPercent: true }, take: 1 },
        consultations: { select: { bodyMeasurements: true }, take: 3 },
      },
    });
    if (!patient) return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });

    const energy = calculateEnergy(parsed);
    const macros = calculateMacros({
      method: parsed.macroMethod,
      carbsInput: parsed.carbsInput,
      proteinInput: parsed.proteinInput,
      fatInput: parsed.fatInput,
      suggestedKcal: energy.suggestedKcal,
      weightKg: parsed.weightKg,
    });

    const confidenceLevel =
      parsed.confidenceLevel ??
      computeConfidenceLevel({
        hasAnamnese: patient.anamneses.length > 0,
        hasAnthropometry: patient.assessments.length > 0,
        hasBodyFat: patient.assessments.some((item) => item.bodyFatPercent > 0),
        hasMeasurements: patient.consultations.some((item) => Boolean(item.bodyMeasurements)),
      });

    const calculation = await prisma.energyCalculation.create({
      data: {
        patientId: id,
        age: parsed.age,
        sex: parsed.sex,
        weightKg: parsed.weightKg,
        heightCm: parsed.heightCm,
        activityLevel: parsed.activityLevel,
        objective: parsed.objective,
        formula: parsed.formula,
        macroMethod: parsed.macroMethod,
        carbInput: parsed.carbsInput,
        proteinInput: parsed.proteinInput,
        fatInput: parsed.fatInput,
        basalMetabolism: energy.basalMetabolism,
        activityFactor: energy.activityFactor,
        totalEnergySpend: energy.totalEnergySpend,
        suggestedKcal: energy.suggestedKcal,
        explanation: energy.explanation,
        carbsGrams: macros.carbsGrams,
        proteinGrams: macros.proteinGrams,
        fatGrams: macros.fatGrams,
        carbsKcal: macros.carbsKcal,
        proteinKcal: macros.proteinKcal,
        fatKcal: macros.fatKcal,
        recommendationStage: parsed.recommendationStage ?? "INITIAL_ESTIMATE",
        confidenceLevel,
        goalPreset: parsed.goalPreset ?? energy.goalPreset,
        profilePreset: parsed.profilePreset ?? energy.profilePreset,
        strategyLabel: energy.strategyLabel,
        macroDiffKcal: macros.diffKcal,
        macroDiffPercent: macros.diffPercent,
      },
    });

    return NextResponse.json(calculation, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
