"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { findUnit } from "@/content/curriculum";
import { getTopic } from "@/content/topics";
import { XP } from "@/engine/progress/rules";
import { actions, useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { Session, type SessionItem } from "@/components/session/Session";
import { GuideSay } from "@/components/guide/Nodo";
import { Icon } from "@/components/ui/Icon";

/** 10 ejercicios mezclados de la unidad, un poco más difíciles que tu nivel. */
function bossItems(topicIds: string[]): SessionItem[] {
  const usable = topicIds.filter((t) => getTopic(t)?.generators.length);
  return Array.from({ length: 10 }, (_, i) => ({ topicId: usable[(i * 3) % usable.length], adjust: i < 4 ? 0 : 1 }));
}

function Boss() {
  const params = useSearchParams();
  const unitId = params.get("unidad") ?? "";
  const found = findUnit(unitId);
  const s = useProgress();
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);
  const usable = found?.unit.topicIds.filter((t) => getTopic(t)?.generators.length) ?? [];
  const items = useMemo(() => (usable.length ? bossItems(usable) : []), [usable.join(","), run]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!found || !usable.length) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-black">Desafío no disponible</h1>
        <p className="text-muted">Esta unidad todavía no tiene ejercicios cargados para armar un desafío.</p>
        <Link href="/camino" className="btn btn-primary">
          Volver al camino
        </Link>
      </div>
    );
  }
  const { unit, subject } = found;
  const won = !!s.bosses[unit.id];

  if (playing) {
    return (
      <Session
        key={run}
        title={`Desafío · ${unit.title}`}
        items={items}
        mode="desafio"
        kind="desafio"
        lives={3}
        noHelp
        onWin={() => actions.winBoss(unit.id)}
        onExit={() => {
          setPlaying(false);
          setRun((r) => r + 1);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <Link href="/camino" className="btn btn-ghost !px-2" aria-label="Volver al camino">
        <Icon name="arrowLeft" /> Camino
      </Link>
      <div className="card space-y-4 p-6 text-center">
        <div className="text-6xl" aria-hidden>
          {won ? "👑" : "🏆"}
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{subject.shortName}</p>
        <h1 className="text-2xl font-black">Desafío final: {unit.title}</h1>
        <ul className="space-y-1 text-left text-sm">
          <li>• 10 ejercicios mezclados de toda la unidad</li>
          <li>• Sin pistas ni explicaciones durante el desafío</li>
          <li>• 3 vidas: cada error resta una</li>
          <li>• Premio: +{won ? 50 : XP.challenge} XP {won ? "(ya lo superaste: la revancha suma menos)" : "y la unidad coronada"}</li>
        </ul>
        <div className="flex flex-wrap justify-center gap-1.5">
          {usable.map((t) => (
            <span key={t} className="chip">
              {getTopic(t)?.name}
            </span>
          ))}
        </div>
        <button className="btn btn-primary w-full text-lg" onClick={() => setPlaying(true)} autoFocus>
          {won ? "Jugar otra vez" : "Empezar desafío"}
        </button>
      </div>
      <GuideSay mood="focus">Tomate tu tiempo: no hay reloj. Si perdés las vidas, al final te digo exactamente qué repasar.</GuideSay>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Suspense>
        <Boss />
      </Suspense>
    </Gate>
  );
}
