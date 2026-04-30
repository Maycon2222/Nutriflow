import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as { name?: string; email?: string; password?: string };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e e-mail sao obrigatorios." }, { status: 400 });
    }

    const emailOwner = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (emailOwner && emailOwner.id !== user.id) {
      return NextResponse.json({ error: "E-mail ja utilizado por outro usuario." }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        ...(password ? { passwordHash: await hash(password, 10) } : {}),
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error);
  }
}
