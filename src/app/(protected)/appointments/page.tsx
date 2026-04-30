import { AppointmentsBoard } from "@/components/appointments/appointments-board";
import { prisma } from "@/database/prisma";
import { listAppointments } from "@/services/appointment-service";
import { requireCurrentUser } from "@/services/session-service";

export default async function AppointmentsPage() {
  const user = await requireCurrentUser();

  const [patients, appointments] = await Promise.all([
    prisma.patient.findMany({
      where: { userId: user.id },
      select: { id: true, fullName: true, phone: true },
      orderBy: { fullName: "asc" },
    }),
    listAppointments(user.id),
  ]);

  const serializedAppointments = appointments.all.map((item) => ({
    ...item,
    scheduledAt: item.scheduledAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agendamento de consultas</h1>
        <p className="text-sm text-slate-500">Organize retornos e consultas futuras em um unico fluxo.</p>
      </div>
      <AppointmentsBoard patients={patients} initialAppointments={serializedAppointments} />
    </div>
  );
}
