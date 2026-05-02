"use client";

import { RecipeType } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { RECIPE_TYPE_OPTIONS, recipeTypeLabel } from "@/models/recipe";
import { apiClient } from "@/services/api-client";

type GalleryRecipe = {
  id: string;
  userId: string;
  title: string;
  type: RecipeType;
  servings: number;
  kcal: number;
  carbs: number;
  proteins: number;
  fats: number;
  ingredients: string;
  preparation: string;
  notes?: string | null;
  canDelete: boolean;
  isDefault: boolean;
};

export function RecipesGallery({ recipes }: { recipes: GalleryRecipe[] }) {
  const [items, setItems] = useState(recipes);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecipeType | "ALL">("ALL");
  const [selectedRecipe, setSelectedRecipe] = useState<GalleryRecipe | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<GalleryRecipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase().trim();
    return items.filter((recipe) => {
      const typeOk = typeFilter === "ALL" || recipe.type === typeFilter;
      const queryOk =
        !lower ||
        recipe.title.toLowerCase().includes(lower) ||
        recipe.ingredients.toLowerCase().includes(lower) ||
        recipe.preparation.toLowerCase().includes(lower);
      return typeOk && queryOk;
    });
  }, [items, query, typeFilter]);

  async function confirmDeleteRecipe() {
    if (!recipeToDelete) return;
    setError(null);
    setSuccess(null);

    if (!recipeToDelete.canDelete || recipeToDelete.isDefault) {
      setError("Voce so pode excluir receitas criadas por voce.");
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient(`/api/recipes/${recipeToDelete.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((recipe) => recipe.id !== recipeToDelete.id));
      setSelectedRecipe((prev) => (prev?.id === recipeToDelete.id ? null : prev));
      setSuccess("Receita excluida com sucesso.");
      setRecipeToDelete(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Falha ao excluir receita.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative">
      <div className={`space-y-4 transition ${selectedRecipe ? "blur-sm" : ""}`}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Receitas de rotina</h1>
            <p className="text-sm text-slate-500">Explore receitas prontas com macros e preparo para aplicar na consulta.</p>
          </div>
          <Link href="/recipes/new">
            <Button>Cadastrar nova receita</Button>
          </Link>
        </div>

        <Card>
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome, ingrediente ou preparo"
                className="pl-9"
              />
            </div>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-300"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as RecipeType | "ALL")}
            >
              <option value="ALL">Todos os tipos</option>
              {RECIPE_TYPE_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <ErrorText message={error} />
        <SuccessText message={success} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((recipe) => {
            return (
              <article
                key={recipe.id}
                className="group overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-100/70 to-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">{recipe.title}</h3>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-emerald-700">{recipeTypeLabel[recipe.type]}</span>
                  </div>

                  {recipe.isDefault ? (
                    <p className="text-[11px] font-medium text-emerald-700">Receita padrao</p>
                  ) : (
                    <p className="text-[11px] font-medium text-slate-500">{recipe.canDelete ? "Criada por voce" : "Compartilhada"}</p>
                  )}

                  <p className="text-xs text-slate-500">Rendimento: {recipe.servings} porcao(oes)</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <NutritionPill label="Kcal" value={recipe.kcal} />
                    <NutritionPill label="Carbs" value={recipe.carbs} suffix="g" />
                    <NutritionPill label="Proteinas" value={recipe.proteins} suffix="g" />
                    <NutritionPill label="Gorduras" value={recipe.fats} suffix="g" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRecipe(recipe)}
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Ver ingredientes e preparo
                  </button>

                  {recipe.canDelete && !recipe.isDefault ? (
                    <button
                      type="button"
                      onClick={() => setRecipeToDelete(recipe)}
                      className="ml-2 mt-3 inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                      Excluir
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>

        {filtered.length === 0 ? <p className="text-sm text-slate-500">Nenhuma receita encontrada para este filtro.</p> : null}
      </div>

      {selectedRecipe ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-emerald-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedRecipe.title}</h3>
                <p className="text-sm text-slate-500">
                  {recipeTypeLabel[selectedRecipe.type]} - Rendimento: {selectedRecipe.servings} porcao(oes)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                <NutritionPill label="Kcal" value={selectedRecipe.kcal} />
                <NutritionPill label="Carbs" value={selectedRecipe.carbs} suffix="g" />
                <NutritionPill label="Proteinas" value={selectedRecipe.proteins} suffix="g" />
                <NutritionPill label="Gorduras" value={selectedRecipe.fats} suffix="g" />
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-emerald-800">Ingredientes</p>
                <p className="mt-1">{selectedRecipe.ingredients}</p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-sky-800">Modo de preparo</p>
                <p className="mt-1">{selectedRecipe.preparation}</p>
              </div>

              {selectedRecipe.notes ? (
                <div className="rounded-2xl bg-rose-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-rose-800">Observacoes</p>
                  <p className="mt-1">{selectedRecipe.notes}</p>
                </div>
              ) : null}

              {selectedRecipe.canDelete && !selectedRecipe.isDefault ? (
                <div className="flex justify-end">
                  <Button variant="danger" onClick={() => setRecipeToDelete(selectedRecipe)}>
                    <Trash2 size={14} className="mr-1" />
                    Excluir receita
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={!!recipeToDelete}
        title="Excluir receita"
        description={`Tem certeza que deseja excluir a receita "${recipeToDelete?.title ?? ""}"? Essa acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={confirmDeleteRecipe}
        onCancel={() => setRecipeToDelete(null)}
        loading={isDeleting}
      />
    </div>
  );
}

function NutritionPill({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-lg bg-white/80 p-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">
        {value}
        {suffix}
      </p>
    </div>
  );
}
