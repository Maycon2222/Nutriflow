"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/services/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient<{ requiresVerification?: boolean }>(`/api/auth/${mode}`, {
        method: "POST",
        body: mode === "register" ? formData : { email: formData.email, password: formData.password },
      });

      if (mode === "register") {
        if (!result.requiresVerification) {
          setSuccess("Conta criada com sucesso. Agora voce ja pode entrar.");
          setMode("login");
          return;
        }
        setSuccess("Conta criada.");
        setMode("login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-emerald-50 to-sky-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold text-teal-700">NutriAcademy</h1>
        <p className="mt-1 text-sm text-slate-500">Plataforma clinica para gestao nutricional</p>

        <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            className={`rounded-md py-2 text-sm font-medium ${mode === "login" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
            onClick={() => setMode("login")}
            type="button"
          >
            Entrar
          </button>
          <button
            className={`rounded-md py-2 text-sm font-medium ${mode === "register" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
            onClick={() => setMode("register")}
            type="button"
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nome profissional</label>
              <Input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <Input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
            <Input type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} required />
          </div>
          {mode === "login" ? (
            <Link href="/forgot-password" className="inline-block text-xs font-medium text-teal-700 hover:text-teal-800">
              Esqueci minha senha
            </Link>
          ) : null}
          <SuccessText message={success} />
          <ErrorText message={error} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar na plataforma" : "Criar conta"}
          </Button>
        </form>
      </div>
    </div>
  );
}

