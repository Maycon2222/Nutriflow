import { AppointmentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { appointmentSchema } from "@/utils/validation";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        patient: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const body = await request.json();
    const parsed = appointmentSchema.parse(body);

    const patient = await prisma.patient.findFirst({
      where: { id: parsed.patientId, userId: user.id },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        patientId: parsed.patientId,
        scheduledAt: new Date(parsed.scheduledAt),
        status: AppointmentStatus.SCHEDULED,
        notes: parsed.notes,
      },
      include: {
        patient: { select: { id: true, fullName: true, phone: true } },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
