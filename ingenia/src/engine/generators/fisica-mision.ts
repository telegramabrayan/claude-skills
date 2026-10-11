/**
 * Física — modo «misión»: ejercicios para PENSAR antes de calcular.
 *
 *  - «¿QUÉ USARÍAS?»: se muestra una situación con datos (a veces sobran) y se
 *    elige la relación física que conviene, sin resolver.
 *  - Signos, conversiones rápidas, análisis dimensional, lectura de gráficos,
 *    variantes de MRUV, problemas en dos etapas y diagramas de cuerpo libre.
 *  - Escenarios para «RESOLVER CONMIGO» (datos → modelo → fórmula → pasos).
 *
 * Convenciones de la cátedra: g = 9,80 m/s², SI, 3 cifras significativas,
 * «rapidez» para el módulo de la velocidad. Ejercicios propios (no copiados).
 */
import type { ErrorType, Generator, NumericExercise, Difficulty } from "../types";
import { fmt } from "../math/parser";
import { rng, type Rng } from "./rng";
import { base, choice, type BaseArgs, type Option } from "./helpers";
import { sig3, s3 } from "./fisica";

const G = 9.8;
const SUBJ = "fisica";

const toRad = (deg: number) => (deg * Math.PI) / 180;
const sinD = (deg: number) => Math.sin(toRad(deg));
const cosD = (deg: number) => Math.cos(toRad(deg));

/** Dato del enunciado con coma decimal (hasta 3 decimales). */
const n = (x: number, d = 3) => fmt(x, d);

type Err = [number, ErrorType, string];
type Bad = [string, ErrorType, string];

interface NumArgs {
  gen: string;
  seed: number;
  d: Difficulty;
  topicId: string;
  prompt: string;
  hints: [string, string, string];
  solution: string[];
  explanation: string;
  unit: string;
  answer: number;
  errors?: Err[];
  visual?: BaseArgs["visual"];
  /** Si es false, no se pide «3 cifras significativas» (respuesta exacta). */
  sig?: boolean;
}

/** Numérico a 3 cifras significativas, tolerancia relativa 0,5 %, sin errores frecuentes repetidos. */
function num(a: NumArgs): NumericExercise {
  const ans = sig3(a.answer);
  const tol = Math.max(Math.abs(ans) * 0.005, 1e-9);
  const kept: number[] = [];
  const frequentErrors = (a.errors ?? [])
    .map(([m, type, message]) => ({ match: sig3(m), type, message }))
    .filter((e) => {
      if (!Number.isFinite(e.match)) return false;
      if (Math.abs(e.match - ans) <= 3 * tol) return false;
      if (kept.some((k) => Math.abs(k - e.match) <= 3 * Math.max(tol, Math.abs(k) * 0.005))) return false;
      kept.push(e.match);
      return true;
    });
  const tail = a.sig === false ? "" : ` Respondé con 3 cifras significativas${a.unit ? `, en ${a.unit}` : ""}.`;
  return {
    ...base({
      gen: a.gen, seed: a.seed, difficulty: a.d, subjectId: SUBJ, topicId: a.topicId,
      prompt: `${a.prompt}${tail}`,
      hints: a.hints, solution: a.solution, explanation: a.explanation, frequentErrors, visual: a.visual,
    }),
    kind: "numeric",
    answer: ans,
    tolerance: tol,
    ...(a.unit ? { unit: a.unit } : {}),
  };
}

function cb(gen: string, seed: number, d: Difficulty, topicId: string, prompt: string, hints: [string, string, string], solution: string[], explanation: string, visual?: BaseArgs["visual"]) {
  return base({ gen, seed, difficulty: d, subjectId: SUBJ, topicId, prompt, hints, solution, explanation, visual });
}

const ok = (text: string): Option => ({ text, correct: true });
const bad = ([text, type, message]: Bad): Option => ({ text, error: { type, message } });

// ═════════════════════════════ «¿QUÉ USARÍAS?» ═════════════════════════════

interface QU {
  /** Situación con los datos. */
  sit: string;
  /** Dato que sobra (se agrega desde dificultad 3). */
  extra?: string;
  /** Lo que se pide ("la rapidez final"). */
  pide: string;
  ok: string;
  why: string;
  bad: Bad[];
  /** Pista intermedia propia de la situación. */
  hint: string;
}

interface QUEntry {
  lvl: number;
  make: (r: Rng) => QU;
}

function quGenerator(id: string, topicId: string, description: string, pool: QUEntry[]): Generator {
  return {
    id,
    topicId,
    description,
    generate(seed, d) {
      const r = rng(seed);
      let cands = pool.filter((e) => e.lvl <= d && e.lvl >= d - 1);
      if (!cands.length) cands = pool.filter((e) => e.lvl <= d);
      const q = r.pick(cands).make(r);
      const withExtra = d >= 3 && !!q.extra;
      const prompt =
        `**¿QUÉ USARÍAS?** ${q.sit}${withExtra ? ` ${q.extra}` : ""}\n\nSe pide **${q.pide}**. ¿Qué relación conviene usar? (No hace falta resolver.)` +
        (d >= 3 ? " Ojo: puede haber datos que sobran." : "");
      return choice(
        r,
        cb(id, seed, d, topicId, prompt,
          [
            "Antes de elegir, separá: ¿qué datos tenés?, ¿qué te piden?, ¿qué NO te dieron?",
            q.hint,
            "Conviene la relación que vincula la incógnita SOLO con datos que ya tenés y cuyas hipótesis se cumplen (aceleración constante, sin rozamiento, reposo…).",
          ],
          [
            `Incógnita: ${q.pide}.`,
            ...(withExtra ? [`Dato que sobra: ${q.extra}`] : []),
            `Relación: ${q.ok}`,
            q.why,
          ],
          `Elegir la relación es la mitad del problema. ${q.why}`,
        ),
        [ok(q.ok), ...q.bad.map(bad)],
      );
    },
  };
}

// ───────────── Cinemática ─────────────

const QU_CINE: QUEntry[] = [
  {
    lvl: 1,
    make: (r) => {
      const a = r.pick([1.5, 2, 2.5, 3]);
      const t = r.pick([4, 5, 6, 8]);
      return {
        sit: `Un auto parte del reposo y acelera a razón de $a = ${n(a)}$ m/s² durante $t = ${t}$ s.`,
        extra: `La masa del auto es de ${r.pick([900, 1100, 1300])} kg.`,
        pide: "la rapidez que alcanza",
        ok: "$v = v_0 + a·t$",
        why: "Tenés $v_0$ (= 0, parte del reposo), $a$ y $t$: es la relación que vincula exactamente esas magnitudes con $v$.",
        hint: "«Parte del reposo» es un dato escondido: $v_0 = 0$. ¿Qué ecuación tiene $v$, $v_0$, $a$ y $t$?",
        bad: [
          ["$x = x_0 + v_0·t + ½·a·t^2$", "formula", "Esa ecuación da la POSICIÓN, no la velocidad. Te serviría si te preguntaran cuánto recorrió."],
          ["$v = Δx/Δt$", "velocidad-aceleracion", "Eso es la velocidad MEDIA (y además no tenés Δx). Como el auto acelera, la rapidez final no es la media."],
          ["$v^2 = v_0^2 + 2·a·Δx$", "formula", "Necesitarías Δx, que no es dato: tendrías que calcularlo primero. Es el camino largo."],
        ],
      };
    },
  },
  {
    lvl: 1,
    make: (r) => {
      const v = r.pick([15, 20, 25, 30]);
      const t = r.pick([10, 12, 40, 60]);
      return {
        sit: `Un tren avanza por una vía recta con rapidez constante de ${v} m/s durante ${t} s.`,
        extra: "La locomotora tiene una potencia de 2000 kW.",
        pide: "la distancia que recorre",
        ok: "$x = x_0 + v·t$ (MRU)",
        why: "La rapidez es constante: no hay aceleración, así que alcanza con la ecuación del MRU.",
        hint: "«Rapidez constante» significa a = 0. ¿Qué modelo es ese?",
        bad: [
          ["$x = x_0 + v_0·t + ½·a·t^2$ con $a = 9,80$ m/s²", "conceptual", "Si la rapidez es constante, a = 0. La g no tiene nada que ver con un movimiento horizontal."],
          ["$v = v_0 + a·t$", "formula", "Esa relación da una velocidad, pero te piden una distancia (y acá v ni siquiera cambia)."],
          ["$v^2 = v_0^2 + 2·a·Δx$", "velocidad-aceleracion", "Con a = 0 esa ecuación queda v = v₀: no te dice nada de la distancia."],
        ],
      };
    },
  },
  {
    lvl: 2,
    make: (r) => {
      const v0 = r.pick([4, 6, 8, 10]);
      const a = r.pick([1.5, 2, 3]);
      const dx = r.pick([20, 30, 45, 60]);
      return {
        sit: `Una moto que va a ${v0} m/s acelera a razón de ${n(a)} m/s² a lo largo de ${dx} m.`,
        extra: "La moto y el conductor tienen, juntos, 250 kg.",
        pide: "su rapidez al final del tramo",
        ok: "$v^2 = v_0^2 + 2·a·Δx$",
        why: "No tenés el tiempo. La relación que vincula v, v₀, a y Δx sin t es esta.",
        hint: "Fijate qué magnitud NO aparece en los datos: el tiempo. Buscá la ecuación de MRUV que no lo tiene.",
        bad: [
          ["$v = v_0 + a·t$", "formula", "Falta el tiempo: no es dato."],
          ["$v = Δx/Δt$", "velocidad-aceleracion", "Eso vale con velocidad constante (o da la media). Además, falta el tiempo."],
          ["$x = x_0 + v·t$", "conceptual", "Es la ecuación del MRU; la moto acelera, así que la velocidad no es constante."],
        ],
      };
    },
  },
  {
    lvl: 2,
    make: (r) => {
      const v0 = r.pick([15, 20, 25]);
      const a = r.pick([4, 5, 6]);
      return {
        sit: `Un auto que va a ${v0} m/s frena con una desaceleración constante de ${a} m/s² hasta detenerse.`,
        extra: "El auto tiene cuatro ocupantes.",
        pide: "la distancia de frenado",
        ok: "$v^2 = v_0^2 + 2·a·Δx$ con $v = 0$",
        why: "«Hasta detenerse» te regala un dato: v = 0. Sin el tiempo, esta es la relación directa entre v₀, a y Δx.",
        hint: "¿Cuánto vale la rapidez final si «se detiene»? ¿Tenés el tiempo de frenado?",
        bad: [
          ["$x = x_0 + v_0·t + ½·a·t^2$", "formula", "Falta el tiempo de frenado: tendrías que calcularlo antes. Es el camino largo."],
          ["$Δx = v_0·t$", "conceptual", "Supone velocidad constante, pero el auto está frenando."],
          ["$v = v_0 + a·t$", "formula", "Esa da el tiempo de frenado, no la distancia: sería solo un paso intermedio."],
        ],
      };
    },
  },
  {
    lvl: 3,
    make: (r) => {
      const d = r.pick([25, 40, 50, 80]);
      const t = r.pick([5, 8, 10]);
      return {
        sit: `Un ciclista parte del reposo y recorre ${d} m en ${t} s con aceleración constante.`,
        extra: "La bicicleta tiene una masa de 12 kg.",
        pide: "su aceleración",
        ok: "$Δx = v_0·t + ½·a·t^2$ con $v_0 = 0$",
        why: "Tenés Δx, t y v₀ = 0: la ecuación horaria de la posición tiene solo una incógnita, a.",
        hint: "No tenés la rapidez final. ¿Qué ecuación vincula Δx, t y a?",
        bad: [
          ["$a = v/t$ con $v = Δx/t$", "velocidad-aceleracion", "Δx/t es la velocidad MEDIA, no la final. Con eso la aceleración te da la mitad de la real."],
          ["$v^2 = v_0^2 + 2·a·Δx$", "formula", "Falta la rapidez final: tenés dos incógnitas (v y a) en una sola ecuación."],
          ["$x = x_0 + v·t$", "conceptual", "Es MRU: el ciclista parte del reposo y acelera."],
        ],
      };
    },
  },
  {
    lvl: 3,
    make: (r) => {
      const h = r.pick([5, 12, 20, 45]);
      return {
        sit: `Se deja caer una maceta desde una altura de ${h} m (despreciá el rozamiento con el aire).`,
        extra: `La maceta tiene una masa de ${r.pick([2, 3, 4])} kg.`,
        pide: "el tiempo que tarda en llegar al piso",
        ok: "$Δy = ½·g·t^2$ (parte del reposo)",
        why: "Caída libre desde el reposo: con la altura y g, la ecuación horaria da directamente t.",
        hint: "«Se deja caer» = $v_0 = 0$. ¿Qué ecuación tiene Δy, g y t?",
        bad: [
          ["$v = g·t$", "formula", "Falta la rapidez final: no la conocés."],
          ["$v^2 = v_0^2 + 2·g·Δy$", "formula", "Te da la rapidez al llegar, no el tiempo (sería un paso intermedio innecesario)."],
          ["$t = Δy/g$", "despeje", "Dimensionalmente no cierra: m ÷ (m/s²) da s², no s."],
        ],
      };
    },
  },
  {
    lvl: 4,
    make: (r) => {
      const v0 = r.pick([10, 14, 18, 20]);
      return {
        sit: `Se lanza una pelota verticalmente hacia arriba con una rapidez de ${v0} m/s.`,
        extra: "La pelota tiene una masa de 0,45 kg.",
        pide: "la altura máxima que alcanza (desde el punto de lanzamiento)",
        ok: "$v^2 = v_0^2 − 2·g·Δy$ con $v = 0$ arriba",
        why: "En la altura máxima la rapidez es 0. Sin el tiempo, la relación directa es la de v² (con eje hacia arriba, a = −g).",
        hint: "¿Cuánto vale la velocidad justo en el punto más alto?",
        bad: [
          ["$Δy = ½·g·t^2$", "conceptual", "Esa vale si parte del REPOSO. Acá sale con v₀ ≠ 0 (y además no tenés t)."],
          ["$Δy = v_0·t$", "velocidad-aceleracion", "Supone velocidad constante; la pelota va frenando por la gravedad."],
          ["$v = v_0 − g·t$", "formula", "Te da el tiempo de subida, no la altura: sería un paso intermedio."],
        ],
      };
    },
  },
  {
    lvl: 4,
    make: (r) => {
      const v0 = r.pick([4, 6, 8]);
      const v = v0 + r.pick([6, 8, 10]);
      const t = r.pick([4, 5, 6]);
      return {
        sit: `Un colectivo pasa de ${v0} m/s a ${v} m/s en ${t} s, con aceleración constante.`,
        extra: "Lleva 30 pasajeros.",
        pide: "la distancia que recorre en ese lapso",
        ok: "$Δx = \\frac{v_0 + v}{2}·Δt$",
        why: "En MRUV la velocidad media es el promedio de la inicial y la final. Con v₀, v y Δt no hace falta calcular a.",
        hint: "No te dieron la aceleración. ¿Hay alguna relación con v₀, v y t (sin a)?",
        bad: [
          ["$x = x_0 + v_0·t + ½·a·t^2$", "formula", "Falta la aceleración: tendrías que calcularla antes."],
          ["$v^2 = v_0^2 + 2·a·Δx$", "formula", "También necesita la aceleración, que no es dato."],
          ["$Δx = v·Δt$", "velocidad-aceleracion", "Usa una sola velocidad como si fuera constante, pero cambia de v₀ a v."],
        ],
      };
    },
  },
  {
    lvl: 5,
    make: (r) => {
      const vA = r.pick([80, 90, 100]);
      const vB = r.pick([50, 60, 70]);
      const d = r.pick([30, 40, 60]);
      return {
        sit: `Un auto A pasa por el km 0 a ${vA} km/h; en ese instante, un camión B que va en el MISMO sentido pasa por el km ${d} a ${vB} km/h. Ambos mantienen su velocidad.`,
        extra: "El camión lleva 20 t de carga.",
        pide: "el instante en que A alcanza a B",
        ok: "Igualar posiciones: $x_{0A} + v_A·t = x_{0B} + v_B·t$",
        why: "Encontrarse es ESTAR en el mismo lugar al mismo tiempo: se igualan las dos ecuaciones horarias de MRU.",
        hint: "¿Qué significa «alcanzar»? Mismo lugar, mismo instante.",
        bad: [
          ["$t = d/(v_A + v_B)$", "velocidad-aceleracion", "Las velocidades se suman si van al encuentro (sentidos opuestos). Acá van en el mismo sentido: A se acerca con v_A − v_B."],
          ["$v^2 = v_0^2 + 2·a·Δx$", "conceptual", "No hay aceleración: los dos van a velocidad constante (MRU)."],
          ["$t = d/v_A$", "conceptual", "Mientras A avanza, B también se mueve: no alcanza con dividir por v_A."],
        ],
      };
    },
  },
  {
    lvl: 5,
    make: (r) => {
      const v0 = r.pick([72, 90, 108]);
      const v = r.pick([18, 36, 54]);
      const dx = r.pick([100, 150, 200]);
      return {
        sit: `Un auto frena uniformemente de ${v0} km/h a ${v} km/h en ${dx} m.`,
        extra: "El tramo dura una cuadra y media.",
        pide: "su aceleración (en m/s²)",
        ok: "$v^2 = v_0^2 + 2·a·Δx$ con las rapideces pasadas a m/s",
        why: "Sin tiempo, la relación es la de v². Y como Δx está en metros, las rapideces deben ir en m/s (÷ 3,6).",
        hint: "Hay dos trampas: falta un dato (¿cuál?) y las unidades no son homogéneas.",
        bad: [
          ["$v^2 = v_0^2 + 2·a·Δx$ con las rapideces en km/h", "unidades", "Mezclar km/h con metros da una aceleración sin sentido: primero pasá a m/s (÷ 3,6)."],
          ["$v = v_0 + a·t$", "formula", "Falta el tiempo."],
          ["$a = (v − v_0)/Δx$", "velocidad-aceleracion", "La aceleración es Δv/Δt, no Δv/Δx (ni siquiera da unidades de aceleración)."],
        ],
      };
    },
  },
  {
    lvl: 6,
    make: (r) => {
      const a = r.pick([2, 2.5, 3]);
      const t1 = r.pick([4, 5, 6]);
      const t2 = r.pick([10, 15, 20]);
      return {
        sit: `Un auto parte del reposo, acelera a ${n(a)} m/s² durante ${t1} s y después sigue ${t2} s con la rapidez que alcanzó.`,
        extra: "El motor tiene 1,6 L de cilindrada.",
        pide: "la distancia total recorrida",
        ok: "Dos tramos: $Δx_1 = ½·a·t_1^2$ y $Δx_2 = (a·t_1)·t_2$",
        why: "Son dos movimientos distintos (MRUV y luego MRU): se calcula cada tramo y la rapidez final del 1.º es la del 2.º.",
        hint: "¿El auto acelera todo el tiempo? Separá el viaje en etapas.",
        bad: [
          ["$Δx = ½·a·(t_1 + t_2)^2$", "conceptual", "Supone que acelera todo el tiempo; en el segundo tramo la velocidad es constante."],
          ["$Δx = v·(t_1 + t_2)$ con $v = a·t_1$", "conceptual", "Supone que va a la rapidez máxima desde el principio; en el primer tramo arranca desde 0."],
          ["$v^2 = v_0^2 + 2·a·Δx$ para todo el viaje", "formula", "Un solo MRUV no describe dos etapas distintas: hay que separar tramos."],
        ],
      };
    },
  },
  {
    lvl: 6,
    make: (r) => {
      const v0 = r.pick([3, 5, 8]);
      const h = r.pick([15, 20, 30]);
      return {
        sit: `Desde una terraza a ${h} m del piso se lanza una piedra verticalmente HACIA ABAJO con rapidez ${v0} m/s.`,
        extra: "La piedra tiene 200 g.",
        pide: "la rapidez con que llega al piso",
        ok: "$v^2 = v_0^2 + 2·g·Δy$ (eje hacia abajo)",
        why: "No hay tiempo de dato y la piedra ya sale con velocidad: la relación de v² incluye v₀ sin necesidad de t.",
        hint: "¿Sale del reposo? ¿Tenés el tiempo?",
        bad: [
          ["$v^2 = 2·g·Δy$", "conceptual", "Esa vale si se suelta desde el reposo; acá tiene velocidad inicial hacia abajo."],
          ["$v = v_0 + g·t$", "formula", "Falta el tiempo."],
          ["$v = Δy/t$", "velocidad-aceleracion", "No es MRU (la piedra acelera) y además falta t."],
        ],
      };
    },
  },
];

export const fisQueUsariasCinematica = quGenerator("fis-que-usarias-cinematica", "t-mruv", "¿Qué usarías? Elegir la ecuación de cinemática según los datos", QU_CINE);

// ───────────── Dinámica ─────────────

