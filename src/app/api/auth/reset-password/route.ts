import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { consumePasswordResetToken } from "@/services/password-reset-service";
import { resetPasswordSchema } from "@/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.parse(body);

    const token = await consumePasswordResetToken(parsed.token);
    if (!token) {
      return NextResponse.json({ error: "Link de redefinicao invalido ou expirado." }, { status: 400 });
    }

    const passwordHash = await hash(parsed.password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    return apiError(error);
  }
}
