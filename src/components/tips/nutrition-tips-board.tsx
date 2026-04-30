"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, X } from "lucide-react";

type Tip = {
  id: number;
  title: string;
  audience: string;
  category: string;
  icon: string;
  bullets: string[];
};

const tips: Tip[] = [
  {
    id: 1,
    title: "Prato equilibrado no dia a dia",
    audience: "Todos os publicos",
    category: "Alimentacao saudavel",
    icon: "\u{1F957}",
    bullets: [
      "Preencha metade do prato com verduras e legumes.",
      "Inclua proteina magra em toda refeicao principal.",
      "Ajuste carboidrato conforme rotina e nivel de atividade.",
    ],
  },
  {
    id: 2,
    title: "Hidratacao que funciona",
    audience: "Criancas, adultos e idosos",
    category: "Hidratacao",
    icon: "\u{1F4A7}",
    bullets: [
      "Comece o dia com agua antes do cafe.",
      "Distribua o consumo durante o dia, nao de uma vez.",
      "Use garrafa visivel para criar constancia.",
    ],
  },
  {
    id: 3,
    title: "Lanches praticos para rotina corrida",
    audience: "Trabalho e estudo",
    category: "Praticidade",
    icon: "\u{1F34E}",
    bullets: [
      "Fruta + iogurte natural + aveia.",
      "Sanduiche integral com proteina e salada.",
      "Oleaginosas em porcao pequena para saciedade.",
    ],
  },
  {
    id: 4,
    title: "Estrategia nutricional para treino",
    audience: "Ativos e atletas",
    category: "Performance",
    icon: "\u{1F3CB}\uFE0F",
    bullets: [
      "Pre-treino com energia facil de digerir.",
      "Pos-treino com proteina e carboidrato para recuperacao.",
      "Evite treinos longos sem ingestao adequada.",
    ],
  },
  {
    id: 5,
    title: "Cafe da manha com mais saciedade",
    audience: "Rotina diaria",
    category: "Organizacao",
    icon: "\u{1F95A}",
    bullets: [
      "Combine proteina + fibra no cafe da manha.",
      "Exemplo pratico: ovos mexidos + fruta + aveia.",
      "Evite comecar o dia apenas com carboidrato simples.",
    ],
  },
  {
    id: 6,
    title: "Coma com atencao e sem pressa",
    audience: "Todos os publicos",
    category: "Comportamento alimentar",
    icon: "\u{1F9E0}",
    bullets: [
      "Mastigue devagar e observe sinais de fome e saciedade.",
      "Evite refeicoes com celular ou TV ligada sempre que possivel.",
      "Pausas curtas durante a refeicao ajudam no controle de porcao.",
    ],
  },
  {
    id: 7,
    title: "Tenha uma base de compras inteligente",
    audience: "Casa e familia",
    category: "Planejamento",
    icon: "\u{1F6D2}",
    bullets: [
      "Monte lista com frutas, legumes, proteinas e graos.",
      "Compre versoes simples e pouco processadas.",
      "Defina 1 dia fixo para reposicao da geladeira.",
    ],
  },
  {
    id: 8,
    title: "Sono e alimentacao andam juntos",
    audience: "Adultos",
    category: "Estilo de vida",
    icon: "\u{1F634}",
    bullets: [
      "Noites curtas podem aumentar vontade de doces.",
      "Evite cafeina perto do horario de dormir.",
      "Ceias leves podem ajudar no conforto noturno.",
    ],
  },
  {
    id: 9,
    title: "Monte lanches de emergencia",
    audience: "Trabalho e estudo",
    category: "Praticidade",
    icon: "\u{1F9C3}",
    bullets: [
      "Deixe sempre 1 opcao saudavel na bolsa/mochila.",
      "Boas opcoes: castanhas, fruta, barrinha simples, iogurte.",
      "Isso reduz chance de escolhas impulsivas no dia corrido.",
    ],
  },
  {
    id: 10,
    title: "Regra simples para bebidas",
    audience: "Todos os publicos",
    category: "Habitos diarios",
    icon: "\u{1F964}",
    bullets: [
      "Priorize agua na maior parte do dia.",
      "Reduza bebidas muito acucaradas no dia a dia.",
      "Se consumir suco, prefira porcao pequena e sem adicao de acucar.",
    ],
  },
];

export function NutritionTipsBoard() {
  const [openId, setOpenId] = useState<number | null>(null);
  const activeTip = tips.find((tip) => tip.id === openId) ?? null;

  return (
    <div className="space-y-5">
      <div className={`space-y-5 transition ${activeTip ? "blur-sm" : ""}`}>
        <section className="relative overflow-hidden rounded-3xl border border-lime-200 bg-gradient-to-br from-lime-50 via-emerald-50 to-white p-6 shadow-sm">
          <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-lime-200/50 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-emerald-200/50 blur-2xl" />
          <div className="relative">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles size={14} />
              Serie visual interativa
            </p>
            <h1 className="text-3xl font-extrabold leading-tight text-emerald-800">10 Dicas de Alimentacao Saudavel</h1>
            <p className="mt-2 text-sm text-emerald-700/90">Pequenas escolhas diarias fazem grande diferenca para todos os perfis de paciente.</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tips.map((tip) => {
            const open = openId === tip.id;
            return (
              <article
                key={tip.id}
                className="group relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-500 to-lime-500 p-0.5 shadow-sm transition hover:shadow-lg"
              >
                <div className="animate-float-soft relative h-full rounded-[22px] bg-white/95 p-4">
                  <div className="pointer-events-none absolute -left-10 top-0 h-20 w-10 rotate-12 bg-white/40 blur-sm animate-shine-sweep" />

                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-orange-400 px-2 py-1 text-xs font-bold text-white">{tip.id}</span>
                    <span className="text-2xl" aria-hidden>
                      {tip.icon}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{tip.category}</p>
                  <h2 className="mt-1 text-base font-bold leading-tight text-slate-900">{tip.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{tip.audience}</p>

                  <button
                    type="button"
                    onClick={() => setOpenId(tip.id)}
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    {open ? "Dica ativa" : "Ver dica"}
                    <ChevronDown size={14} className={`transition ${open ? "rotate-180" : "rotate-0"}`} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {activeTip ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm" onClick={() => setOpenId(null)}>
          <div
            className="w-full max-w-2xl rounded-3xl border border-emerald-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {activeTip.icon} {activeTip.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {activeTip.category} - {activeTip.audience}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 p-5">
              {activeTip.bullets.map((item) => (
                <div key={item} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