const QU_DIN: QUEntry[] = [
  {
    lvl: 1,
    make: (r) => {
      const m = r.pick([2, 4, 5, 10]);
      const F = r.pick([10, 20, 30]);
      return {
        sit: `Sobre un bloque de ${m} kg apoyado en un piso horizontal SIN rozamiento se aplica una fuerza horizontal de ${F} N.`,
        extra: "El bloque mide 30 cm de lado.",
        pide: "la aceleración del bloque",
        ok: "$F = m·a$ (2.ª ley de Newton)",
        why: "La única fuerza horizontal es F: la 2.ª ley da directamente la aceleración.",
        hint: "¿Qué fuerzas actúan en la dirección del movimiento?",
        bad: [
          ["$P = m·g$", "conceptual", "El peso es vertical y queda equilibrado por la normal: no acelera al bloque horizontalmente."],
          ["$F_{roz} = μ·N$", "conceptual", "No hay rozamiento: el piso es liso."],
          ["$v = v_0 + a·t$", "formula", "Esa es cinemática: necesita a para dar v. La aceleración sale de las FUERZAS."],
        ],
      };
    },
  },
  {
    lvl: 1,
    make: (r) => {
      const m = r.pick([5, 12, 60, 75]);
      return {
        sit: `Una persona de ${m} kg está parada en el piso.`,
        extra: "Mide 1,70 m.",
        pide: "su peso (en newtons)",
        ok: "$P = m·g$",
        why: "El peso es la fuerza con que la Tierra atrae al cuerpo: masa por aceleración de la gravedad.",
        hint: "Peso y masa no son lo mismo: el peso es una fuerza.",
        bad: [
          ["$P = m$", "unidades", "La masa (kg) no es una fuerza: el peso se mide en newtons y es m·g."],
          ["$P = m/g$", "despeje", "Al revés: el peso es masa POR g."],
          ["$F = m·a$ con $a = 0$", "conceptual", "Esa da la fuerza NETA (cero, porque está quieta), no el peso."],
        ],
      };
    },
  },
  {
    lvl: 2,
    make: (r) => {
      const m = r.pick([10, 15, 20]);
      const mu = r.pick([0.2, 0.25, 0.3]);
      return {
        sit: `Se arrastra un cajón de ${m} kg sobre un piso horizontal; el coeficiente de rozamiento dinámico es ${n(mu)} y el cajón desliza.`,
        extra: `El coeficiente estático es ${n(mu + 0.15)}.`,
        pide: "el módulo de la fuerza de rozamiento",
        ok: "$F_{roz} = μ_d·N$ con $N = m·g$",
        why: "Si desliza, el rozamiento es dinámico. En un piso horizontal (sin otras fuerzas verticales), N = m·g.",
        hint: "¿Está deslizando o en reposo? ¿Cuánto vale la normal en un piso horizontal?",
        bad: [
          ["$F_{roz} = μ_d·m$", "unidades", "μ·m da kilogramos, no newtons: el rozamiento es μ por la NORMAL (una fuerza)."],
          ["$F_{roz} = μ_e·N$", "conceptual", "El cajón desliza: va el coeficiente DINÁMICO. μₑ·N es el máximo antes de empezar a moverse."],
          ["$N = m·g·cos θ$", "conceptual", "No hay plano inclinado: el piso es horizontal."],
        ],
      };
    },
  },
  {
    lvl: 3,
    make: (r) => {
      const th = r.pick([20, 30, 37, 45]);
      return {
        sit: `Un bloque desliza por un plano inclinado ${th}° SIN rozamiento.`,
        extra: `El bloque tiene ${r.pick([2, 3, 5])} kg.`,
        pide: "su aceleración",
        ok: "$a = g·sen θ$",
        why: "La única fuerza a lo largo del plano es la componente del peso P·sen θ; dividiendo por m queda g·sen θ.",
        hint: "Descomponé el peso: paralela al plano y perpendicular al plano.",
        bad: [
          ["$a = g·cos θ$", "trigonometria", "P·cos θ es la componente PERPENDICULAR al plano (la equilibra la normal); la que acelera es P·sen θ."],
          ["$a = g$", "conceptual", "Eso sería caída libre. El plano sostiene al bloque y solo una parte del peso lo empuja."],
          ["$a = g·(sen θ − μ_d·cos θ)$", "conceptual", "No hay rozamiento: ese término no va."],
        ],
      };
    },
  },
  {
    lvl: 3,
    make: (r) => {
      const m = r.pick([20, 50, 80]);
      const a = r.pick([1, 1.5, 2]);
      return {
        sit: `Una grúa SUBE una carga de ${m} kg colgada de un cable, con aceleración de ${n(a)} m/s² hacia arriba.`,
        extra: "El cable mide 12 m.",
        pide: "la tensión del cable",
        ok: "$T − P = m·a$ → $T = m·(g + a)$",
        why: "Fuerzas sobre la carga: T hacia arriba y P hacia abajo. La neta (T − P) produce la aceleración hacia arriba.",
        hint: "Hacé el DCL de la carga: ¿qué fuerzas tiene y hacia dónde apunta a?",
        bad: [
          ["$T = m·a$", "conceptual", "Olvidaste el peso: la cuerda además de acelerar la carga tiene que sostenerla."],
          ["$T = m·g$", "conceptual", "Eso vale si a = 0 (reposo o velocidad constante). Acelera hacia arriba: T > P."],
          ["$T = m·(g − a)$", "signos", "Esa es para aceleración hacia ABAJO. Acá acelera hacia arriba: la tensión supera al peso."],
        ],
      };
    },
  },
  {
    lvl: 4,
    make: (r) => {
      const th = r.pick([30, 37, 40]);
      const mu = r.pick([0.2, 0.25, 0.3]);
      return {
        sit: `Un bloque baja deslizando por un plano inclinado ${th}° con coeficiente de rozamiento dinámico ${n(mu)}.`,
        extra: `El plano mide ${r.pick([3, 4, 5])} m de largo.`,
        pide: "su aceleración",
        ok: "$a = g·(sen θ − μ_d·cos θ)$",
        why: "A lo largo del plano: P·sen θ hacia abajo y el rozamiento μd·N hacia arriba, con N = m·g·cos θ.",
        hint: "¿Cuánto vale la normal en el plano? ¿Hacia dónde apunta el rozamiento si baja?",
        bad: [
          ["$a = g·(sen θ − μ_d)$", "conceptual", "Usaste N = m·g. En el plano la normal es m·g·cos θ."],
          ["$a = g·(sen θ + μ_d·cos θ)$", "signos", "El rozamiento se opone al deslizamiento: si baja, apunta hacia ARRIBA del plano y resta."],
          ["$a = g·sen θ$", "conceptual", "Así no hay rozamiento, pero el enunciado dice que lo hay."],
        ],
      };
    },
  },
  {
    lvl: 4,
    make: (r) => {
      const th = r.pick([15, 20, 25, 30]);
      return {
        sit: `Se va inclinando de a poco una tabla con un libro encima; el libro empieza a deslizar justo cuando la tabla forma ${th}° con la horizontal.`,
        extra: "El libro tiene 800 g.",
        pide: "el coeficiente de rozamiento estático",
        ok: "$μ_e = tg θ$",
        why: "Justo antes de deslizar: P·sen θ = μₑ·P·cos θ, y el peso se simplifica.",
        hint: "En el límite, el rozamiento estático es máximo y equilibra a P·sen θ.",
        bad: [
          ["$μ_e = sen θ$", "trigonometria", "Te olvidaste de que N = P·cos θ: al dividir por la normal queda sen/cos = tg."],
          ["$μ_e = cos θ$", "trigonometria", "El cociente entre la fuerza que lo hace deslizar (P·sen θ) y la normal (P·cos θ) es la tangente."],
          ["$F_{roz} = μ_d·N$", "conceptual", "Mientras no desliza, el rozamiento es ESTÁTICO."],
        ],
      };
    },
  },
  {
    lvl: 5,
    make: (r) => {
      const mA = r.pick([2, 3, 4]);
      const mB = r.pick([1, 2]);
      return {
        sit: `Un bloque A de ${mA} kg está sobre una mesa horizontal lisa, unido por una cuerda (que pasa por una polea ideal) a un bloque B de ${mB} kg que cuelga.`,
        extra: "La mesa mide 80 cm de alto.",
        pide: "la aceleración del sistema",
        ok: "$a = \\frac{m_B·g}{m_A + m_B}$",
        why: "La única fuerza que tira del sistema es el peso de B, y tiene que acelerar a las DOS masas.",
        hint: "Planteá la 2.ª ley para cada cuerpo y sumá: la tensión se cancela.",
        bad: [
          ["$a = g$", "conceptual", "B no cae libre: arrastra también a A."],
          ["$a = \\frac{m_B·g}{m_A}$", "conceptual", "La fuerza neta mueve a ambos cuerpos: en el denominador va mA + mB."],
          ["$T = m_B·g$", "conceptual", "Si el sistema acelera, la tensión es MENOR que el peso de B; además piden a, no T."],
        ],
      };
    },
  },
  {
    lvl: 5,
    make: (r) => {
      const F = r.pick([40, 60, 75]);
      const m = r.pick([15, 20, 25]);
      return {
        sit: `Se empuja un baúl de ${m} kg con una fuerza horizontal de ${F} N y se mueve con VELOCIDAD CONSTANTE sobre un piso horizontal.`,
        extra: "Lo empujan durante 6 s.",
        pide: "el coeficiente de rozamiento dinámico",
        ok: "$F − μ_d·m·g = 0$ (ΣF = 0)",
        why: "Velocidad constante ⇒ a = 0 ⇒ fuerzas equilibradas: la fuerza aplicada iguala al rozamiento.",
        hint: "¿Cuánto vale la aceleración si la velocidad es constante?",
        bad: [
          ["$F − μ_d·m·g = m·a$ con $a = v/t$", "velocidad-aceleracion", "La velocidad es constante: a = 0, no v/t."],
          ["$μ_d = F/m$", "unidades", "F/m es una aceleración (m/s²): μ es adimensional y se obtiene dividiendo por la NORMAL."],
          ["$μ_e = F/(m·g)$", "conceptual", "El baúl ya está deslizando: el coeficiente es el DINÁMICO."],
        ],
      };
    },
  },
  {
    lvl: 6,
    make: (r) => {
      const m = r.pick([60, 70, 80]);
      const a = r.pick([1, 1.5, 2]);
      return {
        sit: `Una persona de ${m} kg está parada sobre una balanza dentro de un ascensor que BAJA y está FRENANDO con aceleración de módulo ${n(a)} m/s².`,
        extra: "El ascensor va del piso 9 a planta baja.",
        pide: "lo que marca la balanza (la normal)",
        ok: "$N − P = m·a$ con a hacia arriba → $N = m·(g + a)$",
        why: "Si baja y frena, la velocidad apunta hacia abajo pero la ACELERACIÓN hacia arriba: la normal supera al peso.",
        hint: "Frenar es acelerar en sentido contrario a la velocidad. ¿Hacia dónde apunta a?",
        bad: [
          ["$N = m·(g − a)$", "velocidad-aceleracion", "Esa vale si la aceleración apunta hacia abajo. Baja FRENANDO: a apunta hacia arriba."],
          ["$N = m·g$", "conceptual", "Eso vale con a = 0. Mientras frena, la balanza marca más que el peso."],
          ["$N = m·a$", "conceptual", "Olvidaste el peso: la normal tiene que sostener a la persona además de frenarla."],
        ],
      };
    },
  },
  {
    lvl: 6,
    make: (r) => {
      const m = r.pick([500, 800, 1200]);
      const a = r.pick([3, 5, 8]);
      return {
        sit: `Un cohete de ${m} kg despega verticalmente con aceleración constante de ${a} m/s².`,
        extra: "Alcanza 300 m en los primeros segundos.",
        pide: "la fuerza impulsora del motor",
        ok: "$F − P = m·a$ → $F = m·(g + a)$",
        why: "El motor tiene que vencer el peso Y además acelerar al cohete hacia arriba.",
        hint: "DCL del cohete: fuerza del motor hacia arriba, peso hacia abajo.",
        bad: [
          ["$F = m·a$", "conceptual", "Olvidaste el peso: con F = m·a el cohete ni siquiera despegaría."],
          ["$F = m·g$", "conceptual", "Eso solo lo mantiene suspendido (a = 0)."],
          ["$F = m·(a − g)$", "signos", "El peso se opone al movimiento: la fuerza del motor es MAYOR que m·a, no menor."],
        ],
      };
    },
  },
];

export const fisQueUsariasDinamica = quGenerator("fis-que-usarias-dinamica", "t-newton", "¿Qué usarías? Elegir la ley o relación de dinámica", QU_DIN);

// ───────────── Energía ─────────────

const QU_ENE: QUEntry[] = [
  {
    lvl: 1,
    make: (r) => {
      const m = r.pick([2, 5, 10]);
      const h = r.pick([3, 8, 12]);
      return {
        sit: `Una caja de ${m} kg está sobre un estante a ${h} m del piso.`,
        extra: "La caja es de cartón.",
        pide: "su energía potencial gravitatoria respecto del piso",
        ok: "$E_p = m·g·h$",
        why: "La energía potencial gravitatoria depende de la masa, de g y de la altura respecto del nivel de referencia.",
        hint: "¿Se mueve la caja? ¿Qué energía depende de la altura?",
        bad: [
          ["$E_c = ½·m·v^2$", "conceptual", "La caja está quieta: su energía cinética es cero. Piden la potencial."],
          ["$E_{el} = ½·k·Δx^2$", "conceptual", "No hay ningún resorte."],
          ["$W = F·d·cos α$", "formula", "Eso es el trabajo de una fuerza a lo largo de un desplazamiento; acá no hay desplazamiento."],
        ],
      };
    },
  },
  {
    lvl: 1,
    make: (r) => {
      const m = r.pick([60, 80, 1000]);
      const v = r.pick([5, 10, 20]);
      return {
        sit: `Un cuerpo de ${m} kg se mueve a ${v} m/s por un camino horizontal.`,
        extra: "Viaja hacia el norte.",
        pide: "su energía cinética",
        ok: "$E_c = ½·m·v^2$",
        why: "La energía cinética depende de la masa y del CUADRADO de la rapidez.",
        hint: "¿Qué energía tiene un cuerpo por estar moviéndose?",
        bad: [
          ["$E_c = m·v$", "formula", "m·v es la cantidad de movimiento (kg·m/s), no una energía (J)."],
          ["$E_c = ½·m·v$", "potencias", "Falta el cuadrado: la energía cinética crece con v²."],
          ["$E_p = m·g·h$", "conceptual", "El camino es horizontal: no cambia de altura. Piden la energía por el movimiento."],
        ],
      };
    },
  },
  {
    lvl: 2,
    make: (r) => {
      const h = r.pick([5, 10, 20]);
      return {
        sit: `Un trineo parte del reposo desde lo alto de una colina de ${h} m de altura y baja por una ladera curva SIN rozamiento.`,
        extra: `El trineo con su ocupante tiene ${r.pick([50, 70, 90])} kg.`,
        pide: "la rapidez al llegar abajo",
        ok: "Conservación: $m·g·h = ½·m·v^2$",
        why: "Sin rozamiento la energía mecánica se conserva, y no importa la forma de la ladera: solo la altura.",
        hint: "¿Es constante la aceleración en una ladera CURVA? ¿Hay rozamiento?",
        bad: [
          ["$v = v_0 + a·t$", "velocidad-aceleracion", "En una ladera curva la aceleración no es constante (y no tenés t): las ecuaciones de MRUV no sirven."],
          ["$F = m·a$ con $a = g·sen θ$", "conceptual", "La pendiente cambia a lo largo de la colina: no hay un único θ."],
          ["$W_{roz} = ΔE_m$", "conceptual", "No hay rozamiento: la energía mecánica se conserva (W_roz = 0)."],
        ],
      };
    },
  },
  {
    lvl: 3,
    make: (r) => {
      const W = r.pick([1200, 3000, 4500]);
      const t = r.pick([10, 15, 30]);
      return {
        sit: `Un motor realiza un trabajo de ${W} J en ${t} s.`,
        extra: "El motor eleva una caja de 20 kg.",
        pide: "la potencia media del motor",
        ok: "$P = W/Δt$",
        why: "La potencia es el trabajo realizado por unidad de tiempo.",
        hint: "¿Qué magnitud mide «qué tan rápido» se hace un trabajo?",
        bad: [
          ["$P = W·Δt$", "despeje", "Al revés: potencia es trabajo DIVIDIDO tiempo (J/s = W)."],
          ["$P = F/Δt$", "unidades", "Fuerza sobre tiempo no da watts. Es trabajo (energía) sobre tiempo."],
          ["$E_p = m·g·h$", "formula", "Eso daría una energía, no una potencia (y no tenés la altura)."],
        ],
      };
    },
  },
  {
    lvl: 3,
    make: (r) => {
      const v0 = r.pick([8, 10, 12]);
      const mu = r.pick([0.2, 0.3, 0.4]);
      return {
        sit: `Un disco de hockey se desliza a ${v0} m/s sobre una superficie horizontal con rozamiento dinámico ${n(mu)} hasta detenerse.`,
        extra: "El disco tiene 170 g.",
        pide: "la distancia que recorre",
        ok: "$W_{roz} = ΔE_c$: $−μ_d·m·g·d = 0 − ½·m·v_0^2$",
        why: "Hay rozamiento: la energía mecánica NO se conserva, y su variación es el trabajo del rozamiento.",
        hint: "¿Se conserva la energía mecánica cuando hay rozamiento?",
        bad: [
          ["$½·m·v_0^2 = ½·m·v^2$ (Em se conserva)", "conceptual", "Hay rozamiento: la energía mecánica disminuye (se disipa en calor)."],
          ["$m·g·h = ½·m·v^2$", "conceptual", "La superficie es horizontal: no cambia de altura."],
          ["$Δx = v_0·t$", "velocidad-aceleracion", "El disco va frenando (no es MRU) y además no tenés el tiempo."],
        ],
      };
    },
  },
  {
    lvl: 4,
    make: (r) => {
      const k = r.pick([200, 400, 800]);
      const x = r.pick([10, 15, 20]);
      return {
        sit: `Un resorte de constante ${k} N/m comprimido ${x} cm lanza un bloque sobre un piso horizontal liso.`,
        extra: "El resorte mide 40 cm sin deformar.",
        pide: "la rapidez del bloque al separarse del resorte (conocida su masa)",
        ok: "$½·k·Δx^2 = ½·m·v^2$",
        why: "Sin rozamiento, la energía elástica se transforma toda en cinética.",
        hint: "¿La fuerza del resorte es constante mientras se descomprime?",
        bad: [
          ["$k·Δx = m·a$ y $v = a·t$", "velocidad-aceleracion", "La fuerza del resorte cambia con la deformación: la aceleración NO es constante, así que no vale MRUV."],
          ["$½·k·Δx = ½·m·v^2$", "potencias", "La energía elástica es ½·k·Δx² (con el cuadrado)."],
          ["$m·g·h = ½·m·v^2$", "conceptual", "No hay cambio de altura: la energía viene del resorte."],
        ],
      };
    },
  },
  {
    lvl: 4,
    make: (r) => {
      const m = r.pick([2, 4, 5]);
      const h = r.pick([3, 6, 10]);
      return {
        sit: `Un objeto de ${m} kg BAJA ${h} m (por el camino que sea).`,
        extra: `El recorrido total fue de ${h + 5} m.`,
        pide: "el trabajo realizado por el peso",
        ok: "$W_P = m·g·h$ (positivo)",
        why: "El peso es conservativo: su trabajo solo depende del desnivel. Al bajar, peso y desplazamiento vertical van en el mismo sentido: W > 0.",
        hint: "El trabajo del peso, ¿depende del camino? ¿Qué signo tiene al bajar?",
        bad: [
          ["$W_P = −m·g·h$", "signos", "El peso apunta hacia abajo y el objeto baja: fuerza y desplazamiento coinciden, el trabajo es POSITIVO."],
          ["$W_P = m·g·d$ con d el recorrido total", "conceptual", "Solo cuenta el desnivel vertical, no la longitud del camino."],
          ["$W_P = ½·m·v^2$", "conceptual", "Eso sería igual al trabajo del peso solo si partiera del reposo sin otras fuerzas; no es la definición."],
        ],
      };
    },
  },
  {
    lvl: 5,
    make: (r) => {
      const m = r.pick([800, 1000, 1200]);
      const vA = r.pick([20, 25]);
      const vB = r.pick([10, 15]);
      const dh = r.pick([8, 10, 15]);
      return {
        sit: `Un auto de ${m} kg baja por una ruta en pendiente: pasa de ${vA} m/s a ${vB} m/s mientras desciende ${dh} m, frenando.`,
        extra: "El tramo mide 300 m.",
        pide: "el trabajo de las fuerzas no conservativas (frenos y rozamiento)",
        ok: "$W_{nc} = ΔE_m = ½·m·(v_B^2 − v_A^2) + m·g·(h_B − h_A)$",
        why: "Hay frenado: la energía mecánica no se conserva, y su variación (cinética + potencial) es el trabajo no conservativo.",
        hint: "Cambian la rapidez Y la altura. ¿Qué energías cambian?",
        bad: [
          ["$W_{nc} = ½·m·(v_B^2 − v_A^2)$", "conceptual", "Olvidaste la variación de energía potencial: el auto también baja."],
          ["$½·m·v_A^2 + m·g·h_A = ½·m·v_B^2 + m·g·h_B$", "conceptual", "Eso supone que Em se conserva, pero hay frenos: se disipa energía."],
          ["$W = F·d$", "formula", "No conocés la fuerza de frenado; el planteo energético evita necesitarla."],
        ],
      };
    },
  },
  {
    lvl: 5,
    make: (r) => {
      const vA = r.pick([4, 6, 8]);
      const hA = r.pick([12, 15, 20]);
      const hB = r.pick([3, 5, 8]);
      return {
        sit: `Un carrito de montaña rusa pasa por el punto A (a ${hA} m del suelo) a ${vA} m/s y llega al punto B (a ${hB} m). Despreciá el rozamiento.`,
        extra: "El carrito con pasajeros tiene 400 kg.",
        pide: "la rapidez en B",
        ok: "$½·m·v_A^2 + m·g·h_A = ½·m·v_B^2 + m·g·h_B$",
        why: "Sin rozamiento, la energía mecánica se conserva: la suma de cinética y potencial es la misma en A y en B.",
        hint: "En A el carrito ya tiene velocidad y B no está en el suelo.",
        bad: [
          ["$m·g·h_A = ½·m·v_B^2$", "conceptual", "En A ya tenía velocidad (falta Ec_A) y B no está a altura cero (falta Ep_B)."],
          ["$v_B = v_A + g·t$", "velocidad-aceleracion", "En la montaña rusa la aceleración no es constante (ni es g): no vale MRUV."],
          ["$v_B^2 = v_A^2 + 2·g·h_A$", "conceptual", "El desnivel que importa es h_A − h_B, no h_A."],
        ],
      };
    },
  },
  {
    lvl: 6,
    make: (r) => {
      const th = r.pick([30, 37, 45]);
      const mu = r.pick([0.2, 0.25]);
      const d = r.pick([2, 3, 4]);
      return {
        sit: `Un bloque parte del reposo y baja ${d} m a lo largo de un plano inclinado ${th}° con rozamiento dinámico ${n(mu)}.`,
        extra: "El bloque es de madera.",
        pide: "su energía cinética al final del tramo (conocida su masa)",
        ok: "$E_{c,f} = m·g·d·sen θ − μ_d·m·g·cos θ·d$",
        why: "ΔEc = trabajo total: el peso aporta m·g·h (h = d·sen θ) y el rozamiento resta μd·N·d con N = m·g·cos θ.",
        hint: "Altura que baja: h = d·sen θ. Normal en el plano: m·g·cos θ.",
        bad: [
          ["$E_{c,f} = m·g·d·sen θ − μ_d·m·g·d$", "conceptual", "Usaste N = m·g. En el plano la normal es m·g·cos θ."],
          ["$E_{c,f} = m·g·d·sen θ$", "conceptual", "Así se conservaría la energía mecánica, pero hay rozamiento."],
          ["$E_{c,f} = m·g·d − μ_d·m·g·cos θ·d$", "trigonometria", "El desnivel no es d (que se mide sobre el plano) sino d·sen θ."],
        ],
      };
    },
  },
  {
    lvl: 6,
    make: (r) => {
      const P = r.pick([500, 750, 1500]);
      const m = r.pick([50, 100, 150]);
      return {
        sit: `Un montacargas de ${P} W de potencia útil eleva a velocidad constante una carga de ${m} kg.`,
        extra: "El montacargas funciona con 220 V.",
        pide: "la rapidez con que sube la carga",
        ok: "$P = F·v$ con $F = m·g$",
        why: "A velocidad constante la fuerza del motor iguala al peso, y la potencia es fuerza por velocidad (P = W/t = F·d/t).",
        hint: "¿Cuánto vale la fuerza que hace el motor si la carga sube a velocidad constante? ¿Cómo se relaciona potencia con velocidad?",
        bad: [
          ["$P = m·g·h$", "unidades", "m·g·h es una energía (J), no una potencia (W)."],
          ["$P = F·v$ con $F = m·a$", "conceptual", "A velocidad constante a = 0: la fuerza del motor no es m·a sino la que equilibra el peso."],
          ["$P = ½·m·v^2$", "conceptual", "Eso es la energía cinética (que ni siquiera cambia): no es la potencia."],
        ],
      };
    },
  },
];

