"use client";

import { Patient, PatientObjective, PatientStatus, Sex } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OBJECTIVE_OPTIONS, OBJECTIVE_TAG_OPTIONS, SEX_OPTIONS, STATUS_OPTIONS } from "@/models/patient";
import { apiClient } from "@/services/api-client";
import { getAge } from "@/utils/date";

type FormData = {
  fullName: string;
  birthDate: string;
  sex: Sex;
  phone: string;
  email: string;
  profession: string;
  objective: PatientObjective;
  heightCm: number;
  currentWeight: number;
  desiredWeight: number | "";
  generalNotes: string;
  tags: string;
  objectiveTags: string;
  status: PatientStatus;
};

const defaultValues: FormData = {
  fullName: "",
  birthDate: "",
  sex: Sex.FEMALE,
  phone: "",
  email: "",
  profession: "",
  objective: PatientObjective.WEIGHT_LOSS,
  heightCm: 0,
  currentWeight: 0,
  desiredWeight: "",
  generalNotes: "",
  tags: "",
  objectiveTags: "",
  status: PatientStatus.ACTIVE,
};

function patientToForm(patient?: Patient | null): FormData {
  if (!patient) return defaultValues;
  return {
    fullName: patient.fullName,
    birthDate: new Date(patient.birthDate).toISOString().slice(0, 10),
    sex: patient.sex,
    phone: patient.phone,
    email: patient.email ?? "",
    profession: patient.profession ?? "",
    objective: patient.objective,
    heightCm: patient.heightCm,
    currentWeight: patient.currentWeight,
    desiredWeight: patient.desiredWeight ?? "",
    generalNotes: patient.generalNotes ?? "",
    tags: patient.tags ?? "",
    objectiveTags: patient.objectiveTags ?? "",
    status: patient.status,
  };
}

export function PatientForm({ patient }: { patient?: Patient | null }) {
  const router = useRouter();
  const [data, setData] = useState<FormData>(() => patientToForm(patient));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const age = useMemo(() => (data.birthDate ? getAge(data.birthDate) : null), [data.birthDate]);
  const selectedObjectiveTags = useMemo(
    () => data.objectiveTags.split(",").map((item) => item.trim()).filter(Boolean),
    [data.objectiveTags],
  );

  function toggleObjectiveTag(tag: string) {
    const current = new Set(selectedObjectiveTags);
    if (current.has(tag)) current.delete(tag);
    else current.add(tag);
    setData({ ...data, objectiveTags: Array.from(current).join(",") });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        ...data,
        desiredWeight: data.desiredWeight === "" ? undefined : Number(data.desiredWeight),
      };

      if (patient) {
        await apiClient(`/api/patients/${patient.id}`, { method: "PATCH", body: payload });
        setSuccess("Paciente atualizado com sucesso.");
      } else {
        await apiClient("/api/patients", { method: "POST", body: payload });
        setSuccess("Paciente criado com sucesso.");
        setData(defaultValues);
      }

      router.refresh();
      setTimeout(() => {
        router.push("/patients");
      }, 500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nao foi possivel salvar o paciente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Dados pessoais</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Nome completo</label>
            <Input value={data.fullName} onChange={(event) => setData({ ...data, fullName: event.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Data de nascimento</label>
            <Input type="date" value={data.birthDate} onChange={(event) => setData({ ...data, birthDate: event.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Idade (automatica)</label>
            <Input value={age ? `${age} anos` : ""} readOnly />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sexo</label>
            <Select value={data.sex} onChange={(event) => setData({ ...data, sex: event.target.value as Sex })}>
              {SEX_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Telefone</label>
            <Input value={data.phone} onChange={(event) => setData({ ...data, phone: event.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <Input type="email" value={data.email} onChange={(event) => setData({ ...data, email: event.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Profissao</label>
            <Input value={data.profession} onChange={(event) => setData({ ...data, profession: event.target.value })} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Dados clinicos e meta</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Objetivo principal</label>
            <Select value={data.objective} onChange={(event) => setData({ ...data, objective: event.target.value as PatientObjective })}>
              {OBJECTIVE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <Select value={data.status} onChange={(event) => setData({ ...data, status: event.target.value as PatientStatus })}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Tags de objetivo</label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 p-3">
              {OBJECTIVE_TAG_OPTIONS.map((tag) => {
                const active = selectedObjectiveTags.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleObjectiveTag(tag.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Altura (cm)</label>
            <Input type="number" min={0} value={data.heightCm} onChange={(event) => setData({ ...data, heightCm: Number(event.target.value) })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Peso atual (kg)</label>
            <Input type="number" min={0} step="0.1" value={data.currentWeight} onChange={(event) => setData({ ...data, currentWeight: Number(event.target.value) })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Peso desejado (kg)</label>
            <Input
              type="number"
              min={0}
              step="0.1"
              value={data.desiredWeight}
              onChange={(event) =>
                setData({
                  ...data,
                  desiredWeight: event.target.value ? Number(event.target.value) : "",
                })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tags gerais (separadas por virgula)</label>
            <Input value={data.tags} onChange={(event) => setData({ ...data, tags: event.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Observacoes gerais</label>
            <Textarea rows={4} value={data.generalNotes} onChange={(event) => setData({ ...data, generalNotes: event.target.value })} />
          </div>
        </div>
      </section>

      <ErrorText message={error} />
      <SuccessText message={success} />

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : patient ? "Atualizar paciente" : "Cadastrar paciente"}
        </Button>
      </div>
    </form>
  );
}
