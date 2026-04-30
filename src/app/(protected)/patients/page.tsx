import { PatientObjective } from "@prisma/client";
import { PatientsTable } from "@/components/patients/patients-table";
import { listPatients } from "@/services/patient-service";
import { requireCurrentUser } from "@/services/session-service";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PatientsPage({ searchParams }: Props) {
  const user = await requireCurrentUser();
  const params = (await searchParams) ?? {};
  const search = typeof params.search === "string" ? params.search : "";
  const objective = typeof params.objective === "string" ? params.objective : "ALL";
  const sort = typeof params.sort === "string" ? params.sort : "updatedAt";

  const patients = await listPatients({
    userId: user.id,
    search,
    objective: objective as PatientObjective | "ALL",
    sort: sort as "name" | "createdAt" | "updatedAt",
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
        <p className="text-sm text-slate-500">Busque, filtre e gerencie sua carteira de atendimento.</p>
      </div>
      <PatientsTable initialPatients={patients} initialSearch={search} initialObjective={objective} initialSort={sort} />
    </div>
  );
}
