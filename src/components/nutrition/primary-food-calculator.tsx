"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type FoodOption = {
  id: string;
  name: string;
  unitLabel: string;
  gramsPerUnit: number;
  per100g: {
    kcal: number;
    carbs: number;
    proteins: number;
    fats: number;
  };
};

const FOOD_OPTIONS: FoodOption[] = [
  { id: "ovo", name: "Ovo inteiro", unitLabel: "unidade", gramsPerUnit: 50, per100g: { kcal: 143, carbs: 0.7, proteins: 12.6, fats: 9.5 } },
  { id: "frango", name: "Frango (peito cozido)", unitLabel: "gramas", gramsPerUnit: 1, per100g: { kcal: 165, carbs: 0, proteins: 31, fats: 3.6 } },
  { id: "arroz", name: "Arroz branco cozido", unitLabel: "gramas", gramsPerUnit: 1, per100g: { kcal: 130, carbs: 28.2, proteins: 2.7, fats: 0.3 } },
  { id: "feijao", name: "Feijao cozido", unitLabel: "gramas", gramsPerUnit: 1, per100g: { kcal: 76, carbs: 13.6, proteins: 4.8, fats: 0.5 } },
  { id: "batata-doce", name: "Batata doce cozida", unitLabel: "gramas", gramsPerUnit: 1, per100g: { kcal: 77, carbs: 18.4, proteins: 0.6, fats: 0.1 } },
  { id: "banana", name: "Banana prata", unitLabel: "unidade", gramsPerUnit: 86, per100g: { kcal: 98, carbs: 26, proteins: 1.3, fats: 0.1 } },
  { id: "aveia", name: "Aveia em flocos", unitLabel: "gramas", gramsPerUnit: 1, per100g: { kcal: 394, carbs: 66.6, proteins: 13.9, fats: 8.5 } },
  { id: "carne", name: "Carne bovina magra cozida", unitLabel: "gramas", gramsPerUnit: 1, per100g: { kcal: 219, carbs: 0, proteins: 35.9, fats: 7.9 } },
];

function round(value: number) {
  return Number(value.toFixed(1));
}

export function PrimaryFoodCalculator() {
  const [foodId, setFoodId] = useState(FOOD_OPTIONS[0]?.id ?? "");
  const [amount, setAmount] = useState(1);

  const selectedFood = FOOD_OPTIONS.find((food) => food.id === foodId) ?? FOOD_OPTIONS[0];

  const totals = useMemo(() => {
    if (!selectedFood) return null;
    const grams = amount * selectedFood.gramsPerUnit;
    const factor = grams / 100;
    return {
      grams,
      kcal: round(selectedFood.per100g.kcal * factor),
      carbs: round(selectedFood.per100g.carbs * factor),
      proteins: round(selectedFood.per100g.proteins * factor),
      fats: round(selectedFood.per100g.fats * factor),
    };
  }, [amount, selectedFood]);

  if (!selectedFood || !totals) return null;

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">Calculadora de alimentos primarios</h1>
        <p className="mt-1 text-sm text-slate-500">Selecione o alimento e informe a quantidade para calcular kcal e macronutrientes automaticamente.</p>
      </Card>

      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de alimento</label>
            <Select value={foodId} onChange={(event) => setFoodId(event.target.value)}>
              {FOOD_OPTIONS.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Quantidade ({selectedFood.unitLabel})</label>
            <Input
              type="number"
              min={0}
              step={selectedFood.unitLabel === "unidade" ? 1 : 1}
              value={Number.isNaN(amount) ? "" : amount}
              onChange={(event) => setAmount(Math.max(0, Number(event.target.value) || 0))}
            />
          </div>
        </div>
      </Card>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ResultCard label="Kcal total" value={totals.kcal} suffix="kcal" />
        <ResultCard label="Carboidratos" value={totals.carbs} suffix="g" />
        <ResultCard label="Proteinas" value={totals.proteins} suffix="g" />
        <ResultCard label="Gorduras" value={totals.fats} suffix="g" />
      </section>

      <Card>
        <p className="text-sm text-slate-600">
          Base usada: <strong>{selectedFood.name}</strong> com referencia por 100g. Quantidade atual equivale a <strong>{round(totals.grams)}g</strong>.
        </p>
      </Card>
    </div>
  );
}

function ResultCard({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-white">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value} {suffix}
      </p>
    </Card>
  );
}

