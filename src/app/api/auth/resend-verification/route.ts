import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import {
  buildEmailVerificationLink,
  createEmailVerificationToken,
  sendEmailVerificationMessage,
} from "@/services/email-verification-service";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Informe um e-mail valido." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Se o e-mail existir, um novo link sera enviado." });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ message: "Este e-mail ja foi verificado." });
    }

    const token = await createEmailVerificationToken(user.id);
    const link = buildEmailVerificationLink(token);
    await sendEmailVerificationMessage(user.email, link);

    return NextResponse.json({ message: "Novo link de verificacao enviado." });
  } catch (error) {
    return apiError(error);
  }
}

