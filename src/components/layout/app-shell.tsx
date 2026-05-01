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
  { href: "/settings", label: "ConfiguraÃ§Ãµes", icon: Settings },
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
      <div className="mx-auto flex w-full max-w-7xl gap-4 p-4 md:p-6">
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
          <header className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">GestÃ£o clÃ­nica nutricional</p>
              <form onSubmit={handleGlobalSearch} className="flex w-full gap-2 md:w-auto">
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
    </div>
  );
}

