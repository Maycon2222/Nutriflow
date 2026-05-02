import { RecipeType } from "@prisma/client";

export type DefaultRecipe = {
  id: string;
  title: string;
  type: RecipeType;
  servings: number;
  kcal: number;
  carbs: number;
  proteins: number;
  fats: number;
  ingredients: string;
  preparation: string;
  notes?: string;
};

export const DEFAULT_RECIPES: DefaultRecipe[] = [
  {
    id: "default-omelete-aveia",
    title: "Omelete de aveia",
    type: RecipeType.BREAKFAST,
    servings: 1,
    kcal: 290,
    carbs: 18,
    proteins: 20,
    fats: 14,
    ingredients: "2 ovos, 2 colheres de aveia, sal, oregano e tomate.",
    preparation: "Misture tudo e prepare em frigideira antiaderente em fogo baixo.",
    notes: "Receita padrao da plataforma (nao editavel).",
  },
  {
    id: "default-frango-arroz",
    title: "Frango com arroz e legumes",
    type: RecipeType.LUNCH,
    servings: 1,
    kcal: 520,
    carbs: 56,
    proteins: 38,
    fats: 13,
    ingredients: "120g peito de frango, 100g arroz cozido, legumes variados e azeite.",
    preparation: "Grelhe o frango, cozinhe o arroz e monte com legumes salteados.",
    notes: "Receita padrao da plataforma (nao editavel).",
  },
  {
    id: "default-iogurte-frutas",
    title: "Iogurte com frutas e chia",
    type: RecipeType.MORNING_SNACK,
    servings: 1,
    kcal: 260,
    carbs: 30,
    proteins: 13,
    fats: 8,
    ingredients: "170g iogurte natural, frutas picadas e 1 colher de chia.",
    preparation: "Misture os ingredientes e consuma gelado.",
    notes: "Receita padrao da plataforma (nao editavel).",
  },
];