export const fisQueUsariasEnergia = quGenerator("fis-que-usarias-energia", "t-energia", "¿Qué usarías? Elegir el planteo de trabajo y energía", QU_ENE);

// ───────────── Hidrostática ─────────────

const QU_HID: QUEntry[] = [
  {
    lvl: 1,
    make: (r) => {
      const h = r.pick([2, 5, 10]);
      return {
        sit: `Un buzo está a ${h} m de profundidad en un lago (agua dulce, δ = 1000 kg/m³).`,
        extra: "El buzo tiene 80 kg con su equipo.",
        pide: "la presión que ejerce el agua sobre él (sin contar la atmosférica)",
        ok: "$p = δ·g·h$",
        why: "La presión de un líquido en reposo crece con la profundidad: densidad del líquido por g por h.",
        hint: "En un líquido, ¿de qué depende la presión?",
        bad: [
          ["$p = F/S$", "formula", "Es la definición de presión, pero no tenés ni la fuerza ni el área. Para un líquido conviene p = δ·g·h."],
          ["$E = V·δ·g$", "conceptual", "Eso es el EMPUJE (una fuerza en N), no una presión."],
          ["$p = δ·h$", "unidades", "Falta g: δ·h da kg/m², que no es presión."],
        ],
      };
    },
  },
  {
    lvl: 1,
    make: (r) => {
      const F = r.pick([200, 500, 800]);
      const S = r.pick([0.02, 0.05, 0.1]);
      return {
        sit: `Una caja apoyada en el piso ejerce una fuerza de ${F} N sobre una superficie de ${n(S)} m².`,
        extra: "La caja es de madera.",
        pide: "la presión sobre el piso",
        ok: "$p = F/S$",
        why: "La presión es la fuerza perpendicular repartida por unidad de área.",
        hint: "¿Cómo se define la presión?",
        bad: [
          ["$p = F·S$", "despeje", "Al revés: la presión es fuerza DIVIDIDA área (N/m² = Pa)."],
          ["$p = δ·g·h$", "conceptual", "Esa vale para líquidos en reposo; acá es un sólido apoyado."],
          ["$p = S/F$", "despeje", "Dividiste al revés: más fuerza tiene que dar más presión."],
        ],
      };
    },
  },
  {
    lvl: 2,
    make: (r) => {
      const V = r.pick([2, 5, 8]);
      return {
        sit: `Un cuerpo de ${V} L está totalmente sumergido en agua (δ = 1000 kg/m³), colgado de un hilo.`,
        extra: `Está a ${r.pick([1, 2, 3])} m de profundidad y su densidad es 3,0 g/cm³.`,
        pide: "el empuje que recibe",
        ok: "$E = V_{cs}·δ_L·g$",
        why: "Arquímedes: el empuje es el peso del líquido desalojado, con el volumen sumergido y la densidad del LÍQUIDO.",
        hint: "¿De qué densidad depende el empuje: la del cuerpo o la del líquido?",
        bad: [
          ["$E = V·δ_{cuerpo}·g$", "conceptual", "Eso es el PESO del cuerpo. El empuje usa la densidad del LÍQUIDO desalojado."],
          ["$E = m·g$", "conceptual", "E = P solo cuando el cuerpo flota en equilibrio. Este cuelga de un hilo."],
          ["$p = δ·g·h$", "conceptual", "Esa da una presión. Y totalmente sumergido, el empuje no depende de la profundidad."],
        ],
      };
    },
  },
  {
    lvl: 3,
    make: (r) => {
      const d1 = r.pick([2, 3, 4]);
      const d2 = r.pick([20, 30, 40]);
      return {
        sit: `En una prensa hidráulica los pistones tienen ${d1} cm y ${d2} cm de DIÁMETRO. Sobre el grande hay un auto.`,
        extra: "El líquido es aceite de densidad 0,9 g/cm³.",
        pide: "la fuerza que hay que hacer en el pistón chico para sostener el auto",
        ok: "$\\frac{F_1}{S_1} = \\frac{F_2}{S_2}$ con $S = π·(d/2)^2$",
        why: "Pascal: la presión se transmite igual a todo el líquido. Las fuerzas son proporcionales a las ÁREAS.",
        hint: "¿Qué se transmite igual a todo el líquido: la fuerza o la presión?",
        bad: [
          ["$\\frac{F_1}{d_1} = \\frac{F_2}{d_2}$", "conceptual", "La presión se reparte por ÁREA, que va con el diámetro al cuadrado, no con el diámetro."],
          ["$F_1 = F_2$", "conceptual", "Lo que se iguala es la presión, no la fuerza: justamente por eso la prensa multiplica la fuerza."],
          ["$p = δ·g·h$", "formula", "No hay desnivel entre pistones en el enunciado: la clave es el principio de Pascal."],
        ],
      };
    },
  },
  {
    lvl: 3,
    make: (r) => {
      const dc = r.pick([0.6, 0.7, 0.8]);
      return {
        sit: `Un cubo de madera de densidad ${n(dc)} g/cm³ flota en agua.`,
        extra: "El cubo tiene 10 cm de arista.",
        pide: "qué fracción de su volumen está sumergida",
        ok: "$E = P$ → $\\frac{V_{sum}}{V} = \\frac{δ_c}{δ_L}$",
        why: "Si flota en equilibrio, empuje = peso: V_sum·δL·g = V·δc·g.",
        hint: "Si flota quieto, ¿cómo son el empuje y el peso?",
        bad: [
          ["$E = V_{total}·δ_L·g$", "conceptual", "Solo la parte sumergida desaloja líquido: el empuje usa V sumergido."],
          ["$\\frac{V_{emerg}}{V} = \\frac{δ_c}{δ_L}$", "interpretacion", "δc/δL es la fracción SUMERGIDA, no la que asoma."],
          ["$p = δ·g·h$", "formula", "Esa da una presión; la flotación sale del equilibrio de fuerzas."],
        ],
      };
    },
  },
  {
    lvl: 4,
    make: (r) => {
      const m = r.pick([10, 15, 20]);
      const V = r.pick([4, 5, 6]);
      return {
        sit: `Un bloque macizo de ${m} kg y ${V} L está apoyado en el fondo de una pileta llena de agua.`,
        extra: "La pileta tiene 2 m de profundidad.",
        pide: "la fuerza que le hace el fondo (la normal)",
        ok: "$N + E − P = 0$ → $N = P − E$",
        why: "Está en equilibrio con tres fuerzas: peso hacia abajo, empuje y normal hacia arriba.",
        hint: "Hacé el DCL: ¿qué fuerzas lo sostienen?",
        bad: [
          ["$N = P$", "conceptual", "Olvidaste el empuje: el agua sostiene parte del peso."],
          ["$N = P + E$", "signos", "El empuje apunta hacia ARRIBA: ayuda a sostener, se resta."],
          ["$N = E$", "conceptual", "El empuje y la normal sostienen juntos el peso; no son iguales entre sí."],
        ],
      };
    },
  },
  {
    lvl: 4,
    make: (r) => {
      const h1 = r.pick([1, 2, 3]);
      const h2 = h1 + r.pick([2, 4, 5]);
      return {
        sit: `En un tanque con agua se miden dos puntos a ${h1} m y a ${h2} m de profundidad.`,
        extra: "La presión atmosférica es 101,3 kPa.",
        pide: "la diferencia de presión entre esos dos puntos",
        ok: "$Δp = δ·g·Δh$",
        why: "La diferencia de presión depende solo del desnivel: la atmosférica actúa sobre los dos y se cancela.",
        hint: "La presión atmosférica, ¿afecta la DIFERENCIA?",
        bad: [
          ["$Δp = p_{atm} + δ·g·Δh$", "conceptual", "La atmosférica se suma en los dos puntos: en la diferencia se cancela."],
          ["$Δp = δ·g·(h_1 + h_2)$", "signos", "Es una diferencia: va el desnivel h₂ − h₁."],
          ["$Δp = F/S$", "formula", "No tenés fuerza ni área: en un líquido conviene el teorema fundamental."],
        ],
      };
    },
  },
  {
    lvl: 5,
    make: (r) => {
      const h = r.pick([3, 5, 8]);
      return {
        sit: `Se quiere la presión ABSOLUTA en el fondo de un tanque abierto de ${h} m de agua (δ = 1000 kg/m³, $p_{atm}$ = 101,3 kPa).`,
        extra: "El tanque tiene 2 m de diámetro.",
        pide: "la presión absoluta en el fondo",
        ok: "$p = p_{atm} + δ·g·h$",
        why: "Absoluta = atmosférica (que actúa sobre la superficie libre) + la que agrega la columna de líquido.",
        hint: "Absoluta vs manométrica: ¿cuál incluye la atmosférica?",
        bad: [
          ["$p = δ·g·h$", "conceptual", "Esa es la presión manométrica (relativa). Piden la absoluta: falta sumar p_atm."],
          ["$p = \\frac{δ·g·h}{π·r^2}$", "conceptual", "La presión en un líquido no depende del área del recipiente."],
          ["$p = p_{atm} − δ·g·h$", "signos", "Al bajar, la presión AUMENTA: se suma."],
        ],
      };
    },
  },
  {
    lvl: 5,
    make: (r) => {
      const P = r.pick([30, 45, 60]);
      return {
        sit: `Una pieza metálica que pesa ${P} N en el aire se cuelga de un dinamómetro y se sumerge totalmente en agua.`,
        extra: "Se sumerge a 50 cm de profundidad.",
        pide: "lo que marca el dinamómetro (conocido el volumen de la pieza)",
        ok: "$T = P − E$ con $E = V·δ_{agua}·g$",
        why: "La pieza está en equilibrio: tensión del dinamómetro + empuje = peso.",
        hint: "Mientras está sumergida, ¿quiénes la sostienen?",
        bad: [
          ["$T = P$", "conceptual", "Sumergida recibe empuje: el dinamómetro marca MENOS que en el aire."],
          ["$T = P + E$", "signos", "El empuje es hacia arriba: alivia al dinamómetro, se resta."],
          ["$T = E$", "conceptual", "El empuje solo es una parte; la tensión es lo que falta para equilibrar el peso."],
        ],
      };
    },
  },
  {
    lvl: 6,
    make: (r) => {
      const P = r.pick([20, 30, 40]);
      const Pa = P - r.pick([4, 5, 8]);
      return {
        sit: `Una piedra pesa ${P} N en el aire y ${Pa} N totalmente sumergida en agua.`,
        extra: "Se la sumerge en un balde de 10 L.",
        pide: "el volumen de la piedra",
        ok: "$E = P − P_{ap}$ y $V = \\frac{E}{δ_L·g}$",
        why: "La diferencia entre peso y peso aparente es el empuje; y el empuje da el volumen sumergido (todo el de la piedra).",
        hint: "¿Qué fuerza explica que «pese» menos en el agua?",
        bad: [
          ["$V = \\frac{P}{δ_L·g}$", "conceptual", "Con el peso real no: esa sería la masa de agua de igual PESO, no de igual volumen. Usá el empuje."],
          ["$V = \\frac{P_{ap}}{δ_L·g}$", "conceptual", "El peso aparente no es el empuje: E = P − P_ap."],
          ["$V$ = 10 L", "interpretacion", "El volumen del balde es un dato que sobra: no es el de la piedra."],
        ],
      };
    },
  },
  {
    lvl: 6,
    make: (r) => {
      const dc = r.pick([0.6, 0.75, 0.9]);
      return {
        sit: `Un bloque de densidad ${n(dc)} g/cm³ se mantiene totalmente sumergido en agua atado con una cuerda al fondo.`,
        extra: "El fondo está a 3 m.",
        pide: "la tensión de la cuerda (conocido el volumen)",
        ok: "$T = E − P = V·g·(δ_L − δ_c)$",
        why: "Como es menos denso que el agua, el empuje supera al peso: la cuerda tira hacia abajo para sostenerlo sumergido.",
        hint: "¿Hacia dónde tira la cuerda si el bloque tiende a flotar?",
        bad: [
          ["$T = P − E$", "signos", "Así la tensión daría negativa: el bloque tiende a SUBIR, la cuerda tira hacia abajo y T = E − P."],
          ["$T = E$", "conceptual", "Olvidaste el peso del bloque."],
          ["$E = P$", "conceptual", "E = P vale si flota libremente; acá está atado y totalmente sumergido."],
        ],
      };
    },
  },
];

export const fisQueUsariasHidro = quGenerator("fis-que-usarias-hidro", "t-presion", "¿Qué usarías? Elegir la relación de hidrostática", QU_HID);

// ═════════════════════════════ Convenciones de signo ═════════════════════════════

type Dir = 1 | -1 | 0;

const SIGN_TXT: Record<string, string> = { "1": "Positivo", "-1": "Negativo", "0": "Cero" };
const PAIR = (v: number, a: number) => `$v ${v > 0 ? ">" : v < 0 ? "<" : "="} 0$ y $a ${a > 0 ? ">" : a < 0 ? "<" : "="} 0$`;

export const fisSignos: Generator = {
  id: "fis-signos",
  topicId: "t-fis-signos",
  description: "Convenciones de signo: g, v, a, desplazamiento y trabajo según el eje elegido",
  generate(seed, d) {
    const r = rng(seed);
    const explanation =
      "El signo de una componente dice hacia dónde apunta el vector RESPECTO del eje que elegiste. Si cambiás el eje, cambian todos los signos a la vez, pero la física (hacia dónde se mueve, si frena o acelera) no cambia. Frenar NO es «a negativa»: es que a y v tienen signos opuestos.";

    // Trabajo: no depende del eje (es un escalar).
    if (d === 6 && r.bool()) {
      const cases: { sit: string; sign: Dir; why: string }[] = [
        { sit: "el trabajo de la fuerza de rozamiento sobre un bloque que desliza hacia la izquierda por un piso horizontal", sign: -1, why: "El rozamiento dinámico se opone al desplazamiento: α = 180°, cos α = −1." },
        { sit: "el trabajo de la fuerza de rozamiento sobre un bloque que sube deslizando por un plano inclinado", sign: -1, why: "El rozamiento apunta hacia abajo del plano y el bloque sube: forman 180°." },
        { sit: "el trabajo del peso sobre una pelota mientras SUBE", sign: -1, why: "El peso apunta hacia abajo y la pelota sube: forman 180°." },
        { sit: "el trabajo del peso sobre una pelota mientras BAJA", sign: 1, why: "El peso apunta hacia abajo y la pelota baja: forman 0°." },
        { sit: "el trabajo de la normal sobre un bloque que desliza por un piso horizontal", sign: 0, why: "La normal es perpendicular al desplazamiento: α = 90°, cos α = 0." },
      ];
      const c = r.pick(cases);
      const axis = r.pick(["hacia la derecha", "hacia la izquierda", "hacia arriba", "hacia abajo"]);
      const opts: Option[] = ([1, -1, 0] as Dir[]).map((s) =>
        s === c.sign
          ? ok(SIGN_TXT[String(s)])
          : bad([SIGN_TXT[String(s)], "signos", s === 0 ? "Solo es cero si la fuerza es perpendicular al desplazamiento (o no hay desplazamiento). " + c.why : `Mirá el ángulo entre la fuerza y el desplazamiento: ${c.why}`]),
      );
      opts.push(bad(["Depende del sistema de referencia elegido", "conceptual", "El trabajo es un ESCALAR: W = F·d·cos α depende del ángulo entre fuerza y desplazamiento, no del eje que elegiste."]));
      return choice(r, cb(this.id, seed, d, this.topicId,
        `Elegiste el eje positivo ${axis}. ¿Qué signo tiene ${c.sit}?`,
        ["¿El trabajo es un vector o un escalar?", "W = F·d·cos α, con α el ángulo entre la fuerza y el desplazamiento.", "cos 0° = 1, cos 90° = 0, cos 180° = −1."],
        ["W = F·d·cos α", c.why, `Signo: ${SIGN_TXT[String(c.sign)].toLowerCase()} (sin importar el eje).`],
        "A diferencia de v, a o Δx, el trabajo es un escalar: su signo sale del ángulo entre fuerza y desplazamiento y NO cambia si invertís el eje."), opts);
    }

    // Situación: vertical (pelota lanzada hacia arriba) u horizontal (auto).
    const vertical = d === 1 || d === 2 || d === 4 ? true : d === 3 ? false : r.bool();
    let axisUp: 1 | -1; // +1 si el eje positivo apunta hacia arriba/derecha
    if (d === 1) axisUp = 1;
    else if (d === 2) axisUp = -1;
    else axisUp = r.pick([1, -1] as const);
    const axisTxt = vertical ? (axisUp === 1 ? "hacia arriba" : "hacia abajo") : axisUp === 1 ? "hacia la derecha" : "hacia la izquierda";

    let sit: string;
    let vDir: Dir;
    let aDir: Dir;
    let dxDir: Dir | null = null;
    let dxTxt = "";
    if (vertical) {
      const phase = d <= 2 ? r.pick(["sube", "baja"] as const) : r.pick(["sube", "baja", "arriba"] as const);
      vDir = phase === "sube" ? 1 : phase === "baja" ? -1 : 0;
      aDir = -1;
      sit = phase === "sube" ? "Una pelota se lanza hacia arriba y está SUBIENDO." : phase === "baja" ? "Una pelota se lanzó hacia arriba y ahora está BAJANDO." : "Una pelota se lanzó hacia arriba y está justo en el PUNTO MÁS ALTO.";
      const below = r.bool();
      dxDir = below ? -1 : 1;
      dxTxt = below ? "el desplazamiento desde el punto de lanzamiento hasta que cae al fondo de un pozo, por DEBAJO de donde se lanzó" : "el desplazamiento desde el punto de lanzamiento hasta el punto más alto";
    } else {
      const mov = r.pick([1, -1] as const);
      const frena = r.bool();
      vDir = mov;
      aDir = frena ? (-mov as Dir) : mov;
      dxDir = mov;
      sit = `Un auto se mueve hacia la ${mov === 1 ? "derecha" : "izquierda"} y está ${frena ? "FRENANDO" : "ACELERANDO (su rapidez aumenta)"}.`;
      dxTxt = "su desplazamiento en el último segundo";
    }
    const sv = (vDir * axisUp) as Dir;
    const sa = (aDir * axisUp) as Dir;
    const physV = vDir === 0 ? "es nula" : vertical ? (vDir === 1 ? "apunta hacia arriba" : "apunta hacia abajo") : vDir === 1 ? "apunta hacia la derecha" : "apunta hacia la izquierda";
    const physA = vertical ? "apunta hacia abajo (es g)" : aDir === 1 ? "apunta hacia la derecha" : "apunta hacia la izquierda";
    const why = `Con el eje positivo ${axisTxt}: la velocidad ${physV} y la aceleración ${physA}.`;
    const hints: [string, string, string] = [
      "Primero pensá hacia dónde APUNTA cada vector (arriba/abajo, derecha/izquierda), sin pensar en signos.",
      `Ahora compará con el eje: si apunta ${axisTxt}, es positivo; si apunta al revés, negativo.`,
      vertical ? "La aceleración de la gravedad SIEMPRE apunta hacia abajo, suba o baje la pelota (incluso arriba de todo)." : "Si frena, la aceleración apunta al revés que la velocidad; si acelera, en el mismo sentido.",
    ];

    // Par (v, a) en dificultad 5–6.
    if (d >= 5 && vDir !== 0) {
      const opts: Option[] = [];
      for (const v of [1, -1]) for (const a of [1, -1]) {
        const txt = PAIR(v, a);
        if (v === sv && a === sa) opts.push(ok(txt));
        else if (v !== sv && a !== sa) opts.push(bad([txt, "signos", `Los dos signos están invertidos: parece que usaste el eje al revés. ${why}`]));
        else if (v !== sv) opts.push(bad([txt, "signos", `El signo de v está mal. ${why}`]));
        else opts.push(bad([txt, "velocidad-aceleracion", `El signo de a está mal. «Frenar» no significa a < 0: significa que a y v tienen signos OPUESTOS. ${why}`]));
      }
      return choice(r, cb(this.id, seed, d, this.topicId,
        `${sit} Elegiste el eje positivo **${axisTxt}**. ¿Qué signos tienen la velocidad y la aceleración?`,
        hints,
        [`Velocidad: ${physV} → ${SIGN_TXT[String(sv)].toLowerCase()}.`, `Aceleración: ${physA} → ${SIGN_TXT[String(sa)].toLowerCase()}.`, sv * sa < 0 ? "Signos opuestos: la rapidez disminuye (frena)." : "Mismo signo: la rapidez aumenta."],
        explanation), opts);
    }

    // Una sola magnitud.
    type Q = "g" | "v" | "a" | "dx";
    const qs: Q[] = vertical ? (d <= 2 ? ["g", "v"] : ["g", "v", "dx"]) : ["v", "a", "dx"];
    const q = r.pick(qs);
    const correct: Dir = q === "dx" ? ((dxDir! * axisUp) as Dir) : q === "v" ? sv : sa;
    const name = q === "g" ? "la aceleración de la pelota (la de la gravedad)" : q === "a" ? "la aceleración" : q === "v" ? "la velocidad" : dxTxt;
    const physQ = q === "dx" ? (vertical ? (dxDir === 1 ? "apunta hacia arriba" : "apunta hacia abajo") : dxDir === 1 ? "apunta hacia la derecha" : "apunta hacia la izquierda") : q === "v" ? physV : physA;
    const opts: Option[] = ([1, -1, 0] as Dir[]).map((s) => {
      if (s === correct) return ok(SIGN_TXT[String(s)]);
      if (s === 0)
        return bad(["Cero", (q === "g" || q === "a") ? "velocidad-aceleracion" : "signos", q === "g" && vDir === 0
          ? "En el punto más alto v = 0, pero la aceleración sigue siendo g: si fuera cero, la pelota se quedaría quieta allá arriba."
          : `Solo sería cero si el vector fuera nulo. Acá ${physQ}.`]);
      if (correct === 0) return bad([SIGN_TXT[String(s)], "signos", "En el punto más alto la velocidad es nula (cambia de sentido justo ahí): no tiene signo."]);
      return bad([SIGN_TXT[String(s)], "signos", `Con el eje positivo ${axisTxt}, un vector que ${physQ} es ${correct === 1 ? "POSITIVO" : "NEGATIVO"}.${q === "g" ? " Ojo: g = 9,80 m/s² es un MÓDULO; la componente lleva el signo del eje." : ""}`]);
    });
    opts.push(bad(["Depende de la masa del cuerpo", "conceptual", "El signo no tiene nada que ver con la masa: depende solo de hacia dónde apunta el vector y de qué eje elegiste."]));
    return choice(r, cb(this.id, seed, d, this.topicId,
      `${sit} Elegiste el eje positivo **${axisTxt}**. ¿Qué signo tiene ${name}?`,
      hints,
      [`${name[0].toUpperCase()}${name.slice(1)}: ${physQ}.`, `Eje positivo ${axisTxt} → ${SIGN_TXT[String(correct)].toLowerCase()}.`, "Si eligieras el eje al revés, el signo se invertiría, pero el movimiento sería exactamente el mismo."],
      explanation), opts);
  },
};

