"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BODY_MEASUREMENT_OPTIONS, BODY_MEASUREMENT_UNITS } from "@/models/clinical";
import { apiClient } from "@/services/api-client";

type MeasurementRow = {
  id: string;
  type: string;
  value: string;
  unit: "cm" | "mm" | "%";
};

const emptyMeasurement = (): MeasurementRow => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type: "ABDOMEN",
  value: "",
  unit: "cm",
});

export function ConsultationForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    appointmentDate: new Date().toISOString().slice(0, 10),
    dayWeight: "",
    observations: "",
    patientEvolution: "",
    nutritionPlan: "",
    nextReturnDate: "",
  });
  const [measurements, setMeasurements] = useState<MeasurementRow[]>([]);

  function addMeasurement() {
    setMeasurements((prev) => [...prev, emptyMeasurement()]);
  }

  function updateMeasurement(id: string, updates: Partial<MeasurementRow>) {
    setMeasurements((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  function removeMeasurement(id: string) {
    setMeasurements((prev) => prev.filter((item) => item.id !== id));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const bodyMeasurements = measurements
        .filter((item) => item.value.trim())
        .map((item) => ({
          type: item.type,
          value: Number(item.value),
          unit: item.unit,
        }));

      await apiClient(`/api/patients/${patientId}/consultations`, {
        method: "POST",
        body: {
          ...formData,
          dayWeight: formData.dayWeight ? Number(formData.dayWeight) : undefined,
          bodyMeasurements,
        },
      });
      setSuccess("Consulta registrada com sucesso.");
      router.refresh();
      setMeasurements([]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao registrar consulta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Data da consulta">
          <Input type="date" value={formData.appointmentDate} onChange={(event) => setFormData({ ...formData, appointmentDate: event.target.value })} required />
        </Field>
        <Field label="Peso no dia (kg)">
          <Input type="number" step="0.1" value={formData.dayWeight} onChange={(event) => setFormData({ ...formData, dayWeight: event.target.value })} />
        </Field>

        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Medidas corporais</p>
            <Button type="button" variant="secondary" onClick={addMeasurement}>
              Adicionar medida
            </Button>
          </div>

          <div className="space-y-2">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 md:grid-cols-[1.4fr_1fr_0.8fr_auto]">
                <Select value={measurement.type} onChange={(event) => updateMeasurement(measurement.id, { type: event.target.value })}>
                  {BODY_MEASUREMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="Valor"
                  value={measurement.value}
                  onChange={(event) => updateMeasurement(measurement.id, { value: event.target.value })}
                />
                <Select value={measurement.unit} onChange={(event) => updateMeasurement(measurement.id, { unit: event.target.value as MeasurementRow["unit"] })}>
                  {BODY_MEASUREMENT_UNITS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Button type="button" variant="ghost" onClick={() => removeMeasurement(measurement.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            {measurements.length === 0 && <p className="text-xs text-slate-500">Nenhuma medida adicionada nesta consulta.</p>}
          </div>
        </div>

        <Field label="Observacoes">
          <Textarea value={formData.observations} onChange={(event) => setFormData({ ...formData, observations: event.target.value })} />
        </Field>
        <Field label="Evolucao do paciente">
          <Textarea value={formData.patientEvolution} onChange={(event) => setFormData({ ...formData, patientEvolution: event.target.value })} />
        </Field>
        <Field label="Conduta nutricional">
          <Textarea value={formData.nutritionPlan} onChange={(event) => setFormData({ ...formData, nutritionPlan: event.target.value })} />
        </Field>
        <Field label="Proximo retorno">
          <Input type="date" value={formData.nextReturnDate} onChange={(event) => setFormData({ ...formData, nextReturnDate: event.target.value })} />
        </Field>
      </div>

      <ErrorText message={error} />
      <SuccessText message={success} />
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar consulta"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
