"use client";
/**
 * "No entendí" que cambia de estrategia. Cada vez que el estudiante dice que
 * no entendió, la explicación siguiente usa OTRA forma de enseñar:
 *   1 normal → 2 más simple → 3 situación cotidiana → 4 ejemplo con números
 *   → 5 dibujo / pizarra → 6 descomponer en conocimientos previos
 * Además se puede pedir directamente cualquiera de las formas. Cuando lo
 * curado no alcanza, ofrece seguir con el profesor con IA.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lesson, TutorScript } from "@/engine/types";
import { getTopic } from "@/content/topics";
import { store } from "@/lib/store";
import { exerciseFor, prerequisiteClosure } from "@/lib/learning";
import { openTutor } from "@/lib/studyContext";
import { MathText } from "../math/MathText";
import { Widget } from "../widgets/Widget";
import { Whiteboard } from "../board/Whiteboard";
import { ExercisePlayer, QuickReview } from "../exercise/ExercisePlayer";
import { GuideSay } from "../guide/Nodo";
import { Icon } from "../ui/Icon";

export type Strategy = "normal" | "simple" | "cotidiano" | "numerico" | "visual" | "descomponer" | "cero" | "pasos" | "porque" | "origen" | "antes" | "juntos";

const LADDER: Strategy[] = ["normal", "simple", "cotidiano", "numerico", "visual", "descomponer"];

const LABEL: Record<Strategy, string> = {
  normal: "La explicación",
  simple: "Más fácil",
  cotidiano: "Con una situación cotidiana",
  numerico: "Con un ejemplo numérico",
  visual: "Visualmente",
  descomponer: "Detectemos dónde está la dificultad",
  cero: "Desde cero",
  pasos: "Paso a paso",
  porque: "¿Por qué se hace esto?",
  origen: "¿De dónde sale?",
  antes: "¿Qué necesito saber antes?",
  juntos: "Practiquemos juntos",
};

const OPTIONS: Strategy[] = ["simple", "cero", "numerico", "pasos", "visual", "porque", "origen", "antes", "juntos"];

function available(script: TutorScript | undefined, st: Strategy, why?: string): boolean {
  if (!script) return st === "antes" || st === "juntos" || st === "descomponer";
  switch (st) {
    case "visual":
      return !!(script.visual || script.board);
    case "pasos":
      return !!script.board;
    case "origen":
      return !!script.origin;
    case "porque":
      return !!(script.why || why);
    default:
      return true;
  }
}

export function ExplainPanel({
  script,
  title,
  topicIds,
  prerequisites = [],
  why,
  initial = "normal",
  onClose,
}: {
  script?: TutorScript;
  title: string;
  topicIds: string[];
  prerequisites?: string[];
  why?: string;
  initial?: Strategy;
  onClose?: () => void;
}) {
  const [strategy, setStrategy] = useState<Strategy>(initial);
  const [rung, setRung] = useState(LADDER.indexOf(initial));
  const prereqs = useMemo(() => {
    const set = new Set<string>(prerequisites);
    topicIds.forEach((t) => prerequisiteClosure(t).forEach((p) => set.add(p)));
    topicIds.forEach((t) => set.delete(t));
    return [...set].filter((t) => getTopic(t));
  }, [topicIds, prerequisites]);

  const notUnderstood = () => {
    // Siguiente estrategia de la escalera que tenga contenido.
    for (let i = Math.max(0, rung) + 1; i < LADDER.length; i++) {
      if (available(script, LADDER[i], why)) {
        setRung(i);
        setStrategy(LADDER[i]);
        return;
      }
    }
    // Se agotó lo curado: el profesor con IA prueba otra forma.
    openTutor(`No entendí «${title}». Ya probé la explicación normal, una más simple, una analogía, un ejemplo con números y un dibujo. Probá con otra estrategia distinta y preguntame qué parte me cuesta.`);
  };

  const pick = (s: Strategy) => {
    setStrategy(s);
    const i = LADDER.indexOf(s);
    if (i >= 0) setRung(i);
  };

  let body: React.ReactNode;
  const s = script;
  switch (strategy) {
    case "normal":
      body = s ? <MathText text={s.normal} /> : null;
      break;
    case "simple":
      body = s ? <MathText text={s.simple} /> : null;
      break;
    case "cotidiano":
      body = s ? <MathText text={s.nino} /> : null;
      break;
    case "numerico":
      body = s ? <MathText text={s.ejemplo} /> : null;
      break;
    case "cero":
      body = s ? (
        <div className="space-y-3">
          <MathText text={s.fromZero ?? `Empecemos por lo más básico.\n\n${s.simple}`} />
          {!s.fromZero && prereqs.length > 0 && <p className="text-sm text-muted">Esto se apoya en: {prereqs.map((p) => getTopic(p)?.name).join(", ")}. Si alguno te suena lejano, tocá «¿Qué necesito saber antes?».</p>}
        </div>
      ) : null;
      break;
    case "visual":
      body = s?.visual ? (
        <div className="space-y-3">
          {s.visualText && <MathText text={s.visualText} className="text-sm" />}
          <Widget widget={s.visual} />
        </div>
      ) : s?.board ? (
        <Whiteboard steps={s.board} title="Pizarra" autoPlay />
      ) : null;
      break;
    case "pasos":
      body = s?.board ? <Whiteboard steps={s.board} title="Paso a paso" /> : null;
      break;
    case "porque":
      body = <MathText text={s?.why ?? why ?? ""} />;
      break;
    case "origen":
      body = s?.origin ? <MathText text={s.origin} /> : null;
      break;
    case "descomponer":
    case "antes":
      body = <PrereqCheck prereqs={prereqs} intro={strategy === "descomponer" ? "Probemos de a una las ideas en las que se apoya este tema. Así encontramos exactamente cuál es la que falla." : undefined} />;
      break;
    case "juntos":
      body = <Together topicId={topicIds[0]} />;
      break;
  }

  return (
    <div className="anim-pop rounded-2xl border border-accent/40 bg-accent-soft/30 p-4" role="region" aria-label="Otras formas de explicarlo">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold">
          {LABEL[strategy]}
          {LADDER.includes(strategy) && <span className="ml-2 font-normal text-muted">· forma {LADDER.indexOf(strategy) + 1} de {LADDER.length}</span>}
        </p>
        {onClose && (
          <button className="btn btn-ghost !min-h-8 !px-2" onClick={onClose} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>
      <div key={strategy} className="anim-pop">
        {body ?? (
          <GuideSay mood="thinking">
            Para esto todavía no tengo una explicación cargada.{" "}
            <button className="font-semibold text-primary underline" onClick={() => openTutor(`${LABEL[strategy]}: ${title}`)}>
              Pedísela al profesor
            </button>
            .
          </GuideSay>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn btn-primary !min-h-10" onClick={notUnderstood}>
          😵 No entendí
        </button>
        {onClose && (
          <button className="btn btn-secondary !min-h-10" onClick={onClose}>
            Ahora sí, entendí
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Pedir otra forma">
        {OPTIONS.filter((o) => available(script, o, why) && o !== strategy).map((o) => (
          <button key={o} className="chip !py-1.5 hover:!bg-primary-soft" onClick={() => pick(o)}>
            {LABEL[o]}
          </button>
        ))}
        <button className="chip !py-1.5 hover:!bg-primary-soft" onClick={() => openTutor(`Sobre «${title}»: `)}>
          💬 Preguntarle al profesor
        </button>
      </div>
    </div>
  );
}

/** Una pregunta corta por cada conocimiento previo; si falla una, ofrece repasarla antes de seguir. */
export function PrereqCheck({ prereqs, intro, onPassed }: { prereqs: string[]; intro?: string; onPassed?: () => void }) {
  const [items] = useState(() => prereqs.slice(0, 5).filter((t) => getTopic(t)?.generators.length).map((t) => ({ topicId: t, exercise: exerciseFor(store.getState(), t, -2) })));
  const [i, setI] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const [review, setReview] = useState<string | null>(null);

  if (!items.length) {
    return <p className="text-sm text-muted">Este tema no depende de otros de la plataforma: podés arrancar directamente.</p>;
  }
  if (review) {
    return (
      <QuickReview
        topicId={review}
        onDone={() => {
          setFailed((f) => f.filter((x) => x !== review));
          setReview(null);
        }}
      />
    );
  }
  if (i >= items.length) {
    return failed.length ? (
      <div className="space-y-3">
        <GuideSay mood="thinking">
          Encontré dónde está la dificultad: {failed.map((f) => getTopic(f)?.name.toLowerCase()).join(" y ")}. Repasemos eso primero; después este tema se entiende mucho mejor.
        </GuideSay>
        <div className="flex flex-wrap gap-2">
          {failed.map((f) => (
            <button key={f} className="btn btn-primary !min-h-10" onClick={() => setReview(f)}>
              Repasar {getTopic(f)?.name.toLowerCase()} · 5 min
            </button>
          ))}
          {getTopic(failed[0])?.lessonId && (
            <Link className="btn btn-secondary !min-h-10" href={`/leccion/${getTopic(failed[0])!.lessonId}`}>
              Ver la lección completa
            </Link>
          )}
        </div>
      </div>
    ) : (
      <div className="space-y-3">
        <GuideSay mood="happy">Las bases están firmes. Entonces la dificultad está en el tema nuevo, no en lo anterior: probá «Paso a paso» o «Practiquemos juntos».</GuideSay>
        {onPassed && (
          <button className="btn btn-primary" onClick={onPassed}>
            Continuar con la lección
          </button>
        )}
      </div>
    );
  }
  const it = items[i];
  return (
    <div className="space-y-3">
      {i === 0 && intro && <p className="text-sm">{intro}</p>}
      <p className="text-xs font-bold uppercase tracking-wide text-muted">
        Base {i + 1} de {items.length}: {getTopic(it.topicId)?.name}
      </p>
      <ExercisePlayer
        key={it.exercise.id}
        exercise={it.exercise}
        mode="repaso"
        diagnostic
        onDone={(o) => {
          if (!o.correct) setFailed((f) => [...f, it.topicId]);
          setTimeout(() => setI((n) => n + 1), 500);
        }}
      />
    </div>
  );
}