// ═════════════════════════════ Conversiones rápidas ═════════════════════════════

interface Conv {
  lvl: number[];
  from: string;
  to: string;
  values: number[];
  f: (x: number) => number;
  how: string;
  errors: (x: number) => Err[];
}

const CONVS: Conv[] = [
  {
    lvl: [1, 3, 5], from: "km/h", to: "m/s", values: [36, 54, 72, 90, 108, 18, 126, 100, 60, 80, 120],
    f: (x) => x / 3.6, how: "1 km/h = 1000 m / 3600 s → se DIVIDE por 3,6.",
    errors: (x) => [[x * 3.6, "unidades", "Multiplicaste por 3,6: de km/h a m/s se DIVIDE (1 km/h = 1000 m / 3600 s ≈ 0,278 m/s)."], [x / 36, "unidades", "El factor es 3,6, no 36."], [x / 60, "unidades", "Dividiste solo por 60: una hora tiene 3600 s y un km 1000 m → ÷ 3,6."]],
  },
  {
    lvl: [2, 4], from: "m/s", to: "km/h", values: [5, 10, 15, 20, 25, 30, 12, 8],
    f: (x) => x * 3.6, how: "1 m/s = 3,6 km/h → se MULTIPLICA por 3,6.",
    errors: (x) => [[x / 3.6, "unidades", "Dividiste por 3,6: de m/s a km/h se MULTIPLICA (una rapidez en km/h es un número más grande)."], [x * 36, "unidades", "El factor es 3,6, no 36."]],
  },
  {
    lvl: [1, 3], from: "cm", to: "m", values: [25, 80, 150, 7, 4.5, 320],
    f: (x) => x / 100, how: "1 m = 100 cm → se divide por 100.",
    errors: (x) => [[x * 100, "unidades", "Multiplicaste: al pasar a una unidad más GRANDE el número tiene que achicarse (÷ 100)."], [x / 1000, "unidades", "1 m = 100 cm (no 1000): dividí por 100."]],
  },
  {
    lvl: [1, 2], from: "g", to: "kg", values: [500, 250, 200, 750, 80, 1500],
    f: (x) => x / 1000, how: "1 kg = 1000 g → se divide por 1000.",
    errors: (x) => [[x * 1000, "unidades", "Multiplicaste: el kilogramo es más grande que el gramo, el número tiene que achicarse (÷ 1000)."], [x / 100, "unidades", "1 kg = 1000 g (no 100)."]],
  },
  {
    lvl: [2, 3], from: "t", to: "kg", values: [2, 1.5, 12, 0.8, 25],
    f: (x) => x * 1000, how: "1 t = 1000 kg → se multiplica por 1000.",
    errors: (x) => [[x / 1000, "unidades", "Dividiste: la tonelada es más grande que el kilogramo, en kg el número crece (× 1000)."], [x * 100, "unidades", "1 t = 1000 kg (no 100)."]],
  },
  {
    lvl: [2, 3], from: "L", to: "m³", values: [5, 20, 250, 1.5, 600, 12],
    f: (x) => x / 1000, how: "1 m³ = 1000 L → se divide por 1000.",
    errors: (x) => [[x * 1000, "unidades", "Multiplicaste: el m³ es MIL veces más grande que el litro, el número se achica (÷ 1000)."], [x / 100, "unidades", "1 m³ = 1000 L (no 100)."]],
  },
  {
    lvl: [3, 5], from: "g/cm³", to: "kg/m³", values: [1, 0.8, 1.2, 2.7, 7.8, 13.6, 0.92],
    f: (x) => x * 1000, how: "1 g/cm³ = (10⁻³ kg)/(10⁻⁶ m³) = 1000 kg/m³ → se multiplica por 1000.",
    errors: (x) => [[x / 1000, "unidades", "Dividiste: 1 g/cm³ = 1000 kg/m³ (el agua: 1 g/cm³ = 1000 kg/m³). Se multiplica."], [x * 100, "unidades", "El factor es 1000: 10⁻³ kg / 10⁻⁶ m³ = 10³ kg/m³."], [x * 1e6, "unidades", "Convertiste solo el volumen (× 10⁶): también hay que pasar los gramos a kg (÷ 10³)."]],
  },
  {
    lvl: [4, 5], from: "cm²", to: "m²", values: [50, 200, 12, 7.5, 400, 30],
    f: (x) => x / 1e4, how: "1 m = 100 cm → 1 m² = (100 cm)² = 10⁴ cm²: se divide por 10 000.",
    errors: (x) => [[x / 100, "unidades", "Dividiste por 100, pero en un ÁREA el factor va al cuadrado: 1 m² = 100² cm² = 10⁴ cm²."], [x * 1e4, "unidades", "Multiplicaste: el m² es más grande, el número tiene que achicarse."]],
  },
  {
    lvl: [4], from: "mm", to: "m", values: [5, 12, 250, 3.5, 80],
    f: (x) => x / 1000, how: "1 m = 1000 mm → se divide por 1000.",
    errors: (x) => [[x / 100, "unidades", "1 m = 1000 mm (100 son los cm)."], [x * 1000, "unidades", "Multiplicaste en lugar de dividir."]],
  },
  {
    lvl: [4], from: "min", to: "s", values: [2, 5, 1.5, 12, 2.5],
    f: (x) => x * 60, how: "1 min = 60 s → se multiplica por 60.",
    errors: (x) => [[x * 100, "unidades", "Un minuto tiene 60 s, no 100: el tiempo no es decimal."], [x / 60, "unidades", "Dividiste: en segundos el número tiene que ser más grande."]],
  },
  {
    lvl: [5], from: "cm³", to: "m³", values: [500, 250, 1200, 80, 30],
    f: (x) => x / 1e6, how: "1 m³ = (100 cm)³ = 10⁶ cm³: se divide por 10⁶.",
    errors: (x) => [[x / 1000, "unidades", "Dividiste por 1000: eso da litros (dm³), no m³. En volumen el factor va al cubo: 100³ = 10⁶."], [x / 100, "unidades", "En volumen el factor va al CUBO: 1 m³ = 100³ cm³ = 10⁶ cm³."]],
  },
  {
    lvl: [5], from: "h", to: "s", values: [2, 1.5, 0.25, 3],
    f: (x) => x * 3600, how: "1 h = 60 min = 3600 s.",
    errors: (x) => [[x * 60, "unidades", "Eso da minutos: falta multiplicar por 60 otra vez (1 h = 3600 s)."], [x * 100, "unidades", "El tiempo no es decimal: 1 h = 3600 s."]],
  },
  {
    lvl: [6], from: "L/min", to: "m³/s", values: [12, 30, 90, 6, 150],
    f: (x) => x / 1000 / 60, how: "Dos conversiones: L → m³ (÷ 1000) y min → s (÷ 60, porque el tiempo está en el denominador).",
    errors: (x) => [[(x / 1000) * 60, "unidades", "El minuto está en el DENOMINADOR: pasar a segundos divide por 60 (en un segundo pasa menos agua que en un minuto)."], [x / 1000, "unidades", "Convertiste los litros pero te olvidaste de pasar los minutos a segundos (÷ 60)."], [x / 60, "unidades", "Pasaste los minutos, pero falta L → m³ (÷ 1000)."]],
  },
  {
    lvl: [6], from: "cm/s", to: "km/h", values: [50, 25, 80, 120, 15],
    f: (x) => (x / 100) * 3.6, how: "Primero cm/s → m/s (÷ 100) y después m/s → km/h (× 3,6).",
    errors: (x) => [[(x / 100) / 3.6, "unidades", "Para ir de m/s a km/h se MULTIPLICA por 3,6."], [x * 3.6, "unidades", "Faltó pasar los cm a m (÷ 100) antes de multiplicar por 3,6."]],
  },
  {
    lvl: [6], from: "kg/m³", to: "g/cm³", values: [1260, 800, 920, 2700, 13600],
    f: (x) => x / 1000, how: "Es la conversión inversa de g/cm³ → kg/m³: se divide por 1000.",
    errors: (x) => [[x * 1000, "unidades", "Multiplicaste: 1000 kg/m³ = 1 g/cm³, así que el número se achica."], [x / 1e6, "unidades", "Convertiste solo el volumen: 1 kg/m³ = 10³ g / 10⁶ cm³ = 10⁻³ g/cm³."]],
  },
];

export const fisKmh: Generator = {
  id: "fis-kmh",
  topicId: "t-unidades",
  description: "Conversiones rápidas: km/h↔m/s, g/cm³→kg/m³, L→m³, cm→m, t→kg, g→kg, cm²→m²…",
  generate(seed, d) {
    const r = rng(seed);
    const c = r.pick(CONVS.filter((x) => x.lvl.includes(d)));
    const x = r.pick(c.values);
    const ans = c.f(x);
    const small = Math.abs(ans) < 0.01;
    const ctx = c.from === "km/h" || c.from === "m/s" || c.from === "cm/s" ? "una rapidez" : c.from.includes("/cm³") || c.from.includes("/m³") ? "una densidad" : c.from === "L/min" ? "un caudal" : "el dato";
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: c.to, answer: ans,
      prompt: `Convertí ${ctx}: **${n(x)} ${c.from}** = ¿? ${c.to}.${small ? " Podés escribirlo como 2,5·10^-4." : ""}`,
      hints: [
        "Preguntate: ¿la unidad nueva es más grande o más chica? Si es más grande, el número se achica.",
        c.how,
        `${n(x)} ${c.from} → aplicá el factor.`,
      ],
      solution: [c.how, `${n(x)} ${c.from} = ${s3(ans)} ${c.to}`],
      explanation: "Para convertir, multiplicá por un «uno» escrito como cociente de unidades equivalentes (p. ej. 1000 m / 1 km). Así el sentido (multiplicar o dividir) sale solo, porque las unidades se tienen que cancelar.",
      errors: c.errors(x),
    });
  },
};

// ═════════════════════════════ Análisis dimensional ═════════════════════════════

const EQUIV: { unit: string; ok: string; bad: Bad[] }[] = [
  { unit: "N (newton)", ok: "kg·m/s²", bad: [["kg·m/s", "unidades", "kg·m/s es la unidad de la cantidad de movimiento (m·v). Por F = m·a, el newton es kg·m/s²."], ["kg·m²/s²", "unidades", "Eso es el joule (N·m)."], ["kg/(m·s²)", "unidades", "Eso es el pascal (N/m²)."]] },
  { unit: "J (joule)", ok: "N·m", bad: [["N/m", "unidades", "N/m es la unidad de la constante de un resorte. El trabajo es fuerza POR distancia."], ["N·s", "unidades", "N·s es la unidad del impulso. W = F·d → N·m."], ["W·m", "unidades", "El joule es W·s (potencia por tiempo), no W·m."]] },
  { unit: "Pa (pascal)", ok: "N/m²", bad: [["N·m²", "unidades", "La presión es fuerza DIVIDIDA área."], ["N/m", "unidades", "Falta el cuadrado: se divide por un área (m²)."], ["N·m", "unidades", "Eso es el joule. p = F/S → N/m²."]] },
  { unit: "W (watt)", ok: "J/s", bad: [["J·s", "unidades", "La potencia es energía DIVIDIDA tiempo."], ["N/s", "unidades", "Potencia = trabajo/tiempo: J/s = N·m/s, no N/s."], ["N·m", "unidades", "Eso es el joule (energía); falta dividir por el tiempo."]] },
  { unit: "J (joule) en unidades básicas", ok: "kg·m²/s²", bad: [["kg·m/s²", "unidades", "Eso es el newton. J = N·m = kg·m²/s²."], ["kg·m²/s", "unidades", "Revisá el tiempo: N·m = (kg·m/s²)·m → s²."], ["kg·m/s", "unidades", "Eso es cantidad de movimiento."]] },
];

const EXPRS: { e: string; units: string; ans: string; der: string }[] = [
  { e: "m·g·h", units: "m en kg, g en m/s², h en m", ans: "J", der: "kg·(m/s²)·m = kg·m²/s² = J" },
  { e: "½·m·v^2", units: "m en kg, v en m/s", ans: "J", der: "kg·(m/s)² = kg·m²/s² = J" },
  { e: "δ·g·h", units: "δ en kg/m³, g en m/s², h en m", ans: "Pa", der: "(kg/m³)·(m/s²)·m = kg/(m·s²) = N/m² = Pa" },
  { e: "F·v", units: "F en N, v en m/s", ans: "W", der: "N·m/s = J/s = W" },
  { e: "μ·m·g", units: "μ sin unidades, m en kg, g en m/s²", ans: "N", der: "kg·m/s² = N" },
  { e: "\\frac{v^2}{2·g}", units: "v en m/s, g en m/s²", ans: "m", der: "(m²/s²)/(m/s²) = m" },
  { e: "\\sqrt{\\frac{2·h}{g}}", units: "h en m, g en m/s²", ans: "s", der: "√(m / (m/s²)) = √(s²) = s" },
  { e: "V·δ·g", units: "V en m³, δ en kg/m³, g en m/s²", ans: "N", der: "m³·(kg/m³)·(m/s²) = kg·m/s² = N" },
  { e: "k·Δx", units: "k en N/m, Δx en m", ans: "N", der: "(N/m)·m = N" },
  { e: "½·k·Δx^2", units: "k en N/m, Δx en m", ans: "J", der: "(N/m)·m² = N·m = J" },
  { e: "\\frac{F·d}{t}", units: "F en N, d en m, t en s", ans: "W", der: "N·m/s = J/s = W" },
  { e: "\\frac{v − v_0}{t}", units: "v en m/s, t en s", ans: "m/s²", der: "(m/s)/s = m/s²" },
];
const UNIT_POOL = ["J", "N", "Pa", "W", "m", "s", "m/s", "m/s²", "kg", "kg·m/s"];

const DIMCHECK: { e: string; okDim: boolean; why: string }[] = [
  { e: "v = v_0 + a·t^2", okDim: false, why: "a·t² tiene unidades de (m/s²)·s² = m, y se lo suma a una velocidad (m/s)." },
  { e: "x = v_0·t + ½·a·t^2", okDim: true, why: "Cada término es una longitud: (m/s)·s = m y (m/s²)·s² = m." },
  { e: "v^2 = v_0^2 + 2·a·t", okDim: false, why: "v² está en m²/s², pero a·t está en m/s." },
  { e: "p = δ·g·h", okDim: true, why: "(kg/m³)·(m/s²)·m = N/m² = Pa." },
  { e: "t = \\sqrt{2·h·g}", okDim: false, why: "√(m · m/s²) = m/s: da una velocidad, no un tiempo." },
  { e: "P = F·d·t", okDim: false, why: "F·d·t está en J·s; la potencia es J/s." },
  { e: "h = \\frac{v_0^2}{2·g}", okDim: true, why: "(m²/s²)/(m/s²) = m." },
  { e: "T = m·(g + a)", okDim: true, why: "g y a son aceleraciones (se pueden sumar) y kg·m/s² = N." },
  { e: "E = V·δ_L", okDim: false, why: "m³·kg/m³ = kg: es una masa, no una fuerza. Falta multiplicar por g." },
  { e: "F = m·v", okDim: false, why: "kg·m/s no es N (kg·m/s²): falta dividir por un tiempo." },
  { e: "a = \\frac{v^2}{2·Δx}", okDim: true, why: "(m²/s²)/m = m/s²." },
  { e: "E_c = ½·m·v", okDim: false, why: "kg·m/s no es energía: falta el cuadrado de la velocidad." },
];

export const fisDimensional: Generator = {
  id: "fis-dimensional",
  topicId: "t-unidades",
  description: "Análisis dimensional: equivalencias de N, J, Pa, W; unidades de expresiones; homogeneidad",
  generate(seed, d) {
    const r = rng(seed);
    const explanation = "Cada magnitud se reemplaza por su unidad y se simplifica como en álgebra. Una ecuación solo puede ser correcta si todos sus términos tienen las mismas unidades (homogeneidad): si no la cumple, seguro está mal; si la cumple, puede estar bien.";
    if (d <= 2) {
      const q = r.pick(d === 1 ? EQUIV.slice(0, 2) : EQUIV.slice(2));
      return choice(r, cb(this.id, seed, d, this.topicId,
        `¿A qué equivale 1 **${q.unit}**?`,
        ["Pensá en una fórmula que defina esa magnitud (F = m·a, W = F·d, p = F/S, P = W/t).", "Reemplazá cada magnitud de la fórmula por su unidad.", "Simplificá como si fueran letras."],
        [`${q.unit.split(" ")[0]} = ${q.ok}`],
        explanation), [ok(q.ok), ...q.bad.map(bad)]);
    }
    if (d <= 4) {
      const q = r.pick(EXPRS);
      const others = r.shuffle(UNIT_POOL.filter((u) => u !== q.ans)).slice(0, 3);
      return choice(r, cb(this.id, seed, d, this.topicId,
        `¿Qué unidad tiene la expresión $${q.e}$? (${q.units})`,
        ["Reemplazá cada símbolo por su unidad.", "Simplificá: las unidades se multiplican y dividen como letras.", "Reconocé el resultado: kg·m/s² = N, N·m = J, N/m² = Pa, J/s = W."],
        [q.der],
        explanation), [ok(q.ans), ...others.map((u) => bad([u, "unidades", `Reemplazá y simplificá: ${q.der}. Da ${q.ans}, no ${u}.`] as Bad))]);
    }
    if (d === 5) {
      const q = r.pick(DIMCHECK);
      const yes = "Sí: todos los términos tienen las mismas unidades";
      const no = "No: hay términos con unidades distintas";
      return choice(r, cb(this.id, seed, d, this.topicId,
        `¿Es dimensionalmente correcta la expresión $${q.e}$?`,
        ["Calculá las unidades de cada término por separado.", "Solo se pueden sumar (o igualar) cosas con las mismas unidades.", "Recordá: (m/s²)·s = m/s y (m/s²)·s² = m."],
        [q.why, q.okDim ? "Es homogénea." : "No es homogénea: seguro está mal."],
        explanation), [
        q.okDim ? ok(yes) : bad([yes, "unidades", `Revisá término por término: ${q.why}`]),
        q.okDim ? bad([no, "unidades", `Revisá de nuevo: ${q.why}`]) : ok(no),
        bad(["Sí, porque todas las magnitudes están en el SI", "conceptual", "Usar unidades del SI no garantiza nada: la homogeneidad depende de CÓMO se combinan las magnitudes."]),
        bad(["No se puede saber sin valores numéricos", "conceptual", "El análisis dimensional se hace solo con las unidades, sin números."]),
      ]);
    }
    const wrong = r.pick(DIMCHECK.filter((x) => !x.okDim));
    const rights = r.shuffle(DIMCHECK.filter((x) => x.okDim)).slice(0, 3);
    return choice(r, cb(this.id, seed, d, this.topicId,
      "¿Cuál de estas expresiones es dimensionalmente **INCORRECTA**?",
      ["Calculá las unidades de cada término de cada expresión.", "Buscá una suma o igualdad entre cosas con unidades distintas.", "Recordá: (m/s²)·s = m/s y (m/s²)·s² = m."],
      [wrong.why],
      explanation), [ok(`$${wrong.e}$`), ...rights.map((x) => bad([`$${x.e}$`, "unidades", `Esa es homogénea: ${x.why}`] as Bad))]);
  },
};

// ═════════════════════════════ Lectura de gráficos v(t) y x(t) ═════════════════════════════

/** Expresión de una poligonal que pasa por los puntos dados (suma de valores absolutos). */
function polyline(pts: [number, number][]): string {
  const slopes = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / (p[0] - pts[i][0]));
  const inner = pts.slice(1, -1).map((p, i) => [p[0], slopes[i + 1] - slopes[i]] as const);
  const B = slopes[0] + inner.reduce((s, [, dm]) => s + dm / 2, 0);
  const A = pts[0][1] - B * pts[0][0] - inner.reduce((s, [x, dm]) => s + (dm / 2) * Math.abs(pts[0][0] - x), 0);
  return [`${A}`, `${B}*x`, ...inner.map(([x, dm]) => `${dm / 2}*abs(x - ${x})`)].join(" + ");
}

/** Recta y = b + m·x con signos prolijos para el parser. */
const lineExpr = (b: number, m: number) => `${b} ${m < 0 ? "-" : "+"} ${Math.abs(m)}*x`;
const ptsTxt = (pts: [number, number][], u: string) => pts.map(([t, v]) => `(${n(t)} s; ${n(v)} ${u})`).join(", ");

function plotVisual(pts: [number, number][], expr?: string) {
  const ys = pts.map((p) => p[1]);
  const lo = Math.min(0, ...ys);
  const hi = Math.max(0, ...ys);
  const pad = Math.max(1, Math.round((hi - lo) * 0.15));
  return {
    type: "plot" as const,
    functions: [expr ?? polyline(pts)],
    xRange: [0, pts[pts.length - 1][0]] as [number, number],
    yRange: [lo - pad, hi + pad] as [number, number],
    points: pts,
  };
}

