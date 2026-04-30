import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/database/prisma";

export async function listAppointments(userId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const now = new Date();

  const upcoming = appointments.filter(
    (item) => item.status === AppointmentStatus.SCHEDULED && item.scheduledAt >= now,
  );
  const past = appointments.filter(
    (item) => item.status !== AppointmentStatus.CANCELED && item.scheduledAt < now,
  );

  return {
    all: appointments,
    upcoming,
    past,
  };
}
