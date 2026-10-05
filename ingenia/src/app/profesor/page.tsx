"use client";
import { useState } from "react";
import Link from "next/link";
import { LESSONS, getLesson } from "@/content/lessons";
import { getTopic, ERROR_LABELS, ERROR_REMEDIATION } from "@/content/topics";
import { GuideSay } from "@/components/guide/Nodo";
import { store } from "@/lib/store";
import { exerciseFor } from "@/lib/learning";
import { localTutor, type TutorAnswer } from "@/lib/tutor";
import type { Exercise } from "@/engine/types";
import { Gate } from "@/components/layout/Gate";
import { TutorPanel } from "@/components/tutor/TutorPanel";
import { ExercisePlayer } from "@/components/exercise/ExercisePlayer";
import { PageHeader, SectionTitle } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

function Professor() {
  const last = store.getState().lastActivity;
  const lastTopic = last ? getTopic(last.topicId) : undefined;
  const [lessonId, setLessonId] = useState<string>(lastTopic?.lessonId && getLesson(lastTopic.lessonId) ? lastTopic.lessonId : "l-ecuaciones");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<TutorAnswer | null>(null);
  const [practice, setPractice] = useState<Exercise | null>(null);
  const lesson = getLesson(lessonId)!;
  const topicId = lesson.topicIds[0];

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) setAnswer(await localTutor.ask(question));
  };

  return (
    <div>
      <PageHeader title="Preguntarle al profesor" subtitle="Elegí un tema y pedile que te lo explique de la forma que mejor te sirva. Nunca te va a responder solo «incorrecto»." />

      {last && lastTopic && (
        <GuideSay className="mb-4" mood={last.correct ? "happy" : "thinking"}>
          Lo último que trabajaste fue <b>{lastTopic.name}</b>
          {last.correct ? " y lo resolviste bien." : last.errorType ? `, y el error fue de tipo «${ERROR_LABELS[last.errorType].toLowerCase()}».` : ", y no salió."} {lastTopic.lessonId ? "Ya dejé ese tema seleccionado abajo." : ""}
          {!last.correct && last.errorType && ERROR_REMEDIATION[last.errorType] && ERROR_REMEDIATION[last.errorType] !== last.topicId && (
            <>
              {" "}
              Puede ayudarte repasar{" "}
              <Link className="font-semibold text-primary" href={`/practicar?tema=${ERROR_REMEDIATION[last.errorType]}`}>
                {getTopic(ERROR_REMEDIATION[last.errorType]!)?.name.toLowerCase()}
              </Link>
              .
            </>
          )}
        </GuideSay>
      )}

      <form onSubmit={ask} className="card flex flex-col gap-2 p-4 sm:flex-row">
        <input className="input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="¿Qué querés entender? Ej.: ¿qué es la pendiente?" aria-label="Tu pregunta" />
        <button className="btn btn-primary shrink-0" type="submit">
          <Icon name="chat" size={18} /> Preguntar
        </button>
      </form>
      {answer && (
        <div className="anim-pop card mt-3 p-4">
          <p className="mb-3">{answer.intro}</p>
          <ul className="space-y-2">
            {answer.results.map((r) => (
              <li key={`${r.type}-${r.title}`}>
                <Link href={r.href} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-primary">
                  <span className="chip shrink-0">{r.type}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{r.title}</span>
                    {r.path && <span className="text-xs text-muted">{r.path}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SectionTitle>Explicaciones por tema</SectionTitle>
      <label className="block">
        <span className="text-sm font-semibold text-muted">Tema</span>
        <select className="input mt-1" value={lessonId} onChange={(e) => { setLessonId(e.target.value); setPractice(null); }}>
          {LESSONS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-4">
        <TutorPanel key={lessonId} script={lesson.tutor} topicName={lesson.title} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/leccion/${lesson.id}`} className="btn btn-secondary">
          Abrir la lección completa
        </Link>
        {topicId && (
          <button className="btn btn-secondary" onClick={() => setPractice(exerciseFor(store.getState(), topicId))}>
            Dame un ejercicio para probar
          </button>
        )}
      </div>
      {practice && (
        <div className="card mt-4 p-5">
          <ExercisePlayer key={practice.id} exercise={practice} mode="practica" onDone={() => setPractice(exerciseFor(store.getState(), topicId))} continueLabel="Otro" />
          <p className="mt-3 text-xs text-muted">Tema: {getTopic(practice.topicId)?.name}</p>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Professor />
    </Gate>
  );
}
