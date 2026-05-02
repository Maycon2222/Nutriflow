import { prisma } from "@/database/prisma";
import { RecipesGallery } from "@/components/recipes/recipes-gallery";
import { DEFAULT_RECIPES } from "@/models/default-recipes";
import { requireCurrentUser } from "@/services/session-service";

export default async function RecipesPage() {
  const user = await requireCurrentUser();
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  const sharedRecipes = recipes.map((recipe) => ({
    ...recipe,
    canDelete: recipe.userId === user.id,
    isDefault: false,
  }));

  const defaultRecipes = DEFAULT_RECIPES.map((recipe) => ({
    ...recipe,
    userId: "system",
    createdAt: new Date(0),
    updatedAt: new Date(0),
    canDelete: false,
    isDefault: true,
  }));

  const allRecipes = [...defaultRecipes, ...sharedRecipes].sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return <RecipesGallery recipes={allRecipes} />;
}
