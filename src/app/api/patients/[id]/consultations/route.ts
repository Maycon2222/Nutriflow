import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { consultationSchema } from "@/utils/validation";
import { apiError } from "@/app/api/_helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = consultationSchema.parse(body);

    const patient = await prisma.patient.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!patient) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

    const consultation = await prisma.consultation.create({
      data: {
        patientId: id,
        appointmentDate: new Date(parsed.appointmentDate),
        dayWeight: parsed.dayWeight,
        bodyMeasurements: JSON.stringify(parsed.bodyMeasurements ?? []),
        observations: parsed.observations,
        patientEvolution: parsed.patientEvolution,
        nutritionPlan: parsed.nutritionPlan,
        nextReturnDate: parsed.nextReturnDate ? new Date(parsed.nextReturnDate) : undefined,
      },
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
