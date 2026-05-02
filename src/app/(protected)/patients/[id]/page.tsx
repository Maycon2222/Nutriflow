import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ConsultationForm } from "@/components/patients/consultation-form";
import { AnamneseForm } from "@/components/patients/anamnese-form";
import { EnergyCalculationForm } from "@/components/patients/energy-calculation-form";
import { WeightChart } from "@/components/patients/weight-chart";
import { AnthropometryForm } from "@/components/patients/anthropometry-form";
import { AnthropometryEvolutionChart } from "@/components/patients/anthropometry-evolution-chart";
import { getPatientById } from "@/services/patient-service";
import { requireCurrentUser } from "@/services/session-service";
import { parseFoldsJson } from "@/utils/anthropometry";
import { getMeasurementLabel, parseBodyMeasurements } from "@/utils/clinical";
import { formatDate, getAge } from "@/utils/date";
import { activityLabel, energyFormulaLabel, macroMethodLabel, objectiveLabel } from "@/utils/labels";
import { parseCsvTags } from "@/utils/tags";

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) return notFound();

  const age = getAge(patient.birthDate);
  const weightPoints = patient.consultations
    .filter((item) => item.dayWeight)
    .map((item) => ({
      date: item.appointmentDate.toISOString(),
      weight: Number(item.dayWeight),
    }))
    .reverse();

  const anthropometryPoints = patient.assessments.map((item) => ({
    date: item.assessmentDate.toISOString(),
    weight: item.bodyWeightKg,
    bodyFat: item.bodyFatPercent,
    leanMass: item.leanMassKg,
  }));

  const objectiveTags = parseCsvTags(patient.objectiveTags);
  const latestAnamnese = patient.anamneses[0];
  const firstAnamnese = patient.anamneses[patient.anamneses.length - 1];
  const latestAssessment = patient.assessments[patient.assessments.length - 1] ?? null;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{patient.fullName}</h1>
            <p className="text-sm text-slate-500">
              {age} anos - {patient.phone} - {objectiveLabel[patient.objective]}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {objectiveTags.map((tag) => (
                <span key={tag} className="rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700">
                  {tag}
                </span>
              ))}
              {objectiveTags.length === 0 ? <span className="text-xs text-slate-500">Sem tags de objetivo.</span> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={patient.status} />
            <Link href={`/patients/${patient.id}/edit`} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
              Editar dados
            </Link>
            <Link href={`/api/patients/${patient.id}/plan-pdf`} className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Gerar PDF
            </Link>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Dados antropometricos</h2>
          <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <p>Altura: {patient.heightCm} cm</p>
            <p>Peso atual: {patient.currentWeight} kg</p>
            <p>Peso desejado: {patient.desiredWeight ?? "-"} kg</p>
            <p>Ultima atualizacao: {formatDate(patient.updatedAt)}</p>
            <p className="md:col-span-2">Observacoes: {patient.generalNotes || "Sem observacoes."}</p>
            <p className="md:col-span-2">Tags gerais: {patient.tags || "Sem tags."}</p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Historico de anamnese</h2>
          {latestAnamnese ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p>Versao atual: v{latestAnamnese.version}</p>
              <p>Primeira versao: v{firstAnamnese?.version}</p>
              <p>Objetivo inicial: {firstAnamnese?.nutritionGoal || "-"}</p>
              <p>Objetivo atual: {latestAnamnese.nutritionGoal || "-"}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sem anamnese registrada.</p>
          )}
        </Card>
      </section>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Evolucao de peso</h2>
        <WeightChart points={weightPoints} />
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Avaliacao antropometrica</h2>
        <div className="mb-4">
          <AnthropometryEvolutionChart points={anthropometryPoints} />
        </div>
        <div className="mb-4 space-y-2">
          {patient.assessments
            .slice()
            .reverse()
            .map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{formatDate(item.assessmentDate)} - {item.protocol}</p>
                <p>Peso: {item.bodyWeightKg.toFixed(1)} kg</p>
                <p>% Gordura: {item.bodyFatPercent.toFixed(2)}%</p>
                <p>Massa magra: {item.leanMassKg.toFixed(2)} kg</p>
                <p>Soma das dobras: {item.sumOfFolds.toFixed(1)} mm</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(parseFoldsJson(item.foldsJson)).map(([fold, value]) => (
                    <span key={`${item.id}-${fold}`} className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                      {fold}: {value} mm
                    </span>
                  ))}
                </div>
                {item.notes ? <p className="mt-1 text-xs text-slate-500">{item.notes}</p> : null}
              </div>
            ))}
          {patient.assessments.length === 0 && <p className="text-sm text-slate-500">Sem avaliacao antropometrica registrada.</p>}
        </div>
        <AnthropometryForm patientId={patient.id} defaultSex={patient.sex} defaultAge={age} defaultWeightKg={patient.currentWeight} />
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Historico de consultas</h2>
        <div className="mb-4 space-y-2">
          {patient.consultations.map((consultation) => {
            const measures = parseBodyMeasurements(consultation.bodyMeasurements);
            return (
              <div key={consultation.id} className="rounded-lg border border-slate-100 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{formatDate(consultation.appointmentDate)}</p>
                <p>Peso: {consultation.dayWeight ?? "-"} kg</p>
                {measures.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {measures.map((measurement) => (
                      <span key={`${consultation.id}-${measurement.type}-${measurement.value}`} className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                        {getMeasurementLabel(measurement.type)}: {measurement.value} {measurement.unit}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p>Evolucao: {consultation.patientEvolution || "-"}</p>
                <p>Conduta: {consultation.nutritionPlan || "-"}</p>
              </div>
            );
          })}
          {patient.consultations.length === 0 && <p className="text-sm text-slate-500">Sem consultas registradas.</p>}
        </div>
        <ConsultationForm patientId={patient.id} />
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Anamneses registradas (versionadas)</h2>
        <div className="mb-4 space-y-2">
          {patient.anamneses.map((anamnesis) => (
            <div key={anamnesis.id} className="rounded-lg border border-slate-100 p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">v{anamnesis.version} - {formatDate(anamnesis.createdAt)}</p>
              <p>Queixa principal: {anamnesis.mainComplaint || "-"}</p>
              <p>Objetivo nutricional: {anamnesis.nutritionGoal || "-"}</p>
              <p>Atividade fisica: {anamnesis.physicalActivity || "-"}</p>
              <p>Observacoes: {anamnesis.generalObservations || "-"}</p>
            </div>
          ))}
          {patient.anamneses.length === 0 && <p className="text-sm text-slate-500">Sem anamneses registradas.</p>}
        </div>
        <AnamneseForm patientId={patient.id} />
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Calculos energeticos</h2>
        <div className="mb-4 space-y-2">
          {patient.calculations.map((calc) => (
            <div key={calc.id} className="rounded-lg border border-slate-100 p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{formatDate(calc.createdAt)}</p>
              <p>Formula: {energyFormulaLabel[calc.formula]}</p>
              <p>TMB: {calc.basalMetabolism.toFixed(2)} kcal</p>
              <p>GET: {calc.totalEnergySpend.toFixed(2)} kcal</p>
              <p>Fator de atividade: {calc.activityFactor}</p>
              <p>Atividade: {activityLabel[calc.activityLevel]}</p>
              <p>Metodo de macros: {macroMethodLabel[calc.macroMethod]}</p>
              <p>CHO: {calc.carbsGrams.toFixed(1)}g | PTN: {calc.proteinGrams.toFixed(1)}g | FAT: {calc.fatGrams.toFixed(1)}g</p>
              <p className="font-medium text-teal-700">Calorias sugeridas: {calc.suggestedKcal.toFixed(2)} kcal</p>
              <p>{calc.explanation}</p>
            </div>
          ))}
          {patient.calculations.length === 0 && <p className="text-sm text-slate-500">Sem calculos registrados.</p>}
        </div>
        <EnergyCalculationForm
          patient={{
            id: patient.id,
            birthDate: patient.birthDate,
            sex: patient.sex,
            heightCm: patient.heightCm,
            currentWeight: patient.currentWeight,
            objective: patient.objective,
          }}
          latestAssessment={
            latestAssessment
              ? {
                  protocol: latestAssessment.protocol,
                  bodyFatPercent: latestAssessment.bodyFatPercent,
                  leanMassKg: latestAssessment.leanMassKg,
                  sumOfFolds: latestAssessment.sumOfFolds,
                  assessmentDate: latestAssessment.assessmentDate.toISOString(),
                }
              : null
          }
        />
      </Card>
    </div>
  );
}
