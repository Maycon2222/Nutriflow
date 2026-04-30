import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "nutrition_session";
const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado.");
  return encoder.encode(secret);
}

type SessionPayload = {
  userId: string;
  email: string;
  name: string;
};

export async function createSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as SessionPayload;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export const authConfig = {
  SESSION_COOKIE,
};
