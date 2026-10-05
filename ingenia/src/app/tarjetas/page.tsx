"use client";
import { useMemo, useState } from "react";
import { FORMULAS } from "@/content/formulas";
import { GLOSSARY } from "@/content/glossary";
import { LESSONS } from "@/content/lessons";
import { dayKey } from "@/engine/progress/dates";
import { actions, store, useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { MathText } from "@/components/math/MathText";
import { PageHeader, ProgressBar } from "@/components/ui/primitives";
import { GuideSay } from "@/components/guide/Nodo";
import { Icon } from "@/components/ui/Icon";

interface Card {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

type DeckId = "formulas" | "simbolos" | "lecciones";

function deckCards(deck: DeckId): Card[] {
  switch (deck) {
    case "formulas":
      return FORMULAS.map((f) => ({ id: `f:${f.id}`, front: `**${f.name}**\n\n¿Cuál es la fórmula y qué significa?`, back: `$${f.expression}$\n\n${f.meaning}`, hint: f.whenToUse }));
    case "simbolos":
      return GLOSSARY.map((g) => ({ id: `g:${g.symbol}`, front: "¿Qué significa el símbolo `" + g.symbol + "`?", back: `**${g.name}**\n\n${g.meaning}${g.example ? `\n\nEjemplo: ${g.example}` : ""}` }));
    case "lecciones":
      return LESSONS.flatMap((l) => {
        const sum = l.cards.find((c) => c.kind === "summary");
        return sum && sum.kind === "summary" ? [{ id: `l:${l.id}`, front: `**${l.title}**\n\n¿Qué es lo más importante de esta lección?`, back: sum.points.map((p) => `• ${p}`).join("\n\n") }] : [];
      });
  }
}

const DECKS: { id: DeckId; title: string; text: string; icon: string }[] = [
  { id: "formulas", title: "Fórmulas", text: "Expresión, significado y cuándo usarla", icon: "📐" },
  { id: "simbolos", title: "Símbolos", text: "El diccionario matemático", icon: "∑" },
  { id: "lecciones", title: "Ideas clave", text: "Lo importante de cada lección", icon: "💡" },
];

const isDue = (cards: Record<string, { due: string }>, id: string) => !cards[id] || cards[id].due <= dayKey();

function Review({ deck, onExit }: { deck: DeckId; onExit: () => void }) {
  const [queue] = useState(() => {
    const st = store.getState();
    const all = deckCards(deck);
    const due = all.filter((c) => isDue(st.cards, c.id));
    // Primero las ya vistas que vencieron, después hasta 10 nuevas.
    const seen = due.filter((c) => st.cards[c.id]);
    const fresh = due.filter((c) => !st.cards[c.id]).slice(0, 10);
    return [...seen, ...fresh].slice(0, 20);
  });
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knew, setKnew] = useState(0);

  if (!queue.length || i >= queue.length) {
    return (
      <div className="anim-pop mx-auto max-w-md space-y-4 text-center">
        <GuideSay mood="happy" className="justify-center text-left">
          {queue.length ? `Listo: ${knew} de ${queue.length} las sabías. Las que no, vuelven pronto.` : "No hay tarjetas pendientes en este mazo. Volvé mañana."}
        </GuideSay>
        <button className="btn btn-primary" onClick={onExit}>
          Volver a los mazos
        </button>
      </div>
    );
  }
  const card = queue[i];
  const answer = (k: boolean) => {
    actions.reviewCard(card.id, k);
    if (k) setKnew((n) => n + 1);
    setFlipped(false);
    setI(i + 1);
  };
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost !px-2" onClick={onExit} aria-label="Salir">
          <Icon name="x" />
        </button>
        <ProgressBar value={i / queue.length} label="Progreso del mazo" className="flex-1" />
        <span className="text-sm text-muted">
          {i + 1}/{queue.length}
        </span>
      </div>
      <button
        key={card.id + flipped}
        className="anim-pop card flex min-h-64 w-full flex-col items-center justify-center gap-3 p-6 text-center text-lg"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Respuesta. Tocá para ver la pregunta" : "Pregunta. Tocá para dar vuelta"}
      >
        <span className="chip">{flipped ? "Respuesta" : "Pregunta"}</span>
        <MathText text={flipped ? card.back : card.front} />
        {flipped && card.hint && <p className="text-sm text-muted">Cuándo usarla: {card.hint}</p>}
        {!flipped && <span className="text-sm text-muted">Pensá la respuesta y tocá para darla vuelta</span>}
      </button>
      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-secondary" onClick={() => answer(false)}>
            No la sabía
          </button>
          <button className="btn btn-primary" onClick={() => answer(true)} autoFocus>
            La sabía
          </button>
        </div>
      )}
    </div>
  );
}

function Decks() {
  const s = useProgress();
  const [deck, setDeck] = useState<DeckId | null>(null);
  const stats = useMemo(
    () =>
      Object.fromEntries(
        DECKS.map((d) => {
          const all = deckCards(d.id);
          return [d.id, { total: all.length, due: all.filter((c) => isDue(s.cards, c.id)).length, learned: all.filter((c) => (s.cards[c.id]?.box ?? 0) >= 2).length }];
        }),
      ) as Record<DeckId, { total: number; due: number; learned: number }>,
    [s.cards],
  );
  if (deck) return <Review deck={deck} onExit={() => setDeck(null)} />;
  return (
    <div className="space-y-5">
      <PageHeader title="Tarjetas" subtitle="Repetición espaciada: lo que sabés vuelve cada vez más tarde (1, 3, 7, 14 y 30 días); lo que no, vuelve enseguida." />
      <div className="grid gap-3 sm:grid-cols-3">
        {DECKS.map((d) => {
          const st = stats[d.id];
          return (
            <div key={d.id} className="card flex flex-col gap-3 p-5">
              <span className="text-3xl" aria-hidden>
                {d.icon}
              </span>
              <div>
                <p className="text-lg font-bold">{d.title}</p>
                <p className="text-sm text-muted">{d.text}</p>
              </div>
              <ProgressBar value={st.learned / Math.max(1, st.total)} label={`Aprendidas en ${d.title}`} />
              <p className="text-xs text-muted">
                {st.learned}/{st.total} aprendidas · {st.due} para hoy
              </p>
              <button className="btn btn-primary mt-auto" onClick={() => setDeck(d.id)} disabled={!st.due}>
                {st.due ? "Repasar" : "Al día ✓"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Decks />
    </Gate>
  );
}
