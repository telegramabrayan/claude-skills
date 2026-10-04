"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProgressState } from "@/engine/progress/state";
import { MASTERED } from "@/engine/progress/rules";
import { TOPICS, getTopic, SKILL_LABELS } from "@/content/topics";
import { findUnit } from "@/content/curriculum";
import { store, useProgress } from "@/lib/store";
import { activeTopics, recommendations } from "@/lib/learning";
import { Gate } from "@/components/layout/Gate";
import { Session, type SessionItem } from "@/components/session/Session";
import { PageHeader, Ring, SectionTitle } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import type { SkillId } from "@/engine/types";

type Kind = "tema" | "unidad" | "rapido" | "profundo" | "desafio";

const LEVEL_LABEL = ["", "Muy fácil", "Fácil", "Normal", "Difícil", "Nivel parcial", "Desafío"];

function mixed(s: ProgressState, n: number, adjust = 0): SessionItem[] {
  const pool = activeTopics(s);
  const base = pool.length ? pool : ["t-signos", "t-jerarquia", "t-fracciones"];
  const weak = recommendations(s, 3).map((r) => r.topicId);
  const ordered = [...weak, ...base.filter((t) => !weak.includes(t))];
  return Array.from({ length: n }, (_, i) => ({ topicId: ordered[i % ordered.length], adjust }));
}

function buildSession(kind: Kind, arg: string | null): { title: string; items: SessionItem[]; kind: "practica" | "desafio"; mode: "practica" | "rapido" | "profundo" | "desafio" } | null {
  const s = store.getState();
  switch (kind) {
    case "tema": {
      const t = arg && getTopic(arg);
      if (!t) return null;
      return { title: t.name, items: Array.from({ length: 8 }, () => ({ topicId: t.id })), kind: "practica", mode: "practica" };
    }
    case "unidad": {
      const u = arg ? findUnit(arg) : undefined;
      if (!u || !u.unit.topicIds.length) return null;
      return { title: u.unit.title, items: Array.from({ length: 10 }, (_, i) => ({ topicId: u.unit.topicIds[i % u.unit.topicIds.length] })), kind: "practica", mode: "practica" };
    }
    case "rapido":
      return { title: "Modo rápido · 5 minutos", items: mixed(s, 5), kind: "practica", mode: "rapido" };
    case "profundo":
      return { title: "Modo profundo", items: mixed(s, 20), kind: "practica", mode: "profundo" };
    case "desafio":
      return { title: "Desafío", items: mixed(s, 10, 1), kind: "desafio", mode: "desafio" };
  }
}

function Practice() {
  const params = useSearchParams();
  const router = useRouter();
  const s = useProgress();
  const initial = useMemo(() => {
    const tema = params.get("tema");
    const unidad = params.get("unidad");
    const modo = params.get("modo") as Kind | null;
    if (tema) return buildSession("tema", tema);
    if (unidad) return buildSession("unidad", unidad);
    if (modo && ["rapido", "profundo", "desafio"].includes(modo)) return buildSession(modo, null);
    return null;
  }, [params]);
  const [session, setSession] = useState(initial);
  const [sessionKey, setSessionKey] = useState(0);
  const active = session ?? initial;

  const start = (kind: Kind, arg: string | null = null) => {
    setSession(buildSession(kind, arg));
    setSessionKey((k) => k + 1);
  };

  if (active) {
    return (
      <Session
        key={sessionKey}
        title={active.title}
        items={active.items}
        mode={active.mode}
        kind={active.kind}
        onExit={() => {
          setSession(null);
          router.replace("/practicar");
        }}
      />
    );
  }

  const recs = recommendations(s, 3);
  const bySkill = new Map<SkillId, typeof TOPICS>();
  TOPICS.forEach((t) => bySkill.set(t.skill, [...(bySkill.get(t.skill) ?? []), t]));

  return (
    <div>
      <PageHeader title="Practicar" subtitle="Ejercicios que se generan al momento y se adaptan a tu nivel: si fallás seguido baja la dificultad; si acertás seguido, sube." />
      <div className="grid gap-3 sm:grid-cols-3">
        <button className="card flex items-center gap-3 p-4 text-left hover:border-primary" onClick={() => start("rapido")}>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
            <Icon name="clock" />
          </span>
          <span>
            <span className="block font-bold">Modo rápido</span>
            <span className="text-sm text-muted">5 ejercicios · ~5 min</span>
          </span>
        </button>
        <button className="card flex items-center gap-3 p-4 text-left hover:border-primary" onClick={() => start("profundo")}>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
            <Icon name="sparkle" />
          </span>
          <span>
            <span className="block font-bold">Modo profundo</span>
            <span className="text-sm text-muted">20 ejercicios · sesión larga</span>
          </span>
        </button>
        <button className="card flex items-center gap-3 p-4 text-left hover:border-primary" onClick={() => start("desafio")}>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-danger-soft text-danger">
            <Icon name="bolt" />
          </span>
          <span>
            <span className="block font-bold">Desafío</span>
            <span className="text-sm text-muted">10 más difíciles · {s.settings.hearts ? "5 ❤️" : "sin corazones"} · +100 XP</span>
          </span>
        </button>
      </div>

      {recs.length > 0 && (
        <>
          <SectionTitle>Necesitás reforzar</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {recs.map((r) => (
              <button key={r.topicId} className="card p-4 text-left hover:border-warn" onClick={() => start("tema", r.topicId)}>
                <span className="block font-bold">{getTopic(r.topicId)?.name}</span>
                <span className="text-sm text-muted">{r.reason}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {[...bySkill.entries()].map(([skill, topics]) => (
        <section key={skill}>
          <SectionTitle>{SKILL_LABELS[skill]}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map((t) => {
              const ts = s.topics[t.id];
              const m = ts?.mastery ?? 0;
              return (
                <button key={t.id} onClick={() => start("tema", t.id)} className="card flex items-center gap-4 p-4 text-left transition hover:border-primary">
                  <Ring value={m} color={m >= MASTERED ? "var(--xp)" : "var(--primary)"}>
                    {m >= MASTERED ? "⭐" : `${Math.round(m * 100)}%`}
                  </Ring>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{t.name}</span>
                    <span className="text-sm text-muted">
                      {ts ? `${ts.correct}/${ts.attempts} correctos · ${LEVEL_LABEL[ts.level]}` : "Sin practicar todavía"}
                    </span>
                  </span>
                  <Icon name="play" size={18} className="text-primary" />
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Suspense>
        <Practice />
      </Suspense>
    </Gate>
  );
}
