import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { recipeSchema } from "@/utils/validation";

export async function GET() {
  try {
    await requireCurrentUser();
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(recipes);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const body = await request.json();
    const parsed = recipeSchema.parse(body);

    const recipe = await prisma.recipe.create({
      data: {
        userId: user.id,
        ...parsed,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
