"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CareerGoal } from "@/engine/types";
import { actions, useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { Icon } from "@/components/ui/Icon";

const GOALS: { id: CareerGoal; title: string; text: string; icon: string }[] = [
  { id: "industrial", title: "Ingeniería Industrial", text: "Producción, operaciones, economía, estadística y gestión.", icon: "🏭" },
  { id: "informatica", title: "Ingeniería Informática", text: "Programación, algoritmos, sistemas y software.", icon: "💻" },
  { id: "ambas", title: "Ambas", text: "Empezá por la base común y decidí más adelante.", icon: "🧭" },
];

function Welcome() {
  const router = useRouter();
  const onboarded = useProgress().profile.onboarded;
  const [step, setStep] = useState<0 | 1>(0);
  const [start, setStart] = useState<"diagnostico" | "cero">("diagnostico");
  const [name, setName] = useState("");

  const finish = (goal: CareerGoal) => {
    actions.completeOnboarding(goal, start, name.trim());
    router.replace(start === "diagnostico" ? "/diagnostico" : "/");
  };

  if (step === 0) {
    return (
      <div className="anim-pop flex min-h-[80dvh] flex-col justify-center">
        <div className="mb-8 grid h-16 w-16 place-items-center rounded-2xl bg-primary text-3xl font-black text-on-primary">∫</div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Bienvenido.</h1>
        <p className="mt-4 text-xl">Vamos a construir tu camino hacia Ingeniería.</p>
        <p className="mt-4 text-lg text-muted">
          No importa cuánto recuerdes del secundario. Primero vamos a descubrir qué conocimientos todavía tenés y cuáles necesitamos recuperar.
        </p>
        <label className="mt-8 block max-w-sm">
          <span className="text-sm font-semibold text-muted">¿Cómo te llamo? (opcional)</span>
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="given-name" />
        </label>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button className="btn btn-primary text-lg" onClick={() => { setStart("diagnostico"); setStep(1); }}>
            Comenzar diagnóstico <Icon name="arrowRight" />
          </button>
          <button className="btn btn-secondary text-lg" onClick={() => { setStart("cero"); setStep(1); }}>
            Prefiero empezar desde cero
          </button>
        </div>
        <p className="mt-6 text-sm text-muted">El diagnóstico tarda unos 10 minutos. No es un examen: si no sabés algo, tocás «No sé» y seguimos.</p>
        {onboarded && (
          <button className="btn btn-ghost mt-4 self-start" onClick={() => router.push("/")}>
            Volver al inicio
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="anim-pop flex min-h-[80dvh] flex-col justify-center">
      <button className="btn btn-ghost mb-6 self-start !px-2" onClick={() => setStep(0)}>
        <Icon name="arrowLeft" /> Atrás
      </button>
      <h1 className="text-3xl font-black tracking-tight">¿Qué querés estudiar?</h1>
      <p className="mt-2 text-muted">Las dos carreras comparten la base (Preparación y la mayor parte del CBC). Podés cambiarlo cuando quieras.</p>
      <div className="mt-6 grid gap-3">
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => finish(g.id)} className="card flex items-center gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:border-primary">
            <span className="text-4xl" aria-hidden>
              {g.icon}
            </span>
            <span>
              <span className="block text-lg font-bold">{g.title}</span>
              <span className="block text-muted">{g.text}</span>
            </span>
            <Icon name="arrowRight" className="ml-auto shrink-0 text-muted" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Welcome />
    </Gate>
  );
}
