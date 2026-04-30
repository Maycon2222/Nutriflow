import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { calculateAnthropometricAssessment } from "@/utils/anthropometry";
import { anthropometricSchema } from "@/utils/validation";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;

    const patient = await prisma.patient.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!patient) return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });

    const assessments = await prisma.anthropometricAssessment.findMany({
      where: { patientId: id, userId: user.id },
      orderBy: { assessmentDate: "asc" },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = anthropometricSchema.parse(body);

    const patient = await prisma.patient.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!patient) return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });

    const result = calculateAnthropometricAssessment({
      protocol: parsed.protocol,
      sex: parsed.sex,
      age: parsed.age,
      bodyWeightKg: parsed.bodyWeightKg,
      folds: parsed.folds,
    });

    const assessment = await prisma.anthropometricAssessment.create({
      data: {
        userId: user.id,
        patientId: id,
        assessmentDate: new Date(parsed.assessmentDate),
        protocol: parsed.protocol,
        foldsJson: JSON.stringify(parsed.folds),
        bodyWeightKg: parsed.bodyWeightKg,
        notes: parsed.notes,
        ...result,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