/** Practiquemos juntos: un ejercicio guiado (con la primera pista a la vista) y después otro. */
function Together({ topicId }: { topicId?: string }) {
  const [n, setN] = useState(0);
  const exercise = useMemo(() => (topicId && getTopic(topicId)?.generators.length ? exerciseFor(store.getState(), topicId, -1) : null), [topicId, n]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!exercise) return <p className="text-sm text-muted">Para este tema todavía no hay ejercicios generados.</p>;
  return (
    <div className="space-y-2">
      <p className="text-sm">Lo hacemos juntos: te dejo la primera pista a la vista y te voy corrigiendo cada intento.</p>
      <ExercisePlayer key={exercise.id + n} exercise={exercise} mode="practica" guided continueLabel="Otro juntos" onDone={() => setN((x) => x + 1)} />
    </div>
  );
}

/** Atajo para usar el panel con una lección. */
export function LessonExplain({ lesson, initial, onClose }: { lesson: Lesson; initial?: Strategy; onClose?: () => void }) {
  const intro = lesson.cards.find((c) => c.kind === "intro");
  return (
    <ExplainPanel
      script={lesson.tutor}
      title={lesson.title}
      topicIds={lesson.topicIds}
      prerequisites={lesson.prerequisites}
      why={intro?.kind === "intro" ? intro.why : undefined}
      initial={initial}
      onClose={onClose}
    />
  );
}
