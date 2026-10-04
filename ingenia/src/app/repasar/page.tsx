"use client";
import { useState } from "react";
import Link from "next/link";
import { getTopic } from "@/content/topics";
import { useProgress } from "@/lib/store";
import { activeTopics, dueTopics, recommendations } from "@/lib/learning";
import { Gate } from "@/components/layout/Gate";
import { Session, type SessionItem } from "@/components/session/Session";
import { PageHeader, SectionTitle, Empty, ProgressBar } from "@/components/ui/primitives";

function Review() {
  const s = useProgress();
  const [items, setItems] = useState<SessionItem[] | null>(null);
  const due = dueTopics(s);
  const recs = recommendations(s, 5);
  const active = activeTopics(s);

  if (items) return <Session title="Repaso" items={items} mode="repaso" onExit={() => setItems(null)} />;

  const startDue = () => {
    const pool = due.length ? due : active;
    setItems(Array.from({ length: Math.min(10, Math.max(5, pool.length * 2)) }, (_, i) => ({ topicId: pool[i % pool.length], adjust: -1 })));
  };

  return (
    <div>
      <PageHeader
        title="Repasar"
        subtitle="Repetición espaciada: cada tema vuelve justo antes de que se te olvide. Si acertás, el próximo repaso se aleja (1, 2, 4, 8… días); si fallás, vuelve mañana."
      />
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-3xl font-black">{due.length}</p>
          <p className="text-muted">{due.length === 1 ? "tema para repasar hoy" : "temas para repasar hoy"}</p>
        </div>
        <button className="btn btn-primary" onClick={startDue} disabled={!active.length}>
          {due.length ? "Repasar ahora" : "Repasar igual"}
        </button>
      </div>

      {!active.length && (
        <div className="mt-4">
          <Empty title="Todavía no hay nada para repasar">
            Completá una lección o practicá un tema y va a aparecer acá. <Link href="/mapa" className="font-semibold text-primary">Ir al mapa</Link>
          </Empty>
        </div>
      )}

      {recs.length > 0 && (
        <>
          <SectionTitle>Necesitás reforzar</SectionTitle>
          <p className="mb-3 text-sm text-muted">Te recomendamos practicar:</p>
          <ol className="space-y-2">
            {recs.map((r, i) => (
              <li key={r.topicId}>
                <button className="card flex w-full items-center gap-3 p-4 text-left hover:border-warn" onClick={() => setItems(Array.from({ length: 6 }, () => ({ topicId: r.topicId })))}>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-warn-soft font-bold text-warn">{i + 1}</span>
                  <span className="flex-1">
                    <span className="block font-bold">{getTopic(r.topicId)?.name}</span>
                    <span className="text-sm text-muted">{r.reason}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}

      {active.length > 0 && (
        <>
          <SectionTitle>Dominio por tema</SectionTitle>
          <div className="card space-y-3 p-5">
            {active
              .map((t) => ({ t, m: s.topics[t]?.mastery ?? 0, due: s.topics[t]?.due }))
              .sort((a, b) => a.m - b.m)
              .map(({ t, m, due: d }) => (
                <div key={t}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{getTopic(t)?.name}</span>
                    <span className="text-muted">
                      {Math.round(m * 100)}% {d && `· próximo repaso ${new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`}
                    </span>
                  </div>
                  <ProgressBar value={m} color={m >= 0.85 ? "var(--xp)" : m >= 0.6 ? "var(--primary)" : "var(--warn)"} label={getTopic(t)?.name} />
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Review />
    </Gate>
  );
}
