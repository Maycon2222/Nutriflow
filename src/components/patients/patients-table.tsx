"use client";

import { Patient, PatientObjective } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import { OBJECTIVE_OPTIONS } from "@/models/patient";
import { apiClient } from "@/services/api-client";
import { formatDate } from "@/utils/date";
import { objectiveLabel } from "@/utils/labels";

type PatientsTableProps = {
  initialPatients: Patient[];
  initialSearch?: string;
  initialObjective?: string;
  initialSort?: string;
};

export function PatientsTable({ initialPatients, initialSearch = "", initialObjective = "ALL", initialSort = "updatedAt" }: PatientsTableProps) {
  const [search, setSearch] = useState(initialSearch);
  const [objective, setObjective] = useState(initialObjective);
  const [sort, setSort] = useState(initialSort);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const router = useRouter();

  function applyFilters() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (objective !== "ALL") params.set("objective", objective);
    if (sort !== "updatedAt") params.set("sort", sort);
    router.push(`/patients?${params.toString()}`);
  }

  async function deletePatient() {
    if (!confirmId) return;
    try {
      setDeletingId(confirmId);
      await apiClient(`/api/patients/${confirmId}`, { method: "DELETE" });
      router.refresh();
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  }

  const selectedPatient = useMemo(() => initialPatients.find((patient) => patient.id === confirmId), [initialPatients, confirmId]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Buscar por nome, telefone ou tags" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={objective} onChange={(event) => setObjective(event.target.value)}>
            <option value="ALL">Todos os objetivos</option>
            {OBJECTIVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="name">Ordenar por nome</option>
            <option value="createdAt">Ordenar por cadastro</option>
            <option value="updatedAt">Ordenar por atualizacao</option>
          </Select>
          <Button onClick={applyFilters} className="w-full md:w-auto">
            Aplicar filtros
          </Button>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Paciente</th>
              <th className="px-4 py-3">Objetivo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3">Atualizacao</th>
              <th className="px-4 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {initialPatients.map((patient) => (
              <tr key={patient.id} className="border-t border-slate-100 text-sm text-slate-700">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{patient.fullName}</p>
                  <p className="text-xs text-slate-500">{patient.phone}</p>
                </td>
                <td className="px-4 py-3">{objectiveLabel[patient.objective as PatientObjective]}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={patient.status} />
                </td>
                <td className="px-4 py-3">{formatDate(patient.createdAt)}</td>
                <td className="px-4 py-3">{formatDate(patient.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/patients/${patient.id}`}>
                      <Button variant="secondary">Perfil</Button>
                    </Link>
                    <Link href={`/patients/${patient.id}/edit`}>
                      <Button variant="ghost">Editar</Button>
                    </Link>
                    <Button variant="danger" onClick={() => setConfirmId(patient.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {initialPatients.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={6}>
                  Nenhum paciente encontrado para os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {initialPatients.map((patient) => (
          <div key={patient.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-semibold text-slate-900">{patient.fullName}</p>
            <p className="mt-1 text-xs text-slate-500">{patient.phone}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <p>Objetivo: {objectiveLabel[patient.objective as PatientObjective]}</p>
              <p>Cadastro: {formatDate(patient.createdAt)}</p>
              <p>Atualizacao: {formatDate(patient.updatedAt)}</p>
              <div>
                <StatusBadge status={patient.status} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/patients/${patient.id}`} className="min-w-24 flex-1">
                <Button variant="secondary" className="w-full">
                  Perfil
                </Button>
              </Link>
              <Link href={`/patients/${patient.id}/edit`} className="min-w-24 flex-1">
                <Button variant="ghost" className="w-full">
                  Editar
                </Button>
              </Link>
              <Button variant="danger" className="min-w-12" onClick={() => setConfirmId(patient.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        {initialPatients.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
            Nenhum paciente encontrado para os filtros aplicados.
          </div>
        ) : null}
      </div>

      <ConfirmModal
        open={Boolean(confirmId)}
        title="Excluir paciente"
        description={`Tem certeza que deseja excluir ${selectedPatient?.fullName ?? "este paciente"}? Essa acao e irreversivel.`}
        confirmLabel="Excluir"
        loading={Boolean(deletingId)}
        onCancel={() => setConfirmId(null)}
        onConfirm={deletePatient}
      />
    </div>
  );
}
