import { PatientStatus } from "@prisma/client";

const statusStyles: Record<PatientStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-200 text-slate-700",
  PENDING_RETURN: "bg-amber-100 text-amber-700",
};

const statusLabels: Record<PatientStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  PENDING_RETURN: "Retorno pendente",
};

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}>{statusLabels[status]}</span>;
}
