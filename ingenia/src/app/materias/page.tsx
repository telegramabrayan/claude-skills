"use client";
import Link from "next/link";
import type { CareerId, Subject } from "@/engine/types";
import { CAREERS, CBC_RULE, SUBJECTS } from "@/content/curriculum";
import { useProgress } from "@/lib/store";
import { subjectProgress } from "@/lib/learning";
import { Gate } from "@/components/layout/Gate";
import { PageHeader, ProgressBar, SectionTitle, SUBJECT_COLORS } from "@/components/ui/primitives";
import { OfficialBox } from "@/components/subject/OfficialBox";

function SubjectCard({ sub }: { sub: Subject }) {
  const s = useProgress();
  const hasLessons = sub.units.some((u) => u.lessonIds.length);
  const careers = CAREERS.filter((c) => c.cbcSubjects.includes(sub.id) || c.laterSubjects.includes(sub.id));
  return (
    <Link href={`/materias/${sub.id}`} className="card flex gap-4 p-4 transition hover:-translate-y-0.5 hover:border-primary">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl font-bold text-surface" style={{ background: SUBJECT_COLORS[sub.color] }} aria-hidden>
        {sub.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-tight">{sub.name}</span>
        <span className="mt-1 flex flex-wrap gap-1">
          {sub.cycle !== "preparacion" &&
            careers.map((c) => (
              <span key={c.id} className="chip !text-[10px]">
                {c.shortName}
              </span>
            ))}
          {!hasLessons && <span className="chip !text-[10px]">Programa en carga</span>}
        </span>
        {hasLessons && <ProgressBar value={subjectProgress(s, sub)} className="mt-2" height={6} color={SUBJECT_COLORS[sub.color]} label={`Progreso en ${sub.name}`} />}
      </span>
    </Link>
  );
}

function careerOf(sub: Subject): CareerId[] {
  return sub.careers === "todas" ? ["industrial", "informatica"] : sub.careers;
}

function Materias() {
  const prep = SUBJECTS.filter((s) => s.cycle === "preparacion");
  const cbc = SUBJECTS.filter((s) => s.cycle === "cbc");
  const later = SUBJECTS.filter((s) => s.cycle === "segundo-ciclo");
  const shared = later.filter((s) => careerOf(s).length > 1);
  const informatica = later.filter((s) => careerOf(s).length === 1 && careerOf(s)[0] === "informatica");
  const industrial = later.filter((s) => careerOf(s).length === 1 && careerOf(s)[0] === "industrial");

  return (
    <div>
      <PageHeader title="Materias" subtitle="Desde la preparación hasta el segundo ciclo de Ingeniería Industrial e Informática (FIUBA)." />
      <SectionTitle>Preparación</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">{prep.map((s) => <SubjectCard key={s.id} sub={s} />)}</div>

      <SectionTitle>CBC · Ciclo Básico Común</SectionTitle>
      <p className="mb-3 text-sm text-muted">{CBC_RULE}</p>
      <div className="grid gap-3 sm:grid-cols-2">{cbc.map((s) => <SubjectCard key={s.id} sub={s} />)}</div>

      <SectionTitle>Segundo ciclo</SectionTitle>
      <p className="mb-3 text-sm text-muted">
        Solo se listan materias cuyo nombre se confirmó en los planes 2023. El listado completo, los programas y las correlatividades se cargan a medida que se verifican contra las resoluciones oficiales.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <p className="mb-2 text-sm font-bold">Compartidas</p>
          <div className="space-y-3">{shared.map((s) => <SubjectCard key={s.id} sub={s} />)}</div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">Solo Informática</p>
          <div className="space-y-3">{informatica.map((s) => <SubjectCard key={s.id} sub={s} />)}</div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">Solo Industrial</p>
          <div className="space-y-3">{industrial.map((s) => <SubjectCard key={s.id} sub={s} />)}</div>
        </div>
      </div>

      <SectionTitle>Las carreras</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {CAREERS.map((c) => (
          <div key={c.id} className="card space-y-3 p-5">
            <h3 className="text-lg font-bold">{c.name}</h3>
            <p className="text-muted">{c.description}</p>
            <OfficialBox info={c.official} title="Plan de estudios" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Materias />
    </Gate>
  );
}
