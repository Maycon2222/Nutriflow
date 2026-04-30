"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorText, SuccessText } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/services/api-client";

export function AccountForm({ name, email }: { name: string; email: string }) {
  const [form, setForm] = useState({ name, email, password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiClient("/api/users/me", {
        method: "PATCH",
        body: form,
      });
      setSuccess("Dados da conta atualizados com sucesso.");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nao foi possivel atualizar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
        <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Nova senha (opcional)</label>
        <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
      </div>
      <ErrorText message={error} />
      <SuccessText message={success} />
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar alteracoes"}
        </Button>
      </div>
    </form>
  );
}
