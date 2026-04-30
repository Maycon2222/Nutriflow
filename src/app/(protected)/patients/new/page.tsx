import { PatientForm } from "@/components/patients/patient-form";

export default function NewPatientPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Novo paciente</h1>
        <p className="text-sm text-slate-500">Preencha os dados essenciais para iniciar o acompanhamento.</p>
      </div>
      <PatientForm />
    </div>
  );
}
