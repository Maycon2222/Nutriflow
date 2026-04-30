"use client";

import { SleepQuality, StressLevel } from "@prisma/client";
import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  alcoholOptions,
  bowelOptions,
  physicalActivityFrequencyOptions,
  physicalActivityOptions,
  smokingOptions,
} from "@/models/clinical";
import { SLEEP_QUALITY_OPTIONS, STRESS_LEVEL_OPTIONS } from "@/models/patient";
import { apiClient } from "@/services/api-client";

type Props = { patientId: string };

export function AnamneseForm({ patientId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    mainComplaint: "",
    nutritionGoal: "",
    diseaseHistory: "",
    medications: "",
    foodAllergies: "",
    foodIntolerances: "",
    familyHistory: "",
    eatingRoutine: "",
    mealsPerDay: "",
    waterIntakeLiters: "",
    alcoholConsumption: alcoholOptions[0],
    alcoholNotes: "",
    smoking: smokingOptions[0],
    smokingNotes: "",
    sleepQuality: "",
    stressLevel: "",
    physicalActivity: physicalActivityOptions[0],
    physicalActivityFrequency: physicalActivityFrequencyOptions[0],
    trainingType: "",
    foodPreferences: "",
    dislikedFoods: "",
    dietaryRestrictions: "",
    bowelFunction: bowelOptions[0],
    bowelNotes: "",
    generalObservations: "",
  });

  function composeValue(base: string, notes: string) {
    const detail = notes.trim();
    return detail ? `${base} | ${detail}` : base;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiClient(`/api/patients/${patientId}/anamneses`, {
        method: "POST",
        body: {
          ...formData,
          mealsPerDay: formData.mealsPerDay ? Number(formData.mealsPerDay) : undefined,
          waterIntakeLiters: formData.waterIntakeLiters ? Number(formData.waterIntakeLiters) : undefined,
          alcoholConsumption: composeValue(formData.alcoholConsumption, formData.alcoholNotes),
          smoking: composeValue(formData.smoking, formData.smokingNotes),
          bowelFunction: composeValue(formData.bowelFunction, formData.bowelNotes),
          sleepQuality: (formData.sleepQuality || undefined) as SleepQuality | undefined,
          stressLevel: (formData.stressLevel || undefined) as StressLevel | undefined,
        },
      });
      setSuccess("Anamnese registrada com sucesso.");
      router.refresh();
      setFormData({
        mainComplaint: "",
        nutritionGoal: "",
        diseaseHistory: "",
        medications: "",
        foodAllergies: "",
        foodIntolerances: "",
        familyHistory: "",
        eatingRoutine: "",
        mealsPerDay: "",
        waterIntakeLiters: "",
        alcoholConsumption: alcoholOptions[0],
        alcoholNotes: "",
        smoking: smokingOptions[0],
        smokingNotes: "",
        sleepQuality: "",
        stressLevel: "",
        physicalActivity: physicalActivityOptions[0],
        physicalActivityFrequency: physicalActivityFrequencyOptions[0],
        trainingType: "",
        foodPreferences: "",
        dislikedFoods: "",
        dietaryRestrictions: "",
        bowelFunction: bowelOptions[0],
        bowelNotes: "",
        generalObservations: "",
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao salvar anamnese.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Queixa principal">
          <Textarea value={formData.mainComplaint} onChange={(event) => setFormData({ ...formData, mainComplaint: event.target.value })} />
        </Field>
        <Field label="Objetivo nutricional">
          <Textarea value={formData.nutritionGoal} onChange={(event) => setFormData({ ...formData, nutritionGoal: event.target.value })} />
        </Field>
        <Field label="Historico de doencas">
          <Textarea value={formData.diseaseHistory} onChange={(event) => setFormData({ ...formData, diseaseHistory: event.target.value })} />
        </Field>
        <Field label="Uso de medicamentos">
          <Textarea value={formData.medications} onChange={(event) => setFormData({ ...formData, medications: event.target.value })} />
        </Field>
        <Field label="Alergias alimentares">
          <Input value={formData.foodAllergies} onChange={(event) => setFormData({ ...formData, foodAllergies: event.target.value })} />
        </Field>
        <Field label="Intolerancias alimentares">
          <Input value={formData.foodIntolerances} onChange={(event) => setFormData({ ...formData, foodIntolerances: event.target.value })} />
        </Field>
        <Field label="Historico familiar">
          <Textarea value={formData.familyHistory} onChange={(event) => setFormData({ ...formData, familyHistory: event.target.value })} />
        </Field>
        <Field label="Rotina alimentar">
          <Textarea value={formData.eatingRoutine} onChange={(event) => setFormData({ ...formData, eatingRoutine: event.target.value })} />
        </Field>
        <Field label="Refeicoes por dia">
          <Input type="number" value={formData.mealsPerDay} onChange={(event) => setFormData({ ...formData, mealsPerDay: event.target.value })} />
        </Field>
        <Field label="Consumo de agua (L)">
          <Input type="number" step="0.1" value={formData.waterIntakeLiters} onChange={(event) => setFormData({ ...formData, waterIntakeLiters: event.target.value })} />
        </Field>

        <Field label="Consumo de alcool">
          <Select value={formData.alcoholConsumption} onChange={(event) => setFormData({ ...formData, alcoholConsumption: event.target.value })}>
            {alcoholOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Detalhe do alcool (opcional)">
          <Input value={formData.alcoholNotes} onChange={(event) => setFormData({ ...formData, alcoholNotes: event.target.value })} placeholder="Ex.: vinho no fim de semana" />
        </Field>

        <Field label="Tabagismo">
          <Select value={formData.smoking} onChange={(event) => setFormData({ ...formData, smoking: event.target.value })}>
            {smokingOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Detalhe do tabagismo (opcional)">
          <Input value={formData.smokingNotes} onChange={(event) => setFormData({ ...formData, smokingNotes: event.target.value })} placeholder="Ex.: 5 cigarros/dia" />
        </Field>

        <Field label="Qualidade do sono">
          <Select value={formData.sleepQuality} onChange={(event) => setFormData({ ...formData, sleepQuality: event.target.value })}>
            <option value="">Selecione</option>
            {SLEEP_QUALITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nivel de estresse">
          <Select value={formData.stressLevel} onChange={(event) => setFormData({ ...formData, stressLevel: event.target.value })}>
            <option value="">Selecione</option>
            {STRESS_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Pratica atividade fisica">
          <Select value={formData.physicalActivity} onChange={(event) => setFormData({ ...formData, physicalActivity: event.target.value })}>
            {physicalActivityOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Frequencia da atividade fisica">
          <Select value={formData.physicalActivityFrequency} onChange={(event) => setFormData({ ...formData, physicalActivityFrequency: event.target.value })}>
            {physicalActivityFrequencyOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tipo de treino">
          <Input value={formData.trainingType} onChange={(event) => setFormData({ ...formData, trainingType: event.target.value })} />
        </Field>
        <Field label="Preferencias alimentares">
          <Textarea value={formData.foodPreferences} onChange={(event) => setFormData({ ...formData, foodPreferences: event.target.value })} />
        </Field>
        <Field label="Alimentos que nao gosta">
          <Textarea value={formData.dislikedFoods} onChange={(event) => setFormData({ ...formData, dislikedFoods: event.target.value })} />
        </Field>
        <Field label="Restricoes alimentares">
          <Textarea value={formData.dietaryRestrictions} onChange={(event) => setFormData({ ...formData, dietaryRestrictions: event.target.value })} />
        </Field>

        <Field label="Funcionamento intestinal">
          <Select value={formData.bowelFunction} onChange={(event) => setFormData({ ...formData, bowelFunction: event.target.value })}>
            {bowelOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Detalhe intestinal (opcional)">
          <Input value={formData.bowelNotes} onChange={(event) => setFormData({ ...formData, bowelNotes: event.target.value })} placeholder="Ex.: 1 evacuacao dia sim/dia nao" />
        </Field>

        <Field label="Observacoes gerais">
          <Textarea value={formData.generalObservations} onChange={(event) => setFormData({ ...formData, generalObservations: event.target.value })} />
        </Field>
      </div>

      <ErrorText message={error} />
      <SuccessText message={success} />

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar anamnese"}
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
