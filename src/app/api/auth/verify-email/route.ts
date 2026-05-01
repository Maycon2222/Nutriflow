import { NextRequest, NextResponse } from "next/server";
import { consumeEmailVerificationToken } from "@/services/email-verification-service";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const appUrl = (process.env.APP_URL ?? request.nextUrl.origin).replace(/\/+$/, "");

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?verified=missing-token`);
  }

  const user = await consumeEmailVerificationToken(token);
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login?verified=invalid-token`);
  }

  return NextResponse.redirect(`${appUrl}/login?verified=success`);
}

