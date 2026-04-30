import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { patientSchema } from "@/utils/validation";
import { apiError } from "@/app/api/_helpers";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const patient = await prisma.patient.findFirst({
      where: { id, userId: user.id },
      include: {
        anamneses: { orderBy: { createdAt: "desc" } },
        calculations: { orderBy: { createdAt: "desc" } },
        consultations: { orderBy: { appointmentDate: "desc" } },
        assessments: { orderBy: { assessmentDate: "asc" } },
      },
    });

    if (!patient) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
    return NextResponse.json(patient);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = patientSchema.parse(body);

    const existing = await prisma.patient.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...parsed,
        birthDate: new Date(parsed.birthDate),
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const existing = await prisma.patient.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ message: "Paciente removido com sucesso." });
  } catch (error) {
    return apiError(error);
  }
}
