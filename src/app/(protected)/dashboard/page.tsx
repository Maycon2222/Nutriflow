import Link from "next/link";
import { ReactNode } from "react";
import { AppointmentStatus } from "@prisma/client";
import { AlertTriangle, ArrowRight, CalendarClock, PlusCircle, Search, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getDashboardStats } from "@/services/dashboard-service";
import { requireCurrentUser } from "@/services/session-service";
import { formatDate, formatDateTime } from "@/utils/date";
import { objectiveLabel } from "@/utils/labels";

const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: "Pendente",
  CANCELED: "Cancelada",
  COMPLETED: "Realizada",
};

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const stats = await getDashboardStats(user.id);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total de pacientes</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalPatients}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pacientes em acompanhamento</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.inFollowUp}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Cadastros recentes</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.recentPatients.length}</p>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickAction href="/patients/new" icon={<PlusCircle size={18} />} title="Cadastrar paciente" subtitle="Novo cadastro completo" />
        <QuickAction href="/patients" icon={<Search size={18} />} title="Buscar paciente" subtitle="Pesquisa rapida e filtros" />
        <QuickAction href="/patients" icon={<Stethoscope size={18} />} title="Criar anamnese" subtitle="Acesse o perfil para registrar" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Alertas de retencao</h2>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Sem agendamento futuro</p>
              <div className="mt-2 space-y-2">
                {stats.retentionAlerts.noFutureAppointments.slice(0, 5).map((patient) => (
                  <Link key={patient.id} href={`/patients/${patient.id}`} className="block rounded-lg border border-amber-100 bg-amber-50/60 p-2 text-sm text-slate-700">
                    {patient.fullName} - {patient.phone}
                  </Link>
                ))}
                {stats.retentionAlerts.noFutureAppointments.length === 0 ? (
                  <p className="text-xs text-slate-500">Nenhum alerta nesta categoria.</p>
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">Sem retorno ha mais de 30 dias</p>
              <div className="mt-2 space-y-2">
                {stats.retentionAlerts.noReturn30Days.slice(0, 5).map((patient) => (
                  <Link key={patient.id} href={`/patients/${patient.id}`} className="block rounded-lg border border-red-100 bg-red-50/60 p-2 text-sm text-slate-700">
                    {patient.fullName} - {patient.phone}
                  </Link>
                ))}
                {stats.retentionAlerts.noReturn30Days.length === 0 ? (
                  <p className="text-xs text-slate-500">Nenhum alerta nesta categoria.</p>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock size={18} className="text-teal-700" />
            <h2 className="text-lg font-semibold text-slate-900">Agenda do dia</h2>
          </div>

          <div className="space-y-2">
            {stats.todayAgenda.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{item.patient.fullName}</p>
                <p>{formatDateTime(item.scheduledAt)}</p>
                <p className="text-xs text-slate-500">Status: {appointmentStatusLabel[item.status]}</p>
                {item.notes ? <p className="text-xs text-slate-500">{item.notes}</p> : null}
              </div>
            ))}
            {stats.todayAgenda.length === 0 ? <p className="text-sm text-slate-500">Sem compromissos para hoje.</p> : null}
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Pacientes cadastrados recentemente</h2>
          <Link href="/patients" className="text-sm font-medium text-teal-700 hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentPatients.map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition hover:border-teal-200 hover:bg-teal-50/40"
            >
              <div>
                <p className="font-medium text-slate-800">{patient.fullName}</p>
                <p className="text-xs text-slate-500">
                  {objectiveLabel[patient.objective]} - {formatDate(patient.createdAt)}
                </p>
              </div>
              <ArrowRight size={16} className="text-slate-500" />
            </Link>
          ))}
          {stats.recentPatients.length === 0 && <p className="text-sm text-slate-500">Nenhum paciente cadastrado ainda.</p>}
        </div>
      </Card>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 inline-flex rounded-full bg-teal-100 p-2 text-teal-700">{icon}</div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </Link>
  );
}