export const fisGraficoVtLectura: Generator = {
  id: "fis-grafico-vt-lectura",
  topicId: "t-graficos-vt",
  description: "Leer gráficos v(t) y x(t): acelera o frena, signo de v, cambio de sentido, pendiente y área (desplazamiento vs distancia)",
  generate(seed, d) {
    const r = rng(seed);
    const hintsVt: [string, string, string] = [
      "En un gráfico v–t: la ALTURA es la velocidad (con signo), la PENDIENTE es la aceleración y el ÁREA es el desplazamiento.",
      "La rapidez es |v|: si |v| crece acelera, si |v| decrece frena (mirá la distancia de la curva al eje t, no si sube o baja).",
      "Las áreas por debajo del eje t cuentan como desplazamiento NEGATIVO; para la distancia recorrida se suman en valor absoluto.",
    ];
    const explanation = "En v–t: altura = velocidad, pendiente = aceleración, área = desplazamiento (con signo). En x–t: pendiente = velocidad. Que la curva «baje» no significa que frene: frena cuando |v| disminuye, es decir, cuando v y a tienen signos opuestos.";

    // d1 / d4: ¿acelera o frena?
    if (d === 1 || (d === 4 && r.bool())) {
      let v0: number;
      let a: number;
      if (d === 1) {
        v0 = r.pick([2, 4, 10, 12]);
        a = v0 >= 10 ? -r.pick([1, 2]) : r.pick([1, 2]);
      } else {
        v0 = r.pick([-8, -6, 6, 8]);
        a = r.pick([1, -1]);
      }
      const T = 4;
      const pts: [number, number][] = [[0, v0], [T, v0 + a * T]];
      const speedsUp = Math.abs(v0 + a * T) > Math.abs(v0);
      const vs = v0 < 0;
      const opts: Option[] = [
        speedsUp ? ok("Acelera: su rapidez aumenta") : bad(["Acelera: su rapidez aumenta", "velocidad-aceleracion", "Mirá |v|: la curva se ACERCA al eje t, así que la rapidez disminuye."]),
        !speedsUp ? ok("Frena: su rapidez disminuye") : bad(["Frena: su rapidez disminuye", "velocidad-aceleracion", vs ? "La recta baja, pero la velocidad es NEGATIVA y se aleja del eje t: |v| crece, así que acelera (en sentido negativo)." : "La velocidad se aleja del eje t: |v| crece, acelera."]),
        bad(["Tiene velocidad constante", "velocidad-aceleracion", "Con velocidad constante el gráfico v–t sería una recta HORIZONTAL; esta tiene pendiente."]),
        bad(["Está detenido", "interpretacion", "Detenido sería v = 0 todo el tiempo (la recta sobre el eje t)."]),
      ];
      return choice(r, cb(this.id, seed, d, this.topicId,
        `El gráfico velocidad–tiempo de un móvil es una recta que une ${ptsTxt(pts, "m/s")}. Entre 0 y ${T} s, ¿qué hace el móvil?`,
        hintsVt,
        [`v pasa de ${n(v0)} m/s a ${n(v0 + a * T)} m/s.`, `|v| pasa de ${n(Math.abs(v0))} a ${n(Math.abs(v0 + a * T))} m/s: ${speedsUp ? "aumenta → acelera" : "disminuye → frena"}.`],
        explanation, plotVisual(pts, lineExpr(v0, a))), opts);
    }

    // d2: pendiente (a en v–t, v en x–t)
    if (d === 2) {
      if (r.bool()) {
        const v0 = r.pick([2, 4, 6, 10, 12]);
        const a = r.pick([-2, -1, 1, 1.5, 2, 3]);
        const T = r.pick([2, 4]);
        const pts: [number, number][] = [[0, v0], [T, v0 + a * T]];
        return num({
          gen: this.id, seed, d, topicId: this.topicId, unit: "m/s²", answer: a,
          prompt: `El gráfico v–t de un móvil es una recta que pasa por ${ptsTxt(pts, "m/s")}. ¿Cuál es su aceleración (con signo)?`,
          hints: ["En v–t la aceleración es la PENDIENTE.", "Pendiente = Δv/Δt = (v₂ − v₁)/(t₂ − t₁).", `a = (${n(v0 + a * T)} − ${n(v0)}) / ${T}.`],
          solution: [`a = Δv/Δt = (${n(v0 + a * T)} − ${n(v0)}) / (${T} − 0)`, `a = ${s3(a)} m/s²`],
          explanation,
          errors: [[(v0 + a * T) / T, "velocidad-aceleracion", "Dividiste la velocidad final por el tiempo: hay que usar la VARIACIÓN Δv = v₂ − v₁."], [-a, "signos", "Revisá el orden de la resta: Δv = v_final − v_inicial."], [(a * T) * T, "conceptual", "Multiplicaste Δv·Δt (eso es un área). La aceleración es el cociente Δv/Δt."]],
          visual: plotVisual(pts, lineExpr(v0, a)),
        });
      }
      const x0 = r.pick([0, 10, 20, 40]);
      const v = r.pick([-5, -4, -2, 2, 3, 5]);
      const T = r.pick([4, 5]);
      const x1 = x0 + v * T;
      const pts: [number, number][] = [[0, x0], [T, x1]];
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s", answer: v,
        prompt: `El gráfico POSICIÓN–tiempo de un móvil es una recta que pasa por ${ptsTxt(pts, "m")}. ¿Cuál es su velocidad (con signo)?`,
        hints: ["En un gráfico x–t, la velocidad es la PENDIENTE.", "v = Δx/Δt.", `v = (${n(x1)} − ${n(x0)}) / ${T}.`],
        solution: [`v = Δx/Δt = (${n(x1)} − ${n(x0)}) / ${T}`, `v = ${s3(v)} m/s`],
        explanation,
        errors: [[x1 / T, "conceptual", "Dividiste la posición final por el tiempo; la velocidad es Δx/Δt (variación de posición)."], [-v, "signos", "La posición " + (v < 0 ? "disminuye" : "aumenta") + ": el signo de v es el de Δx."]],
        visual: plotVisual(pts, lineExpr(x0, v)),
      });
    }

    // Recta que cruza el eje t (cambia de sentido).
    const k = r.pick([1, 2, 3, 4]);
    const tc = r.pick([2, 3, 4, 5]);
    const v0 = k * tc;
    const T = tc + r.pick([1, 2, 3].filter((x) => x !== tc));
    const vT = v0 - k * T;
    const pts: [number, number][] = [[0, v0], [tc, 0], [T, vT]];
    const visual = plotVisual(pts, lineExpr(v0, -k));
    const desc = `El gráfico v–t de un móvil es una recta que pasa por ${ptsTxt([[0, v0], [T, vT]], "m/s")}.`;

    if (d === 3) {
      if (r.bool()) {
        return num({
          gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: tc,
          prompt: `${desc} ¿En qué instante cambia de sentido?`,
          hints: ["Cambiar de sentido es pasar de v > 0 a v < 0.", "Buscá dónde la recta corta el eje t (v = 0).", `v(t) = ${v0} − ${k}·t = 0.`],
          solution: [`v(t) = ${v0} − ${k}·t`, `0 = ${v0} − ${k}·t → t = ${v0}/${k}`, `t = ${s3(tc)} s`],
          explanation,
          errors: [[T, "interpretacion", "Ese es el final del gráfico. El cambio de sentido es donde v = 0 (la recta corta el eje t)."], [v0 / (2 * k), "calculo", "Revisá el despeje: v = 0 cuando t = v₀/|a|."]],
          visual,
        });
      }
      const tq = r.pick([tc + 0.5, Math.max(0.5, tc - 1), T]);
      const sign: Dir = tq < tc ? 1 : -1;
      return choice(r, cb(this.id, seed, d, this.topicId,
        `${desc} ¿Qué signo tiene la velocidad en t = ${n(tq)} s?`,
        hintsVt,
        [`v(${n(tq)}) = ${v0} − ${k}·${n(tq)} = ${n(v0 - k * tq)} m/s`, sign === 1 ? "Positiva: se mueve en el sentido positivo." : "Negativa: ya cambió de sentido."],
        explanation, visual), [
        sign === 1 ? ok("Positivo") : bad(["Positivo", "signos", `En t = ${n(tq)} s la recta ya está por DEBAJO del eje t: la velocidad es negativa (el móvil se mueve en sentido contrario).`]),
        sign === -1 ? ok("Negativo") : bad(["Negativo", "velocidad-aceleracion", "La recta baja (a < 0), pero todavía está por ENCIMA del eje: la velocidad sigue siendo positiva. No confundas el signo de a con el de v."]),
        bad(["Cero", "interpretacion", `v = 0 solo en t = ${tc} s, donde la recta corta el eje.`]),
      ]);
    }

    if (d === 4) {
      // Área de un trapecio positivo entre t1 y t2 (antes del cruce).
      const t1 = r.pick([0, 1]);
      const t2 = Math.min(tc, t1 + r.pick([1, 2]));
      const va = v0 - k * t1;
      const vb = v0 - k * t2;
      const area = ((va + vb) / 2) * (t2 - t1);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: area,
        prompt: `${desc} ¿Cuánto se desplaza entre t = ${t1} s y t = ${t2} s?`,
        hints: hintsVt,
        solution: [`v(${t1}) = ${n(va)} m/s; v(${t2}) = ${n(vb)} m/s`, `Área (trapecio) = (${n(va)} + ${n(vb)})/2 · ${t2 - t1}`, `Δx = ${s3(area)} m`],
        explanation,
        errors: [[va * (t2 - t1), "conceptual", "Usaste un rectángulo con la velocidad inicial, pero la velocidad cambia: la figura es un trapecio."], [(va - vb) / (t2 - t1), "conceptual", "Calculaste la pendiente (aceleración); el desplazamiento es el ÁREA."]],
        visual,
      });
    }

    if (d === 5) {
      const disp = v0 * T - (k * T * T) / 2;
      const a1 = (v0 * tc) / 2;
      const a2 = (k * (T - tc) ** 2) / 2;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: disp,
        prompt: `${desc} ¿Cuál es su DESPLAZAMIENTO entre 0 y ${T} s (con signo)?`,
        hints: hintsVt,
        solution: [`Cruza el eje en t = ${tc} s.`, `Área positiva (0 a ${tc} s): ${n(v0)}·${tc}/2 = ${s3(a1)} m`, `Área negativa (${tc} a ${T} s): −${n(Math.abs(vT))}·${T - tc}/2 = −${s3(a2)} m`, `Δx = ${s3(a1)} − ${s3(a2)} = ${s3(disp)} m`],
        explanation,
        errors: [[a1 + a2, "interpretacion", "Sumaste las áreas en valor absoluto: eso es la DISTANCIA recorrida. El desplazamiento resta lo que retrocedió."], [a1, "conceptual", "Te faltó el tramo por debajo del eje: después de t = " + tc + " s el móvil retrocede."]],
        visual,
      });
    }

    // d6: poligonal (constante, frena, cruza y retrocede): distancia recorrida.
    const t1 = r.pick([2, 3, 4]);
    const s1 = r.pick([2, 3, 4]);
    const s2 = r.pick([1, 2, 3]);
    const vc = k * s1;
    const P: [number, number][] = [[0, vc], [t1, vc], [t1 + s1, 0], [t1 + s1 + s2, -k * s2]];
    const A1 = vc * t1;
    const A2 = (vc * s1) / 2;
    const A3 = (k * s2 * s2) / 2;
    const dist = A1 + A2 + A3;
    const disp = A1 + A2 - A3;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: dist,
      prompt: `El gráfico v–t de un móvil está formado por segmentos rectos que unen ${ptsTxt(P, "m/s")}. ¿Qué DISTANCIA total recorre entre 0 y ${n(P[3][0])} s?`,
      hints: hintsVt,
      solution: [
        `Tramo 1 (rectángulo): ${n(vc)}·${t1} = ${s3(A1)} m`,
        `Tramo 2 (triángulo, frena hasta 0): ${n(vc)}·${s1}/2 = ${s3(A2)} m`,
        `Tramo 3 (triángulo bajo el eje, retrocede): ${n(k * s2)}·${s2}/2 = ${s3(A3)} m`,
        `Distancia = ${s3(A1)} + ${s3(A2)} + ${s3(A3)} = ${s3(dist)} m`,
        `(El desplazamiento sería ${s3(disp)} m: resta el tramo de retroceso.)`,
      ],
      explanation,
      errors: [[disp, "interpretacion", "Ese es el DESPLAZAMIENTO (restaste el tramo de retroceso). La distancia recorrida suma todas las áreas en valor absoluto."], [A1 + A2, "conceptual", "Te faltó el último tramo: aunque esté debajo del eje, el móvil también recorre esa distancia (hacia atrás)."], [A1, "conceptual", "Solo tomaste el tramo de velocidad constante."]],
      visual: plotVisual(P),
    });
  },
};

// ═════════════════════════════ Variantes de MRUV ═════════════════════════════

export const fisMruvVariantes: Generator = {
  id: "fis-mruv-variantes",
  topicId: "t-mruv",
  description: "MRUV pensando qué falta: t, a, Δx o v₀; con km/h y datos que sobran",
  generate(seed, d) {
    const r = rng(seed);
    const sobra = d >= 3 ? r.pick([` La masa del vehículo es de ${r.pick([850, 1200, 1500])} kg.`, " Es un día nublado y hace 18 °C.", ` El conductor tiene ${r.pick([22, 35, 48])} años.`]) : "";
    const explanation = "En MRUV hay cuatro relaciones (v = v₀ + a·t; Δx = v₀·t + ½·a·t²; v² = v₀² + 2·a·Δx; Δx = (v₀ + v)/2·t). Cada una deja afuera una magnitud: elegí la que NO tiene la magnitud que no te dieron.";
    const mode = byD(d, [["t0"], ["t", "a2"], ["dx", "a2"], ["v0", "kmh"], ["kmh", "v0t"], ["tkmh", "v0t"]]);
    const m = r.pick(mode);

    if (m === "t0" || m === "t") {
      const a = r.pick([1.5, 2, 2.5, 3, 4]);
      const v0 = m === "t0" ? 0 : r.pick([3, 5, 8]);
      const t = r.pick([3, 4, 5, 6, 8]);
      const v = v0 + a * t;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: t,
        prompt: `Un auto ${v0 === 0 ? "parte del reposo" : `que va a ${n(v0)} m/s acelera`} con aceleración constante de ${n(a)} m/s² hasta llegar a ${n(v)} m/s. ¿Cuánto tiempo tarda?`,
        hints: ["No te piden distancia: buscá la relación entre v, v₀, a y t.", "v = v₀ + a·t.", "Despejá: t = (v − v₀)/a."],
        solution: [`v = v₀ + a·t`, `t = (${n(v)} − ${n(v0)}) / ${n(a)}`, `t = ${s3(t)} s`],
        explanation,
        errors: [[v / a, "despeje", "Te olvidaste de restar la velocidad inicial: t = (v − v₀)/a."], [(v - v0) * a, "despeje", "Multiplicaste: a = Δv/t, así que t = Δv/a."], [Math.sqrt((2 * v) / a), "formula", "No hace falta raíz: la relación entre v y t es lineal."]],
      });
    }
    if (m === "a2") {
      const t = r.pick([4, 5, 8, 10]);
      const a = r.pick([0.5, 1, 1.5, 2, 2.5]);
      const dx = sig3((a * t * t) / 2);
      const ans = (2 * dx) / (t * t);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s²", answer: ans,
        prompt: `Una moto parte del reposo y recorre ${n(dx)} m en ${t} s con aceleración constante.${sobra} ¿Cuál es su aceleración?`,
        hints: ["No tenés la rapidez final. ¿Qué ecuación vincula Δx, t y a?", "Δx = v₀·t + ½·a·t², con v₀ = 0.", "Despejá: a = 2·Δx / t²."],
        solution: [`Δx = ½·a·t² (v₀ = 0)`, `a = 2·${n(dx)} / ${t}²`, `a = ${s3(ans)} m/s²`],
        explanation,
        errors: [[dx / (t * t), "despeje", "Te olvidaste el 2: de Δx = ½·a·t² sale a = 2Δx/t²."], [(dx / t) / t, "velocidad-aceleracion", "Δx/t es la velocidad MEDIA, no la final: dividirla por t da la mitad de la aceleración."], [(2 * dx) / t, "potencias", "El tiempo va al CUADRADO: a = 2Δx/t²."]],
      });
    }
    if (m === "dx") {
      const v0 = r.pick([4, 6, 10]);
      const v = v0 + r.pick([4, 6, 8, 10]);
      const a = r.pick([1, 2, 2.5, 4]);
      const ans = (v * v - v0 * v0) / (2 * a);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: ans,
        prompt: `Un ciclista pasa de ${v0} m/s a ${v} m/s con una aceleración constante de ${n(a)} m/s².${sobra} ¿Qué distancia recorre mientras acelera?`,
        hints: ["No te dieron el tiempo.", "Usá v² = v₀² + 2·a·Δx.", `Δx = (${v}² − ${v0}²) / (2·${n(a)}).`],
        solution: [`v² = v₀² + 2·a·Δx`, `Δx = (${v * v} − ${v0 * v0}) / ${n(2 * a)}`, `Δx = ${s3(ans)} m`],
        explanation,
        errors: [[((v - v0) ** 2) / (2 * a), "potencias", "(v − v₀)² no es v² − v₀². Restá los cuadrados."], [(v * v - v0 * v0) / a, "despeje", "Te faltó el 2 del denominador."], [(v * v) / (2 * a), "conceptual", "Te olvidaste de la velocidad inicial: no parte del reposo."]],
      });
    }
    if (m === "v0") {
      const v = r.pick([0, 5, 10]);
      const a = -r.pick([2, 4, 5, 6]);
      const v0t = v + r.pick([10, 15, 20]);
      const dx = Math.round(((v0t * v0t - v * v) / (2 * -a)) * 10) / 10;
      const ans = Math.sqrt(v * v - 2 * a * dx);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s", answer: ans,
        prompt: `Un auto frena con desaceleración constante de ${n(-a)} m/s² a lo largo de ${n(dx)} m${v === 0 ? " hasta detenerse" : ` y queda a ${v} m/s`}.${sobra} ¿Con qué rapidez venía?`,
        hints: ["Te piden v₀ y no tenés el tiempo.", "v² = v₀² + 2·a·Δx con a NEGATIVA (frena).", "v₀ = √(v² − 2·a·Δx)."],
        solution: [`v² = v₀² + 2·a·Δx con a = −${n(-a)} m/s²`, `v₀² = ${n(v * v)} + 2·${n(-a)}·${n(dx)}`, `v₀ = ${s3(ans)} m/s`],
        explanation,
        errors: [[Math.sqrt(Math.max(0, v * v + 2 * a * dx)), "signos", "Si frena, la aceleración es opuesta a la velocidad: v₀² = v² + 2·|a|·Δx (la rapidez inicial es MAYOR que la final)."], [v * v - 2 * a * dx, "potencias", "Te faltó sacar la raíz: eso es v₀²."], [Math.sqrt(-a * dx), "despeje", "Te faltó el 2: v₀² = v² + 2·|a|·Δx."]],
      });
    }
    if (m === "kmh") {
      const V0 = r.pick([0, 18, 36]);
      const V = V0 + r.pick([36, 54, 72]);
      const t = r.pick([5, 8, 10]);
      const a = (V / 3.6 - V0 / 3.6) / t;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s²", answer: a,
        prompt: `Un auto pasa de ${V0} km/h a ${V} km/h en ${t} s con aceleración constante.${sobra} ¿Cuál es su aceleración, en m/s²?`,
        hints: ["Antes de calcular, pasá las rapideces a m/s.", "km/h → m/s: dividí por 3,6.", "a = (v − v₀)/t."],
        solution: [`v₀ = ${V0} km/h = ${s3(V0 / 3.6)} m/s; v = ${V} km/h = ${s3(V / 3.6)} m/s`, `a = (${s3(V / 3.6)} − ${s3(V0 / 3.6)}) / ${t}`, `a = ${s3(a)} m/s²`],
        explanation,
        errors: [[(V - V0) / t, "unidades", "No pasaste a m/s: km/h ÷ s no da m/s². Dividí las rapideces por 3,6 antes."], [((V - V0) * 3.6) / t, "unidades", "Multiplicaste por 3,6: de km/h a m/s se divide."], [V / 3.6 / t, "despeje", "Te olvidaste de restar v₀."]],
      });
    }
    if (m === "v0t") {
      const t = r.pick([4, 5, 6]);
      const a = r.pick([1, 2, 3]);
      const v0 = r.pick([2, 4, 5, 8]);
      const dx = v0 * t + (a * t * t) / 2;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s", answer: v0,
        prompt: `Un tren acelera a ${n(a)} m/s² y en ${t} s recorre ${n(dx)} m.${sobra} ¿Qué rapidez tenía al comenzar ese tramo?`,
        hints: ["Tenés Δx, t y a: la incógnita es v₀.", "Δx = v₀·t + ½·a·t².", "v₀ = (Δx − ½·a·t²)/t."],
        solution: [`Δx = v₀·t + ½·a·t²`, `${n(dx)} = v₀·${t} + ½·${n(a)}·${t}²`, `v₀ = (${n(dx)} − ${n((a * t * t) / 2)}) / ${t} = ${s3(v0)} m/s`],
        explanation,
        errors: [[dx / t, "velocidad-aceleracion", "Δx/t es la velocidad MEDIA del tramo, no la inicial (el tren acelera)."], [(dx - a * t * t) / t, "despeje", "Te olvidaste el ½ del término ½·a·t²."], [dx / t - a * t, "despeje", "Revisá el despeje: v₀ = Δx/t − ½·a·t."]],
      });
    }
    // tkmh: frena de V1 a V2 en D metros: ¿cuánto tarda?
    const V1 = r.pick([72, 90, 108]);
    const V2 = r.pick([18, 36, 54]);
    const D = r.pick([100, 150, 200, 250]);
    const ans = (2 * D) / (V1 / 3.6 + V2 / 3.6);
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: ans,
      prompt: `Un auto frena uniformemente de ${V1} km/h a ${V2} km/h en ${D} m.${sobra} ¿Cuánto tarda en hacerlo?`,
      hints: ["No tenés ni a ni t. ¿Hay una relación con v₀, v, Δx y t (sin a)?", "Δx = (v₀ + v)/2 · t, con las rapideces en m/s.", `t = 2·${D} / (v₀ + v).`],
      solution: [`v₀ = ${V1}/3,6 = ${s3(V1 / 3.6)} m/s; v = ${V2}/3,6 = ${s3(V2 / 3.6)} m/s`, `Δx = (v₀ + v)/2 · t → t = 2Δx/(v₀ + v)`, `t = ${2 * D} / ${s3(V1 / 3.6 + V2 / 3.6)} = ${s3(ans)} s`],
      explanation,
      errors: [[(2 * D) / (V1 + V2), "unidades", "Usaste las rapideces en km/h con la distancia en m. Pasalas a m/s (÷ 3,6)."], [D / (V1 / 3.6 + V2 / 3.6), "despeje", "Te olvidaste el 2: la velocidad media es (v₀ + v)/2."], [D / (V1 / 3.6), "velocidad-aceleracion", "Supusiste velocidad constante; el auto frena, usá la velocidad media."]],
    });
  },
};

