import { AppointmentStatus, PatientStatus } from "@prisma/client";
import { prisma } from "@/database/prisma";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end, now };
}

export async function getDashboardStats(userId: string) {
  const { start, end, now } = getTodayRange();
  const threshold = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

  const [totalPatients, inFollowUp, recentPatients, patientsForRetention, todayAgenda] = await Promise.all([
    prisma.patient.count({ where: { userId } }),
    prisma.patient.count({ where: { userId, status: PatientStatus.ACTIVE } }),
    prisma.patient.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, objective: true, createdAt: true, status: true },
    }),
    prisma.patient.findMany({
      where: { userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        objective: true,
        appointments: {
          where: {
            status: AppointmentStatus.SCHEDULED,
            scheduledAt: { gte: now },
          },
          orderBy: { scheduledAt: "asc" },
          take: 1,
          select: { id: true, scheduledAt: true },
        },
        consultations: {
          orderBy: { appointmentDate: "desc" },
          take: 1,
          select: { id: true, appointmentDate: true },
        },
      },
    }),
    prisma.appointment.findMany({
      where: {
        userId,
        scheduledAt: { gte: start, lte: end },
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        patient: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    }),
  ]);

  const noFutureAppointments = patientsForRetention.filter((patient) => patient.appointments.length === 0);
  const noReturn30Days = patientsForRetention.filter((patient) => {
    const latest = patient.consultations[0]?.appointmentDate;
    if (!latest) return true;
    return latest < threshold;
  });

  return {
    totalPatients,
    inFollowUp,
    recentPatients,
    retentionAlerts: {
      noFutureAppointments,
      noReturn30Days,
    },
    todayAgenda,
  };
}
