import { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import {
  buildEmailVerificationLink,
  createEmailVerificationToken,
  sendEmailVerificationMessage,
} from "@/services/email-verification-service";
import { authConfig, createSession } from "@/utils/auth";
import { registerSchema } from "@/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const email = parsed.email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Ja existe usuario com este e-mail." }, { status: 409 });
    }

    const passwordHash = await hash(parsed.password, 10);
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? UserRole.ADMIN : UserRole.USER;
    const shouldAutoVerify = role === UserRole.ADMIN;

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email,
        passwordHash,
        role,
        emailVerifiedAt: shouldAutoVerify ? new Date() : null,
      },
    });

    if (!shouldAutoVerify) {
      const verificationToken = await createEmailVerificationToken(user.id);
      const verificationLink = buildEmailVerificationLink(verificationToken);
      await sendEmailVerificationMessage(user.email, verificationLink);

      return NextResponse.json({
        message: "Conta criada. Verifique seu e-mail para ativar o acesso.",
        requiresVerification: true,
      });
    }

    const token = await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role });
    const response = NextResponse.json({
      message: "Conta de administrador criada com sucesso.",
      requiresVerification: false,
    });

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
