"use client";

import { ActivityLevel, EnergyFormula, MacroMethod, Patient, PatientObjective, Sex, SkinfoldProtocol } from "@prisma/client";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ACTIVITY_LEVEL_OPTIONS, ENERGY_FORMULA_OPTIONS, MACRO_METHOD_OPTIONS, OBJECTIVE_OPTIONS, SEX_OPTIONS } from "@/models/patient";
import { CONFIDENCE_LABEL, STAGE_OPTIONS } from "@/models/energy";
import { apiClient } from "@/services/api-client";
import {
  buildMacroPresetByGoal,
  calculateEnergy,
  calculateMacros,
  calculateMacrosFromAnthropometry,
  clampMacroGkgValues,
  computeConfidenceLevel,
  convertGkgToPercent,
  convertPercentToGkg,
  inferProfilePreset,
  mapObjectiveToGoalPreset,
  validateGkgRanges,
} from "@/utils/energy";

type Props = {
  patient: Pick<Patient, "id" | "birthDate" | "sex" | "heightCm" | "currentWeight" | "objective">;
  latestAssessment?: {
    protocol: SkinfoldProtocol;
    bodyFatPercent: number;
    leanMassKg: number;
    sumOfFolds: number;
    assessmentDate: string;
  } | null;
  hasAnamnese: boolean;
  hasPartialMeasures: boolean;
};

type Stage = "INITIAL_ESTIMATE" | "FINAL_PRESCRIPTION";

type EnergyFormState = {
  age: number;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  objective: PatientObjective;
  formula: EnergyFormula;
  macroMethod: MacroMethod;
  carbsInput: number;
  proteinInput: number;
  fatInput: number;
  recommendationStage: Stage;
};

