"use client";
/**
 * Minijuegos: mecánicas distintas sobre el mismo contenido. Ninguno bloquea
 * por errores; todos muestran qué repasar al final. Los récords se guardan
 * sólo en este navegador (son una comodidad, no progreso académico).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Exercise } from "@/engine/types";
import { exerciseFor } from "@/lib/learning";
import { store, useProgress } from "@/lib/store";
import { getTopic, TOPICS } from "@/content/topics";
import { GLOSSARY } from "@/content/glossary";
import { getGenerator } from "@/engine/generators";
import { newSeed, rng } from "@/engine/generators/rng";
import { ExercisePlayer } from "../exercise/ExercisePlayer";
import { Nodo } from "../guide/Nodo";
import { Icon } from "../ui/Icon";
import { Confetti } from "../ui/Celebrate";
import { play } from "@/lib/sound";

// ───────────── Récords locales ─────────────

function getBest(key: string): number {
  try {
    return Number(localStorage.getItem(`ingenia:best:${key}`) ?? 0) || 0;
  } catch {
    return 0;
  }
}
function setBest(key: string, v: number): boolean {
  try {
    if (v > getBest(key)) {
      localStorage.setItem(`ingenia:best:${key}`, String(v));
      return true;
    }
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
  return false;
}

/** Temas para jugar: los que ya tocaste (o los de Preparación si recién empezás). */
export function useGameTopics(): string[] {
  const s = useProgress();
  return useMemo(() => {
    const started = TOPICS.filter((t) => t.generators.length && s.topics[t.id]?.attempts).map((t) => t.id);
    return started.length >= 3 ? started : TOPICS.filter((t) => t.subjectId === "preparacion" && t.generators.length).map((t) => t.id);
  }, [s.topics]);
}

function pickExercise(topics: string[], i: number, adjust = 0): Exercise {
  const t = topics[(i * 7 + Math.floor(Math.random() * topics.length)) % topics.length];
  return exerciseFor(store.getState(), t, adjust);
}

function GameShell({ title, icon, children, stats }: { title: string; icon: string; children: React.ReactNode; stats?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/juegos" className="btn btn-ghost !px-2" aria-label="Volver a los minijuegos">
          <Icon name="x" />
        </Link>
        <h1 className="flex-1 text-xl font-black">
          <span aria-hidden>{icon}</span> {title}
        </h1>
        {stats}
      </div>
      {children}
    </div>
  );
}

function EndCard({ title, lines, again, best, record, unit }: { title: string; lines: string[]; again: () => void; best: number; record: boolean; unit?: string }) {
  return (
    <div className="card relative overflow-hidden p-6 text-center anim-rise">
      {record && <Confetti />}
      <div className="flex justify-center">
        <Nodo mood={record ? "celebrate" : "happy"} size={96} body />
      </div>
      <h2 className="mt-2 text-2xl font-black">{title}</h2>
      {lines.map((l) => (
        <p key={l} className="font-semibold text-muted">
          {l}
        </p>
      ))}
      <p className="mt-2 text-sm font-bold text-xp">{record ? "🏅 ¡Nuevo récord personal!" : `Tu récord: ${best}${unit ? ` ${unit}` : ""}`}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button className="btn-3d" onClick={again} autoFocus>
          Jugar otra vez
        </button>
        <Link href="/juegos" className="btn-3d is-secondary">
          Otros juegos
        </Link>
      </div>
    </div>
  );
}

// ───────────── Contrarreloj ─────────────

