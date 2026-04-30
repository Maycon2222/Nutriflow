import { AppointmentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const body = (await request.json()) as { status?: AppointmentStatus };

    if (!body.status || !Object.values(AppointmentStatus).includes(body.status)) {
      return NextResponse.json({ error: "Status invalido." }, { status: 400 });
    }

    const existing = await prisma.appointment.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: body.status },
      include: {
        patient: { select: { id: true, fullName: true, phone: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;

    const existing = await prisma.appointment.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
    }

    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ message: "Agendamento removido." });
  } catch (error) {
    return apiError(error);
  }
}
