import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { anamneseSchema } from "@/utils/validation";
import { apiError } from "@/app/api/_helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = anamneseSchema.parse(body);

    const patient = await prisma.patient.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!patient) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

    const lastVersion = await prisma.anamnesis.findFirst({
      where: { patientId: id },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const anamnese = await prisma.anamnesis.create({
      data: {
        patientId: id,
        version: (lastVersion?.version ?? 0) + 1,
        ...parsed,
      },
    });

    return NextResponse.json(anamnese, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
