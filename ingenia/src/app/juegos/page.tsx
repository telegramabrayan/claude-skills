"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Gate } from "@/components/layout/Gate";
import { Session } from "@/components/session/Session";
import { Contrarreloj, Escalera, FORMATS, formatTopic, Memoria, VerdaderoFalso } from "@/components/games/Games";
import { GuideSay } from "@/components/guide/Nodo";
import { SectionTitle } from "@/components/ui/primitives";

const GAMES: { key: string; title: string; text: string; icon: string; color: string }[] = [
  { key: "contrarreloj", title: "Contrarreloj", text: "¿Cuántos resolvés bien en 90 segundos?", icon: "⏱️", color: "var(--c-physics)" },
  { key: "escalera", title: "Escalera", text: "Cada acierto sube un escalón; cada vez más difícil.", icon: "🪜", color: "var(--c-algebra)" },
  { key: "error", title: "Encontrá el error", text: "Una resolución que parece bien… pero no.", icon: "🔍", color: "var(--c-math)" },
  { key: "memoria", title: "Memoria de conceptos", text: "Parejas de símbolos, unidades y funciones.", icon: "🧠", color: "var(--c-ipc)" },
  { key: "vf", title: "Verdadero o falso", text: "10 afirmaciones rápidas con su porqué.", icon: "⚖️", color: "var(--c-chem)" },
];

function Hub() {
  return (
    <div className="space-y-8">
      <header className="card-hero p-6 sm:p-8" style={{ ["--subj" as string]: "var(--c-algebra)", ["--subj-deep" as string]: "var(--c-algebra-deep)" }}>
        <p className="hero-muted text-sm font-black uppercase tracking-wider text-white/85">Minijuegos</p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">Jugá con lo que estás aprendiendo</h1>
        <p className="hero-muted mt-2 max-w-prose text-white/85">Los ejercicios salen de los temas que ya practicaste. Los aciertos cuentan para tu dominio igual que en la práctica: jugar también es estudiar.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger">
        {GAMES.map((g) => (
          <Link key={g.key} href={`/juegos?juego=${g.key}`} className="card-subject p-5" style={{ ["--subj" as string]: g.color }}>
            <span className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: `color-mix(in srgb, ${g.color} 18%, transparent)` }} aria-hidden>
              {g.icon}
            </span>
            <span className="mt-3 block text-lg font-black">{g.title}</span>
            <span className="block text-sm font-semibold text-muted">{g.text}</span>
          </Link>
        ))}
      </div>
      <section>
        <SectionTitle>Probá cada tipo de actividad</SectionTitle>
        <GuideSay mood="explain" size={44} className="mb-3">
          Cada concepto tiene el formato que mejor lo muestra: arrastrar, unir, construir, tocar el gráfico…
        </GuideSay>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {FORMATS.map((f) => (
            <Link key={f.gen} href={`/juegos?formato=${f.gen}`} className="tile !items-start flex-col !gap-1">
              <span className="text-2xl" aria-hidden>{f.icon}</span>
              <span className="font-black leading-tight">{f.title}</span>
              <span className="text-xs font-semibold text-muted">{f.text}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Router() {
  const p = useSearchParams();
  const juego = p.get("juego");
  const formato = p.get("formato");
  if (formato && FORMATS.some((f) => f.gen === formato)) {
    const f = FORMATS.find((x) => x.gen === formato)!;
    return <Session key={formato} title={f.title} items={Array.from({ length: 5 }, (_, i) => ({ topicId: formatTopic(formato), generator: formato, adjust: i >= 3 ? 1 : 0 }))} mode="practica" exitHref="/juegos" />;
  }
  switch (juego) {
    case "contrarreloj":
      return <Contrarreloj />;
    case "escalera":
      return <Escalera />;
    case "memoria":
      return <Memoria />;
    case "vf":
      return <VerdaderoFalso />;
    case "error":
      return <Session key="error" title="Encontrá el error" items={Array.from({ length: 5 }, (_, i) => ({ topicId: "t-ecuaciones", generator: "act-encontrar-error", adjust: i >= 2 ? 1 : 0 }))} mode="practica" exitHref="/juegos" />;
    default:
      return <Hub />;
  }
}

export default function Page() {
  return (
    <Gate>
      <Suspense>
        <Router />
      </Suspense>
    </Gate>
  );
}
