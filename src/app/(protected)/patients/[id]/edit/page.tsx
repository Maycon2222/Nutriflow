import { notFound } from "next/navigation";
import { PatientForm } from "@/components/patients/patient-form";
import { getPatientById } from "@/services/patient-service";
import { requireCurrentUser } from "@/services/session-service";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) return notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar paciente</h1>
        <p className="text-sm text-slate-500">Atualize dados cadastrais e antropométricos.</p>
      </div>
      <PatientForm patient={patient} />
    </div>
  );
}