export function EnergyCalculationForm({ patient, latestAssessment, hasAnamnese, hasPartialMeasures }: Props) {
  const router = useRouter();
  const initialAge = Math.max(1, new Date().getFullYear() - new Date(patient.birthDate).getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<EnergyFormState>({
    age: initialAge,
    sex: patient.sex,
    weightKg: patient.currentWeight,
    heightCm: patient.heightCm,
    activityLevel: ActivityLevel.MODERATE,
    objective: patient.objective,
    formula: EnergyFormula.MIFFLIN_ST_JEOR,
    macroMethod: MacroMethod.PERCENTAGE,
    carbsInput: 45,
    proteinInput: 30,
    fatInput: 25,
    recommendationStage: "INITIAL_ESTIMATE",
  });

  const preview = useMemo(() => {
    const energy = calculateEnergy(formData);
    const macros = calculateMacros({
      method: formData.macroMethod,
      carbsInput: formData.carbsInput,
      proteinInput: formData.proteinInput,
      fatInput: formData.fatInput,
      suggestedKcal: energy.suggestedKcal,
      weightKg: formData.weightKg,
    });
    const goalPreset = mapObjectiveToGoalPreset(formData.objective);
    const profilePreset = inferProfilePreset(formData.weightKg, formData.heightCm, formData.activityLevel);
    const confidenceLevel = computeConfidenceLevel({
      hasAnamnese,
      hasAnthropometry: Boolean(latestAssessment),
      hasBodyFat: Boolean(latestAssessment?.bodyFatPercent),
      hasMeasurements: hasPartialMeasures,
    });
    const gkg =
      formData.macroMethod === MacroMethod.G_PER_KG
        ? { carbs: formData.carbsInput, protein: formData.proteinInput, fat: formData.fatInput }
        : convertPercentToGkg({
            carbsPercent: macros.carbsPercent,
            proteinPercent: macros.proteinPercent,
            fatPercent: macros.fatPercent,
            kcal: energy.suggestedKcal,
            weightKg: formData.weightKg,
          });
    return { ...energy, ...macros, goalPreset, profilePreset, confidenceLevel, gkg };
  }, [formData, hasAnamnese, hasPartialMeasures, latestAssessment]);

  const gkgWarnings = validateGkgRanges(preview.gkg);

  function applyAutoRecommendation() {
    const goalPreset = mapObjectiveToGoalPreset(formData.objective);
    const profilePreset = inferProfilePreset(formData.weightKg, formData.heightCm, formData.activityLevel);
    const energy = calculateEnergy(formData);

    if (latestAssessment) {
      const anthropometry = calculateMacrosFromAnthropometry({
        objective: formData.objective,
        suggestedKcal: energy.suggestedKcal,
        weightKg: formData.weightKg,
        leanMassKg: latestAssessment.leanMassKg,
        bodyFatPercent: latestAssessment.bodyFatPercent,
      });
      const gkg = clampMacroGkgValues({
        carbs: anthropometry.carbsGrams / formData.weightKg,
        protein: anthropometry.proteinGrams / formData.weightKg,
        fat: anthropometry.fatGrams / formData.weightKg,
      });
      setFormData((prev) => ({ ...prev, macroMethod: MacroMethod.G_PER_KG, carbsInput: gkg.carbs, proteinInput: gkg.protein, fatInput: gkg.fat }));
      return;
    }

    const preset = buildMacroPresetByGoal({ goal: goalPreset, profile: profilePreset });
    setFormData((prev) => ({ ...prev, macroMethod: MacroMethod.G_PER_KG, carbsInput: preset.carbs, proteinInput: preset.protein, fatInput: preset.fat }));
  }

  function onChangeMacroMethod(nextMethod: MacroMethod) {
    if (nextMethod === formData.macroMethod) return;

    if (nextMethod === MacroMethod.G_PER_KG) {
      const converted = convertPercentToGkg({
        carbsPercent: formData.carbsInput,
        proteinPercent: formData.proteinInput,
        fatPercent: formData.fatInput,
        kcal: preview.suggestedKcal,
        weightKg: formData.weightKg,
      });
      const safe = clampMacroGkgValues(converted);
      setFormData((prev) => ({ ...prev, macroMethod: nextMethod, carbsInput: Number(safe.carbs.toFixed(2)), proteinInput: Number(safe.protein.toFixed(2)), fatInput: Number(safe.fat.toFixed(2)) }));
      return;
    }

    const percent = convertGkgToPercent({
      carbsGkg: formData.carbsInput,
      proteinGkg: formData.proteinInput,
      fatGkg: formData.fatInput,
      weightKg: formData.weightKg,
    });
    setFormData((prev) => ({ ...prev, macroMethod: nextMethod, carbsInput: Number(percent.carbs.toFixed(1)), proteinInput: Number(percent.protein.toFixed(1)), fatInput: Number(percent.fat.toFixed(1)) }));
  }

  async function submitWithStage(stage: Stage) {
    setError(null);
    setSuccess(null);

    if (formData.macroMethod === MacroMethod.PERCENTAGE) {
      const total = formData.carbsInput + formData.proteinInput + formData.fatInput;
      if (Math.abs(total - 100) > 0.01) {
        setError("No modo percentual, carbo/proteina/gordura devem somar 100%.");
        return;
      }
    }

    setLoading(true);
    try {
      await apiClient(`/api/patients/${patient.id}/energy-calculations`, {
        method: "POST",
        body: {
          ...formData,
          recommendationStage: stage,
          goalPreset: preview.goalPreset,
          profilePreset: preview.profilePreset,
          confidenceLevel: preview.confidenceLevel,
        },
      });
      setSuccess(stage === "INITIAL_ESTIMATE" ? "Estimativa inicial salva." : "Prescricao final salva.");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao salvar calculo.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitWithStage(formData.recommendationStage);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={applyAutoRecommendation}>Gerar recomendacao inicial automatica</Button>
        <Button type="button" variant="secondary" onClick={() => setFormData((prev) => ({ ...prev }))}>Recalcular com base nos dados disponiveis</Button>
        <Button type="button" variant="secondary" onClick={() => submitWithStage("INITIAL_ESTIMATE")} disabled={loading}>Salvar como estimativa inicial</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Peso (kg)"><Input type="number" step="0.1" value={formData.weightKg} onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })} /></Field>
        <Field label="Altura (cm)"><Input type="number" value={formData.heightCm} onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })} /></Field>
        <Field label="Idade"><Input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} /></Field>
        <Field label="Sexo">
          <Select value={formData.sex} onChange={(e) => setFormData({ ...formData, sex: e.target.value as Sex })}>{SEX_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select>
        </Field>
        <Field label="Nivel de atividade fisica">
          <Select value={formData.activityLevel} onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}>{ACTIVITY_LEVEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select>
        </Field>
        <Field label="Objetivo">
          <Select value={formData.objective} onChange={(e) => setFormData({ ...formData, objective: e.target.value as PatientObjective })}>{OBJECTIVE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select>
        </Field>
        <Field label="Formula cientifica">
          <Select value={formData.formula} onChange={(e) => setFormData({ ...formData, formula: e.target.value as EnergyFormula })}>{ENERGY_FORMULA_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select>
        </Field>
        <Field label="Metodo de macro">
          <Select value={formData.macroMethod} onChange={(e) => onChangeMacroMethod(e.target.value as MacroMethod)}>{MACRO_METHOD_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select>
        </Field>
        <Field label={formData.macroMethod === MacroMethod.PERCENTAGE ? "Carboidrato (%)" : "Carboidrato (g/kg)"}><Input type="number" step="0.1" value={formData.carbsInput} onChange={(e) => setFormData({ ...formData, carbsInput: Number(e.target.value) })} /></Field>
        <Field label={formData.macroMethod === MacroMethod.PERCENTAGE ? "Proteina (%)" : "Proteina (g/kg)"}><Input type="number" step="0.1" value={formData.proteinInput} onChange={(e) => setFormData({ ...formData, proteinInput: Number(e.target.value) })} /></Field>
        <Field label={formData.macroMethod === MacroMethod.PERCENTAGE ? "Gordura (%)" : "Gordura (g/kg)"}><Input type="number" step="0.1" value={formData.fatInput} onChange={(e) => setFormData({ ...formData, fatInput: Number(e.target.value) })} /></Field>
        <Field label="Tipo de salvamento">
          <Select value={formData.recommendationStage} onChange={(e) => setFormData({ ...formData, recommendationStage: e.target.value as Stage })}>
            {STAGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </Field>
      </div>

      <Card className="bg-teal-50">
        <h3 className="mb-2 text-sm font-semibold uppercase text-teal-700">Resumo clinico do calculo</h3>
        <p className="text-sm text-slate-700">TMB: {preview.basalMetabolism.toFixed(1)} kcal</p>
        <p className="text-sm text-slate-700">GET: {preview.totalEnergySpend.toFixed(1)} kcal (fator {preview.activityFactor})</p>
        <p className="text-sm font-semibold text-teal-700">Calorias sugeridas: {preview.suggestedKcal.toFixed(1)} kcal</p>
        <p className="text-sm text-slate-700">Estrategia aplicada: {preview.strategyLabel}</p>
        <p className="text-sm text-slate-700">Confiabilidade: {CONFIDENCE_LABEL[preview.confidenceLevel]}</p>
        <p className="mt-2 text-sm text-slate-700">CHO {preview.carbsGrams.toFixed(1)}g ({preview.carbsKcal.toFixed(0)} kcal | {preview.carbsPercent.toFixed(1)}%)</p>
        <p className="text-sm text-slate-700">PTN {preview.proteinGrams.toFixed(1)}g ({preview.proteinKcal.toFixed(0)} kcal | {preview.proteinPercent.toFixed(1)}%)</p>
        <p className="text-sm text-slate-700">FAT {preview.fatGrams.toFixed(1)}g ({preview.fatKcal.toFixed(0)} kcal | {preview.fatPercent.toFixed(1)}%)</p>
        <p className={`mt-2 text-xs ${Math.abs(preview.diffKcal) > 100 ? "text-amber-700" : "text-slate-600"}`}>
          Total dos macros: {preview.totalKcal.toFixed(1)} kcal. Diferenca: {preview.diffKcal.toFixed(1)} kcal ({preview.diffPercent.toFixed(1)}%).
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Este calculo foi gerado com base nos dados disponiveis e pode ser provisoriamente usado ate a avaliacao completa.
        </p>
        <p className="text-xs text-slate-600">CHO = energia para treino e rotina; PTN = manutencao/ganho de massa magra; FAT = funcao hormonal e saciedade.</p>
      </Card>

      {gkgWarnings.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-800">Alertas de faixa de macros</p>
          <ul className="mt-1 list-disc pl-5 text-xs text-amber-700">{gkgWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </Card>
      ) : null}

      <ErrorText message={error} />
      <SuccessText message={success} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => submitWithStage("FINAL_PRESCRIPTION")} disabled={loading}>Salvar como prescricao final</Button>
        <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar calculo"}</Button>
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

