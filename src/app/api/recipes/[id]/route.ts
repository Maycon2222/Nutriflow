import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;

    const existing = await prisma.recipe.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Receita nao encontrada." }, { status: 404 });
    }

    await prisma.recipe.delete({ where: { id } });
    return NextResponse.json({ message: "Receita removida." });
  } catch (error) {
    return apiError(error);
  }
}
