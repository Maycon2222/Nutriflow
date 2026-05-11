import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ClipboardList,
  Database,
  HeartPulse,
  Mail,
  Phone,
  Target,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/utils/auth";

const features = [
  { title: "Calculo energetico inteligente", text: "Estimativas progressivas com formulas cientificas e ajuste por nivel de dados.", icon: BrainCircuit },
  { title: "Prescricao de macros", text: "Distribuicao por percentual ou g/kg com alertas de faixa segura para CHO, PTN e FAT.", icon: Target },
  { title: "Acompanhamento de pacientes", text: "Historico clinico, anamneses, consultas e evolucao em um unico fluxo.", icon: UserRound },
  { title: "Organizacao de dados nutricionais", text: "Centralize antropometria, observacoes, metas e status em uma ficha unica.", icon: Database },
  { title: "Interface pratica para nutricionistas", text: "Rotina otimizada para consulta, tomada de decisao e ganho de produtividade.", icon: ClipboardList },
] as const;

const steps = [
  { title: "Cadastro e acesso", text: "A profissional entra na plataforma e ativa seu ambiente de atendimento." },
  { title: "Dados do paciente", text: "As informacoes clinicas sao registradas de forma guiada e segura." },
  { title: "Calculo automatico", text: "O sistema aplica formulas e sugere estrategia inicial com confiabilidade." },
  { title: "Ajuste e acompanhamento", text: "As condutas evoluem com novos dados e retornos do paciente." },
] as const;

const collaborators = [
  { name: "Dra. Helena Costa", role: "Nutricionista Clinica", bio: "Especialista em planejamento alimentar individualizado e adesao de longo prazo." },
  { name: "Rafael Mendes", role: "Analista de Dados em Saude", bio: "Transforma dados clinicos em insights para apoiar decisoes nutricionais assertivas." },
  { name: "Camila Nogueira", role: "Product Designer", bio: "Responsavel por fluxos intuitivos para acelerar o trabalho no consultorio." },
] as const;

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user?.userId) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href="#inicio" className="text-xl font-bold text-teal-700">NutriAcademy</Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="#inicio" className="hover:text-teal-700">Inicio</Link>
            <Link href="#sobre" className="hover:text-teal-700">Sobre</Link>
            <Link href="#funcionalidades" className="hover:text-teal-700">Funcionalidades</Link>
            <Link href="#contato" className="hover:text-teal-700">Contato</Link>
          </nav>
          <Link href="/login" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
            Entrar
          </Link>
        </div>
      </header>

      <section id="inicio" className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="space-y-5">
          <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">Plataforma clinica de nutricao</span>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Nutricao, performance e dados em uma estacao de trabalho unica.
          </h1>
          <p className="text-base text-slate-600 md:text-lg">
            Organize pacientes, acelere calculos energeticos e acompanhe evolucoes com uma experiencia moderna para a rotina da nutricionista.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700">
              Comecar agora
            </Link>
            <Link href="#sobre" className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
              Saiba mais
            </Link>
          </div>
        </div>
        <Card className="relative overflow-hidden border-teal-100 bg-gradient-to-br from-white to-teal-50">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-100" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-100" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-teal-700 shadow-sm">
              <HeartPulse size={16} /> Monitoramento inteligente
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Gestao completa para consultas nutricionais mais eficientes.</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Calculos automatizados</p>
                <p className="text-sm font-semibold text-slate-800">TMB, GET e macros</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Fluxo clinico</p>
                <p className="text-sm font-semibold text-slate-800">Anamnese e evolucao</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section id="sobre" className="mx-auto w-full max-w-6xl px-4 py-8">
        <Card>
          <h3 className="text-2xl font-bold text-slate-900">Sobre a plataforma</h3>
          <p className="mt-3 text-slate-600">
            A NutriAcademy nasceu da rotina real de consultorio: pouco tempo entre atendimentos e muita informacao para organizar. O projeto comecou como uma planilha evoluida e virou uma plataforma completa para apoiar decisoes nutricionais com base em dados e pratica clinica.
          </p>
          <p className="mt-3 text-slate-600">
            Nossa missao e simplificar a gestao nutricional sem perder precisao tecnica. Nossa visao e tornar o acompanhamento nutricional mais humano, eficiente e orientado por evidencias.
          </p>
        </Card>
      </section>

      <section id="funcionalidades" className="mx-auto w-full max-w-6xl px-4 py-8">
        <h3 className="mb-4 text-2xl font-bold text-slate-900">Funcionalidades</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="transition hover:-translate-y-0.5 hover:shadow-md">
              <feature.icon className="mb-3 text-teal-700" size={20} />
              <h4 className="text-lg font-semibold text-slate-900">{feature.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{feature.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <h3 className="mb-4 text-2xl font-bold text-slate-900">Como funciona</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <Card key={step.title} className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                {index + 1}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{step.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{step.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <h3 className="mb-4 text-2xl font-bold text-slate-900">Equipe e colaboradores</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {collaborators.map((person) => (
            <Card key={person.name}>
              <p className="text-lg font-semibold text-slate-900">{person.name}</p>
              <p className="mt-1 text-sm font-medium text-teal-700">{person.role}</p>
              <p className="mt-2 text-sm text-slate-600">{person.bio}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="contato" className="mx-auto w-full max-w-6xl px-4 py-8">
        <Card className="border-slate-800 bg-slate-900">
          <h3 className="text-2xl font-bold text-white">Contato</h3>
          <p className="mt-2 text-sm text-slate-200">Fale com nosso time para tirar duvidas e conhecer o fluxo ideal para sua clinica.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link href="mailto:contato@nutriacademy.app" className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700">
              <Mail size={16} className="mb-2 text-teal-300" /> contato@nutriacademy.app
            </Link>
            <Link href="tel:+5582999999999" className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700">
              <Phone size={16} className="mb-2 text-teal-300" /> +55 (82) 99999-9999
            </Link>
            <Link href="https://instagram.com/nutriacademy.app" className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700">
              <Activity size={16} className="mb-2 text-teal-300" /> @nutriacademy.app
            </Link>
          </div>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="flex flex-col items-start justify-between gap-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white md:flex-row md:items-center">
          <div>
            <p className="text-xl font-semibold">Pronto para elevar a produtividade da sua rotina clinica?</p>
            <p className="mt-1 text-sm text-teal-50">Comece agora e centralize tudo em um unico lugar.</p>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-slate-100">
            Entrar na plataforma <ArrowRight size={16} />
          </Link>
        </Card>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} NutriAcademy. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="#inicio" className="hover:text-teal-700">Inicio</Link>
            <Link href="#funcionalidades" className="hover:text-teal-700">Funcionalidades</Link>
            <Link href="#contato" className="hover:text-teal-700">Contato</Link>
            <Link href="/login" className="hover:text-teal-700">Entrar</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
