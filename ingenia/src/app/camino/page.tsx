"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useProgress, actions } from "@/lib/store";
import { buildPath, currentNode, pathSubjects, progressLadder, type PathNode, type PathSection } from "@/lib/path";
import { getSubject } from "@/content/curriculum";
import { lessonContext, nextLesson } from "@/lib/learning";
import { getLesson } from "@/content/lessons";
import { findUnit } from "@/content/curriculum";
import { XP } from "@/engine/progress/rules";
import { Gate } from "@/components/layout/Gate";
import { Nodo } from "@/components/guide/Nodo";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/primitives";
import { useSubjectTheme } from "@/lib/subjectTheme";

/** Desplazamiento lateral del nodo i: un zigzag suave. */
const OFFSET = [0, 52, 78, 52, 0, -52, -78, -52];

function stars(acc: number | undefined) {
  if (acc === undefined) return 1;
  return acc >= 0.95 ? 3 : acc >= 0.75 ? 2 : 1;
}

const ROW = 112;

function NodeButton({ node, color, offset, onOpen }: { node: PathNode; color: string; offset: number; onOpen: () => void }) {
  const s = useProgress();
  const isBoss = node.kind === "boss";
  const title = node.kind === "lesson" ? getLesson(node.lessonId)?.title ?? "" : "Desafío final";
  const done = node.status === "hecho";
  const current = node.status === "actual";
  const locked = node.status === "bloqueado";
  const st = node.kind === "lesson" && done ? stars(s.lessons[node.lessonId]?.bestAccuracy) : 0;
  const labelLeft = offset > 0;
  return (
    <div className="relative mx-auto flex w-fit justify-center" style={{ transform: `translateX(${offset}px)`, height: ROW }}>
      {current && (
        <div className="anim-pop absolute -top-8 z-10 whitespace-nowrap rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow" style={{ background: color }}>
          {node.kind === "lesson" && s.lessons[node.lessonId] ? "Seguir" : "Empezar"}
        </div>
      )}
      <button
        onClick={onOpen}
        aria-label={`${title}: ${done ? `completado, ${st} de 3 estrellas` : current ? "siguiente" : locked ? "bloqueado" : "disponible"}`}
        className={`relative z-[1] grid place-items-center rounded-full border-b-[6px] transition hover:scale-105 active:translate-y-0.5 active:border-b-2 ${isBoss ? "h-[84px] w-[84px]" : "h-[72px] w-[72px]"} ${current ? "node-current" : ""}`}
        style={{
          background: locked ? "var(--surface-2)" : done || current ? color : "var(--surface)",
          borderColor: locked ? "var(--border)" : `color-mix(in srgb, ${color} 65%, black)`,
          color: locked ? "var(--muted)" : done || current ? "#fff" : color,
          outline: !done && !current && !locked ? `3px solid ${color}` : undefined,
        }}
      >
        {isBoss ? (
          <span className="text-3xl" aria-hidden>
            {node.kind === "boss" && node.won ? "👑" : "🏆"}
          </span>
        ) : done ? (
          <Icon name="check" size={34} />
        ) : locked ? (
          <Icon name="lock" size={26} />
        ) : (
          <Icon name="star" size={30} />
        )}
        {done && !isBoss && (
          <span className="absolute -bottom-4 flex gap-0.5 text-sm drop-shadow" aria-hidden>
            {[1, 2, 3].map((k) => (
              <span key={k} className={k <= st ? "" : "opacity-25 grayscale"}>⭐</span>
            ))}
          </span>
        )}
      </button>
      <span
        className={`absolute top-6 w-32 text-xs font-bold leading-tight sm:w-40 ${labelLeft ? "right-full mr-4 text-right" : "left-full ml-4"} ${locked ? "text-muted" : ""}`}
        aria-hidden
      >
        {title}
      </span>
    </div>
  );
}

