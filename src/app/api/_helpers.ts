import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Erro interno." }, { status: 500 });
}