function byD<T>(d: Difficulty, levels: [T, T, T, T, T, T]): T {
  return levels[d - 1];
}

// ═════════════════════════════ Problemas en dos etapas ═════════════════════════════

export const fisDosEtapas: Generator = {
  id: "fis-dos-etapas",
  topicId: "t-frenado",
  description: "Dos etapas encadenadas: reacción + frenado, acelera y sigue constante, cohete con motor y vuelo libre",
  generate(seed, d) {
    const r = rng(seed);
    const explanation = "En un problema de dos etapas, el FINAL de la primera es el INICIO de la segunda: la rapidez (y la posición) con que termina la etapa 1 son los datos iniciales de la etapa 2. Cada etapa tiene su propio modelo (MRU, MRUV, caída libre) y su propia aceleración.";
    const hints2: [string, string, string] = [
      "Separá el movimiento en dos etapas y dibujá un esquema con lo que pasa en cada una.",
      "Calculá primero cómo TERMINA la etapa 1 (rapidez y distancia).",
      "La rapidez final de la etapa 1 es la inicial de la etapa 2; ojo con qué aceleración vale en cada etapa.",
    ];
    const kind = byD(d, [["acel2"], ["acelTot"], ["reac"], ["reacKmh"], ["coheteH"], ["coheteT", "reacT"]]);
    const k = r.pick(kind);

    if (k === "acel2" || k === "acelTot") {
      const a = r.pick([1, 2, 2.5, 3]);
      const t1 = r.pick([4, 5, 6]);
      const t2 = r.pick([5, 10, 20]);
      const v1 = a * t1;
      const x1 = (a * t1 * t1) / 2;
      const x2 = v1 * t2;
      const ans = k === "acel2" ? x2 : x1 + x2;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: ans,
        prompt: `Un auto parte del reposo y acelera a ${n(a)} m/s² durante ${t1} s; después mantiene constante la rapidez alcanzada durante ${t2} s. ${k === "acel2" ? "¿Qué distancia recorre en la SEGUNDA etapa?" : "¿Qué distancia recorre en TOTAL?"}`,
        hints: hints2,
        solution: [
          `Etapa 1 (MRUV): v₁ = a·t₁ = ${n(a)}·${t1} = ${s3(v1)} m/s`,
          ...(k === "acelTot" ? [`Δx₁ = ½·a·t₁² = ½·${n(a)}·${t1}² = ${s3(x1)} m`] : []),
          `Etapa 2 (MRU): Δx₂ = v₁·t₂ = ${s3(v1)}·${t2} = ${s3(x2)} m`,
          ...(k === "acelTot" ? [`Total: ${s3(x1)} + ${s3(x2)} = ${s3(ans)} m`] : []),
        ],
        explanation,
        errors: [
          [(a * t2 * t2) / 2, "conceptual", "En la segunda etapa NO acelera: va a velocidad constante v₁ = a·t₁."],
          [(a * (t1 + t2) ** 2) / 2, "conceptual", "Supusiste que acelera todo el tiempo; en la segunda etapa la rapidez es constante."],
          [k === "acel2" ? x1 : x2, "interpretacion", k === "acel2" ? "Esa es la distancia de la PRIMERA etapa." : "Esa es solo la segunda etapa: falta sumar lo que recorrió mientras aceleraba."],
          [v1 * (t1 + t2), "conceptual", "Usaste la rapidez máxima también en la primera etapa, pero ahí arrancó desde 0."],
        ],
      });
    }
    if (k === "reac" || k === "reacKmh" || k === "reacT") {
      const kmh = k !== "reac";
      const V = kmh ? r.pick([54, 72, 90, 108]) : 0;
      const v0 = kmh ? V / 3.6 : r.pick([10, 15, 20, 25]);
      const tr = r.pick([0.5, 0.75, 1, 1.5]);
      const a = r.pick([4, 5, 6, 8]);
      const dr = v0 * tr;
      const df = (v0 * v0) / (2 * a);
      const vtxt = kmh ? `${V} km/h` : `${n(v0)} m/s`;
      if (k === "reacT") {
        const tt = tr + v0 / a;
        return num({
          gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: tt,
          prompt: `Un auto va a ${vtxt}. El conductor ve un perro, tarda ${n(tr)} s en reaccionar (sigue a la misma velocidad) y luego frena con desaceleración constante de ${a} m/s² hasta detenerse. ¿Cuánto tiempo pasa desde que ve al perro hasta que se detiene?`,
          hints: hints2,
          solution: [`v₀ = ${V} / 3,6 = ${s3(v0)} m/s`, `Etapa 1 (reacción, MRU): dura ${n(tr)} s`, `Etapa 2 (frenado): t_f = v₀/a = ${s3(v0)}/${a} = ${s3(v0 / a)} s`, `Total: ${n(tr)} + ${s3(v0 / a)} = ${s3(tt)} s`],
          explanation,
          errors: [[v0 / a, "conceptual", "Ese es solo el frenado: falta el tiempo de reacción, durante el cual el auto sigue a la misma velocidad."], [tr + V / a, "unidades", "Usaste la rapidez en km/h: pasala a m/s (÷ 3,6)."], [tr + (2 * v0) / a, "despeje", "El tiempo de frenado es v₀/a (de v = v₀ − a·t con v = 0)."]],
        });
      }
      const ans = dr + df;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: ans,
        prompt: `Un auto va a ${vtxt} cuando el conductor ve un semáforo en rojo. Tarda ${n(tr)} s en reaccionar (en ese lapso sigue a la misma velocidad) y después frena con desaceleración constante de ${a} m/s² hasta detenerse. ¿Qué distancia recorre desde que ve el semáforo hasta que se detiene?`,
        hints: hints2,
        solution: [
          ...(kmh ? [`v₀ = ${V} / 3,6 = ${s3(v0)} m/s`] : []),
          `Etapa 1 (reacción, MRU): d_r = v₀·t_r = ${s3(v0)}·${n(tr)} = ${s3(dr)} m`,
          `Etapa 2 (frenado, MRUV): 0 = v₀² − 2·a·d_f → d_f = v₀²/(2a) = ${s3(df)} m`,
          `Total: ${s3(dr)} + ${s3(df)} = ${s3(ans)} m`,
        ],
        explanation,
        errors: [
          [df, "conceptual", "Te faltó la distancia de reacción: durante ese tiempo el auto sigue a la misma velocidad."],
          [dr, "conceptual", "Esa es solo la reacción; falta la distancia de frenado."],
          [dr + (v0 * v0) / a, "despeje", "La distancia de frenado es v₀²/(2a): te faltó el 2."],
          ...(kmh ? [[V * tr + (V * V) / (2 * a), "unidades", "Usaste la rapidez en km/h con a en m/s²: pasá primero a m/s (÷ 3,6)."] as Err] : []),
        ],
      });
    }
    // Cohete: motor (a hacia arriba durante t1) y luego vuelo libre.
    const a = r.pick([4, 5, 6, 8, 10]);
    const t1 = r.pick([3, 4, 5, 6]);
    const v1 = a * t1;
    const h1 = (a * t1 * t1) / 2;
    const h2 = (v1 * v1) / (2 * G);
    const hmax = h1 + h2;
    if (k === "coheteH") {
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: hmax,
        prompt: `Un cohete de juguete parte del reposo desde el suelo y sube verticalmente con aceleración constante de ${a} m/s² mientras funciona su motor, durante ${t1} s. Entonces el motor se apaga. ¿Qué altura máxima alcanza (despreciá el rozamiento con el aire)?`,
        hints: hints2,
        solution: [
          `Etapa 1 (motor): h₁ = ½·a·t₁² = ${s3(h1)} m; v₁ = a·t₁ = ${s3(v1)} m/s`,
          `Etapa 2 (sin motor, solo g): sigue subiendo hasta v = 0: h₂ = v₁²/(2g) = ${s3(v1 * v1)}/(2·9,80) = ${s3(h2)} m`,
          `h_máx = h₁ + h₂ = ${s3(hmax)} m`,
        ],
        explanation,
        errors: [
          [h1, "conceptual", "Esa es la altura cuando se apaga el motor; pero el cohete sigue subiendo (tiene velocidad hacia arriba) hasta frenar por g."],
          [h2, "conceptual", "Te faltó la altura ganada mientras el motor funcionaba."],
          [h1 + (v1 * v1) / (2 * a), "velocidad-aceleracion", "Después de apagar el motor, la única aceleración es g (hacia abajo), no la del motor."],
        ],
      });
    }
    const tt = t1 + v1 / G;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: tt,
      prompt: `Un cohete parte del reposo desde el suelo y sube con aceleración constante de ${a} m/s² durante ${t1} s; en ese momento se apaga el motor. ¿Cuánto tiempo pasa desde el despegue hasta que alcanza la altura máxima?`,
      hints: hints2,
      solution: [`Etapa 1: v₁ = a·t₁ = ${s3(v1)} m/s`, `Etapa 2: 0 = v₁ − g·t₂ → t₂ = ${s3(v1)}/9,80 = ${s3(v1 / G)} s`, `Total: ${t1} + ${s3(v1 / G)} = ${s3(tt)} s`],
      explanation,
      errors: [[t1, "conceptual", "Cuando se apaga el motor el cohete todavía sube: sigue hasta que g lo frena."], [v1 / G, "conceptual", "Ese es solo el tiempo de la segunda etapa: falta sumar los segundos con el motor encendido."], [t1 + v1 / a, "velocidad-aceleracion", "Sin motor, el cohete frena con g = 9,80 m/s², no con la aceleración del motor."]],
    });
  },
};

// ═════════════════════════════ Diagrama de cuerpo libre ═════════════════════════════

interface DclCase {
  lvl: number;
  sit: string;
  ok: string;
  bad: Bad[];
  why: string;
  q?: string;
}

const DCL: DclCase[] = [
  {
    lvl: 1,
    sit: "Una lámpara cuelga en reposo del techo, sostenida por un cable vertical.",
    ok: "Peso (hacia abajo) y tensión del cable (hacia arriba)",
    why: "Solo dos cosas interactúan con la lámpara: la Tierra (peso) y el cable (tensión). Está en reposo: T = P.",
    bad: [
      ["Peso, tensión y normal del techo", "conceptual", "La normal aparece solo donde el cuerpo está APOYADO en una superficie. La lámpara cuelga: no toca el techo."],
      ["Solo el peso", "conceptual", "Si solo actuara el peso, la lámpara caería. El cable tira hacia arriba."],
      ["Peso, tensión y la fuerza de gravedad", "conceptual", "El peso ES la fuerza de gravedad: dibujarla dos veces es contar lo mismo dos veces."],
    ],
  },
  {
    lvl: 2,
    sit: "Se arrastra un cajón hacia la derecha con una soga horizontal sobre un piso con rozamiento; el cajón desliza.",
    ok: "Peso, normal, tensión hacia la derecha y rozamiento hacia la izquierda",
    why: "Tierra → peso; piso → normal y rozamiento (opuesto al deslizamiento); soga → tensión.",
    bad: [
      ["Peso, normal, tensión y rozamiento hacia la derecha", "signos", "El rozamiento dinámico se opone al deslizamiento: si el cajón va hacia la derecha, apunta hacia la izquierda."],
      ["Peso, tensión y rozamiento", "conceptual", "Olvidaste la normal: el piso empuja al cajón hacia arriba."],
      ["Peso, normal, tensión, rozamiento y la «fuerza del movimiento»", "conceptual", "No existe una «fuerza del movimiento»: toda fuerza la hace ALGO. Acá quien tira es la soga."],
    ],
  },
  {
    lvl: 2,
    sit: "Un bloque desliza hacia abajo por un plano inclinado LISO (sin rozamiento).",
    ok: "Peso y normal (perpendicular al plano)",
    why: "Sin rozamiento, el plano solo ejerce la normal. Lo que lo hace bajar es la componente del peso paralela al plano.",
    bad: [
      ["Peso, normal y rozamiento hacia arriba del plano", "conceptual", "El plano es liso: no hay rozamiento."],
      ["Peso, normal y una fuerza hacia abajo del plano que lo hace bajar", "conceptual", "Esa «fuerza que lo hace bajar» es la componente del peso P·sen θ. No es una fuerza aparte: dibujarla sería contarla dos veces."],
      ["Peso y normal vertical hacia arriba", "vectores", "La normal es perpendicular a la SUPERFICIE de contacto: en un plano inclinado, está inclinada."],
    ],
  },
  {
    lvl: 3,
    sit: "Un bloque baja deslizando por un plano inclinado CON rozamiento.",
    ok: "Peso, normal y rozamiento hacia arriba del plano",
    why: "El rozamiento se opone al deslizamiento: si baja, apunta hacia arriba del plano.",
    bad: [
      ["Peso, normal y rozamiento hacia abajo del plano", "signos", "El rozamiento se opone al movimiento relativo: si el bloque baja, el rozamiento apunta hacia ARRIBA del plano."],
      ["Peso, normal, rozamiento y la fuerza impulsora P·sen θ", "conceptual", "P·sen θ es una COMPONENTE del peso. Si la dibujás además del peso, lo contás dos veces."],
      ["Peso y rozamiento", "conceptual", "Olvidaste la normal: el plano empuja al bloque perpendicularmente."],
    ],
  },
  {
    lvl: 4,
    sit: "Se lanza un bloque hacia ARRIBA por un plano inclinado con rozamiento; ya se soltó y sigue subiendo.",
    ok: "Peso, normal y rozamiento hacia abajo del plano",
    why: "Una vez soltado, nada lo empuja: sube por inercia. El rozamiento se opone al deslizamiento (hacia abajo del plano).",
    bad: [
      ["Peso, normal, rozamiento hacia abajo y una fuerza hacia arriba del plano que lo hace subir", "conceptual", "No hay ninguna fuerza que lo empuje hacia arriba: ya se soltó. Sube por INERCIA (tiene velocidad), y va frenando."],
      ["Peso, normal y rozamiento hacia arriba del plano", "signos", "El rozamiento se opone al movimiento: si sube, apunta hacia abajo del plano."],
      ["Peso y normal", "conceptual", "Te olvidaste del rozamiento: el plano es rugoso."],
    ],
  },
  {
    lvl: 4,
    sit: "Una persona empuja un bloque hacia arriba de un plano inclinado rugoso con una fuerza F paralela al plano, y el bloque sube.",
    ok: "Peso, normal, F hacia arriba del plano y rozamiento hacia abajo del plano",
    why: "Acá sí hay alguien que empuja (F). El rozamiento se opone al deslizamiento: hacia abajo del plano.",
    bad: [
      ["Peso, normal, F y rozamiento hacia arriba del plano", "signos", "El bloque sube: el rozamiento apunta hacia abajo del plano."],
      ["Normal, F y rozamiento hacia abajo del plano", "conceptual", "Olvidaste el peso: la Tierra siempre lo atrae."],
      ["Peso, normal, F, rozamiento y P·sen θ", "conceptual", "P·sen θ es parte del peso: no se dibuja aparte."],
    ],
  },
  {
    lvl: 5,
    sit: "Un bloque está apoyado en el plano inclinado y desliza (con o sin rozamiento, da igual para esta pregunta).",
    q: "¿Cuánto vale el módulo de la normal?",
    ok: "N = P·cos θ",
    why: "Perpendicular al plano no hay movimiento: la normal equilibra a la componente perpendicular del peso, P·cos θ.",
    bad: [
      ["N = P", "conceptual", "N = P vale en un piso horizontal. En el plano, la normal solo equilibra la componente PERPENDICULAR del peso."],
      ["N = P·sen θ", "trigonometria", "P·sen θ es la componente PARALELA al plano. La perpendicular es P·cos θ (con θ la inclinación)."],
      ["N = P/cos θ", "trigonometria", "La normal es menor que el peso en un plano inclinado: N = P·cos θ."],
    ],
  },
  {
    lvl: 5,
    sit: "Un cubo de metal está apoyado en el fondo de un recipiente con agua, totalmente sumergido.",
    ok: "Peso (abajo), empuje (arriba) y normal del fondo (arriba)",
    why: "Tierra → peso; agua → empuje; fondo → normal. En equilibrio: N + E = P.",
    bad: [
      ["Peso y normal del fondo", "conceptual", "Olvidaste el empuje: el agua sostiene parte del peso, por eso la normal es menor que P."],
      ["Peso y empuje", "conceptual", "Si solo actuaran P y E (con P > E, porque se hunde), el cubo aceleraría hacia abajo. El fondo empuja con una normal."],
      ["Peso, empuje, normal y la fuerza del agua hacia abajo", "conceptual", "La resultante de todas las fuerzas del agua ES el empuje: no se agrega otra fuerza del líquido."],
    ],
  },
  {
    lvl: 6,
    sit: "Un bloque está QUIETO sobre un plano inclinado rugoso, sin que nadie lo toque.",
    ok: "Peso, normal y rozamiento estático hacia arriba del plano",
    why: "Sin rozamiento el bloque bajaría: el rozamiento estático apunta hacia arriba del plano y equilibra a P·sen θ.",
    bad: [
      ["Peso y normal (no hay rozamiento porque no se mueve)", "conceptual", "Sin movimiento puede haber rozamiento ESTÁTICO: es justamente lo que impide que deslice."],
      ["Peso, normal y rozamiento estático hacia abajo del plano", "signos", "El bloque tiende a bajar: el rozamiento estático apunta hacia ARRIBA del plano."],
      ["Peso, normal y rozamiento de valor μₑ·N", "conceptual", "μₑ·N es el valor MÁXIMO del rozamiento estático; si está quieto lejos del límite, el rozamiento vale solo P·sen θ."],
    ],
  },
  {
    lvl: 6,
    sit: "Un bloque está apoyado en un piso horizontal y alguien lo empuja con una fuerza F inclinada hacia ABAJO (formando un ángulo con la horizontal); el bloque no se mueve.",
    q: "¿Cómo es la normal comparada con el peso?",
    ok: "N es mayor que P (N = P + F·sen α)",
    why: "La componente vertical de F empuja el bloque contra el piso: la normal tiene que equilibrar el peso MÁS esa componente.",
    bad: [
      ["N = P siempre en un piso horizontal", "conceptual", "N = P solo si no hay otras fuerzas verticales. Acá F tiene una componente hacia abajo."],
      ["N es menor que P (N = P − F·sen α)", "signos", "Eso sería si F tirara hacia ARRIBA. Empujando hacia abajo, aprieta el bloque contra el piso."],
      ["N = F·cos α", "trigonometria", "F·cos α es la componente horizontal de F: no tiene que ver con la normal."],
    ],
  },
];

export const fisDcl: Generator = {
  id: "fis-dcl",
  topicId: "t-plano-inclinado",
  description: "Diagrama de cuerpo libre: qué fuerzas actúan (plano inclinado, cuerda, fondo de un líquido)",
  generate(seed, d) {
    const r = rng(seed);
    let cands = DCL.filter((c) => c.lvl === d || c.lvl === d - 1);
    if (!cands.length) cands = DCL.filter((c) => c.lvl <= d);
    const c = r.pick(cands);
    return choice(r, cb(this.id, seed, d, this.topicId,
      `**Diagrama de cuerpo libre.** ${c.sit} ${c.q ?? "¿Qué fuerzas actúan sobre el cuerpo?"}`,
      [
        "Recorré lo que TOCA al cuerpo (cuerdas, superficies, líquidos) y sumá el peso, que actúa a distancia.",
        "Cada fuerza la ejerce ALGO: si no podés decir quién la hace, no existe (no hay «fuerza del movimiento»).",
        "La normal es perpendicular a la superficie de contacto; el rozamiento es paralelo a ella y se opone al deslizamiento (o a la tendencia a deslizar).",
      ],
      ["Interacciones: la Tierra (peso) y cada cosa en contacto.", c.why],
      "Un DCL tiene una flecha por cada interacción: peso (Tierra), normal y rozamiento (superficie), tensión (cuerda), empuje (fluido). Las componentes (P·sen θ, P·cos θ) NO son fuerzas nuevas: son el peso descompuesto."), [ok(c.ok), ...c.bad.map(bad)]);
  },
};

export const FIS_MISSION_GENERATORS: Generator[] = [
  fisQueUsariasCinematica,
  fisQueUsariasDinamica,
  fisQueUsariasEnergia,
  fisQueUsariasHidro,
  fisSignos,
  fisKmh,
  fisDimensional,
  fisGraficoVtLectura,
  fisMruvVariantes,
  fisDosEtapas,
  fisDcl,
];

// ═════════════════════════════ Escenarios «RESOLVER CONMIGO» ═════════════════════════════

export interface FisScenario {
  kind: string;
  topicId: string;
  /** Enunciado (MathText). */
  enunciado: string;
  /** Datos del enunciado; los que no se usan tienen relevante = false. */
  datos: { label: string; sym: string; value: string; relevante: boolean }[];
  pide: { options: string[]; answer: number };
  modelo: { options: string[]; answer: number; why: string };
  formula: { options: string[]; answer: number; why: string };
  /** Conversión de unidades necesaria, si la hay ("90 km/h = 25,0 m/s"). */
  conversion?: string;
  /** Resolución renglón por renglón. */
  pasos: string[];
  respuesta: number;
  unidad: string;
  tolerance: number;
  /** Chequeo de sentido físico y de unidades. */
  verificacion: string;
}

export const SCENARIO_KINDS: { kind: string; topicId: string; title: string }[] = [
  { kind: "mruv-v", topicId: "t-mruv", title: "MRUV: rapidez final" },
  { kind: "mruv-t", topicId: "t-mruv", title: "MRUV: ¿cuánto tarda?" },
  { kind: "mruv-a", topicId: "t-mruv", title: "MRUV: aceleración" },
  { kind: "frenado", topicId: "t-frenado", title: "Distancia de frenado" },
  { kind: "encuentro", topicId: "t-encuentro", title: "Encuentro en MRU" },
  { kind: "caida", topicId: "t-caida-libre", title: "Caída libre" },
  { kind: "tiro-hmax", topicId: "t-tiro-oblicuo", title: "Tiro oblicuo: altura máxima" },
  { kind: "plano-a", topicId: "t-plano-inclinado", title: "Plano inclinado con rozamiento" },
  { kind: "energia-v", topicId: "t-energia", title: "Energía: rapidez abajo de la colina" },
  { kind: "presion", topicId: "t-presion", title: "Presión hidrostática" },
  { kind: "empuje", topicId: "t-arquimedes", title: "Empuje y flotación" },
  { kind: "newton-F", topicId: "t-newton", title: "2.ª ley: fuerza necesaria" },
  { kind: "vinculados", topicId: "t-vinculados", title: "Cuerpos vinculados" },
];

