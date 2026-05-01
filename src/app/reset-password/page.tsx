"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/services/api-client";

export default function ResetPasswordPage() {
  const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") ?? "" : "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiClient<{ message: string }>("/api/auth/reset-password", {
        method: "POST",
        body: { token, password },
      });
      setSuccess(result.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-emerald-50 to-sky-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur">
          <ErrorText message="Token de redefinicao ausente." />
          <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:text-teal-800">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-emerald-50 to-sky-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold text-teal-700">Redefinir senha</h1>
        <p className="mt-1 text-sm text-slate-500">Digite sua nova senha para concluir o acesso.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nova senha</label>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
          </div>
          <SuccessText message={success} />
          <ErrorText message={error} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>

        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:text-teal-800">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
