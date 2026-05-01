import { createHash, randomBytes } from "crypto";
import { prisma } from "@/database/prisma";

const TOKEN_EXPIRATION_MINUTES = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getAppUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export async function createPasswordResetToken(userId: string) {
  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return token;
}

export function buildPasswordResetLink(token: string) {
  return `${getAppUrl()}/reset-password?token=${token}`;
}

export async function sendPasswordResetMessage(recipientEmail: string, link: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !sender) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Servico de e-mail nao configurado. Defina RESEND_API_KEY e RESEND_FROM_EMAIL.");
    }
    console.log(`[password-reset] ${recipientEmail} => ${link}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: recipientEmail,
      subject: "Redefinicao de senha - NutriAcademy",
      html: `<p>Voce solicitou redefinicao de senha.</p><p><a href="${link}">Clique aqui para redefinir</a></p><p>Expira em 30 minutos.</p>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao enviar e-mail de redefinicao: ${body}`);
  }
}

export async function consumePasswordResetToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!token || token.usedAt || token.expiresAt < new Date()) {
    return null;
  }

  return token;
}

export async function markPasswordResetTokenUsed(id: string) {
  await prisma.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}