const MODELOS = ["MRU", "MRUV", "Caída libre / tiro vertical", "Tiro oblicuo", "Estática", "Dinámica (2.ª ley)", "Energía", "Hidrostática"];

type Dato = FisScenario["datos"][number];
const dato = (label: string, sym: string, value: string, relevante = true): Dato => ({ label, sym, value, relevante });

/** Mezcla una opción correcta con distractores y devuelve el índice correcto. */
function mix(r: Rng, correct: string, wrongs: string[]): { options: string[]; answer: number } {
  const options = r.shuffle([correct, ...wrongs.filter((w) => w !== correct)]);
  return { options, answer: options.indexOf(correct) };
}

function modelos(r: Rng, correct: string, why: string, plausible: string[] = []) {
  const others = r.shuffle(MODELOS.filter((m) => m !== correct && !plausible.includes(m)));
  const wrongs = [...plausible.filter((p) => p !== correct), ...others].slice(0, 3);
  return { ...mix(r, correct, wrongs), why };
}

interface Draft {
  enunciado: string;
  datos: Dato[];
  pide: [string, string[]];
  modelo: [string, string, string[]?];
  formula: [string, string, string[]];
  conversion?: string;
  pasos: string[];
  valor: number;
  unidad: string;
  verificacion: string;
}

function finish(r: Rng, kind: string, topicId: string, d: Difficulty, x: Draft): FisScenario {
  const respuesta = sig3(x.valor);
  const datos = d >= 3 ? r.shuffle(x.datos) : x.datos;
  return {
    kind,
    topicId,
    enunciado: x.enunciado,
    datos,
    pide: mix(r, x.pide[0], x.pide[1]),
    modelo: modelos(r, x.modelo[0], x.modelo[1], x.modelo[2]),
    formula: { ...mix(r, x.formula[0], x.formula[2]), why: x.formula[1] },
    ...(x.conversion ? { conversion: x.conversion } : {}),
    pasos: x.pasos,
    respuesta,
    unidad: x.unidad,
    tolerance: Math.max(Math.abs(respuesta) * 0.005, 1e-9),
    verificacion: x.verificacion,
  };
}

const PIDE_KIN = ["la rapidez final $v$", "el tiempo $t$", "la aceleración $a$", "la distancia recorrida $Δx$"];
const others = (all: string[], ok: string) => all.filter((x) => x !== ok).slice(0, 3);

type Builder = (r: Rng, d: Difficulty) => Draft;

