"use client";

import {
  ActivityLevel,
  EnergyFormula,
  MacroMethod,
  Patient,
  PatientObjective,
  Sex,
} from "@prisma/client";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ACTIVITY_LEVEL_OPTIONS,
  ENERGY_FORMULA_OPTIONS,
  MACRO_METHOD_OPTIONS,
  OBJECTIVE_OPTIONS,
  SEX_OPTIONS,
} from "@/models/patient";
import { apiClient } from "@/services/api-client";
import { calculateEnergy, calculateMacros } from "@/utils/energy";

type Props = {
  patient: Pick<Patient, "id" | "birthDate" | "sex" | "heightCm" | "currentWeight" | "objective">;
};

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
};

export function EnergyCalculationForm({ patient }: Props) {
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
    carbsInput: 40,
    proteinInput: 30,
    fatInput: 30,
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

    return {
      ...energy,
      ...macros,
      macroTotal:
        formData.macroMethod === MacroMethod.PERCENTAGE
          ? formData.carbsInput + formData.proteinInput + formData.fatInput
          : null,
    };
  }, [formData]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        body: formData,
      });
      setSuccess("Calculo energetico salvo com sucesso.");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao salvar calculo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Peso (kg)">
          <Input type="number" step="0.1" value={formData.weightKg} onChange={(event) => setFormData({ ...formData, weightKg: Number(event.target.value) })} />
        </Field>
        <Field label="Altura (cm)">
          <Input type="number" value={formData.heightCm} onChange={(event) => setFormData({ ...formData, heightCm: Number(event.target.value) })} />
        </Field>
        <Field label="Idade">
          <Input type="number" value={formData.age} onChange={(event) => setFormData({ ...formData, age: Number(event.target.value) })} />
        </Field>
        <Field label="Sexo">
          <Select value={formData.sex} onChange={(event) => setFormData({ ...formData, sex: event.target.value as Sex })}>
            {SEX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nivel de atividade fisica">
          <Select
            value={formData.activityLevel}
            onChange={(event) => setFormData({ ...formData, activityLevel: event.target.value as ActivityLevel })}
          >
            {ACTIVITY_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Objetivo">
          <Select
            value={formData.objective}
            onChange={(event) => setFormData({ ...formData, objective: event.target.value as PatientObjective })}
          >
            {OBJECTIVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Formula cientifica">
          <Select value={formData.formula} onChange={(event) => setFormData({ ...formData, formula: event.target.value as EnergyFormula })}>
            {ENERGY_FORMULA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Metodo de macro">
          <Select
            value={formData.macroMethod}
            onChange={(event) => setFormData({ ...formData, macroMethod: event.target.value as MacroMethod })}
          >
            {MACRO_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={formData.macroMethod === MacroMethod.PERCENTAGE ? "Carboidrato (%)" : "Carboidrato (g/kg)"}>
          <Input type="number" step="0.1" value={formData.carbsInput} onChange={(event) => setFormData({ ...formData, carbsInput: Number(event.target.value) })} />
        </Field>
        <Field label={formData.macroMethod === MacroMethod.PERCENTAGE ? "Proteina (%)" : "Proteina (g/kg)"}>
          <Input type="number" step="0.1" value={formData.proteinInput} onChange={(event) => setFormData({ ...formData, proteinInput: Number(event.target.value) })} />
        </Field>
        <Field label={formData.macroMethod === MacroMethod.PERCENTAGE ? "Gordura (%)" : "Gordura (g/kg)"}>
          <Input type="number" step="0.1" value={formData.fatInput} onChange={(event) => setFormData({ ...formData, fatInput: Number(event.target.value) })} />
        </Field>
      </div>

      <Card className="bg-teal-50">
        <h3 className="mb-2 text-sm font-semibold uppercase text-teal-700">Resumo do calculo</h3>
        <p className="text-sm text-slate-700">TMB: {preview.basalMetabolism.toFixed(2)} kcal</p>
        <p className="text-sm text-slate-700">Fator de atividade: {preview.activityFactor}</p>
        <p className="text-sm text-slate-700">GET: {preview.totalEnergySpend.toFixed(2)} kcal</p>
        <p className="text-sm font-semibold text-teal-700">Calorias sugeridas: {preview.suggestedKcal.toFixed(2)} kcal</p>
        {preview.macroTotal !== null ? (
          <p className="text-xs text-slate-600">Soma percentual dos macros: {preview.macroTotal.toFixed(1)}%</p>
        ) : null}
        <p className="mt-2 text-sm text-slate-700">
          CHO: {preview.carbsGrams.toFixed(1)} g ({preview.carbsKcal.toFixed(0)} kcal) | PTN: {preview.proteinGrams.toFixed(1)} g ({preview.proteinKcal.toFixed(0)} kcal) | FAT: {preview.fatGrams.toFixed(1)} g ({preview.fatKcal.toFixed(0)} kcal)
        </p>
        <p className="mt-2 text-xs text-slate-600">{preview.explanation}</p>
      </Card>

      <ErrorText message={error} />
      <SuccessText message={success} />

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar calculo"}
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
