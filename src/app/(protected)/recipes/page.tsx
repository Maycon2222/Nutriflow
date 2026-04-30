import { prisma } from "@/database/prisma";
import { RecipesGallery } from "@/components/recipes/recipes-gallery";
import { requireCurrentUser } from "@/services/session-service";

export default async function RecipesPage() {
  const user = await requireCurrentUser();
  const recipes = await prisma.recipe.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return <RecipesGallery recipes={recipes} />;
}