/** Línea que une los nodos: hecha (color de la materia) y pendiente (punteada). */
function Trail({ nodes, color }: { nodes: PathNode[]; color: string }) {
  const pts = nodes.map((_, i) => [OFFSET[i % OFFSET.length], ROW * i + 36] as const);
  const doneUntil = nodes.findIndex((n) => n.status !== "hecho");
  const lastDone = doneUntil === -1 ? nodes.length - 1 : doneUntil;
  const path = (a: number, b: number) =>
    pts
      .slice(a, b + 1)
      .map(([x, y], i, arr) => (i === 0 ? `M${x},${y}` : `C${arr[i - 1][0]},${arr[i - 1][1] + ROW / 2} ${x},${y - ROW / 2} ${x},${y}`))
      .join(" ");
  return (
    <svg className="pointer-events-none absolute left-1/2 top-0" width="1" height={ROW * nodes.length} overflow="visible" aria-hidden>
      <path d={path(0, nodes.length - 1)} fill="none" stroke="var(--border)" strokeWidth="8" strokeDasharray="2 14" strokeLinecap="round" />
      {lastDone > 0 && <path d={path(0, lastDone)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" opacity="0.55" />}
    </svg>
  );
}

function NodeSheet({ node, section, onClose }: { node: PathNode; section: PathSection; onClose: () => void }) {
  const s = useProgress();
  if (node.kind === "boss") {
    const unit = findUnit(node.unitId)?.unit;
    return (
      <Sheet onClose={onClose}>
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: section.color }}>
          {section.title}
        </p>
        <h2 className="text-2xl font-black">👑 Desafío final</h2>
        <p className="mt-2 text-muted">10 ejercicios mezclados de toda la unidad, sin pistas, con 3 vidas. Si lo superás: +{XP.challenge} XP y la unidad queda coronada.</p>
        {node.won && <p className="mt-2 font-semibold text-success">Ya lo superaste. Podés volver a jugarlo para practicar.</p>}
        {node.status === "bloqueado" && <p className="mt-2 rounded-xl bg-surface-2 p-3 text-sm">Conviene terminar primero las lecciones de la unidad ({unit?.lessonIds.filter((l) => s.lessons[l]?.status !== "completada").length} pendientes). Igual podés intentarlo.</p>}
        <Link href={`/desafio?unidad=${node.unitId}`} className="btn-3d is-block mt-5 text-lg">
          {node.status === "bloqueado" ? "Intentarlo igual" : "Empezar desafío"}
        </Link>
      </Sheet>
    );
  }
  const lesson = getLesson(node.lessonId)!;
  const ls = s.lessons[node.lessonId];
  return (
    <Sheet onClose={onClose}>
      <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: section.color }}>
        {section.title}
      </p>
      <h2 className="text-2xl font-black">{lesson.title}</h2>
      <p className="text-muted">{lesson.subtitle}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="chip">⏱ {lesson.estimatedMinutes} min</span>
        <span className="chip !bg-xp-soft !text-xp">+{XP.lesson} XP · perfecta +{XP.perfectLesson}</span>
        {ls?.bestAccuracy !== undefined && <span className="chip">Mejor precisión {Math.round(ls.bestAccuracy * 100)}%</span>}
        {ls?.perfect && <span className="chip !bg-success-soft !text-success">Perfecta</span>}
      </div>
      {node.status === "bloqueado" ? (
        <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
          <p>Te recomendamos completar primero la lección anterior del camino. Igual podés entrar: nada está cerrado del todo.</p>
          <Link href={`/leccion/${node.lessonId}`} onClick={() => actions.unlockNode(node.unitId)} className="btn btn-secondary mt-3 w-full">
            Entrar igual
          </Link>
        </div>
      ) : (
        <Link href={`/leccion/${node.lessonId}`} className="btn-3d is-block mt-5 text-lg">
          {node.status === "hecho" ? "Repasar lección" : ls ? "Continuar" : "Empezar"} <Icon name="arrowRight" />
        </Link>
      )}
    </Sheet>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Cerrar" />
      <div className="anim-pop relative w-full max-w-md rounded-t-3xl bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-3xl">
        <button className="btn btn-ghost absolute right-3 top-3 !px-2" onClick={onClose} aria-label="Cerrar">
          <Icon name="x" />
        </button>
        {children}
      </div>
    </div>
  );
}

