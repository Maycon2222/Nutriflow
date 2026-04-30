import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import { createSession, authConfig } from "@/utils/auth";
import { registerSchema } from "@/utils/validation";
import { apiError } from "@/app/api/_helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (exists) {
      return NextResponse.json({ error: "Já existe usuário com este e-mail." }, { status: 409 });
    }

    const passwordHash = await hash(parsed.password, 10);

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash,
      },
    });

    const token = await createSession({ userId: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({ message: "Conta criada com sucesso." });
    response.cookies.set(authConfig.SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