const BUILDERS: Record<string, Builder> = {
  "mruv-v": (r, d) => {
    const kmh = d >= 4;
    const V0 = kmh ? r.pick([18, 36, 54]) : 0;
    const v0 = kmh ? V0 / 3.6 : d >= 2 ? r.pick([2, 4, 6]) : 0;
    const a = r.pick([1.5, 2, 2.5, 3]);
    const t = r.pick([4, 5, 6, 8]);
    const v = v0 + a * t;
    const datos = [
      dato("Rapidez inicial", "v_0", kmh ? `${V0} km/h` : `${n(v0)} m/s`),
      dato("Aceleración", "a", `${n(a)} m/s²`),
      dato("Tiempo", "t", `${t} s`),
    ];
    if (d >= 3) datos.push(dato("Masa del auto", "m", `${r.pick([900, 1100, 1300])} kg`, false));
    if (d >= 5) datos.push(dato("Distancia hasta la próxima esquina", "D", `${r.pick([150, 200, 300])} m`, false));
    return {
      enunciado: `Un auto ${v0 === 0 ? "parte del reposo" : `que va a ${kmh ? `${V0} km/h` : `${n(v0)} m/s`}`} y acelera uniformemente a ${n(a)} m/s² durante ${t} s.${d >= 3 ? ` El auto tiene una masa de ${datos[3].value}.` : ""}${d >= 5 ? ` La próxima esquina está a ${datos[4].value}.` : ""} ¿Qué rapidez alcanza, en m/s?`,
      datos,
      pide: ["la rapidez final $v$", others(PIDE_KIN, "la rapidez final $v$")],
      modelo: ["MRUV", "La aceleración es constante y distinta de cero: movimiento rectilíneo uniformemente variado.", ["MRU", "Caída libre / tiro vertical"]],
      formula: ["$v = v_0 + a·t$", "Tenés v₀, a y t: es la relación que vincula exactamente esas magnitudes con v.", ["$v^2 = v_0^2 + 2·a·Δx$", "$x = x_0 + v·t$", "$Δx = v_0·t + ½·a·t^2$"]],
      ...(kmh ? { conversion: `${V0} km/h = ${s3(v0)} m/s` } : {}),
      pasos: [...(kmh ? [`v₀ = ${V0} km/h ÷ 3,6 = ${s3(v0)} m/s`] : []), "v = v₀ + a·t", `v = ${s3(v0)} + ${n(a)}·${t}`, `v = ${s3(v)} m/s`],
      valor: v,
      unidad: "m/s",
      verificacion: `a > 0, así que v tiene que salir mayor que v₀ ✔. Unidades: m/s + (m/s²)·s = m/s ✔. ${s3(v)} m/s = ${s3(v * 3.6)} km/h: razonable para un auto.`,
    };
  },
  "mruv-t": (r, d) => {
    const frena = d >= 5;
    const a = r.pick([1.5, 2, 2.5, 4]);
    const lo = r.pick([2, 4, 6]);
    const t = r.pick([3, 4, 5, 6]);
    const hi = lo + a * t;
    const [v0, v] = frena ? [hi, lo] : [d === 1 ? 0 : lo, d === 1 ? a * t : hi];
    const datos = [dato("Rapidez inicial", "v_0", `${n(v0)} m/s`), dato("Rapidez final", "v", `${n(v)} m/s`), dato(frena ? "Desaceleración (módulo)" : "Aceleración", "a", `${n(a)} m/s²`)];
    if (d >= 3) datos.push(dato("Masa", "m", `${r.pick([200, 250])} kg`, false));
    if (d >= 4) datos.push(dato("Largo del tramo recto", "L", "500 m", false));
    return {
      enunciado: `Una moto ${frena ? "frena" : "acelera"} uniformemente de ${n(v0)} m/s a ${n(v)} m/s con una ${frena ? "desaceleración" : "aceleración"} de ${n(a)} m/s².${d >= 3 ? ` La moto con su conductor tiene ${datos[3].value}.` : ""}${d >= 4 ? " El tramo recto de la ruta mide 500 m." : ""} ¿Cuánto tarda?`,
      datos,
      pide: ["el tiempo $t$", others(PIDE_KIN, "el tiempo $t$")],
      modelo: ["MRUV", "La velocidad cambia de manera uniforme: aceleración constante.", ["MRU", "Dinámica (2.ª ley)"]],
      formula: ["$v = v_0 + a·t$", "Tenés v₀, v y a: despejando t de esta relación sale directo.", ["$v^2 = v_0^2 + 2·a·Δx$", "$Δx = v_0·t + ½·a·t^2$", "$t = Δx/v$"]],
      pasos: ["v = v₀ + a·t → t = (v − v₀)/a", frena ? `t = (${n(v)} − ${n(v0)}) / (−${n(a)})` : `t = (${n(v)} − ${n(v0)}) / ${n(a)}`, `t = ${s3(t)} s`],
      valor: t,
      unidad: "s",
      verificacion: `${frena ? "Frena: a es negativa y v − v₀ también, así que t sale positivo ✔." : "t positivo ✔."} Unidades: (m/s)/(m/s²) = s ✔.`,
    };
  },
  "mruv-a": (r, d) => {
    const t = r.pick([4, 5, 8, 10]);
    const v0 = d >= 4 ? r.pick([2, 3, 5]) : 0;
    const a = r.pick([0.5, 1, 1.5, 2]);
    const dx = v0 * t + (a * t * t) / 2;
    const datos = [...(v0 ? [dato("Rapidez inicial", "v_0", `${n(v0)} m/s`)] : []), dato("Distancia", "Δx", `${n(dx)} m`), dato("Tiempo", "t", `${t} s`)];
    if (d >= 3) datos.push(dato("Masa de la bicicleta", "m", "12 kg", false));
    if (d >= 5) datos.push(dato("Velocidad máxima permitida", "v_{máx}", "40 km/h", false));
    return {
      enunciado: `Un ciclista ${v0 ? `que va a ${n(v0)} m/s` : "que parte del reposo"} recorre ${n(dx)} m en ${t} s con aceleración constante.${d >= 3 ? " La bicicleta tiene una masa de 12 kg." : ""}${d >= 5 ? " En esa calle la velocidad máxima es 40 km/h." : ""} ¿Cuál es su aceleración?`,
      datos,
      pide: ["la aceleración $a$", others(PIDE_KIN, "la aceleración $a$")],
      modelo: ["MRUV", "Aceleración constante.", ["MRU", "Dinámica (2.ª ley)"]],
      formula: ["$Δx = v_0·t + ½·a·t^2$", "Tenés Δx, t y v₀: la ecuación horaria tiene una sola incógnita, a.", ["$v = v_0 + a·t$", "$v^2 = v_0^2 + 2·a·Δx$", "$a = Δx/t^2$"]],
      pasos: ["Δx = v₀·t + ½·a·t²", `${n(dx)} = ${n(v0)}·${t} + ½·a·${t}²`, `a = 2·(${n(dx)} − ${n(v0 * t)}) / ${t * t}`, `a = ${s3(a)} m/s²`],
      valor: a,
      unidad: "m/s²",
      verificacion: `Comprobación: ${n(v0)}·${t} + ½·${s3(a)}·${t}² = ${s3(dx)} m ✔. Unidades: m/s² ✔.`,
    };
  },
  frenado: (r, d) => {
    const kmh = d >= 2;
    const V = r.pick([54, 72, 90, 108]);
    const v0 = kmh ? V / 3.6 : r.pick([10, 15, 20]);
    const a = r.pick([4, 5, 6, 8]);
    const reac = d >= 5;
    const tr = reac ? r.pick([0.5, 0.75, 1]) : 0;
    const df = (v0 * v0) / (2 * a);
    const total = v0 * tr + df;
    const datos = [dato("Rapidez inicial", "v_0", kmh ? `${V} km/h` : `${n(v0)} m/s`), dato("Desaceleración (módulo)", "a", `${a} m/s²`)];
    if (reac) datos.push(dato("Tiempo de reacción", "t_r", `${n(tr)} s`));
    if (d >= 3) datos.push(dato("Masa del auto", "m", `${r.pick([1000, 1200, 1400])} kg`, false));
    if (d >= 4) datos.push(dato("Coeficiente de rozamiento estático", "μ_e", "0,7", false));
    return {
      enunciado: `Un auto va a ${datos[0].value}${reac ? ` y el conductor tarda ${n(tr)} s en reaccionar (en ese lapso sigue a la misma velocidad); después frena` : " y frena"} con desaceleración constante de ${a} m/s² hasta detenerse.${d >= 3 ? ` La masa del auto es ${datos.find((x) => x.sym === "m")!.value}.` : ""}${d >= 4 ? " El coeficiente de rozamiento estático entre neumáticos y asfalto es 0,7." : ""} ¿Qué distancia recorre ${reac ? "desde que ve el obstáculo" : "mientras frena"}?`,
      datos,
      pide: ["la distancia recorrida $Δx$", others(PIDE_KIN, "la distancia recorrida $Δx$")],
      modelo: reac
        ? ["MRU y después MRUV", "Durante la reacción la velocidad es constante (MRU); después frena con aceleración constante (MRUV).", ["MRU", "MRUV"]]
        : ["MRUV", "Frena con aceleración constante.", ["MRU", "Dinámica (2.ª ley)"]],
      formula: [reac ? "$Δx = v_0·t_r + \\frac{v_0^2}{2·a}$" : "$v^2 = v_0^2 + 2·a·Δx$ con $v = 0$", reac ? "Distancia de reacción (MRU) + distancia de frenado (v² = v₀² − 2aΔx con v = 0)." : "«Hasta detenerse» da v = 0, y no tenés el tiempo: la relación de v² es la directa.", reac ? ["$Δx = \\frac{v_0^2}{2·a}$", "$Δx = v_0·t_r$", "$Δx = ½·a·t_r^2$"] : ["$Δx = v_0·t$", "$v = v_0 + a·t$", "$Δx = ½·a·t^2$"]],
      ...(kmh ? { conversion: `${V} km/h = ${s3(v0)} m/s` } : {}),
      pasos: [
        ...(kmh ? [`v₀ = ${V} ÷ 3,6 = ${s3(v0)} m/s`] : []),
        ...(reac ? [`Reacción: d_r = v₀·t_r = ${s3(v0)}·${n(tr)} = ${s3(v0 * tr)} m`] : []),
        "Frenado: 0 = v₀² − 2·a·d_f → d_f = v₀²/(2a)",
        `d_f = ${s3(v0)}² / (2·${a}) = ${s3(df)} m`,
        ...(reac ? [`Total: ${s3(v0 * tr)} + ${s3(df)} = ${s3(total)} m`] : []),
      ],
      valor: total,
      unidad: "m",
      verificacion: `Si duplicás la rapidez, la distancia de frenado se cuadruplica (va con v₀²). Unidades: (m/s)²/(m/s²) = m ✔.`,
    };
  },
  encuentro: (r, d) => {
    const vA = r.pick([80, 90, 100, 120]);
    const vB = r.pick([40, 50, 60]);
    const d0 = r.pick([30, 40, 60, 80]);
    const t = d0 / (vA - vB);
    const askX = d >= 4;
    const datos = [dato("Rapidez del auto A", "v_A", `${vA} km/h`), dato("Rapidez del camión B", "v_B", `${vB} km/h`), dato("Distancia inicial entre ambos", "d_0", `${d0} km`)];
    if (d >= 3) datos.push(dato("Carga del camión", "m", "18 t", false));
    if (d >= 5) datos.push(dato("Largo del camión", "L", "16 m", false));
    return {
      enunciado: `Por una ruta recta, un auto A pasa por el km 0 a ${vA} km/h. En ese mismo instante, un camión B pasa por el km ${d0} a ${vB} km/h en el MISMO sentido. Ambos mantienen su velocidad.${d >= 3 ? " El camión lleva 18 t de carga." : ""}${d >= 5 ? " El camión mide 16 m de largo." : ""} ${askX ? "¿En qué kilómetro lo alcanza?" : "¿Cuánto tarda A en alcanzar a B, en horas?"}`,
      datos,
      pide: askX ? ["la posición del encuentro $x_E$", ["el tiempo de encuentro $t_E$", "la rapidez relativa", "la distancia inicial"]] : ["el tiempo de encuentro $t_E$", ["la posición del encuentro $x_E$", "la rapidez relativa", "la aceleración de A"]],
      modelo: ["MRU", "Los dos van a velocidad constante.", ["MRUV", "Dinámica (2.ª ley)"]],
      formula: ["$x_A(t) = x_B(t)$, con $x = x_0 + v·t$", "Encontrarse es estar en el mismo lugar en el mismo instante: se igualan las ecuaciones horarias.", ["$t = \\frac{d_0}{v_A + v_B}$", "$t = \\frac{d_0}{v_A}$", "$v^2 = v_0^2 + 2·a·Δx$"]],
      pasos: [`x_A = ${vA}·t ; x_B = ${d0} + ${vB}·t`, `${vA}·t = ${d0} + ${vB}·t → t = ${d0}/(${vA} − ${vB})`, `t = ${s3(t)} h`, ...(askX ? [`x_E = ${vA}·${s3(t)} = ${s3(vA * t)} km`] : [])],
      valor: askX ? vA * t : t,
      unidad: askX ? "km" : "h",
      verificacion: `Comprobá con B: ${d0} + ${vB}·${s3(t)} = ${s3(d0 + vB * t)} km, igual que A ✔. ${Number.isInteger(t) ? "" : `Para pasarlo a minutos, la parte decimal se multiplica por 60: ${s3(t)} h = ${Math.floor(t)} h ${Math.round((t - Math.floor(t)) * 60)} min.`}`,
    };
  },
  caida: (r, d) => {
    const h = r.pick([5, 10, 20, 30, 45]);
    const v0 = d >= 4 ? r.pick([3, 5, 8]) : 0;
    const askT = d <= 2 || d >= 5;
    const v = Math.sqrt(v0 * v0 + 2 * G * h);
    const t = (-v0 + v) / G;
    const datos = [dato("Altura", "h", `${h} m`), ...(v0 ? [dato("Rapidez inicial (hacia abajo)", "v_0", `${v0} m/s`)] : [])];
    if (d >= 3) datos.push(dato("Masa de la piedra", "m", `${r.pick([150, 200, 500])} g`, false));
    if (d >= 6) datos.push(dato("Diámetro de la piedra", "D", "4 cm", false));
    return {
      enunciado: `Desde lo alto de un edificio, a ${h} m del piso, ${v0 ? `se lanza una piedra verticalmente hacia abajo con rapidez de ${v0} m/s` : "se deja caer una piedra"}. Despreciá el rozamiento con el aire.${d >= 3 ? ` La piedra tiene una masa de ${datos.find((x) => x.sym === "m")!.value}.` : ""}${d >= 6 ? " Su diámetro es de 4 cm." : ""} ${askT ? "¿Cuánto tarda en llegar al piso?" : "¿Con qué rapidez llega al piso?"}`,
      datos,
      pide: askT ? ["el tiempo de caída $t$", ["la rapidez final $v$", "la altura máxima", "la aceleración"]] : ["la rapidez final $v$", ["el tiempo de caída $t$", "la altura máxima", "la aceleración"]],
      modelo: ["Caída libre / tiro vertical", "Solo actúa el peso: aceleración constante g = 9,80 m/s² hacia abajo.", ["MRU", "Tiro oblicuo"]],
      formula: askT
        ? (v0 ? ["$Δy = v_0·t + ½·g·t^2$ (eje hacia abajo)", "Tenés Δy, v₀ y g: la ecuación horaria da t (es cuadrática: usá la resolvente).", ["$Δy = ½·g·t^2$", "$t = Δy/v_0$", "$v = g·t$"]] : ["$Δy = ½·g·t^2$", "Parte del reposo: con la altura y g sale t directamente.", ["$v = g·t$", "$t = Δy/g$", "$Δy = v·t$"]])
        : ["$v^2 = v_0^2 + 2·g·Δy$", "No pide el tiempo: la relación de v² vincula v, v₀, g y la altura.", ["$v^2 = 2·g·Δy$ (aunque tenga $v_0$)", "$v = Δy/t$", "$v = g·t$"]],
      pasos: askT
        ? (v0
          ? [`Eje hacia abajo: ${h} = ${v0}·t + 4,9·t²`, `4,9·t² + ${v0}·t − ${h} = 0`, `t = (−${v0} + √(${v0}² + 4·4,9·${h})) / (2·4,9)`, `t = ${s3(t)} s (la otra raíz es negativa: se descarta)`]
          : [`${h} = ½·9,80·t²`, `t = √(2·${h}/9,80)`, `t = ${s3(t)} s`])
        : [`v² = ${v0}² + 2·9,80·${h}`, `v² = ${s3(v * v)} m²/s²`, `v = ${s3(v)} m/s`],
      valor: askT ? t : v,
      unidad: askT ? "s" : "m/s",
      verificacion: askT ? `Con ese tiempo, la rapidez al llegar sería ${s3(v)} m/s. La masa no interviene: en caída libre todos los cuerpos caen igual. Unidades: s ✔.` : `La masa no interviene. Si se soltara desde el reposo daría √(2·g·h) = ${s3(Math.sqrt(2 * G * h))} m/s${v0 ? ", un poco menos ✔" : " ✔"}.`,
    };
  },
  "tiro-hmax": (r, d) => {
    const kmh = d >= 4;
    const V = r.pick([54, 72, 90, 108]);
    const v0 = kmh ? V / 3.6 : r.pick([15, 20, 25, 30]);
    const th = r.pick([30, 37, 45, 53, 60]);
    const vy = v0 * sinD(th);
    const hmax = (vy * vy) / (2 * G);
    const datos = [dato("Rapidez inicial", "v_0", kmh ? `${V} km/h` : `${n(v0)} m/s`), dato("Ángulo con la horizontal", "θ", `${th}°`)];
    if (d >= 3) datos.push(dato("Masa de la pelota", "m", "0,43 kg", false));
    if (d >= 5) datos.push(dato("Distancia al arco", "D", "30 m", false));
    return {
      enunciado: `Se patea una pelota desde el suelo con una rapidez de ${datos[0].value}, formando ${th}° con la horizontal. Despreciá el rozamiento con el aire.${d >= 3 ? " La pelota tiene 0,43 kg." : ""}${d >= 5 ? " El arco está a 30 m." : ""} ¿Qué altura máxima alcanza?`,
      datos,
      pide: ["la altura máxima $h_{máx}$", ["el alcance horizontal", "el tiempo de vuelo", "la rapidez en la altura máxima"]],
      modelo: ["Tiro oblicuo", "Horizontal: MRU. Vertical: tiro vertical con a = −g. La altura máxima solo depende de la componente vertical.", ["Caída libre / tiro vertical", "MRUV"]],
      formula: ["$h_{máx} = \\frac{(v_0·sen θ)^2}{2·g}$", "En la altura máxima v_y = 0: de v_y² = v₀y² − 2·g·h sale h = v₀y²/(2g).", ["$h_{máx} = \\frac{(v_0·cos θ)^2}{2·g}$", "$h_{máx} = \\frac{v_0^2}{2·g}$", "$h_{máx} = v_{0y}·t$"]],
      ...(kmh ? { conversion: `${V} km/h = ${s3(v0)} m/s` } : {}),
      pasos: [...(kmh ? [`v₀ = ${V} ÷ 3,6 = ${s3(v0)} m/s`] : []), `v₀y = v₀·sen ${th}° = ${s3(vy)} m/s`, "0 = v₀y² − 2·g·h_máx", `h_máx = ${s3(vy)}² / (2·9,80) = ${s3(hmax)} m`],
      valor: hmax,
      unidad: "m",
      verificacion: `Tiene que ser menor que v₀²/(2g) = ${s3((v0 * v0) / (2 * G))} m (lo que subiría lanzada vertical) ✔. La masa no interviene.`,
    };
  },
  "plano-a": (r, d) => {
    const th = r.pick([30, 37, 40, 45]);
    const mu = r.pick([0.1, 0.2, 0.25, 0.3]);
    const sube = d >= 5;
    const a = sube ? G * (sinD(th) + mu * cosD(th)) : G * (sinD(th) - mu * cosD(th));
    const datos = [dato("Inclinación", "θ", `${th}°`), dato("Coeficiente de rozamiento dinámico", "μ_d", n(mu))];
    if (d >= 3) datos.push(dato("Masa del bloque", "m", `${r.pick([2, 5, 8])} kg`, false));
    if (d >= 4) datos.push(dato("Largo del plano", "L", `${r.pick([3, 4, 5])} m`, false));
    return {
      enunciado: `Un bloque ${sube ? "es lanzado hacia ARRIBA por" : "baja deslizando por"} un plano inclinado ${th}° con coeficiente de rozamiento dinámico ${n(mu)}.${d >= 3 ? ` El bloque tiene ${datos[2].value}.` : ""}${d >= 4 ? ` El plano mide ${datos[3].value}.` : ""} ¿Cuál es el módulo de su aceleración${sube ? " mientras sube" : ""}?`,
      datos,
      pide: ["la aceleración $a$", ["la fuerza normal $N$", "la fuerza de rozamiento", "la rapidez final"]],
      modelo: ["Dinámica (2.ª ley)", "Hay fuerzas no equilibradas a lo largo del plano: ΣF = m·a.", ["Estática", "Energía"]],
      formula: [sube ? "$a = g·(sen θ + μ_d·cos θ)$" : "$a = g·(sen θ − μ_d·cos θ)$", sube ? "Subiendo, P·sen θ y el rozamiento apuntan los dos hacia abajo del plano: se suman. N = m·g·cos θ." : "P·sen θ hacia abajo del plano y el rozamiento μd·N hacia arriba, con N = m·g·cos θ. La masa se simplifica.", [sube ? "$a = g·(sen θ − μ_d·cos θ)$" : "$a = g·(sen θ + μ_d·cos θ)$", sube ? "$a = g·(sen θ + μ_d)$" : "$a = g·(sen θ − μ_d)$", "$a = g·cos θ$"]],
      pasos: [
        `N = m·g·cos ${th}°`,
        sube ? `m·a = m·g·sen ${th}° + μ_d·m·g·cos ${th}°` : `m·a = m·g·sen ${th}° − μ_d·m·g·cos ${th}°`,
        `a = 9,80·(sen ${th}° ${sube ? "+" : "−"} ${n(mu)}·cos ${th}°)`,
        `a = ${s3(a)} m/s²`,
      ],
      valor: a,
      unidad: "m/s²",
      verificacion: sube ? `Tiene que ser mayor que g·sen θ = ${s3(G * sinD(th))} m/s² (el rozamiento suma al frenar la subida) ✔. La masa se simplifica.` : `Tiene que ser menor que g·sen θ = ${s3(G * sinD(th))} m/s² (sin rozamiento) y positiva (μd < tg θ) ✔. La masa se simplifica: no se usa.`,
    };
  },
  "energia-v": (r, d) => {
    const hA = r.pick([10, 15, 20, 25]);
    const conVel = d >= 3;
    const vA = conVel ? r.pick([2, 3, 4, 5]) : 0;
    const hB = conVel ? r.pick([0, 2, 4, 5]) : 0;
    const v = Math.sqrt(vA * vA + 2 * G * (hA - hB));
    const datos = [dato("Altura inicial", "h_A", `${hA} m`), ...(conVel ? [dato("Rapidez inicial", "v_A", `${vA} m/s`), dato("Altura final", "h_B", `${hB} m`)] : [])];
    if (d >= 3) datos.push(dato("Masa del carrito", "m", `${r.pick([150, 300, 450])} kg`, false));
    if (d >= 5) datos.push(dato("Longitud del recorrido", "L", "60 m", false));
    return {
      enunciado: conVel
        ? `Un carrito de montaña rusa pasa por un punto A, a ${hA} m del suelo, con una rapidez de ${vA} m/s, y baja por la vía (sin rozamiento) hasta un punto B a ${hB} m.${` El carrito tiene ${datos[3].value}.`}${d >= 5 ? " El recorrido entre A y B mide 60 m." : ""} ¿Qué rapidez tiene en B?`
        : `Un trineo parte del reposo desde lo alto de una colina de ${hA} m y baja por la ladera curva sin rozamiento. ¿Con qué rapidez llega abajo?`,
      datos,
      pide: ["la rapidez final $v$", ["la energía potencial inicial", "el tiempo de bajada", "la aceleración"]],
      modelo: ["Energía", "Sin rozamiento la energía mecánica se conserva, y la forma de la vía no importa (la aceleración no es constante: MRUV no sirve).", ["MRUV", "Dinámica (2.ª ley)"]],
      formula: ["$½·m·v_A^2 + m·g·h_A = ½·m·v_B^2 + m·g·h_B$", "Conservación de la energía mecánica: la masa se simplifica y solo importa el desnivel.", ["$v = v_0 + a·t$", "$m·g·h_A = ½·m·v_B^2$ (aunque haya $v_A$ y $h_B$)", "$F = m·a$ con $a = g·sen θ$"]],
      pasos: [`½·v_B² = ½·${vA}² + 9,80·(${hA} − ${hB})`, `v_B² = ${vA * vA} + 2·9,80·${hA - hB} = ${s3(v * v)}`, `v_B = ${s3(v)} m/s`],
      valor: v,
      unidad: "m/s",
      verificacion: `La masa no aparece en el resultado (se simplificó) ✔. Como baja, v_B > v_A ✔. Unidades: √(m²/s²) = m/s ✔.`,
    };
  },
  presion: (r, d) => {
    const conv = d >= 3;
    const dif = d >= 5;
    const dens = conv ? r.pick([0.8, 1, 1.03, 1.26, 13.6]) : r.pick([1000, 800, 1030]);
    const dSI = conv ? dens * 1000 : dens;
    const h1 = conv ? r.pick([20, 35, 50]) : 0;
    const h = conv ? h1 + r.pick([40, 60, 80, 120]) : r.pick([2, 5, 8, 12]);
    const hSI = conv ? (dif ? (h - h1) / 100 : h / 100) : h;
    const p = dSI * G * hSI;
    const datos = [dato("Densidad del líquido", "δ", conv ? `${n(dens)} g/cm³` : `${dens} kg/m³`), dato(dif ? "Profundidad del punto más hondo" : "Profundidad", "h", conv ? `${h} cm` : `${h} m`)];
    if (dif) datos.push(dato("Profundidad del punto menos hondo", "h_1", `${h1} cm`));
    if (d >= 3) datos.push(dato("Presión atmosférica", "p_atm", "101,3 kPa", false));
    if (d >= 4) datos.push(dato("Área del fondo del recipiente", "S", "0,5 m²", false));
    return {
      enunciado: dif
        ? `En un recipiente con un líquido de densidad ${n(dens)} g/cm³ hay dos puntos a ${h1} cm y a ${h} cm de profundidad. La presión atmosférica es 101,3 kPa y el fondo tiene 0,5 m² de área. ¿Cuál es la diferencia de presión entre esos dos puntos, en Pa?`
        : `Un recipiente abierto contiene un líquido de densidad ${datos[0].value}. ¿Cuál es la presión manométrica (la que agrega el líquido) a ${datos[1].value} de profundidad, en Pa?${d >= 3 ? " La presión atmosférica es 101,3 kPa." : ""}${d >= 4 ? " El fondo del recipiente tiene 0,5 m² de área." : ""}`,
      datos,
      pide: [dif ? "la diferencia de presión $Δp$" : "la presión $p$", ["el empuje $E$", "la fuerza sobre el fondo", "la densidad $δ$"]],
      modelo: ["Hidrostática", "Líquido en reposo: la presión aumenta con la profundidad (teorema fundamental).", ["Estática", "Energía"]],
      formula: [dif ? "$Δp = δ·g·Δh$" : "$p = δ·g·h$", dif ? "Solo importa el desnivel entre los puntos; la atmosférica actúa en los dos y se cancela." : "La presión que agrega el líquido es densidad × g × profundidad (sin la atmosférica porque piden la manométrica).", [dif ? "$Δp = p_{atm} + δ·g·Δh$" : "$p = p_{atm} + δ·g·h$", "$p = F/S$", "$E = V·δ·g$"]],
      ...(conv ? { conversion: `${n(dens)} g/cm³ = ${n(dSI)} kg/m³; ${dif ? `${h} cm − ${h1} cm = ${h - h1} cm` : `${h} cm`} = ${n(hSI)} m` } : {}),
      pasos: [...(conv ? [`δ = ${n(dens)} g/cm³ = ${n(dSI)} kg/m³`, `${dif ? "Δh" : "h"} = ${n(hSI)} m`] : []), `${dif ? "Δp" : "p"} = ${n(dSI)}·9,80·${n(hSI)}`, `${dif ? "Δp" : "p"} = ${s3(p)} Pa`],
      valor: p,
      unidad: "Pa",
      verificacion: `Referencia: 10 m de agua agregan ≈ 98 000 Pa (casi una atmósfera). Unidades: (kg/m³)·(m/s²)·m = N/m² = Pa ✔.`,
    };
  },
  empuje: (r, d) => {
    if (d >= 6) {
      const dc = r.pick([0.5, 0.6, 0.75, 0.9]);
      const dl = r.pick([1, 1.03]);
      const frac = (dc / dl) * 100;
      return {
        enunciado: `Un bloque de madera de densidad ${n(dc)} g/cm³ y 2 L de volumen flota en un líquido de densidad ${n(dl)} g/cm³, en un recipiente de 1,5 m de profundidad. ¿Qué porcentaje de su volumen queda SUMERGIDO?`,
        datos: r.shuffle([dato("Densidad del bloque", "δ_c", `${n(dc)} g/cm³`), dato("Densidad del líquido", "δ_L", `${n(dl)} g/cm³`), dato("Volumen del bloque", "V", "2 L", false), dato("Profundidad del recipiente", "H", "1,5 m", false)]),
        pide: ["el porcentaje sumergido", ["el porcentaje que asoma", "el empuje", "el peso del bloque"]],
        modelo: ["Hidrostática", "Flota en equilibrio: empuje = peso (Arquímedes).", ["Estática", "Dinámica (2.ª ley)"]],
        formula: ["$\\frac{V_{sum}}{V} = \\frac{δ_c}{δ_L}$", "De E = P: V_sum·δL·g = V·δc·g. El volumen total se simplifica.", ["$\\frac{V_{emerg}}{V} = \\frac{δ_c}{δ_L}$", "$E = V·δ_L·g$ con todo el volumen", "$p = δ·g·h$"]],
        pasos: ["E = P → V_sum·δ_L·g = V·δ_c·g", `V_sum/V = ${n(dc)}/${n(dl)}`, `Sumergido: ${s3(frac)} %`],
        valor: frac,
        unidad: "%",
        verificacion: `Es menor que 100 % porque el bloque es menos denso que el líquido ✔. Asoma el ${s3(100 - frac)} %.`,
      };
    }
    const fondo = d >= 4;
    const VL = fondo ? r.pick([2, 3, 4, 5]) : d === 3 ? r.pick([250, 400, 600]) : r.pick([2, 5, 8]);
    const VSI = d === 3 ? VL / 1e6 : VL / 1000;
    const dl = d === 3 ? r.pick([1, 0.8, 1.2]) : r.pick([1000, 800]);
    const dlSI = d === 3 ? dl * 1000 : dl;
    const E = VSI * dlSI * G;
    const m = fondo ? r.pick([8, 10, 12, 15]) : 0;
    const N = m * G - E;
    const datos = [dato("Volumen del cuerpo", "V", d === 3 ? `${VL} cm³` : `${VL} L`), dato("Densidad del líquido", "δ_L", d === 3 ? `${n(dl)} g/cm³` : `${dl} kg/m³`), ...(fondo ? [dato("Masa del cuerpo", "m", `${m} kg`)] : [])];
    if (d >= 3) datos.push(dato("Profundidad a la que está", "h", `${r.pick([1, 2, 3])} m`, false));
    if (d >= 5) datos.push(dato("Presión atmosférica", "p_atm", "101,3 kPa", false));
    return {
      enunciado: fondo
        ? `Un bloque macizo de ${m} kg y ${VL} L está apoyado en el fondo de un tanque con un líquido de densidad ${dl} kg/m³, a ${datos[3].value} de profundidad.${d >= 5 ? " La presión atmosférica es 101,3 kPa." : ""} ¿Qué fuerza le hace el fondo (la normal)?`
        : `Un cuerpo de ${datos[0].value} está totalmente sumergido en un líquido de densidad ${datos[1].value}, colgado de un hilo${d >= 3 ? `, a ${datos[2].value} de profundidad` : ""}. ¿Qué empuje recibe?`,
      datos,
      pide: [fondo ? "la normal del fondo $N$" : "el empuje $E$", fondo ? ["el empuje $E$", "el peso $P$", "la presión en el fondo"] : ["el peso del cuerpo", "la tensión del hilo", "la presión a esa profundidad"]],
      modelo: ["Hidrostática", fondo ? "Equilibrio de un cuerpo sumergido: peso, empuje (Arquímedes) y normal." : "Principio de Arquímedes: el empuje es el peso del líquido desalojado.", ["Estática", "Dinámica (2.ª ley)"]],
      formula: fondo
        ? ["$N = m·g − V·δ_L·g$", "En equilibrio: N + E = P. El empuje usa el volumen sumergido y la densidad del LÍQUIDO.", ["$N = m·g$", "$N = m·g + V·δ_L·g$", "$N = V·δ_L·g$"]]
        : ["$E = V·δ_L·g$", "Totalmente sumergido: V_sumergido = V. La profundidad no influye.", ["$E = δ_L·g·h$", "$E = m·g$", "$E = V·δ_L$"]],
      conversion: `${d === 3 ? `${VL} cm³ = ${n(VSI, 6)} m³; ${n(dl)} g/cm³ = ${n(dlSI)} kg/m³` : `${VL} L = ${n(VSI)} m³`}`,
      pasos: [`V = ${n(VSI, 6)} m³`, `E = ${n(VSI, 6)}·${n(dlSI)}·9,80 = ${s3(E)} N`, ...(fondo ? [`P = ${m}·9,80 = ${s3(m * G)} N`, `N = P − E = ${s3(m * G)} − ${s3(E)} = ${s3(N)} N`] : [])],
      valor: fondo ? N : E,
      unidad: "N",
      verificacion: fondo ? `N < P porque el líquido sostiene parte del peso ✔ (y N > 0: el bloque es más denso que el líquido). La profundidad no cambia el empuje.` : `La profundidad es un dato que sobra: totalmente sumergido, el empuje no depende de ella ✔. Unidades: m³·(kg/m³)·(m/s²) = N ✔.`,
    };
  },
  "newton-F": (r, d) => {
    const m = r.pick([5, 10, 20, 50]);
    const a = r.pick([1, 1.5, 2, 2.5]);
    const tipo = d <= 2 ? "liso" : d <= 4 ? "cable" : "roz";
    const mu = r.pick([0.2, 0.25, 0.3]);
    const F = tipo === "liso" ? m * a : tipo === "cable" ? m * (G + a) : m * a + mu * m * G;
    const datos = [dato("Masa", "m", `${m} kg`), dato("Aceleración", "a", `${n(a)} m/s²`), ...(tipo === "roz" ? [dato("Coeficiente de rozamiento dinámico", "μ_d", n(mu))] : [])];
    if (d >= 3) datos.push(dato(tipo === "cable" ? "Largo del cable" : "Tiempo que dura el empuje", tipo === "cable" ? "L" : "t", tipo === "cable" ? "15 m" : "4 s", false));
    if (d >= 6) datos.push(dato("Coeficiente de rozamiento estático", "μ_e", n(mu + 0.15), false));
    return {
      enunciado: tipo === "liso"
        ? `¿Qué fuerza horizontal hay que aplicarle a un carro de ${m} kg, sobre un piso horizontal sin rozamiento, para que acelere a ${n(a)} m/s²?`
        : tipo === "cable"
          ? `Una grúa levanta una carga de ${m} kg con un cable de 15 m, con aceleración de ${n(a)} m/s² hacia arriba. ¿Cuál es la tensión del cable?`
          : `Se arrastra un cajón de ${m} kg sobre un piso horizontal con rozamiento dinámico ${n(mu)}${d >= 6 ? ` (el estático es ${n(mu + 0.15)})` : ""}, con una fuerza horizontal que dura 4 s. ¿Qué fuerza hay que hacer para que acelere a ${n(a)} m/s²?`,
      datos,
      pide: [tipo === "cable" ? "la tensión $T$" : "la fuerza aplicada $F$", ["la aceleración $a$", "el peso $P$", "la fuerza de rozamiento"]],
      modelo: ["Dinámica (2.ª ley)", "Se pide una fuerza a partir de una aceleración: ΣF = m·a.", ["Estática", "MRUV"]],
      formula: tipo === "liso"
        ? ["$F = m·a$", "Es la única fuerza horizontal.", ["$F = m·g$", "$F = m·(g + a)$", "$F = μ·m·g$"]]
        : tipo === "cable"
          ? ["$T − m·g = m·a$", "Sobre la carga actúan T (arriba) y P (abajo); la neta produce la aceleración hacia arriba.", ["$T = m·a$", "$T = m·g$", "$T − m·g = −m·a$"]]
          : ["$F − μ_d·m·g = m·a$", "A lo largo del piso: F hacia adelante y el rozamiento μd·N (con N = m·g) hacia atrás.", ["$F = m·a$", "$F = μ_d·m·g$", "$F − μ_e·m·g = m·a$"]],
      pasos: tipo === "liso"
        ? [`F = ${m}·${n(a)}`, `F = ${s3(F)} N`]
        : tipo === "cable"
          ? ["T − P = m·a → T = m·(g + a)", `T = ${m}·(9,80 + ${n(a)})`, `T = ${s3(F)} N`]
          : [`F_roz = μ_d·m·g = ${n(mu)}·${m}·9,80 = ${s3(mu * m * G)} N`, `F = m·a + F_roz = ${m}·${n(a)} + ${s3(mu * m * G)}`, `F = ${s3(F)} N`],
      valor: F,
      unidad: "N",
      verificacion: tipo === "cable" ? `T > P = ${s3(m * G)} N, como corresponde si acelera hacia arriba ✔.` : tipo === "roz" ? `F es mayor que el rozamiento (${s3(mu * m * G)} N): si no, no aceleraría ✔.` : "Unidades: kg·m/s² = N ✔.",
    };
  },
  vinculados: (r, d) => {
    const mA = r.pick([8, 10, 12]);
    const mB = r.pick([3, 4, 5, 6]);
    const th = r.pick([30, 37, 45]);
    const mu = r.pick([0.1, 0.2, 0.25]);
    const a = (mA * G * sinD(th) - mu * mB * G) / (mA + mB);
    const askT = d >= 5;
    const T = mB * (a + mu * G);
    const datos = [dato("Masa de A (en el plano)", "m_A", `${mA} kg`), dato("Masa de B (en la mesa)", "m_B", `${mB} kg`), dato("Inclinación del plano", "θ", `${th}°`), dato("Rozamiento dinámico entre B y la mesa", "μ_d", n(mu))];
    if (d >= 3) datos.push(dato("Rozamiento estático entre B y la mesa", "μ_e", n(mu + 0.1), false));
    if (d >= 4) datos.push(dato("Largo de la cuerda", "L", "2 m", false));
    return {
      enunciado: `Un bloque A de ${mA} kg está sobre un plano inclinado ${th}° SIN rozamiento. Una cuerda ideal, que pasa por una polea en lo alto del plano, lo une a un bloque B de ${mB} kg apoyado sobre una mesa horizontal con rozamiento dinámico ${n(mu)}${d >= 3 ? ` (estático ${n(mu + 0.1)})` : ""}${d >= 4 ? "; la cuerda mide 2 m" : ""}. A baja por el plano arrastrando a B. ¿Cuál es ${askT ? "la tensión de la cuerda" : "la aceleración del sistema"}?`,
      datos,
      pide: [askT ? "la tensión $T$" : "la aceleración $a$", askT ? ["la aceleración $a$", "la normal sobre A", "el rozamiento sobre B"] : ["la tensión $T$", "la normal sobre A", "el rozamiento sobre B"]],
      modelo: ["Dinámica (2.ª ley)", "Dos cuerpos unidos por una cuerda con fuerzas no equilibradas: 2.ª ley para cada uno (misma |a|).", ["Estática", "Energía"]],
      formula: askT
        ? ["$T − μ_d·m_B·g = m_B·a$ (con $a$ del sistema)", "Primero a con el sistema; después la 2.ª ley sobre B da T.", ["$T = m_A·g·sen θ$", "$T = μ_d·m_B·g$", "$T = m_B·g$"]]
        : ["$a = \\frac{m_A·g·sen θ − μ_d·m_B·g}{m_A + m_B}$", "Sumando las ecuaciones de A y B la tensión se cancela: la fuerza que tira es P_A·sen θ y la que frena es el rozamiento sobre B.", ["$a = \\frac{m_A·g·sen θ}{m_A}$", "$a = \\frac{m_A·g·sen θ − μ_d·m_B·g}{m_B}$", "$a = \\frac{m_A·g·cos θ − μ_d·m_B·g}{m_A + m_B}$"]],
      pasos: [
        `A: m_A·g·sen ${th}° − T = m_A·a`,
        `B: T − μ_d·m_B·g = m_B·a`,
        `Sumando: a = (${mA}·9,80·sen ${th}° − ${n(mu)}·${mB}·9,80) / ${mA + mB}`,
        `a = ${s3(a)} m/s²`,
        ...(askT ? [`T = m_B·(a + μ_d·g) = ${mB}·(${s3(a)} + ${n(mu)}·9,80) = ${s3(T)} N`] : []),
      ],
      valor: askT ? T : a,
      unidad: askT ? "N" : "m/s²",
      verificacion: askT ? `T tiene que estar entre el rozamiento sobre B (${s3(mu * mB * G)} N) y P_A·sen θ (${s3(mA * G * sinD(th))} N) ✔.` : `a es menor que g·sen θ = ${s3(G * sinD(th))} m/s² (A arrastra a B y hay rozamiento) y positiva ✔. El μ estático no se usa: el sistema ya se mueve.`,
    };
  },
};

export function makeScenario(kind: string, seed: number, difficulty: Difficulty): FisScenario {
  const meta = SCENARIO_KINDS.find((k) => k.kind === kind);
  const build = BUILDERS[kind];
  if (!meta || !build) throw new Error(`Escenario desconocido: ${kind}`);
  const r = rng(seed);
  return finish(r, kind, meta.topicId, difficulty, build(r, difficulty));
}
