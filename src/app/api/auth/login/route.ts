import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { authConfig, createSession } from "@/utils/auth";
import { loginSchema } from "@/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    const email = parsed.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario ou senha invalidos." }, { status: 401 });
    }

    const validPassword = await compare(parsed.password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Usuario ou senha invalidos." }, { status: 401 });
    }

    const token = await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role });

    const response = NextResponse.json({ message: "Login efetuado com sucesso." });
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
