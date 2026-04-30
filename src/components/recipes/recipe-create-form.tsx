"use client";

import { Recipe, RecipeType } from "@prisma/client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RECIPE_TYPE_OPTIONS } from "@/models/recipe";
import { apiClient } from "@/services/api-client";

type RecipeForm = {
  title: string;
  type: RecipeType;
  servings: number;
  kcal: number;
  carbs: number;
  proteins: number;
  fats: number;
  ingredients: string;
  preparation: string;
  notes: string;
};

const defaultForm: RecipeForm = {
  title: "",
  type: RecipeType.LUNCH,
  servings: 1,
  kcal: 0,
  carbs: 0,
  proteins: 0,
  fats: 0,
  ingredients: "",
  preparation: "",
  notes: "",
};

const TITLE_EMOJIS = ["🍽️", "🥗", "🍛", "🍞", "🍎", "🍌", "🍰"];
const CONTENT_EMOJIS = ["✨", "💡", "🥄", "🥣", "🔥", "✅", "💧", "🦾"];

export function RecipeCreateForm() {
  const [form, setForm] = useState<RecipeForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function appendEmoji(field: keyof Pick<RecipeForm, "title" | "ingredients" | "preparation" | "notes">, emoji: string) {
    setForm((prev) => ({
      ...prev,
      [field]: `${prev[field]}${prev[field] ? " " : ""}${emoji}`,
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiClient<Recipe>("/api/recipes", {
        method: "POST",
        body: form,
      });
      setForm(defaultForm);
      setSuccess("Receita cadastrada com sucesso.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao salvar receita.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova receita</h1>
          <p className="text-sm text-slate-500">Cadastre receitas com valor nutricional para uso clinico rapido.</p>
        </div>
        <Link href="/recipes">
          <Button variant="secondary">Ver receitas cadastradas</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Titulo da receita</label>
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <EmojiRow emojis={TITLE_EMOJIS} onClick={(emoji) => appendEmoji("title", emoji)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de receita</label>
            <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as RecipeType })}>
              {RECIPE_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Porcoes</label>
            <Input type="number" min={1} value={form.servings} onChange={(event) => setForm({ ...form, servings: Number(event.target.value) })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Kcal</label>
            <Input type="number" min={0} step="0.1" value={form.kcal} onChange={(event) => setForm({ ...form, kcal: Number(event.target.value) })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Carboidratos (g)</label>
            <Input type="number" min={0} step="0.1" value={form.carbs} onChange={(event) => setForm({ ...form, carbs: Number(event.target.value) })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Proteinas (g)</label>
            <Input type="number" min={0} step="0.1" value={form.proteins} onChange={(event) => setForm({ ...form, proteins: Number(event.target.value) })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Gorduras (g)</label>
            <Input type="number" min={0} step="0.1" value={form.fats} onChange={(event) => setForm({ ...form, fats: Number(event.target.value) })} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Ingredientes</label>
            <Textarea rows={4} value={form.ingredients} onChange={(event) => setForm({ ...form, ingredients: event.target.value })} required />
            <EmojiRow emojis={CONTENT_EMOJIS} onClick={(emoji) => appendEmoji("ingredients", emoji)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Modo de preparo</label>
            <Textarea rows={4} value={form.preparation} onChange={(event) => setForm({ ...form, preparation: event.target.value })} required />
            <EmojiRow emojis={CONTENT_EMOJIS} onClick={(emoji) => appendEmoji("preparation", emoji)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Observacoes (opcional)</label>
            <Textarea rows={2} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            <EmojiRow emojis={CONTENT_EMOJIS} onClick={(emoji) => appendEmoji("notes", emoji)} />
          </div>
          <div className="md:col-span-2">
            <ErrorText message={error} />
            <SuccessText message={success} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar receita"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function EmojiRow({ emojis, onClick }: { emojis: string[]; onClick: (emoji: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      <span className="mr-1 text-xs text-slate-500">Emojis:</span>
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onClick(emoji)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm transition hover:bg-slate-50"
          aria-label={`Inserir ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
