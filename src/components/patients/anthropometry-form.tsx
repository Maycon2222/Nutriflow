"use client";

import { SkinfoldProtocol, Sex } from "@prisma/client";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROTOCOL_FOLDS, SKINFOLD_PROTOCOL_OPTIONS } from "@/models/anthropometry";
import { SEX_OPTIONS } from "@/models/patient";
import { apiClient } from "@/services/api-client";

type Props = {
  patientId: string;
  defaultSex: Sex;
  defaultAge: number;
  defaultWeightKg: number;
};

export function AnthropometryForm({ patientId, defaultSex, defaultAge, defaultWeightKg }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<SkinfoldProtocol>(SkinfoldProtocol.POLLOCK_7);
  const [sex, setSex] = useState<Sex>(defaultSex);
  const [age, setAge] = useState<number>(defaultAge);
  const [weight, setWeight] = useState<number>(defaultWeightKg);
  const [notes, setNotes] = useState("");
  const [folds, setFolds] = useState<Record<string, string>>({});

  const protocolFolds = useMemo(() => PROTOCOL_FOLDS[protocol], [protocol]);

  function updateFold(key: string, value: string) {
    setFolds((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload = {
        assessmentDate: new Date().toISOString(),
        protocol,
        sex,
        age,
        bodyWeightKg: weight,
        folds: protocolFolds.reduce<Record<string, number>>((acc, fold) => {
          if (folds[fold.key]) acc[fold.key] = Number(folds[fold.key]);
          return acc;
        }, {}),
        notes,
      };

      await apiClient(`/api/patients/${patientId}/anthropometry`, {
        method: "POST",
        body: payload,
      });
      setSuccess("Avaliacao antropometrica salva.");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao salvar avaliacao.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Protocolo</label>
          <Select value={protocol} onChange={(event) => setProtocol(event.target.value as SkinfoldProtocol)}>
            {SKINFOLD_PROTOCOL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Sexo</label>
          <Select value={sex} onChange={(event) => setSex(event.target.value as Sex)}>
            {SEX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Idade</label>
          <Input type="number" value={age} onChange={(event) => setAge(Number(event.target.value))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Peso atual (kg)</label>
          <Input type="number" step="0.1" value={weight} onChange={(event) => setWeight(Number(event.target.value))} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 text-sm font-medium text-slate-700">Dobras do protocolo selecionado (mm)</p>
        <div className="grid gap-3 md:grid-cols-2">
          {protocolFolds.map((fold) => (
            <div key={fold.key}>
              <label className="mb-1 block text-sm text-slate-600">{fold.label}</label>
              <Input
                type="number"
                step="0.1"
                value={folds[fold.key] ?? ""}
                onChange={(event) => updateFold(fold.key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Observacoes da avaliacao</label>
        <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>

      <ErrorText message={error} />
      <SuccessText message={success} />

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar avaliacao antropometrica"}
        </Button>
      </div>
    </form>
  );
}
