"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CalendarDays, Calculator, LayoutDashboard, Lightbulb, LogOut, Search, Settings, UserPlus, Users } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/services/api-client";
import { cn } from "@/utils/cn";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tips", label: "Dicas", icon: Lightbulb },
  { href: "/recipes", label: "Receitas", icon: BookOpen },
  { href: "/food-calculator", label: "Calc. Alimentos", icon: Calculator },
  { href: "/appointments", label: "Agendamentos", icon: CalendarDays },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/patients/new", label: "Novo Paciente", icon: UserPlus },
  { href: "/settings", label: "Configuracoes", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("search") ?? "");
  const [loadingLogout, setLoadingLogout] = useState(false);

  async function logout() {
    try {
      setLoadingLogout(true);
      await apiClient("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoadingLogout(false);
    }
  }

  function handleGlobalSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return router.push("/patients");
    router.push(`/patients?search=${encodeURIComponent(value)}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-emerald-50 to-sky-50">
      <div className="mx-auto flex w-full max-w-7xl gap-4 p-4 pb-24 md:p-6 md:pb-6">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:block">
          <h1 className="mb-6 text-xl font-bold text-teal-700">NutriAcademy</h1>
          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Button variant="ghost" className="mt-8 w-full justify-start" onClick={logout} disabled={loadingLogout}>
            <LogOut size={16} className="mr-2" />
            {loadingLogout ? "Saindo..." : "Sair"}
          </Button>
        </aside>

        <main className="flex-1">
          <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:hidden">
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-lg font-bold text-teal-700">NutriAcademy</h1>
              <Button variant="ghost" onClick={logout} disabled={loadingLogout}>
                <LogOut size={16} className="mr-2" />
                {loadingLogout ? "Saindo..." : "Sair"}
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {links.slice(0, 6).map((link) => {
                const Icon = link.icon;
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={`mobile-${link.href}`}
                    href={link.href}
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium",
                      active
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600",
                    )}
                  >
                    <Icon size={13} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <header className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">Gestao clinica nutricional</p>
              <form onSubmit={handleGlobalSearch} className="grid w-full grid-cols-[1fr_auto] gap-2 md:flex md:w-auto">
                <Input
                  placeholder="Busca global: nome, telefone ou tags..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="md:w-80"
                />
                <Button type="submit" className="shrink-0">
                  <Search size={16} />
                </Button>
              </form>
            </div>
          </header>
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {[
            { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
            { href: "/patients", label: "Pacientes", icon: Users },
            { href: "/recipes", label: "Receitas", icon: BookOpen },
            { href: "/appointments", label: "Agenda", icon: CalendarDays },
          ].map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={`bottom-${item.href}`}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium",
                  active ? "text-teal-700" : "text-slate-500",
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={logout}
            disabled={loadingLogout}
            className="flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-rose-600"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </nav>
    </div>
  );
}