export function Contrarreloj() {
  const topics = useGameTopics();
  const [run, setRun] = useState(0);
  const [left, setLeft] = useState(90);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [ex, setEx] = useState<Exercise>(() => pickExercise(topics, 0, -1));
  const [end, setEnd] = useState<{ record: boolean } | null>(null);
  useEffect(() => {
    if (end) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [end, run]);
  useEffect(() => {
    if (left <= 0 && !end) setEnd({ record: setBest("contrarreloj", score) });
  }, [left, end, score]);
  const again = () => {
    setLeft(90);
    setI(0);
    setScore(0);
    setEx(pickExercise(topics, 0, -1));
    setEnd(null);
    setRun((r) => r + 1);
  };
  return (
    <GameShell
      title="Contrarreloj"
      icon="⏱️"
      stats={
        <span className={`rounded-full px-3 py-1 font-mono text-lg font-black ${left <= 10 ? "bg-warn-soft text-warn" : "bg-surface-2"}`} aria-live="off">
          {Math.max(0, left)} s · ✅ {score}
        </span>
      }
    >
      <div className="pbar !h-3" aria-hidden>
        <span style={{ width: `${(Math.max(0, left) / 90) * 100}%`, ["--bar" as string]: left <= 10 ? "var(--warn)" : "var(--primary)" }} />
      </div>
      {end ? (
        <EndCard title="¡Tiempo!" lines={[`Resolviste bien ${score} ${score === 1 ? "ejercicio" : "ejercicios"} en 90 segundos.`]} again={again} best={getBest("contrarreloj")} record={end.record} />
      ) : (
        <ExercisePlayer
          key={`${run}-${i}`}
          exercise={ex}
          mode="practica"
          noHelp
          continueLabel="Siguiente"
          onDone={(o) => {
            if (o.correct && o.firstTry) setScore((s) => s + 1);
            setI((n) => n + 1);
            setEx(pickExercise(topics, i + 1, -1));
          }}
        />
      )}
    </GameShell>
  );
}

// ───────────── Escalera ─────────────

const RUNGS = 10;

export function Escalera() {
  const topics = useGameTopics();
  const [step, setStep] = useState(0);
  const [i, setI] = useState(0);
  const [ex, setEx] = useState<Exercise>(() => pickExercise(topics, 0));
  const [best, setBestState] = useState(0);
  const [end, setEnd] = useState<{ record: boolean } | null>(null);
  const again = () => {
    setStep(0);
    setI(0);
    setEx(pickExercise(topics, 0));
    setEnd(null);
    setBestState(0);
  };
  return (
    <GameShell title="Escalera" icon="🪜" stats={<span className="rounded-full bg-surface-2 px-3 py-1 font-black">Escalón {step}/{RUNGS}</span>}>
      <div className="flex items-end gap-4">
        <div className="relative flex h-56 w-24 shrink-0 flex-col-reverse justify-between rounded-2xl border-2 border-line bg-surface p-2" aria-label={`Escalón ${step} de ${RUNGS}`}>
          {Array.from({ length: RUNGS }, (_, k) => (
            <div key={k} className={`h-2 rounded-full transition-colors ${k < step ? "bg-primary" : "bg-surface-2"}`} />
          ))}
          <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-500" style={{ bottom: `${(step / RUNGS) * 82}%` }}>
            <Nodo mood={step >= RUNGS ? "celebrate" : "focus"} size={40} />
          </div>
        </div>
        <p className="text-sm font-semibold text-muted">Cada respuesta correcta sube un escalón; un error te baja dos (nunca a cero si ya pasaste el 5). Llegá arriba de todo. Las preguntas se van poniendo más difíciles.</p>
      </div>
      {end ? (
        <EndCard title={step >= RUNGS ? "¡Llegaste a la cima!" : "Fin"} lines={[`Escalón más alto: ${best}.`]} again={again} best={getBest("escalera")} record={end.record} />
      ) : (
        <ExercisePlayer
          key={i}
          exercise={ex}
          mode="practica"
          noHelp
          continueLabel="Siguiente"
          onDone={(o) => {
            const ok = o.correct && o.firstTry;
            const next = ok ? step + 1 : Math.max(step >= 5 ? 5 : 0, step - 2);
            setStep(next);
            const b = Math.max(best, next);
            setBestState(b);
            if (next >= RUNGS || i >= 24) setEnd({ record: setBest("escalera", b) });
            setI((n) => n + 1);
            setEx(pickExercise(topics, i + 1, Math.floor(next / 4)));
          }}
        />
      )}
    </GameShell>
  );
}

// ───────────── Memoria de conceptos ─────────────

const MEMO_SETS: Record<string, { name: string; pairs: () => [string, string][] }> = {
  simbolos: { name: "Símbolos matemáticos", pairs: () => GLOSSARY.filter((g) => g.symbol.length <= 4).map((g) => [g.symbol, g.name] as [string, string]) },
  unidades: { name: "Magnitudes y unidades", pairs: () => [["Velocidad", "m/s"], ["Fuerza", "N"], ["Presión", "Pa"], ["Energía", "J"], ["Potencia", "W"], ["Aceleración", "m/s²"], ["Densidad", "kg/m³"], ["Carga", "C"]] },
  quimica: { name: "Elementos químicos", pairs: () => [["H", "Hidrógeno"], ["O", "Oxígeno"], ["C", "Carbono"], ["N", "Nitrógeno"], ["Na", "Sodio"], ["Cl", "Cloro"], ["Fe", "Hierro"], ["Ca", "Calcio"], ["K", "Potasio"], ["S", "Azufre"]] },
  python: { name: "Python", pairs: () => [["len()", "Largo"], ["append()", "Agregar al final"], ["range(3)", "0, 1, 2"], ["//", "División entera"], ["%", "Resto"], ["==", "¿Son iguales?"], ["and", "Las dos"], ["str()", "A texto"]] },
};

export function Memoria() {
  const [setKey, setSetKey] = useState("simbolos");
  const [seed, setSeed] = useState(() => newSeed());
  const cards = useMemo(() => {
    const r = rng(seed);
    const pairs = r.shuffle(MEMO_SETS[setKey].pairs()).slice(0, 6);
    return r.shuffle(pairs.flatMap(([a, b], k) => [{ id: `${k}a`, pair: k, text: a }, { id: `${k}b`, pair: k, text: b }]));
  }, [seed, setKey]);
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);
  const done = found.length === 6;
  const [record, setRecord] = useState(false);
  useEffect(() => {
    if (done) setRecord(setBest(`memoria-${setKey}`, 100 - moves));
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps
  const flip = (id: string) => {
    if (lock.current || open.includes(id)) return;
    const card = cards.find((c) => c.id === id)!;
    if (found.includes(card.pair)) return;
    const next = [...open, id];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((x) => cards.find((c) => c.id === x)!);
      if (a.pair === b.pair) {
        play("correct");
        setFound((f) => [...f, a.pair]);
        setOpen([]);
      } else {
        lock.current = true;
        setTimeout(() => {
          setOpen([]);
          lock.current = false;
        }, 900);
      }
    }
  };
  const again = (k = setKey) => {
    setSetKey(k);
    setSeed(newSeed());
    setOpen([]);
    setFound([]);
    setMoves(0);
    setRecord(false);
  };
  return (
    <GameShell title="Memoria de conceptos" icon="🧠" stats={<span className="rounded-full bg-surface-2 px-3 py-1 font-black">{moves} jugadas</span>}>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tema">
        {Object.entries(MEMO_SETS).map(([k, v]) => (
          <button key={k} role="radio" aria-checked={setKey === k} className="tile !min-h-10 !py-1 text-sm" onClick={() => again(k)}>
            {v.name}
          </button>
        ))}
      </div>
      {done ? (
        <EndCard title="¡Memoria completa!" lines={[`Encontraste las 6 parejas en ${moves} jugadas.`]} unit="jugadas" again={() => again()} best={getBest(`memoria-${setKey}`) ? 100 - getBest(`memoria-${setKey}`) : 0} record={record} />
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {cards.map((c) => {
            const shown = open.includes(c.id) || found.includes(c.pair);
            return (
              <button
                key={c.id}
                onClick={() => flip(c.id)}
                className={`memo-card ${shown ? "is-open" : ""} ${found.includes(c.pair) ? "is-found" : ""}`}
                aria-label={shown ? c.text : "Carta tapada"}
                aria-pressed={shown}
              >
                <span className="memo-inner">
                  <span className="memo-back" aria-hidden>?</span>
                  <span className="memo-front">{c.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted">Encontrá las parejas: cada símbolo, magnitud o función con su significado.</p>
    </GameShell>
  );
}

// ───────────── Verdadero o falso ─────────────

function statements(seed: number): { text: string; truth: boolean; why: string }[] {
  const r = rng(seed);
  const pool: { text: string; truth: boolean; why: string }[] = [
    { text: "La unidad de fuerza en el SI es el joule (J).", truth: false, why: "La fuerza se mide en newtons (N); el joule es energía." },
    { text: "Si un término suma de un lado, pasa restando al otro.", truth: true, why: "Se resta lo mismo en ambos miembros." },
    { text: "(a + b)² = a² + b²", truth: false, why: "Falta el doble producto: (a + b)² = a² + 2ab + b²." },
    { text: "La derivada de una constante es 0.", truth: true, why: "Una constante no cambia: su pendiente es cero." },
    { text: "En Python, range(5) incluye al 5.", truth: false, why: "range(5) da 0, 1, 2, 3, 4: el final no se incluye." },
    { text: "Un vector tiene módulo, dirección y sentido.", truth: true, why: "Por eso no alcanza con un número para describirlo." },
    { text: "La aceleración siempre tiene el mismo sentido que la velocidad.", truth: false, why: "Al frenar, la aceleración apunta al revés de la velocidad." },
    { text: "H₂O tiene dos átomos de hidrógeno y uno de oxígeno.", truth: true, why: "El subíndice 2 corresponde al H; el O no lleva subíndice (1)." },
    { text: "√(a + b) = √a + √b", truth: false, why: "La raíz no se distribuye en la suma: √(9 + 16) = 5, pero 3 + 4 = 7." },
    { text: "El 25 % de 80 es 20.", truth: true, why: "80 · 0,25 = 20." },
    { text: "Dividir por un número negativo da vuelta una desigualdad.", truth: true, why: "Por ejemplo, −2x < 6 ⇒ x > −3." },
    { text: "Un argumento válido siempre tiene conclusión verdadera.", truth: false, why: "Válido significa que SI las premisas fueran verdaderas, la conclusión también; con premisas falsas puede fallar." },
    { text: "En MRU la velocidad es constante.", truth: true, why: "Rectilíneo Uniforme: misma velocidad todo el tiempo." },
    { text: "En Python, 7 // 2 da 3,5.", truth: false, why: "// es división entera: da 3." },
    { text: "La Constitución Nacional argentina fue reformada en 1994.", truth: true, why: "La reforma de 1994 incorporó, entre otras cosas, el balotaje y nuevos derechos." },
    { text: "Un mol contiene 6,02·10²³ partículas.", truth: true, why: "Es el número de Avogadro." },
    { text: "0/5 es una indeterminación.", truth: false, why: "0/5 = 0. La indeterminación es 0/0." },
    { text: "La pendiente de y = −3x + 2 es 2.", truth: false, why: "La pendiente es el coeficiente de x: −3. El 2 es la ordenada al origen." },
  ];
  return r.shuffle(pool).slice(0, 10);
}

export function VerdaderoFalso() {
  const [seed, setSeed] = useState(() => newSeed());
  const list = useMemo(() => statements(seed), [seed]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [last, setLast] = useState<{ ok: boolean; why: string } | null>(null);
  const [record, setRecord] = useState(false);
  const done = i >= list.length;
  const answer = (v: boolean) => {
    const ok = v === list[i].truth;
    play(ok ? "correct" : "wrong");
    setLast({ ok, why: list[i].why });
    if (ok) setScore((s) => s + 1);
  };
  const next = () => {
    setLast(null);
    if (i + 1 >= list.length) setRecord(setBest("vf", score));
    setI((n) => n + 1);
  };
  const again = () => {
    setSeed(newSeed());
    setI(0);
    setScore(0);
    setLast(null);
  };
  return (
    <GameShell title="Verdadero o falso" icon="⚖️" stats={<span className="rounded-full bg-surface-2 px-3 py-1 font-black">{Math.min(i + 1, list.length)}/{list.length} · ✅ {score}</span>}>
      {done ? (
        <EndCard title="¡Listo!" lines={[`${score} de ${list.length} correctas.`]} again={again} best={getBest("vf")} record={record} />
      ) : (
        <>
          <div className="q-card anim-rise p-6 text-center text-xl font-black sm:text-2xl" key={i}>
            {list[i].text}
          </div>
          {last ? (
            <div className={`feedback anim-rise ${last.ok ? "is-ok" : "is-almost"}`} role="status">
              <p className="text-lg font-black">{last.ok ? "✨ ¡Bien!" : "Casi."}</p>
              <p className="font-semibold">{last.why}</p>
              <button className={`btn-3d is-block mt-3 ${last.ok ? "is-success" : ""}`} onClick={next} autoFocus>
                SIGUIENTE
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-3d is-success !min-h-20 text-xl" onClick={() => answer(true)}>
                ✔ VERDADERO
              </button>
              <button className="btn-3d is-warn !min-h-20 text-xl" onClick={() => answer(false)}>
                ✘ FALSO
              </button>
            </div>
          )}
        </>
      )}
    </GameShell>
  );
}

// ───────────── Formatos de actividad (para probar cada mecánica) ─────────────

export const FORMATS: { gen: string; title: string; icon: string; text: string }[] = [
  { gen: "act-puerta", title: "Abrí la puerta", icon: "🚪", text: "Opción múltiple con escena" },
  { gen: "act-fill-operador", title: "Completá el operador", icon: "🧩", text: "Arrastrar al hueco" },
  { gen: "act-ordenar-resolucion", title: "Ordená el procedimiento", icon: "🔀", text: "Arrastrar renglones" },
  { gen: "act-encontrar-error", title: "Encontrá el error", icon: "🔍", text: "Tocar el paso equivocado" },
  { gen: "act-formula-mru", title: "Construí la fórmula", icon: "🧱", text: "Bloques en orden" },
  { gen: "act-unidades-match", title: "Uní con líneas", icon: "🔗", text: "Magnitud ↔ unidad" },
  { gen: "act-grafico-vertice", title: "Tocá el gráfico", icon: "📈", text: "Marcá el máximo o mínimo" },
  { gen: "act-grafico-tangente", title: "Mové el punto", icon: "🎯", text: "Tangente horizontal" },
  { gen: "act-fabrica-costos", title: "La fábrica", icon: "🏭", text: "Costos de producción" },
  { gen: "act-cohete", title: "Despegue", icon: "🚀", text: "MRUV con escena" },
  { gen: "act-algoritmo", title: "Armá el algoritmo", icon: "💻", text: "Ordenar código" },
  { gen: "act-simbolos", title: "Laboratorio", icon: "⚗️", text: "Símbolos químicos" },
];

export function formatTopic(gen: string): string {
  return getGenerator(gen).topicId;
}

export function topicName(id: string) {
  return getTopic(id)?.name ?? id;
}
