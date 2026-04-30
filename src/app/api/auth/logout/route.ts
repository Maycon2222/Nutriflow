import { NextResponse } from "next/server";
import { authConfig } from "@/utils/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logout efetuado com sucesso." });
  response.cookies.set(authConfig.SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
