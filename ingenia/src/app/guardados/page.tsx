"use client";
import { useState } from "react";
import Link from "next/link";
import type { Exercise } from "@/engine/types";
import { getTopic } from "@/content/topics";
import { getLesson } from "@/content/lessons";
import { getFormula } from "@/content/formulas";
import { actions, useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { ExercisePlayer } from "@/components/exercise/ExercisePlayer";
import { PageHeader, SectionTitle } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

const KIND_LABEL = { formula: "Fórmula", leccion: "Lección", tema: "Tema", materia: "Materia", definicion: "Definición" } as const;

function noteTitle(key: string): { title: string; href?: string } {
  const [kind, id] = key.split(":");
  if (kind === "leccion") return { title: getLesson(id)?.title ?? id, href: `/leccion/${id}` };
  if (kind === "tema") return { title: getTopic(id)?.name ?? id, href: `/practicar?tema=${id}` };
  if (kind === "formula") return { title: getFormula(id)?.name ?? id, href: `/formulas?q=${encodeURIComponent(getFormula(id)?.name ?? "")}` };
  return { title: id ?? key };
}

function Later() {
  const s = useProgress();
  const [open, setOpen] = useState<string | null>(null);
  if (!s.later.length) return <p className="card p-4 text-sm text-muted">Cuando un ejercicio te cueste, tocá «🔖 Repasar después» y aparece acá para rehacerlo con calma.</p>;
  return (
    <ul className="space-y-3">
      {[...s.later].reverse().map((item) => (
        <li key={item.id} className="card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex-1 font-semibold">{getTopic(item.topicId)?.name ?? "Ejercicio"}</span>
            <span className="text-xs text-muted">{new Date(item.at).toLocaleDateString("es-AR")}</span>
            <button className="btn btn-secondary !min-h-9 text-sm" onClick={() => setOpen(open === item.id ? null : item.id)}>
              {open === item.id ? "Cerrar" : "Rehacer"}
            </button>
            <button className="btn btn-ghost !min-h-9 !px-2" aria-label="Quitar de la lista" onClick={() => actions.toggleLater({ id: item.id, exercise: item.exercise, topicId: item.topicId })}>
              <Icon name="x" size={18} />
            </button>
          </div>
          {open === item.id && (
            <div className="mt-4 border-t border-line pt-4">
              <ExercisePlayer
                exercise={item.exercise as Exercise}
                mode="repaso"
                continueLabel="Listo, quitar de la lista"
                onDone={(o) => {
                  if (o.correct) actions.toggleLater({ id: item.id, exercise: item.exercise, topicId: item.topicId });
                  setOpen(null);
                }}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function Saved() {
  const s = useProgress();
  const notes = Object.entries(s.notes).sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt));
  return (
    <div className="space-y-2">
      <PageHeader title="Guardados" subtitle="Tus favoritos, tus notas y los ejercicios que marcaste para repasar." />

      <SectionTitle>🔖 Para repasar después ({s.later.length})</SectionTitle>
      <Later />

      <SectionTitle>⭐ Favoritos ({s.saved.length})</SectionTitle>
      {s.saved.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {s.saved.map((x) => (
            <li key={`${x.kind}:${x.id}`} className="card flex items-center gap-3 p-3">
              <Link href={x.href} className="min-w-0 flex-1">
                <span className="block text-xs text-muted">{KIND_LABEL[x.kind]}</span>
                <span className="block truncate font-semibold">{x.title}</span>
              </Link>
              <button className="btn btn-ghost !min-h-9 !px-2" aria-label={`Quitar ${x.title} de favoritos`} onClick={() => actions.toggleSaved(x)}>
                ⭐
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card p-4 text-sm text-muted">Tocá ☆ en una lección o una fórmula para tenerla siempre a mano.</p>
      )}

      <SectionTitle>📝 Mis notas ({notes.length})</SectionTitle>
      {notes.length ? (
        <ul className="space-y-2">
          {notes.map(([key, n]) => {
            const t = noteTitle(key);
            return (
              <li key={key} className="card p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  {t.href ? (
                    <Link href={t.href} className="font-semibold text-primary">
                      {t.title}
                    </Link>
                  ) : (
                    <span className="font-semibold">{t.title}</span>
                  )}
                  <span className="text-xs text-muted">{new Date(n.updatedAt).toLocaleDateString("es-AR")}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{n.text}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="card p-4 text-sm text-muted">En cada lección tocá 📝 para escribir con tus palabras lo que querés recordar.</p>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Saved />
    </Gate>
  );
}
