import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import {
  buildPasswordResetLink,
  createPasswordResetToken,
  sendPasswordResetMessage,
} from "@/services/password-reset-service";
import { forgotPasswordSchema } from "@/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.parse(body);
    const email = parsed.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = await createPasswordResetToken(user.id);
      const link = buildPasswordResetLink(token);
      await sendPasswordResetMessage(user.email, link);
    }

    return NextResponse.json({
      message: "Se este e-mail existir, enviaremos um link para redefinicao de senha.",
    });
  } catch (error) {
    return apiError(error);
  }
}