function Path() {
  const s = useProgress();
  const subjects = pathSubjects().filter((id) => buildPath(s, id).length);
  const [subject, setSubject] = useState<string>(() => {
    const nl = nextLesson(s);
    const sid = nl ? lessonContext(nl)?.subject.id : undefined;
    return sid && subjects.includes(sid) ? sid : subjects[0] ?? "preparacion";
  });
  useEffect(() => {
    const q = new URLSearchParams(window.location.search || window.location.hash.split("?")[1] || "").get("materia");
    if (q && subjects.includes(q)) setSubject(q);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useSubjectTheme(subject);
  const sections = buildPath(s, subject);
  const current = currentNode(sections);
  const [open, setOpen] = useState<{ node: PathNode; section: PathSection } | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const ladder = progressLadder(s);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  return (
    <div className="mx-auto max-w-xl overflow-x-clip">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Tu camino</h1>
          <p className="text-muted">Un paso a la vez. Tocá el nodo marcado para seguir.</p>
        </div>
        <Link href="/materias" className="btn btn-secondary !min-h-10 text-sm">
          <Icon name="map" size={18} /> Explorar libremente
        </Link>
      </div>
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 pt-1" role="tablist" aria-label="Materia">
        {subjects.map((id) => {
          const sub = getSubject(id);
          return (
            <button key={id} role="tab" aria-selected={subject === id} onClick={() => setSubject(id)} className={`tile shrink-0 !min-h-10 !px-3 !py-1 text-sm ${subject === id ? "is-selected" : ""}`}>
              {sub?.icon} {sub?.shortName}
            </button>
          );
        })}
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3">
        {ladder.map((l) => (
          <div key={l.label} className="card p-3">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-semibold">{l.label}</span>
              <span>{Math.round(l.value * 100)}%</span>
            </div>
            <ProgressBar value={l.value} height={6} label={l.label} />
          </div>
        ))}
      </div>

      <div className="space-y-14">
        {sections.map((sec) => (
          <section key={sec.unitId} aria-labelledby={`sec-${sec.unitId}`}>
            <div className="sticky top-14 z-20 mb-10 flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-white shadow-md" style={{ background: `linear-gradient(135deg, ${sec.color}, color-mix(in srgb, ${sec.color} 60%, black))` }}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 text-2xl" aria-hidden>
                {sec.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide opacity-85">{sec.subjectName}</p>
                <h2 id={`sec-${sec.unitId}`} className="truncate text-lg font-black">
                  {sec.title}
                </h2>
              </div>
              <span className="rounded-full bg-black/20 px-2.5 py-1 text-sm font-black">
                {sec.done}/{sec.total}
              </span>
            </div>
            <div className="relative">
              <Trail nodes={sec.nodes} color={sec.color} />
              {sec.nodes.map((node, i) => {
                const isCurrent = current?.id === node.id;
                const off = OFFSET[i % OFFSET.length];
                return (
                  <div key={node.id} ref={isCurrent ? currentRef : undefined} className="relative">
                    <NodeButton node={node} color={sec.color} offset={off} onOpen={() => setOpen({ node, section: sec })} />
                    {isCurrent && (
                      <div className="pointer-events-none absolute top-0 hidden sm:block" style={off > 0 ? { right: `calc(50% - ${off}px + 190px)` } : { left: `calc(50% + ${off}px + 210px)` }}>
                        <Nodo size={60} mood="encourage" body />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-12 text-center text-sm text-muted">
        El camino sigue con más unidades a medida que se cargan. Mientras tanto, podés{" "}
        <Link href="/materias" className="font-semibold text-primary">
          explorar todas las materias
        </Link>
        .
      </p>
      {open && <NodeSheet node={open.node} section={open.section} onClose={() => setOpen(null)} />}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Path />
    </Gate>
  );
}
