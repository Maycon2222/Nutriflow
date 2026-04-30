import { RecipeType } from "@prisma/client";

export const RECIPE_TYPE_OPTIONS = [
  { value: RecipeType.BREAKFAST, label: "Cafe da manha" },
  { value: RecipeType.MORNING_SNACK, label: "Lanche da manha" },
  { value: RecipeType.LUNCH, label: "Almoco" },
  { value: RecipeType.AFTERNOON_SNACK, label: "Lanche da tarde" },
  { value: RecipeType.DINNER, label: "Janta" },
  { value: RecipeType.SUPPER, label: "Ceia" },
  { value: RecipeType.DESSERT, label: "Sobremesa" },
];

export const recipeTypeLabel: Record<RecipeType, string> = {
  BREAKFAST: "Cafe da manha",
  MORNING_SNACK: "Lanche da manha",
  LUNCH: "Almoco",
  AFTERNOON_SNACK: "Lanche da tarde",
  DINNER: "Janta",
  SUPPER: "Ceia",
  DESSERT: "Sobremesa",
};
