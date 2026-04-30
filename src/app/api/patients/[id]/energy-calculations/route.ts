import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { calculateEnergy, calculateMacros } from "@/utils/energy";
import { energyCalculationSchema } from "@/utils/validation";
import { apiError } from "@/app/api/_helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = energyCalculationSchema.parse(body);

    const patient = await prisma.patient.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!patient) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

    const result = calculateEnergy(parsed);
    const macros = calculateMacros({
      method: parsed.macroMethod,
      carbsInput: parsed.carbsInput,
      proteinInput: parsed.proteinInput,
      fatInput: parsed.fatInput,
      suggestedKcal: result.suggestedKcal,
      weightKg: parsed.weightKg,
    });

    const calculation = await prisma.energyCalculation.create({
      data: {
        patientId: id,
        ...parsed,
        ...result,
        ...macros,
      },
    });

    return NextResponse.json(calculation, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
