import { createHash, randomBytes } from "crypto";
import { prisma } from "@/database/prisma";

const TOKEN_EXPIRATION_HOURS = 24;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getAppUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export async function createEmailVerificationToken(userId: string) {
  await prisma.emailVerificationToken.deleteMany({
    where: { userId, usedAt: null },
  });

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return token;
}

export function buildEmailVerificationLink(token: string) {
  const base = getAppUrl().replace(/\/+$/, "");
  return `${base}/api/auth/verify-email?token=${token}`;
}

export async function sendEmailVerificationMessage(recipientEmail: string, link: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !sender) {
    console.log(`[email-verification] ${recipientEmail} => ${link}`);
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
      subject: "Confirme seu e-mail no NutriFlow",
      html: `<p>Confirme seu e-mail para ativar sua conta:</p><p><a href="${link}">${link}</a></p>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao enviar e-mail de verificacao: ${body}`);
  }
}

export async function consumeEmailVerificationToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const token = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!token || token.usedAt || token.expiresAt < new Date()) {
    return null;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return token.user;
}

