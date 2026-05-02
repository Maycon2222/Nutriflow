"use client";

import { AppointmentStatus, Patient } from "@prisma/client";
import { CalendarCheck2, FileText, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/services/api-client";
import { formatDateTime } from "@/utils/date";

type AppointmentWithPatient = {
  id: string;
  patientId: string;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string | null;
  patient: {
    id: string;
    fullName: string;
    phone: string;
  };
};

const statusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendada",
  CANCELED: "Cancelada",
  COMPLETED: "Concluida",
};

const statusStyle: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-cyan-100 text-cyan-700",
  CANCELED: "bg-red-100 text-red-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export function AppointmentsBoard({
  patients,
  initialAppointments,
}: {
  patients: Pick<Patient, "id" | "fullName" | "phone">[];
  initialAppointments: AppointmentWithPatient[];
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const now = new Date();
  const upcoming = appointments.filter(
    (item) => item.status === AppointmentStatus.SCHEDULED && new Date(item.scheduledAt) >= now,
  );
  const history = appointments.filter(
    (item) => item.status !== AppointmentStatus.SCHEDULED || new Date(item.scheduledAt) < now,
  );

  async function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const created = await apiClient<AppointmentWithPatient>("/api/appointments", {
        method: "POST",
        body: {
          patientId,
          scheduledAt,
          notes,
        },
      });
      setAppointments((prev) => [...prev, created].sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)));
      setNotes("");
      setScheduledAt("");
      setSuccess("Consulta agendada com sucesso.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao agendar.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    setError(null);
    try {
      const updated = await apiClient<AppointmentWithPatient>(`/api/appointments/${id}`, {
        method: "PATCH",
        body: { status },
      });
      setAppointments((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSuccess("Status do agendamento atualizado.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao atualizar status.");
    }
  }

  async function removeAppointment(id: string) {
    setError(null);
    try {
      await apiClient(`/api/appointments/${id}`, { method: "DELETE" });
      setAppointments((prev) => prev.filter((item) => item.id !== id));
      setSuccess("Agendamento removido.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao remover agendamento.");
    }
  }

  async function downloadAppointmentPdf(id: string) {
    setError(null);
    try {
      const response = await fetch(`/api/appointments/${id}/pdf`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Falha ao gerar PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `agendamento-${id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setSuccess("PDF do agendamento gerado com sucesso.");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Falha ao baixar PDF.");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Novo agendamento</h2>
        <form onSubmit={createAppointment} className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Paciente</label>
            <Select value={patientId} onChange={(event) => setPatientId(event.target.value)} required>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName} - {patient.phone}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Data e horario</label>
            <Input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Observacao do agendamento (opcional)</label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={loading || !patientId}>
              {loading ? "Agendando..." : "Agendar consulta"}
            </Button>
          </div>
        </form>
      </Card>

      <ErrorText message={error} />
      <SuccessText message={success} />

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Proximas consultas</h2>
        <div className="space-y-2">
          {upcoming.map((appointment) => (
            <div key={appointment.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{appointment.patient.fullName}</p>
                  <p className="text-sm text-slate-600">{formatDateTime(appointment.scheduledAt)}</p>
                  {appointment.notes ? <p className="text-sm text-slate-500">{appointment.notes}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle[appointment.status]}`}>
                    {statusLabel[appointment.status]}
                  </span>
                  <Button variant="secondary" onClick={() => updateStatus(appointment.id, AppointmentStatus.COMPLETED)}>
                    <CalendarCheck2 size={14} className="mr-1" />
                    Concluir
                  </Button>
                  <Button variant="ghost" onClick={() => updateStatus(appointment.id, AppointmentStatus.CANCELED)}>
                    Cancelar
                  </Button>
                  <Button variant="secondary" onClick={() => downloadAppointmentPdf(appointment.id)}>
                    <FileText size={14} className="mr-1" />
                    PDF
                  </Button>
                  <Button variant="danger" onClick={() => removeAppointment(appointment.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {upcoming.length === 0 ? <p className="text-sm text-slate-500">Nenhuma consulta futura agendada.</p> : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Historico de agendamentos</h2>
        <div className="space-y-2">
          {history.map((appointment) => (
            <div key={appointment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">{appointment.patient.fullName}</p>
              <p className="text-sm text-slate-600">{formatDateTime(appointment.scheduledAt)}</p>
              {appointment.notes ? <p className="text-sm text-slate-500">{appointment.notes}</p> : null}
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyle[appointment.status]}`}>
                  {statusLabel[appointment.status]}
                </span>
                <Button variant="secondary" onClick={() => downloadAppointmentPdf(appointment.id)}>
                  <FileText size={14} className="mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          ))}
          {history.length === 0 ? <p className="text-sm text-slate-500">Sem historico de agendamentos.</p> : null}
        </div>
      </Card>
    </div>
  );
}
