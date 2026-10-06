/**
 * Generadores de Física (CBC / UBA XXI, estilo de la cátedra Torti).
 *
 * Convenciones: g = 9,80 m/s², resultados con 3 cifras significativas y su
 * unidad, tolerancia relativa de ~0,5 %. Los distractores numéricos son los
 * errores típicos detectados en los exámenes (sen↔cos, diámetro como radio,
 * olvidar el peso, omitir mgΔh, μs↔μd, no sumar h0, % sumergido vs emergido).
 */
import type { ErrorType, Generator, NumericExercise } from "../types";
import { fmt } from "../math/parser";
import { rng } from "./rng";
import { base, choice, type BaseArgs } from "./helpers";

const G = 9.8;
const SUBJ = "fisica";

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;
const sinD = (deg: number) => Math.sin(toRad(deg));
const cosD = (deg: number) => Math.cos(toRad(deg));
const tanD = (deg: number) => Math.tan(toRad(deg));

/** Redondea a 3 cifras significativas. */
export function sig3(x: number): number {
  if (!Number.isFinite(x) || x === 0) return x;
  return Number(x.toPrecision(3));
}

/** Texto con 3 cifras significativas y coma decimal (p. ej. 7,21 · 0,418 · 358). */
export function s3(x: number): string {
  const v = sig3(x);
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(v)));
  const dec = Math.max(0, 2 - e);
  return v.toFixed(dec).replace(".", ",").replace("-", "−");
}

/** Dato del enunciado (hasta 3 decimales, coma decimal). */
const n = (x: number, d = 3) => fmt(x, d);

/** Ángulo normalizado a [0°, 360°). */
const norm360 = (deg: number) => ((deg % 360) + 360) % 360;

type Err = [number, ErrorType, string];

interface NumArgs {
  gen: string;
  seed: number;
  d: Parameters<Generator["generate"]>[1];
  topicId: string;
  prompt: string;
  hints: [string, string, string];
  solution: string[];
  explanation: string;
  /** Unidad del resultado ("" si es adimensional). */
  unit: string;
  answer: number;
  errors?: Err[];
  visual?: BaseArgs["visual"];
}

/**
 * Ejercicio numérico con respuesta a 3 cifras significativas y tolerancia
 * relativa de 0,5 %. Descarta errores frecuentes que coincidan con la
 * respuesta o entre sí.
 */
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
  return {
    ...base({
      gen: a.gen,
      seed: a.seed,
      difficulty: a.d,
      subjectId: SUBJ,
      topicId: a.topicId,
      prompt: `${a.prompt} Respondé con 3 cifras significativas${a.unit ? `, en ${a.unit}` : " (es un número sin unidades)"}.`,
      hints: a.hints,
      solution: a.solution,
      explanation: a.explanation,
      frequentErrors,
      visual: a.visual,
    }),
    kind: "numeric",
    answer: ans,
    tolerance: tol,
    ...(a.unit ? { unit: a.unit } : {}),
  };
}

/** Base para ejercicios de opción múltiple. */
function cbase(gen: string, seed: number, d: NumArgs["d"], topicId: string, prompt: string, hints: [string, string, string], solution: string[], explanation: string, visual?: BaseArgs["visual"]) {
  return base({ gen, seed, difficulty: d, subjectId: SUBJ, topicId, prompt, hints, solution, explanation, visual });
}

const vec = (x: number, y: number, d = 0) => `(${fmt(x, d)}; ${fmt(y, d)})`;

// ═══════════════════════════ Unidad 1: Vectores II ═══════════════════════════

const AXES = ["+x", "+y", "−x", "−y"];

export const fisVecComponente: Generator = {
  id: "fis-vec-componente",
  topicId: "t-vec-componentes",
  description: "Componente de un vector con el ángulo medido desde cualquier semieje",
  generate(seed, d) {
    const r = rng(seed);
    const mag = r.pick([12, 20, 25, 40, 50, 60, 80, 150]);
    const alpha = r.pick([20, 25, 35, 40, 50, 55, 65, 70]);
    const axis = d <= 2 ? 0 : d <= 3 ? r.pick([0, 1]) : r.int(0, 3);
    const s = d <= 3 ? (axis === 0 ? 1 : -1) : r.pick([1, -1]);
    const nb = (((axis + s) % 4) + 4) % 4;
    const theta = norm360(axis * 90 + s * alpha);
    const askX = r.bool();
    const comp = mag * (askX ? cosD(theta) : sinD(theta));
    const swapped = mag * (askX ? sinD(theta) : cosD(theta));
    const naive = mag * (askX ? cosD(alpha) : sinD(alpha));
    const radians = mag * (askX ? Math.cos(theta) : Math.sin(theta));
    const c = askX ? "x" : "y";
    const fromX = axis % 2 === 0;
    const errors: Err[] = [
      [swapped, "trigonometria", fromX
        ? "Cambiaste seno por coseno. Con el ángulo medido desde el eje x, la componente x es el cateto adyacente (coseno) y la y, el opuesto (seno)."
        : "Cambiaste seno por coseno. El ángulo está medido desde el eje **y**: ahora la componente y es la adyacente (coseno) y la x la opuesta (seno)."],
      [naive, "vectores", "Usaste el ángulo dado como si estuviera medido desde +x. Primero mirá desde qué semieje se mide y en qué cuadrante queda la flecha."],
      ...(comp < 0 ? [[-comp, "signos", `Te faltó el signo: la flecha apunta hacia el lado negativo del eje ${c}, así que $F_${c}$ es negativa.`] as Err] : []),
      [radians, "calculo", "La calculadora está en radianes. Ponela en grados (DEG)."],
    ];
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: comp,
      prompt: `Una fuerza $F$ de módulo ${mag} N forma un ángulo de ${alpha}° con el semieje ${AXES[axis]}, inclinada hacia el semieje ${AXES[nb]}. ¿Cuánto vale su componente $F_${c}$ (con su signo)?`,
      hints: [
        "Hacé un dibujo: ¿en qué cuadrante queda la flecha? Eso ya te dice los signos de las componentes.",
        fromX
          ? "El ángulo se mide desde el eje x: la componente sobre ese eje es la adyacente (coseno); la otra, la opuesta (seno)."
          : "El ángulo se mide desde el eje y: la componente y es la adyacente (coseno) y la x es la opuesta (seno).",
        `Otra forma: el ángulo desde +x (antihorario) es θ = ${theta}°, y $F_x = |F|·cos θ$, $F_y = |F|·sen θ$.`,
      ],
      solution: [
        `Ángulo medido desde +x: θ = ${theta}°`,
        `$F_${c}$ = ${mag} · ${askX ? "cos" : "sen"} ${theta}°`,
        `$F_${c}$ = ${s3(comp)} N`,
      ],
      explanation: "La regla «x con coseno, y con seno» vale SOLO si el ángulo se mide desde +x. Si se mide desde otro eje, el coseno va con la componente sobre ese eje. El signo sale del cuadrante.",
      errors,
    });
  },
};

export const fisVecAngulo: Generator = {
  id: "fis-vec-angulo",
  topicId: "t-vec-componentes",
  description: "Ángulo de un vector con +x (corrigiendo el cuadrante) o con +y",
  generate(seed, d) {
    const r = rng(seed);
    let vx = r.int(1, 9);
    let vy = r.int(1, 9);
    if (vx === vy) vy = vx + 1;
    if (d >= 3) {
      const q = r.pick([2, 3, 4, d >= 4 ? 1 : 3]);
      if (q === 2 || q === 3) vx = -vx;
      if (q === 3 || q === 4) vy = -vy;
    }
    const mod = Math.hypot(vx, vy);
    const withY = d >= 5 && r.bool();
    const raw = toDeg(Math.atan(vy / vx));
    const theta = norm360(toDeg(Math.atan2(vy, vx)));
    if (withY) {
      const ang = toDeg(Math.acos(vy / mod));
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "°", answer: ang,
        prompt: `Dado $V = ${vec(vx, vy)}$ N, ¿qué ángulo forma $V$ con el semieje +y? (entre 0° y 180°)`,
        hints: [
          "Dibujá el vector y marcá el semieje +y.",
          "El ángulo con +y sale de cos α = V_y / |V| (el coseno va con la componente sobre el eje de referencia).",
          `|V| = √(${vx}² + ${vy}²) = ${s3(mod)}; α = arccos(${vy} / ${s3(mod)}).`,
        ],
        solution: [`|V| = √(${vx * vx} + ${vy * vy}) = ${s3(mod)} N`, `cos α = ${vy} / ${s3(mod)}`, `α = ${s3(ang)}°`],
        explanation: "El ángulo con un eje se obtiene con el coseno director: cos α = (componente sobre ese eje)/|V|. Así no hay que corregir cuadrantes.",
        errors: [
          [theta, "vectores", "Ese es el ángulo con +x, no con +y."],
          [Math.abs(toDeg(Math.atan(vx / vy))), "trigonometria", "Calculaste un ángulo del triángulo sin ubicarlo respecto de +y. Usá cos α = V_y/|V|, que da directamente el ángulo con +y entre 0° y 180°."],
          [Math.abs(raw), "trigonometria", "Ese es el ángulo agudo con el eje x. Te piden el ángulo con el semieje +y."],
        ],
        visual: { type: "vector", vectors: [{ x: vx, y: vy, label: "V" }] },
      });
    }
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "°", answer: theta,
      prompt: `Dado $V = ${vec(vx, vy)}$ N, ¿qué ángulo forma con el semieje +x, medido en sentido antihorario (entre 0° y 360°)?`,
      hints: [
        "Primero ubicá el cuadrante mirando los signos de las componentes.",
        "La calculadora da arctg(V_y/V_x) entre −90° y 90°: solo sirve tal cual en el primer y cuarto cuadrante.",
        vx < 0 ? "Como V_x < 0, el vector está en el 2.º o 3.º cuadrante: sumale 180° a lo que da la calculadora." : vy < 0 ? "Está en el 4.º cuadrante: sumale 360° al resultado negativo de la calculadora." : "Está en el 1.er cuadrante: arctg(V_y/V_x) ya es el ángulo.",
      ],
      solution: [
        `arctg(${vy} / ${vx}) = ${s3(raw)}°`,
        vx < 0 ? `V_x < 0 → θ = ${s3(raw)}° + 180°` : vy < 0 ? `4.º cuadrante → θ = ${s3(raw)}° + 360°` : "1.er cuadrante: no hay corrección",
        `θ = ${s3(theta)}°`,
      ],
      explanation: "arctg no distingue (3; 4) de (−3; −4). Por eso, con V_x < 0 hay que sumar 180°, y en el 4.º cuadrante, 360°.",
      errors: [
        [raw, "trigonometria", "Es lo que da la calculadora, pero arctg no ve el cuadrante. Mirá los signos: con V_x < 0 hay que sumar 180°."],
        [Math.abs(raw), "trigonometria", "Ese es el ángulo agudo del triángulo, no el ángulo medido desde +x. Corregí según el cuadrante."],
        [toDeg(Math.atan2(vx, vy)), "vectores", "Invertiste las componentes: la tangente es V_y / V_x."],
        [norm360(theta + 180), "vectores", "Te quedó el ángulo del vector opuesto (le sumaste 180° de más)."],
      ],
      visual: { type: "vector", vectors: [{ x: vx, y: vy, label: "V" }] },
    });
  },
};

export const fisVecResta: Generator = {
  id: "fis-vec-resta",
  topicId: "t-vec-operaciones",
  description: "Resta B − A por componentes y su módulo",
  generate(seed, d) {
    const r = rng(seed);
    const A = [r.nz(-7, 7), r.nz(-7, 7)];
    let B = [r.nz(-7, 7), r.nz(-7, 7)];
    if (B[0] === A[0] && B[1] === A[1]) B = [A[0] + 3, A[1] - 2];
    const D = [B[0] - A[0], B[1] - A[1]];
    if (d <= 2 || (d === 3 && r.bool())) {
      const S = [A[0] + B[0], A[1] + B[1]];
      return choice(
        r,
        cbase(this.id, seed, d, this.topicId,
          `Dados $A = ${vec(A[0], A[1])}$ N y $B = ${vec(B[0], B[1])}$ N, ¿cuánto vale $B − A$?`,
          ["Restar es componente a componente: x con x, y con y.", "Ojo con el orden: es B menos A (al vector B le sacás A).", `x: ${B[0]} − (${A[0]}); y: ${B[1]} − (${A[1]}).`],
          [`x: ${B[0]} − (${A[0]}) = ${D[0]}`, `y: ${B[1]} − (${A[1]}) = ${D[1]}`, `B − A = ${vec(D[0], D[1])} N`],
          "B − A = (B_x − A_x; B_y − A_y). Es el vector que va desde la punta de A hasta la punta de B.",
          { type: "vector", vectors: [{ x: A[0], y: A[1], label: "A" }, { x: B[0], y: B[1], label: "B" }, { x: D[0], y: D[1], label: "B−A" }] },
        ),
        [
          { text: `${vec(D[0], D[1])} N`, correct: true },
          { text: `${vec(-D[0], -D[1])} N`, error: { type: "signos", message: "Calculaste A − B. El orden importa: B − A es el opuesto de A − B." } },
          { text: `${vec(S[0], S[1])} N`, error: { type: "vectores", message: "Sumaste en lugar de restar. Restar A es sumar −A: cambiá el signo de cada componente de A." } },
          { text: `${vec(B[0] - A[1], B[1] - A[0])} N`, error: { type: "vectores", message: "Mezclaste componentes: la x de B se opera con la x de A, y la y con la y." } },
        ],
      );
    }
    const mod = Math.hypot(D[0], D[1]);
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: mod,
      prompt: `Dados $A = ${vec(A[0], A[1])}$ N y $B = ${vec(B[0], B[1])}$ N, calculá el módulo de $B − A$.`,
      hints: ["Primero obtené el vector B − A componente a componente.", `B − A = (${B[0]} − (${A[0]}); ${B[1]} − (${A[1]})) = ${vec(D[0], D[1])}.`, "El módulo sale con Pitágoras: √(x² + y²)."],
      solution: [`B − A = ${vec(D[0], D[1])} N`, `|B − A| = √(${D[0]}² + ${D[1]}²) = √${D[0] ** 2 + D[1] ** 2}`, `|B − A| = ${s3(mod)} N`],
      explanation: "El módulo de una diferencia NO es la diferencia de módulos: primero se resta por componentes y después se aplica Pitágoras.",
      errors: [
        [Math.hypot(A[0] + B[0], A[1] + B[1]), "vectores", "Ese es el módulo de A + B. Para restar, cambiá el signo de las componentes de A."],
        [Math.abs(Math.hypot(B[0], B[1]) - Math.hypot(A[0], A[1])), "vectores", "Restaste los módulos. |B − A| ≠ |B| − |A|: primero restá por componentes."],
        [D[0] ** 2 + D[1] ** 2, "calculo", "Te faltó la raíz cuadrada."],
      ],
    });
  },
};

export const fisVecEquilibrante: Generator = {
  id: "fis-vec-equilibrante",
  topicId: "t-vec-operaciones",
  description: "Resultante y equilibrante de un sistema de fuerzas",
  generate(seed, d) {
    const r = rng(seed);
    if (d <= 3) {
      const k = d === 1 ? 2 : 3;
      const F = Array.from({ length: k }, () => [r.int(-8, 8), r.int(-8, 8)]);
      const R = [F.reduce((s, f) => s + f[0], 0), F.reduce((s, f) => s + f[1], 0)];
      if (R[0] === 0 && R[1] === 0) {
        F[0][0] += 4;
        R[0] += 4;
      }
      const names = F.map((f, i) => `$F_${i + 1} = ${vec(f[0], f[1])}$ N`).join(", ");
      return choice(
        r,
        cbase(this.id, seed, d, this.topicId,
          `Sobre un cuerpo actúan ${names}. ¿Qué fuerza hay que agregar para que quede en equilibrio (la equilibrante)?`,
          ["Primero calculá la resultante R sumando por componentes.", "En equilibrio la suma de TODAS las fuerzas es cero: R + E = 0.", `R = ${vec(R[0], R[1])}, así que E = −R.`],
          [`R = ${vec(R[0], R[1])} N`, "E = −R", `E = ${vec(-R[0], -R[1])} N`],
          "La equilibrante tiene el mismo módulo que la resultante y sentido opuesto: E = −R.",
        ),
        [
          { text: `${vec(-R[0], -R[1])} N`, correct: true },
          { text: `${vec(R[0], R[1])} N`, error: { type: "vectores", message: "Esa es la resultante. La equilibrante es la que la anula: E = −R." } },
          { text: `${vec(-R[0], R[1])} N`, error: { type: "signos", message: "Cambiaste el signo de una sola componente. E = −R: cambian las dos." } },
          { text: `${vec(R[0], -R[1])} N`, error: { type: "signos", message: "Cambiaste el signo de una sola componente. E = −R: cambian las dos." } },
        ],
      );
    }
    const m1 = r.pick([20, 30, 40, 50, 60]);
    const m2 = r.pick([25, 35, 45, 70, 80]);
    const a1 = r.pick([0, 15, 30, 40, 60]);
    const a2 = r.pick([100, 120, 135, 150, 210, 240]);
    const Rx = m1 * cosD(a1) + m2 * cosD(a2);
    const Ry = m1 * sinD(a1) + m2 * sinD(a2);
    const R = Math.hypot(Rx, Ry);
    const angE = norm360(toDeg(Math.atan2(-Ry, -Rx)));
    const angR = norm360(toDeg(Math.atan2(Ry, Rx)));
    const askAng = d >= 5 && r.bool();
    const prompt = `Dos fuerzas actúan sobre un objeto: $F_1$ = ${m1} N a ${a1}° de +x y $F_2$ = ${m2} N a ${a2}° de +x (ángulos medidos en sentido antihorario). ${askAng ? "¿Qué ángulo forma la equilibrante con +x (entre 0° y 360°)?" : "¿Cuál es el módulo de la equilibrante?"}`;
    const sol = [
      `R_x = ${m1}·cos ${a1}° + ${m2}·cos ${a2}° = ${s3(Rx)} N`,
      `R_y = ${m1}·sen ${a1}° + ${m2}·sen ${a2}° = ${s3(Ry)} N`,
      `E = −R = (${s3(-Rx)}; ${s3(-Ry)}) N`,
      askAng ? `θ_E = ${s3(angE)}°` : `|E| = |R| = ${s3(R)} N`,
    ];
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: askAng ? "°" : "N", answer: askAng ? angE : R,
      prompt,
      hints: ["Descomponé cada fuerza: F_x = F·cos θ, F_y = F·sen θ.", "Sumá las x por un lado y las y por el otro: eso es la resultante R.", askAng ? "La equilibrante es −R: apunta al revés, su ángulo es el de R más (o menos) 180°." : "La equilibrante tiene el mismo módulo que R: |E| = √(R_x² + R_y²)."],
      solution: sol,
      explanation: "La equilibrante anula la resultante: mismo módulo, misma dirección, sentido opuesto (ángulo de R ± 180°).",
      errors: askAng
        ? [[angR, "vectores", "Ese es el ángulo de la resultante. La equilibrante apunta al revés: sumale o restale 180°."], [toDeg(Math.atan(Ry / Rx)), "trigonometria", "Es lo que da arctg sin corregir el cuadrante. Mirá los signos de E_x y E_y."]]
        : [[m1 + m2, "vectores", "Sumaste los módulos como si fueran números. Las fuerzas se suman por componentes."], [Math.abs(m1 - m2), "vectores", "Restaste los módulos. Hay que descomponer cada fuerza y sumar por componentes."]],
    });
  },
};

export const fisVecProductoVectorial: Generator = {
  id: "fis-vec-producto-vectorial",
  topicId: "t-vec-operaciones",
  description: "Producto vectorial en el plano: (A×B)z = Ax·By − Ay·Bx",
  generate(seed, d) {
    const r = rng(seed);
    if (d <= 4) {
      const A = [r.nz(-6, 7), r.nz(-6, 7)];
      const B = [r.nz(-6, 7), r.nz(-6, 7)];
      let z = A[0] * B[1] - A[1] * B[0];
      if (z === 0) { B[0] += 1; z = A[0] * B[1] - A[1] * B[0]; }
      const swap = d >= 3 && r.bool();
      const [P, Q] = swap ? [B, A] : [A, B];
      const ans = P[0] * Q[1] - P[1] * Q[0];
      const lbl = swap ? "B × A" : "A × B";
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "N²", answer: ans,
        prompt: `Dados $A = ${vec(A[0], A[1])}$ N y $B = ${vec(B[0], B[1])}$ N (en el plano xy), calculá la componente z de $${lbl}$.`,
        hints: ["El producto vectorial de dos vectores del plano apunta en z (perpendicular al plano).", "(P × Q)_z = P_x·Q_y − P_y·Q_x: «cruzado y restado».", `Con ${lbl}: ${P[0]}·(${Q[1]}) − (${P[1]})·(${Q[0]}).`],
        solution: [`(${lbl})_z = ${P[0]}·(${Q[1]}) − (${P[1]})·(${Q[0]})`, `= ${P[0] * Q[1]} − (${P[1] * Q[0]})`, `= ${ans} N²`],
        explanation: "El producto vectorial da un VECTOR perpendicular al plano; su componente z es P_x·Q_y − P_y·Q_x. No es conmutativo: B × A = −(A × B).",
        errors: [
          [P[0] * Q[0] + P[1] * Q[1], "vectores", "Calculaste el producto ESCALAR (x con x, y con y). El vectorial es cruzado: P_x·Q_y − P_y·Q_x."],
          [-ans, "signos", `Calculaste ${swap ? "A × B" : "B × A"}. El orden importa: invertirlo cambia el signo.`],
          [P[0] * Q[1] + P[1] * Q[0], "signos", "Sumaste los productos cruzados. Es una RESTA: P_x·Q_y − P_y·Q_x."],
        ],
      });
    }
    const a = r.pick([4, 5, 6, 8, 10]);
    const b = r.pick([3, 5, 7, 9, 12]);
    const ta = r.pick([0, 20, 30, 45]);
    let tb = r.pick([70, 100, 120, 150, 200]);
    if ((tb - ta) % 180 === 0) tb += 40;
    const z = a * b * sinD(tb - ta);
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N²", answer: z,
      prompt: `$|A|$ = ${a} N forma ${ta}° con +x y $|B|$ = ${b} N forma ${tb}° con +x. Calculá $(A × B)_z$.`,
      hints: ["Podés descomponer cada vector y usar A_x·B_y − A_y·B_x.", "Atajo: (A × B)_z = |A|·|B|·sen(θ_B − θ_A).", `θ_B − θ_A = ${tb - ta}°.`],
      solution: [`θ_B − θ_A = ${tb - ta}°`, `(A × B)_z = ${a}·${b}·sen ${tb - ta}°`, `= ${s3(z)} N²`],
      explanation: "|A × B| = |A||B| sen φ: el producto vectorial «mide» la parte perpendicular. El signo indica el sentido de giro de A hacia B.",
      errors: [
        [a * b * cosD(tb - ta), "trigonometria", "Usaste coseno: eso es el producto escalar. El vectorial lleva seno del ángulo entre los vectores."],
        [-z, "signos", "Te quedó el signo de B × A. Con ángulo θ_B − θ_A, el signo sale solo."],
        [a * b, "vectores", "Falta el seno del ángulo entre los vectores."],
      ],
    });
  },
};

// ═══════════════════════════ Unidad 2: MRU / MRUV ═══════════════════════════

export const fisMruEncuentro: Generator = {
  id: "fis-mru-encuentro",
  topicId: "t-encuentro",
  description: "Encuentro de dos móviles en MRU (mismo sentido o sentidos opuestos)",
  generate(seed, d) {
    const r = rng(seed);
    const same = d <= 2 ? true : d === 3 ? false : r.bool();
    const vA = r.pick([60, 72, 80, 90, 100, 110]);
    const vB = same ? vA - r.pick([15, 20, 25, 30, 35]) : r.pick([40, 50, 60, 70, 85]);
    const d0 = r.pick([30, 45, 60, 75, 84, 120, 150]);
    const t = same ? d0 / (vA - vB) : d0 / (vA + vB);
    const xe = vA * t;
    const ask = d <= 1 ? "t" : r.pick(d >= 5 ? (["t", "x", "min"] as const) : (["t", "x"] as const));
    const relTxt = same ? `${vA} − ${vB}` : `${vA} + ${vB}`;
    const tWrong = same ? d0 / (vA + vB) : d0 / (vA - vB);
    const scen = same
      ? `Un auto pasa por el km 0 de una ruta a ${vA} km/h. En ese mismo instante, un camión que va en el mismo sentido a ${vB} km/h pasa por el km ${d0}.`
      : `Dos ciudades están separadas por ${d0} km. Un auto sale de la ciudad A hacia B a ${vA} km/h y, en el mismo instante, una camioneta sale de B hacia A a ${vB} km/h.`;
    const q = ask === "t" ? "¿Cuánto tiempo después se encuentran? (en horas)" : ask === "min" ? "¿Cuántos minutos después se encuentran?" : `¿A qué distancia del ${same ? "km 0" : "punto de partida del auto"} se encuentran?`;
    const sol = [
      same ? `x_A = ${vA}·t,  x_B = ${d0} + ${vB}·t` : `x_A = ${vA}·t,  x_B = ${d0} − ${vB}·t`,
      `Encuentro: x_A = x_B → t = ${d0} / (${relTxt}) = ${s3(t)} h`,
      ...(ask === "min" ? [`t = ${s3(t)} h · 60 = ${s3(t * 60)} min`] : ask === "x" ? [`x = ${vA} · ${s3(t)} = ${s3(xe)} km`] : []),
    ];
    const tErr: Err = [same ? tWrong : tWrong, "conceptual", same ? "Sumaste las velocidades. Si van en el MISMO sentido, el auto descuenta la ventaja a razón de v_A − v_B." : "Restaste las velocidades. Si van uno hacia el otro, la distancia se acorta a razón de v_A + v_B."];
    const errors: Err[] =
      ask === "t" ? [tErr, [d0 / vA, "conceptual", "Calculaste cuánto tarda el auto en llegar a donde ESTABA el otro, pero el otro también se movió."]]
      : ask === "min" ? [[t, "unidades", "Ese es el tiempo en horas: multiplicá por 60."], [Math.floor(t) * 60 + Math.round((t % 1) * 100), "unidades", "Leíste los decimales de la hora como minutos: 0,5 h son 30 min, no 50 min. Multiplicá por 60."], [tErr[0] * 60, tErr[1], tErr[2]]]
      : [[same ? vB * t : vB * t, "conceptual", same ? "Calculaste cuánto avanzó el camión, pero partió del km " + d0 + ": su posición es " + d0 + " + v_B·t." : "Esa es la distancia que recorrió la camioneta, no la que recorrió el auto desde A."], [vA * tWrong, tErr[1], tErr[2]]];
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: ask === "x" ? "km" : ask === "min" ? "min" : "h", answer: ask === "x" ? xe : ask === "min" ? t * 60 : t,
      prompt: `${scen} ${q}`,
      hints: [
        "Escribí la ecuación de posición de cada uno con el mismo origen y el mismo sentido positivo.",
        same ? `x_A = ${vA}·t y x_B = ${d0} + ${vB}·t. Se encuentran cuando x_A = x_B.` : `x_A = ${vA}·t y x_B = ${d0} − ${vB}·t (la camioneta va hacia el origen). Igualalas.`,
        `t = ${d0} / (${relTxt})${ask === "x" ? "; después reemplazá t en x_A." : ask === "min" ? "; pasalo a minutos." : "."}`,
      ],
      solution: sol,
      explanation: "En un encuentro las POSICIONES son iguales (no las distancias recorridas). Con las ecuaciones x(t) de ambos en el mismo sistema de referencia, se iguala y se despeja t.",
      errors,
    });
  },
};

export const fisMruDesfase: Generator = {
  id: "fis-mru-desfase",
  topicId: "t-encuentro",
  description: "Desfase de llegada (o de salida) entre dos móviles en MRU",
  generate(seed, d) {
    const r = rng(seed);
    const dist = r.pick([120, 150, 180, 240, 300, 360]);
    const v1 = r.pick([90, 100, 110, 120]);
    const v2 = v1 - r.pick([10, 20, 30, 40]);
    const dt = dist / v2 - dist / v1;
    const late = d >= 4 && r.bool();
    const prompt = late
      ? `Un micro (${v2} km/h) y un auto (${v1} km/h) hacen el mismo viaje de ${dist} km. Si quieren llegar juntos, ¿cuántos minutos antes que el auto tiene que salir el micro?`
      : `Un micro a ${v2} km/h y un auto a ${v1} km/h salen juntos para recorrer ${dist} km en MRU. ¿Cuántos minutos antes llega el auto?`;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "min", answer: dt * 60,
      prompt,
      hints: ["Calculá cuánto tarda cada uno: t = d / v.", `t_micro = ${dist}/${v2} h y t_auto = ${dist}/${v1} h.`, "Restá los tiempos y pasá a minutos (· 60)."],
      solution: [`t_micro = ${dist} / ${v2} = ${s3(dist / v2)} h`, `t_auto = ${dist} / ${v1} = ${s3(dist / v1)} h`, `Δt = ${s3(dt)} h = ${s3(dt * 60)} min`],
      explanation: "El desfase es la diferencia entre los tiempos de viaje, d/v_lento − d/v_rápido. No se puede hacer d/(v₁ − v₂): eso no es el tiempo de nada en este problema.",
      errors: [
        [dt, "unidades", "Ese es el desfase en horas. Te lo piden en minutos: multiplicá por 60."],
        [(dist / (v1 - v2)) * 60, "conceptual", "Dividiste la distancia por la diferencia de velocidades. Calculá cada tiempo por separado y restalos."],
        [Math.floor(dt) * 60 + Math.round((dt % 1) * 100), "unidades", "Leíste los decimales de la hora como minutos. 0,25 h = 15 min (se multiplica por 60)."],
      ],
    });
  },
};

export const fisFrenado: Generator = {
  id: "fis-frenado",
  topicId: "t-frenado",
  description: "Tiempo de reacción y frenado (MRU + MRUV)",
  generate(seed, d) {
    const r = rng(seed);
    const kmh = r.pick([54, 72, 90, 108]);
    const v = kmh / 3.6;
    const tr = r.pick([0.5, 0.7, 0.8, 1, 1.2, 1.5]);
    const tf = r.pick([3, 4, 5, 6]);
    const ask = d <= 2 ? "a" : d <= 4 ? "total" : r.pick(["total", "tf"] as const);
    if (ask === "a") {
      const a = v / tf;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s²", answer: a,
        prompt: `Un auto va a ${kmh} km/h y frena con aceleración constante hasta detenerse en ${tf} s. ¿Cuál es el módulo de su aceleración?`,
        hints: ["Pasá la velocidad a m/s (÷ 3,6).", "En el frenado: 0 = v₀ + a·t.", `|a| = v₀ / t = ${n(v)} / ${tf}.`],
        solution: [`v₀ = ${kmh} / 3,6 = ${n(v)} m/s`, `0 = ${n(v)} + a·${tf}`, `a = −${s3(v / tf)} m/s² → |a| = ${s3(a)} m/s²`],
        explanation: "Frenar hasta detenerse significa pasar de v₀ a 0: |a| = v₀/t. La velocidad tiene que estar en m/s para que a salga en m/s².",
        errors: [[kmh / tf, "unidades", "No pasaste los km/h a m/s. Dividí por 3,6 antes de operar."], [v * tf, "despeje", "Multiplicaste: a = v₀ / t."]],
      });
    }
    if (ask === "total") {
      const dist = v * tr + (v / 2) * tf;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: dist,
        prompt: `Un conductor va a ${kmh} km/h y ve un obstáculo. Tarda ${n(tr)} s en reaccionar (sigue a velocidad constante) y luego frena uniformemente hasta detenerse en ${tf} s. ¿Qué distancia recorre desde que ve el obstáculo hasta que se detiene?`,
        hints: ["Son dos tramos: MRU mientras reacciona y MRUV mientras frena.", `Tramo 1: d₁ = v·t_r. Tramo 2: velocidad media (v + 0)/2 por ${tf} s.`, `v = ${kmh}/3,6 = ${n(v)} m/s.`],
        solution: [`v = ${n(v)} m/s`, `d₁ = ${n(v)} · ${n(tr)} = ${s3(v * tr)} m`, `d₂ = (${n(v)}/2) · ${tf} = ${s3((v / 2) * tf)} m`, `d = ${s3(dist)} m`],
        explanation: "Durante el tiempo de reacción NO frena: avanza en MRU. Recién después empieza el MRUV, en el que la distancia es la velocidad media (v₀/2) por el tiempo.",
        errors: [
          [(v / 2) * tf, "conceptual", "Te olvidaste del tramo de reacción: durante ese tiempo el auto sigue a velocidad constante."],
          [v * (tr + tf), "velocidad-aceleracion", "Usaste la velocidad inicial en todo el frenado, pero mientras frena la velocidad baja: la distancia es (v₀/2)·t_f."],
          [(kmh * tr + (kmh / 2) * tf), "unidades", "Operaste en km/h con segundos. Pasá la velocidad a m/s."],
        ],
      });
    }
    // distancia de frenado dada → aceleración y tiempo total
    const df = r.pick([30, 40, 50, 60, 80]);
    const a = (v * v) / (2 * df);
    const tTot = tr + v / a;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: tTot,
      prompt: `Un auto a ${kmh} km/h necesita ${df} m para detenerse una vez que empieza a frenar (aceleración constante). Si el conductor tarda ${n(tr)} s en reaccionar, ¿cuánto tiempo pasa desde que ve el peligro hasta que el auto se detiene?`,
      hints: ["Con la distancia de frenado sacá la aceleración: 0 = v₀² − 2·|a|·d.", `|a| = v₀²/(2d) con v₀ = ${n(v)} m/s.`, "Tiempo de frenado t_f = v₀/|a|; sumale el de reacción."],
      solution: [`v₀ = ${n(v)} m/s`, `|a| = ${n(v)}² / (2·${df}) = ${s3(a)} m/s²`, `t_f = ${n(v)} / ${s3(a)} = ${s3(v / a)} s`, `t = ${n(tr)} + ${s3(v / a)} = ${s3(tTot)} s`],
      explanation: "La ecuación sin tiempo (v² = v₀² + 2aΔx) da la aceleración; con ella sale el tiempo de frenado. El tiempo total suma la reacción.",
      errors: [[v / a, "conceptual", "Ese es solo el tiempo de frenado. Falta sumarle el tiempo de reacción."], [tr + df / v, "velocidad-aceleracion", "Calculaste el frenado como si fuera a velocidad constante. Mientras frena la velocidad media es v₀/2."]],
    });
  },
};

export const fisPersecucion: Generator = {
  id: "fis-persecucion",
  topicId: "t-frenado",
  description: "Persecución: móvil en MRU vs. móvil que parte del reposo en MRUV",
  generate(seed, d) {
    const r = rng(seed);
    const v = r.pick([12, 15, 18, 20, 25]);
    const a = r.pick([1.5, 2, 2.5, 3, 4]);
    if (d >= 5) {
      const td = r.pick([1, 2, 3]);
      // ½a(t − td)² = v t → ½a t² − (a td + v) t + ½ a td² = 0
      const A = a / 2, B = -(a * td + v), C = (a * td * td) / 2;
      const disc = B * B - 4 * A * C;
      const t = (-B + Math.sqrt(disc)) / (2 * A);
      const other = (-B - Math.sqrt(disc)) / (2 * A);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: t,
        prompt: `Una moto pasa a ${v} m/s constante frente a un patrullero detenido. El patrullero arranca ${td} s después, con aceleración constante de ${n(a)} m/s². ¿Cuánto tiempo después de que pasó la moto la alcanza?`,
        hints: ["Tomá t = 0 cuando pasa la moto: x_moto = v·t.", `El patrullero arranca en t = ${td}: x_pat = ½·${n(a)}·(t − ${td})².`, "Igualá y resolvé la cuadrática con la resolvente; quedate con la raíz mayor que el retraso."],
        solution: [`${v}·t = ½·${n(a)}·(t − ${td})²`, `${n(A)}t² − ${n(-B)}t + ${n(C)} = 0`, `t = ${s3(t)} s (la otra raíz, ${s3(other)} s, es anterior a la salida del patrullero)`],
        explanation: "Si los móviles no arrancan juntos, el que sale después tiene (t − t_salida) en su ecuación. La resolvente da dos raíces: solo sirve la que es posterior a la salida.",
        errors: [[(2 * v) / a, "conceptual", "Ese sería el encuentro si arrancaran juntos. El patrullero sale más tarde: su ecuación lleva (t − t_salida)."], [other, "conceptual", "Esa raíz es anterior a que arranque el patrullero: no tiene sentido físico."], [(2 * v) / a + td, "conceptual", "No alcanza con sumar el retraso: mientras tanto la moto se alejó más. Planteá la ecuación completa."]],
      });
    }
    const t = (2 * v) / a;
    const ask = d <= 2 ? "t" : r.pick(["t", "x", "v"] as const);
    const val = ask === "t" ? t : ask === "x" ? v * t : a * t;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: ask === "t" ? "s" : ask === "x" ? "m" : "m/s", answer: val,
      prompt: `Un auto pasa a ${v} m/s constante junto a una moto detenida. En ese instante la moto arranca con aceleración constante de ${n(a)} m/s². ${ask === "t" ? "¿Cuánto tarda en alcanzarlo?" : ask === "x" ? "¿Qué distancia recorrieron hasta el encuentro?" : "¿Qué velocidad tiene la moto al alcanzar al auto?"}`,
      hints: ["x_auto = v·t (MRU); x_moto = ½·a·t² (MRUV desde el reposo).", `Igualá: ${v}·t = ½·${n(a)}·t². Sacá factor común t.`, `t = 2·${v}/${n(a)}${ask === "t" ? "." : ask === "x" ? "; después x = v·t." : "; después v_moto = a·t."}`],
      solution: [`${v}·t = ½·${n(a)}·t²`, `t = 2·${v} / ${n(a)} = ${s3(t)} s`, ...(ask === "x" ? [`x = ${v}·${s3(t)} = ${s3(v * t)} m`] : ask === "v" ? [`v_moto = ${n(a)}·${s3(t)} = ${s3(a * t)} m/s`] : [])],
      explanation: "La solución t = 0 es el instante en que están juntos al principio; la otra es el encuentro. Curiosidad: la moto alcanza al auto yendo justo al doble de velocidad.",
      errors: ask === "t"
        ? [[v / a, "velocidad-aceleracion", "Ese es el instante en que tienen la MISMA VELOCIDAD (cuando están más separados), no el encuentro. Igualá posiciones."], [Math.sqrt((2 * v) / a), "despeje", "Al despejar, t² / t = t: no hace falta raíz."]]
        : ask === "x" ? [[(v * v) / a, "velocidad-aceleracion", "Usaste el tiempo en que igualan velocidades (v/a). El encuentro es en t = 2v/a."], [(v * v) / (2 * a), "conceptual", "Calculaste con t = v/a. Igualá posiciones, no velocidades."]]
        : [[v, "velocidad-aceleracion", "Igualaste velocidades. La moto llega al encuentro más rápida que el auto: v = a·t con t = 2v/a."]],
    });
  },
};

/** Expresión de una poligonal que pasa por los puntos dados (suma de valores absolutos). */
function polyline(pts: [number, number][]): string {
  const slopes = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / (p[0] - pts[i][0]));
  const inner = pts.slice(1, -1).map((p, i) => [p[0], slopes[i + 1] - slopes[i]] as const);
  const B = slopes[0] + inner.reduce((s, [, dm]) => s + dm / 2, 0);
  const A = pts[0][1] - B * pts[0][0] - inner.reduce((s, [x, dm]) => s + (dm / 2) * Math.abs(pts[0][0] - x), 0);
  return [`${A}`, `${B}*x`, ...inner.map(([x, dm]) => `${dm / 2}*abs(x - ${x})`)].join(" + ");
}

export const fisGraficoVt: Generator = {
  id: "fis-grafico-vt",
  topicId: "t-graficos-vt",
  description: "Gráfico velocidad–tiempo: pendiente (aceleración) y área (desplazamiento)",
  generate(seed, d) {
    const r = rng(seed);
    const v0 = d <= 2 ? 0 : r.pick([0, 2, 4, 6]);
    const v1 = v0 + r.pick([6, 8, 10, 12]);
    const t1 = r.pick([2, 3, 4, 5]);
    const t2 = t1 + r.pick([3, 4, 5, 6]);
    const t3 = t2 + r.pick([2, 3, 4]);
    const pts: [number, number][] = [[0, v0], [t1, v1], [t2, v1], [t3, 0]];
    const visual = { type: "plot" as const, functions: [polyline(pts)], xRange: [0, t3] as [number, number], yRange: [0, v1 + 2] as [number, number], points: pts };
    const desc = `El gráfico v–t de un móvil está formado por segmentos rectos que unen los puntos (0 s; ${v0} m/s), (${t1} s; ${v1} m/s), (${t2} s; ${v1} m/s) y (${t3} s; 0 m/s).`;
    const areas = [((v0 + v1) / 2) * t1, v1 * (t2 - t1), (v1 / 2) * (t3 - t2)];
    const total = areas[0] + areas[1] + areas[2];
    const mode = d <= 2 ? r.pick(["a1", "d1"] as const) : d <= 4 ? r.pick(["a3", "dtot", "d1"] as const) : r.pick(["dtot", "vm", "a3"] as const);
    if (mode === "a1" || mode === "a3") {
      const a = mode === "a1" ? (v1 - v0) / t1 : -v1 / (t3 - t2);
      const [ta, tb, va, vb] = mode === "a1" ? [0, t1, v0, v1] : [t2, t3, v1, 0];
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s²", answer: a,
        prompt: `${desc} ¿Cuál es la aceleración entre ${ta} s y ${tb} s (con su signo)?`,
        hints: ["En un gráfico v–t, la aceleración es la PENDIENTE.", "Pendiente = Δv / Δt.", `a = (${vb} − ${va}) / (${tb} − ${ta}).`],
        solution: [`a = (${vb} − ${va}) / (${tb} − ${ta})`, `a = ${s3(a)} m/s²`],
        explanation: "En el gráfico v–t la pendiente es la aceleración y el área bajo la curva es el desplazamiento.",
        errors: [[vb / tb, "velocidad-aceleracion", "Dividiste una velocidad por un instante. La pendiente usa VARIACIONES: Δv/Δt."], [(vb - va) * (tb - ta), "conceptual", "Multiplicaste Δv·Δt (eso tiene unidades de distancia). La aceleración es Δv/Δt."], ...(mode === "a1" && va !== 0 ? [[vb / (tb - ta), "velocidad-aceleracion", "Te faltó restar la velocidad inicial: Δv = v_final − v_inicial."] as Err] : [])],
        visual,
      });
    }
    if (mode === "d1") {
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: areas[0],
        prompt: `${desc} ¿Qué distancia recorre en los primeros ${t1} s?`,
        hints: ["En un gráfico v–t, la distancia recorrida es el ÁREA bajo la curva.", v0 === 0 ? "Entre 0 y t₁ la figura es un triángulo." : "Entre 0 y t₁ la figura es un trapecio (o rectángulo + triángulo).", v0 === 0 ? `Área = base·altura/2 = ${t1}·${v1}/2.` : `Área = (${v0} + ${v1})/2 · ${t1}.`],
        solution: [`Área = (${v0} + ${v1}) / 2 · ${t1}`, `d = ${s3(areas[0])} m`],
        explanation: "El área bajo el gráfico v–t es v·t «sumado» instante a instante: el desplazamiento.",
        errors: [[v1 * t1, "conceptual", "Usaste el rectángulo de altura v_final, pero la velocidad fue aumentando: el área es un trapecio/triángulo."], [(v1 - v0) / t1, "conceptual", "Calculaste la pendiente (aceleración). La distancia es el ÁREA."]],
        visual,
      });
    }
    if (mode === "dtot") {
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: total,
        prompt: `${desc} ¿Qué distancia recorre en total?`,
        hints: ["Distancia = área bajo el gráfico v–t.", "Partí el área en tres figuras: trapecio (o triángulo), rectángulo y triángulo.", `Áreas: ${s3(areas[0])} + ${s3(areas[1])} + ${s3(areas[2])}.`],
        solution: [`Tramo 1: (${v0} + ${v1})/2 · ${t1} = ${s3(areas[0])} m`, `Tramo 2: ${v1} · ${t2 - t1} = ${s3(areas[1])} m`, `Tramo 3: ${v1} · ${t3 - t2} / 2 = ${s3(areas[2])} m`, `Total = ${s3(total)} m`],
        explanation: "Se suman las áreas de cada tramo. En los tramos con aceleración la figura no es un rectángulo.",
        errors: [[v1 * t3, "conceptual", "Tomaste un único rectángulo de altura máxima. Los tramos de aceleración y frenado son trapecios o triángulos."], [areas[1], "conceptual", "Solo sumaste el tramo de velocidad constante. Faltan las áreas de aceleración y frenado."]],
        visual,
      });
    }
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "m/s", answer: total / t3,
      prompt: `${desc} ¿Cuál es la velocidad media en los ${t3} s?`,
      hints: ["v_media = desplazamiento total / tiempo total.", "El desplazamiento es el área bajo el gráfico.", `Área total = ${s3(total)} m.`],
      solution: [`Δx = ${s3(areas[0])} + ${s3(areas[1])} + ${s3(areas[2])} = ${s3(total)} m`, `v_m = ${s3(total)} / ${t3} = ${s3(total / t3)} m/s`],
      explanation: "La velocidad media NO es el promedio de las velocidades: es Δx/Δt.",
      errors: [[(v0 + v1 + v1 + 0) / 4, "conceptual", "Promediaste las velocidades de los puntos. La velocidad media es Δx/Δt."], [v1 / 2, "conceptual", "La velocidad media es el área total dividida por el tiempo total."]],
      visual,
    });
  },
};

// ═══════════════════════════ Unidad 2d: tiro oblicuo ═══════════════════════════

export const fisTiroOblicuo: Generator = {
  id: "fis-tiro-oblicuo",
  topicId: "t-tiro-oblicuo",
  description: "Tiro oblicuo desde el suelo: altura máxima, tiempo de vuelo, alcance",
  generate(seed, d) {
    const r = rng(seed);
    const v0 = r.pick([15, 20, 25, 30, 35, 40, 50]);
    const th = r.pick([20, 25, 30, 35, 40, 50, 55, 60, 65]);
    const vx = v0 * cosD(th), vy = v0 * sinD(th);
    const ask = d <= 2 ? r.pick(["h", "ts"] as const) : d <= 4 ? r.pick(["h", "T", "R"] as const) : r.pick(["R", "v", "x"] as const);
    const hmax = (vy * vy) / (2 * G), ts = vy / G, T = 2 * ts, R = vx * T;
    const tq = d >= 5 ? Math.round(ts * 0.5 * 10) / 10 || 0.5 : 0;
    const swapVy = v0 * cosD(th);
    const base0 = `Se lanza una pelota desde el suelo con una rapidez de ${v0} m/s formando ${th}° con la horizontal (g = 9,80 m/s², sin rozamiento).`;
    const comps = `v₀x = ${v0}·cos ${th}° = ${s3(vx)} m/s;  v₀y = ${v0}·sen ${th}° = ${s3(vy)} m/s`;
    const sinCos: Err = [0, "trigonometria", "Cambiaste seno por coseno. Con el ángulo medido desde la horizontal: v₀x = v₀·cos θ y v₀y = v₀·sen θ."];
    if (ask === "h") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: hmax,
      prompt: `${base0} ¿Qué altura máxima alcanza?`,
      hints: ["Solo importa el movimiento vertical: es un tiro vertical con v₀y.", "En la altura máxima v_y = 0.", "h_máx = v₀y² / (2g), con v₀y = v₀·sen θ."],
      solution: [comps, `h_máx = ${s3(vy)}² / (2·9,80) = ${s3(hmax)} m`],
      explanation: "El tiro oblicuo es un MRU horizontal más un tiro vertical. La altura máxima solo depende de v₀y.",
      errors: [[(swapVy * swapVy) / (2 * G), sinCos[1], sinCos[2]], [(vy * vy) / G, "formula", "Te faltó el 2: h_máx = v₀y²/(2g)."], [(v0 * v0) / (2 * G), "vectores", "Usaste v₀ entera. Para subir solo cuenta la componente vertical v₀y = v₀·sen θ."]],
    });
    if (ask === "ts" || ask === "T") {
      const val = ask === "ts" ? ts : T;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: val,
        prompt: `${base0} ${ask === "ts" ? "¿Cuánto tarda en llegar a la altura máxima?" : "¿Cuánto tiempo está en el aire?"}`,
        hints: ["Mirá solo la vertical: v_y(t) = v₀y − g·t.", "En la altura máxima v_y = 0 ⇒ t_s = v₀y/g.", ask === "T" ? "Si cae al mismo nivel, el tiempo de vuelo es el doble del de subida." : "Recordá: v₀y = v₀·sen θ."],
        solution: [comps, `t_s = ${s3(vy)} / 9,80 = ${s3(ts)} s`, ...(ask === "T" ? [`t_v = 2·t_s = ${s3(T)} s`] : [])],
        explanation: "La subida y la bajada (al mismo nivel) duran lo mismo: t_vuelo = 2·v₀y/g.",
        errors: [[ask === "ts" ? swapVy / G : (2 * swapVy) / G, sinCos[1], sinCos[2]], ...(ask === "T" ? [[ts, "conceptual", "Ese es solo el tiempo de subida. Al mismo nivel, la bajada tarda lo mismo: t_vuelo = 2·t_s."] as Err] : [[v0 / G, "vectores", "Usaste v₀ entera; para la vertical va v₀y = v₀·sen θ."] as Err])],
      });
    }
    if (ask === "R") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: R,
      prompt: `${base0} ¿A qué distancia horizontal del punto de lanzamiento cae?`,
      hints: ["El alcance es v₀x por el tiempo de vuelo.", "Tiempo de vuelo: t_v = 2·v₀y/g.", "Horizontal sin aceleración: x = v₀x·t."],
      solution: [comps, `t_v = 2·${s3(vy)}/9,80 = ${s3(T)} s`, `x = ${s3(vx)} · ${s3(T)} = ${s3(R)} m`],
      explanation: "En la horizontal no hay aceleración (MRU): el alcance es v₀x·t_vuelo.",
      errors: [[vx * ts, "conceptual", "Usaste el tiempo de subida. El alcance se calcula con el tiempo total de vuelo (subida + bajada)."], [v0 * T, "vectores", "En la horizontal se mueve con v₀x = v₀·cos θ, no con v₀."]],
    });
    if (ask === "v") {
      const vyt = vy - G * tq;
      const sp = Math.hypot(vx, vyt);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s", answer: sp,
        prompt: `${base0} ¿Qué rapidez tiene a los ${n(tq)} s del lanzamiento?`,
        hints: ["La velocidad tiene dos componentes: v_x (constante) y v_y (cambia).", `v_y(t) = v₀y − g·t con t = ${n(tq)} s.`, "La rapidez es el módulo: √(v_x² + v_y²)."],
        solution: [comps, `v_y = ${s3(vy)} − 9,80·${n(tq)} = ${s3(vyt)} m/s`, `|v| = √(${s3(vx)}² + ${s3(vyt)}²) = ${s3(sp)} m/s`],
        explanation: "La componente horizontal no cambia; la vertical baja 9,80 m/s cada segundo. La rapidez es el módulo del vector velocidad.",
        errors: [[v0 - G * tq, "vectores", "Le restaste g·t a la rapidez total. La gravedad solo cambia la componente vertical."], [Math.abs(vyt), "vectores", "Esa es solo la componente vertical. Falta combinarla con v_x usando Pitágoras."]],
      });
    }
    const xq = sig3(vx * tq);
    const tx = xq / vx;
    const yq = vy * tx - 0.5 * G * tx * tx;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: yq,
      prompt: `${base0} ¿A qué altura está cuando ya avanzó ${s3(xq)} m en horizontal?`,
      hints: ["Primero sacá el tiempo con la horizontal: x = v₀x·t.", `t = ${s3(xq)} / ${s3(vx)}.`, "Con ese t, y = v₀y·t − ½·g·t²."],
      solution: [comps, `t = ${s3(xq)} / ${s3(vx)} = ${s3(tx)} s`, `y = ${s3(vy)}·${s3(tx)} − 4,90·${s3(tx)}² = ${s3(yq)} m`],
      explanation: "El tiempo es el que conecta los dos movimientos: se calcula con uno (horizontal) y se usa en el otro (vertical).",
      errors: [[vy * tx, "formula", "Te faltó restar ½·g·t²: la gravedad frena la subida."], [vy * tx - G * tx * tx, "formula", "Te faltó el ½ en ½·g·t²."]],
    });
  },
};

export const fisTiroAltura: Generator = {
  id: "fis-tiro-altura",
  topicId: "t-tiro-altura",
  description: "Tiro horizontal y oblicuo desde una altura h₀ (resolvente)",
  generate(seed, d) {
    const r = rng(seed);
    const h0 = r.pick([1.5, 2, 5, 8, 10, 15, 20, 25]);
    const v0 = r.pick([8, 10, 12, 15, 18, 20]);
    const th = d <= 2 ? 0 : r.pick([20, 30, 37, 40, 45, 53]);
    const vx = v0 * cosD(th), vy = v0 * sinD(th);
    const disc = vy * vy + 2 * G * h0;
    const t = (vy + Math.sqrt(disc)) / G;
    const tNeg = (vy - Math.sqrt(disc)) / G;
    const X = vx * t;
    const vImp = Math.sqrt(v0 * v0 + 2 * G * h0);
    const hmax = h0 + (vy * vy) / (2 * G);
    const horizontal = th === 0;
    const desc = horizontal
      ? `Desde una terraza de ${n(h0)} m de altura se lanza una pelota horizontalmente a ${v0} m/s (g = 9,80 m/s²).`
      : `Desde ${n(h0)} m de altura se lanza una pelota a ${v0} m/s formando ${th}° hacia arriba de la horizontal (g = 9,80 m/s²).`;
    const opts = horizontal ? (["t", "x", "v"] as const) : d <= 4 ? (["t", "hmax", "x"] as const) : (["x", "v", "ang"] as const);
    const ask = r.pick(opts);
    const eq = `0 = ${n(h0)} + ${s3(vy)}·t − 4,90·t²`;
    const tSteps = horizontal
      ? [`0 = ${n(h0)} − 4,90·t²`, `t = √(2·${n(h0)}/9,80) = ${s3(t)} s`]
      : [`v₀x = ${s3(vx)} m/s;  v₀y = ${s3(vy)} m/s`, eq, `t = [${s3(vy)} + √(${s3(vy)}² + 2·9,80·${n(h0)})] / 9,80 = ${s3(t)} s`];
    const ground = (2 * vy) / G;
    if (ask === "t") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: t,
      prompt: `${desc} ¿Cuánto tarda en llegar al piso?`,
      hints: ["Poné el origen en el piso: y(t) = h₀ + v₀y·t − ½·g·t².", "Llega al piso cuando y = 0.", horizontal ? "Con v₀y = 0 queda t = √(2h₀/g)." : "Es una cuadrática: usá la resolvente y quedate con la raíz positiva."],
      solution: tSteps,
      explanation: "Al lanzar desde una altura no sirve t = 2v₀y/g (eso es volver al nivel de partida). Hay que plantear y(t) = 0 con h₀ incluido.",
      errors: [[horizontal ? Math.sqrt(h0 / G) : ground, horizontal ? "formula" : "conceptual", horizontal ? "Te faltó el 2: de h₀ = ½·g·t² sale t = √(2h₀/g)." : "Ese es el tiempo para volver a la altura de partida. Falta la caída de los h₀ metros: usá y(t) = 0."], ...(horizontal ? [] : [[Math.abs(tNeg), "signos", "Esa raíz es negativa en la resolvente: corresponde a un instante anterior al lanzamiento. Quedate con la positiva."] as Err])],
    });
    if (ask === "hmax") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: hmax,
      prompt: `${desc} ¿Cuál es la altura máxima respecto del piso?`,
      hints: ["La subida depende solo de v₀y.", "Lo que sube por encima del punto de lanzamiento es v₀y²/(2g).", "Te piden respecto del piso: sumá h₀."],
      solution: [`v₀y = ${v0}·sen ${th}° = ${s3(vy)} m/s`, `Δh = ${s3(vy)}²/(2·9,80) = ${s3(hmax - h0)} m`, `h_máx = ${n(h0)} + ${s3(hmax - h0)} = ${s3(hmax)} m`],
      explanation: "v₀y²/(2g) es cuánto sube DESDE donde se lanzó. Respecto del piso hay que sumar la altura inicial.",
      errors: [[hmax - h0, "conceptual", "Esa es la altura que sube por encima del punto de lanzamiento. No sumaste h₀."], [h0 + (v0 * cosD(th)) ** 2 / (2 * G), "trigonometria", "Usaste coseno para la componente vertical: v₀y = v₀·sen θ."]],
    });
    if (ask === "x") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: X,
      prompt: `${desc} ¿A qué distancia horizontal del punto de lanzamiento cae?`,
      hints: ["Primero el tiempo de vuelo: y(t) = 0 con h₀ incluido.", horizontal ? "t = √(2h₀/g)." : "Resolvente; raíz positiva.", "Después x = v₀x·t."],
      solution: [...tSteps, `x = ${s3(vx)} · ${s3(t)} = ${s3(X)} m`],
      explanation: "El tiempo de vuelo sale de la vertical (con h₀) y el alcance, de la horizontal (MRU).",
      errors: [...(horizontal ? [[v0 * Math.sqrt(h0 / G), "formula", "Te faltó el 2 en t = √(2h₀/g)."] as Err] : [[vx * ground, "conceptual", "Usaste t = 2v₀y/g, el tiempo para volver a la altura inicial. Todavía le faltan h₀ metros de caída."] as Err, [vy * t, "trigonometria", "Usaste v₀y para la horizontal. El avance horizontal es v₀x·t con v₀x = v₀·cos θ."] as Err])],
    });
    if (ask === "v") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "m/s", answer: vImp,
      prompt: `${desc} ¿Con qué rapidez llega al piso?`,
      hints: ["Al llegar, v_x = v₀x (no cambió) y v_y = v₀y − g·t.", "Calculá el tiempo de vuelo con y(t) = 0.", "Rapidez = √(v_x² + v_y²). (Atajo: v² = v₀² + 2g·h₀.)"],
      solution: [...tSteps, `v_y = ${s3(vy)} − 9,80·${s3(t)} = ${s3(vy - G * t)} m/s`, `|v| = √(${s3(vx)}² + ${s3(vy - G * t)}²) = ${s3(vImp)} m/s`],
      explanation: "La rapidez final combina la componente horizontal (constante) con la vertical (que creció hacia abajo).",
      errors: [[Math.abs(vy - G * t), "vectores", "Esa es solo la componente vertical. La rapidez es el módulo: √(v_x² + v_y²)."], [Math.sqrt(2 * G * h0), "vectores", "Te olvidaste de la velocidad horizontal (y de v₀y): eso sería soltarla desde el reposo."]],
    });
    const vyf = vy - G * t;
    const ang = toDeg(Math.atan(Math.abs(vyf) / vx));
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "°", answer: ang,
      prompt: `${desc} ¿Qué ángulo (por debajo de la horizontal) forma su velocidad al llegar al piso?`,
      hints: ["Calculá el tiempo de vuelo y la v_y final.", "v_x no cambia.", "tg α = |v_y| / v_x."],
      solution: [...tSteps, `v_y = ${s3(vyf)} m/s;  v_x = ${s3(vx)} m/s`, `α = arctg(${s3(Math.abs(vyf))} / ${s3(vx)}) = ${s3(ang)}°`],
      explanation: "El ángulo de la velocidad sale de sus componentes en ese instante, no del ángulo de lanzamiento.",
      errors: [[th, "conceptual", "El ángulo de llegada no es el de lanzamiento: cayó más de lo que subió."], [90 - ang, "trigonometria", "Ese es el ángulo con la vertical. Te piden con la horizontal: tg α = |v_y|/v_x."]],
    });
  },
};

export const fisCaidaAstros: Generator = {
  id: "fis-caida-astros",
  topicId: "t-tiro-altura",
  description: "Caída libre en otros astros y desfase entre caídas",
  generate(seed, d) {
    const r = rng(seed);
    const astros = [["la Luna", 1.62], ["Marte", 3.71], ["Mercurio", 3.7], ["Titán", 1.35]] as const;
    const mode = d <= 2 ? "g" : d <= 4 ? r.pick(["g", "t", "v"] as const) : r.pick(["desfase", "v", "g"] as const);
    if (mode === "g") {
      const h = r.pick([1.5, 2, 2.5, 3, 4]);
      const gp = r.pick([1.62, 3.71, 2.5, 5.2]);
      const tt = Math.round(Math.sqrt((2 * h) / gp) * 100) / 100;
      const g = (2 * h) / (tt * tt);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s²", answer: g,
        prompt: `Un astronauta suelta una herramienta desde ${n(h)} m de altura sobre la superficie de un planeta sin atmósfera, y tarda ${n(tt, 2)} s en llegar al piso. ¿Cuánto vale la aceleración de la gravedad allí?`,
        hints: ["Soltar = parte del reposo: h = ½·g·t².", "Despejá g.", `g = 2h/t² = 2·${n(h)}/${n(tt, 2)}².`],
        solution: [`${n(h)} = ½·g·${n(tt, 2)}²`, `g = 2·${n(h)} / ${n(tt * tt, 4)}`, `g = ${s3(g)} m/s²`],
        explanation: "Las ecuaciones de caída libre son las mismas en cualquier astro; solo cambia el valor de g.",
        errors: [[h / (tt * tt), "despeje", "Te olvidaste del 2: de h = ½gt² sale g = 2h/t²."], [(2 * h) / tt, "potencias", "El tiempo va al cuadrado: g = 2h/t²."], [9.8, "conceptual", "9,80 m/s² es la gravedad de la Tierra; acá hay que calcularla con los datos."]],
      });
    }
    const [name, gp] = r.pick(astros);
    if (mode === "t" || mode === "v") {
      const h = r.pick([5, 10, 12, 20, 30]);
      const val = mode === "t" ? Math.sqrt((2 * h) / gp) : Math.sqrt(2 * gp * h);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: mode === "t" ? "s" : "m/s", answer: val,
        prompt: `En ${name} (g = ${n(gp)} m/s²) se suelta una piedra desde ${h} m de altura. ${mode === "t" ? "¿Cuánto tarda en llegar al suelo?" : "¿Con qué rapidez llega al suelo?"}`,
        hints: ["Caída libre desde el reposo con la g del astro.", mode === "t" ? "h = ½·g·t² ⇒ t = √(2h/g)." : "v² = 2·g·h (sin tiempo).", `Usá g = ${n(gp)} m/s², no 9,80.`],
        solution: mode === "t" ? [`t = √(2·${h}/${n(gp)})`, `t = ${s3(val)} s`] : [`v = √(2·${n(gp)}·${h})`, `v = ${s3(val)} m/s`],
        explanation: "Con menos gravedad la caída es más lenta y llega con menos velocidad, pero las fórmulas son las mismas.",
        errors: mode === "t"
          ? [[Math.sqrt((2 * h) / G), "conceptual", "Usaste la g terrestre. En otro astro va su propia g."], [Math.sqrt(h / gp), "formula", "Te faltó el 2: t = √(2h/g)."]]
          : [[Math.sqrt(2 * G * h), "conceptual", "Usaste la g terrestre. En otro astro va su propia g."], [2 * gp * h, "calculo", "Te faltó la raíz: v² = 2gh."], [Math.sqrt(gp * h), "formula", "Te faltó el 2: v = √(2gh)."]],
      });
    }
    const h1 = r.pick([10, 15, 20, 30]);
    const h2 = h1 - r.pick([4, 5, 8]);
    const dt = Math.sqrt((2 * h1) / gp) - Math.sqrt((2 * h2) / gp);
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "s", answer: dt,
      prompt: `En ${name} (g = ${n(gp)} m/s²) se sueltan al mismo tiempo dos piedras: una desde ${h1} m y otra desde ${h2} m. ¿Cuánto tiempo después de la primera llega al suelo la segunda en caer?`,
      hints: ["Calculá el tiempo de caída de cada una por separado.", "t = √(2h/g).", "Restá los dos tiempos."],
      solution: [`t₁ = √(2·${h1}/${n(gp)}) = ${s3(Math.sqrt((2 * h1) / gp))} s`, `t₂ = √(2·${h2}/${n(gp)}) = ${s3(Math.sqrt((2 * h2) / gp))} s`, `Δt = ${s3(dt)} s`],
      explanation: "La caída no es proporcional a la altura (t ∝ √h): hay que calcular cada tiempo y restar.",
      errors: [[Math.sqrt((2 * (h1 - h2)) / gp), "conceptual", "Calculaste el tiempo de caer la DIFERENCIA de alturas desde el reposo. La de más arriba llega a esa altura ya con velocidad: restá los tiempos completos."], [Math.sqrt((2 * h1) / G) - Math.sqrt((2 * h2) / G), "conceptual", "Usaste la g terrestre."]],
    });
  },
};

// ═══════════════════════════ Estática ═══════════════════════════

export const fisNudo: Generator = {
  id: "fis-estatica-nudo",
  topicId: "t-estatica-particula",
  description: "Equilibrio de un nudo: dos cuerdas (ángulos desde la vertical u horizontal) o tres hebras",
  generate(seed, d) {
    const r = rng(seed);
    const m = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
    const P = m * G;
    if (d <= 2) {
      const a = r.pick([20, 30, 40, 45, 50, 60]);
      const T = P / (2 * cosD(a));
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: T,
        prompt: `Un cuadro de ${m} kg cuelga de un clavo mediante dos tramos de cuerda iguales, cada uno formando ${a}° con la vertical. ¿Qué tensión soporta cada tramo?`,
        hints: ["Hacé el diagrama de cuerpo libre del punto donde se juntan las fuerzas.", "Por simetría las horizontales se anulan. En vertical: 2·T·cos α = P.", `T = P / (2·cos ${a}°), con P = ${m}·9,80 N.`],
        solution: [`P = ${m}·9,80 = ${s3(P)} N`, `ΣF_y = 0: 2·T·cos ${a}° = ${s3(P)}`, `T = ${s3(T)} N`],
        explanation: "Cada cuerda sostiene con su componente vertical. Como están inclinadas, la tensión es MAYOR que P/2.",
        errors: [[P / 2, "conceptual", "P/2 sería si las cuerdas fueran verticales. Inclinadas, solo su componente vertical sostiene: 2T·cos α = P."], [P / (2 * sinD(a)), "trigonometria", "Usaste seno. Con el ángulo medido desde la VERTICAL, la componente vertical va con coseno."], [m / (2 * cosD(a)), "unidades", "Usaste la masa en lugar del peso: P = m·g."]],
      });
    }
    if (d >= 5 && r.bool()) {
      const a = r.pick([25, 30, 35, 40, 50]);
      const askOblique = r.bool();
      const val = askOblique ? P / cosD(a) : P * tanD(a);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: val,
        prompt: `Una lámpara de ${m} kg cuelga de una hebra vertical atada a un nudo. Del nudo salen otras dos hebras: una horizontal hasta una pared y otra hasta el techo, que forma ${a}° con la pared (vertical). ¿Qué tensión soporta la hebra ${askOblique ? "que va al techo" : "horizontal"}?`,
        hints: ["Analizá el nudo: tres fuerzas (peso por la hebra vertical, T horizontal, T oblicua).", `Vertical: T_ob·cos ${a}° = P (el ángulo es con la vertical).`, `Horizontal: T_h = T_ob·sen ${a}°.`],
        solution: [`T_vertical = P = ${s3(P)} N`, `T_ob = P / cos ${a}° = ${s3(P / cosD(a))} N`, ...(askOblique ? [] : [`T_h = T_ob·sen ${a}° = P·tg ${a}° = ${s3(val)} N`])],
        explanation: "La hebra oblicua es la única con componente vertical: sostiene todo el peso con T·cos α. Su componente horizontal la equilibra la hebra horizontal.",
        errors: askOblique
          ? [[P / sinD(a), "trigonometria", "Usaste seno: el ángulo es con la pared (vertical), así que la componente vertical va con coseno."], [P * cosD(a), "despeje", "Multiplicaste: de T·cos α = P sale T = P/cos α."]]
          : [[P / tanD(a), "trigonometria", "Invertiste la tangente: con el ángulo desde la vertical, T_h = P·tg α."], [P, "conceptual", "La hebra horizontal no sostiene el peso: equilibra la componente horizontal de la oblicua."]],
      });
    }
    const fromV = d <= 3 ? true : r.bool();
    const a = r.pick([20, 30, 35, 40, 45]);
    const b = r.pick([50, 55, 60, 65]);
    // ángulos con la vertical
    const avv = fromV ? a : 90 - a, bvv = fromV ? b : 90 - b;
    const T1 = (P * sinD(bvv)) / sinD(avv + bvv);
    const T2 = (P * sinD(avv)) / sinD(avv + bvv);
    const ask1 = r.bool();
    const ans = ask1 ? T1 : T2;
    // error: interpretar los ángulos desde la otra referencia
    const aw = 90 - avv, bw = 90 - bvv;
    const W1 = (P * sinD(bw)) / sinD(aw + bw), W2 = (P * sinD(aw)) / sinD(aw + bw);
    const ref = fromV ? "la vertical" : "la horizontal";
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: ans,
      prompt: `Un cuerpo de ${m} kg cuelga de un nudo sostenido por dos cuerdas: la cuerda 1 forma ${fromV ? avv : 90 - avv}° con ${ref} hacia la izquierda y la cuerda 2 forma ${fromV ? bvv : 90 - bvv}° con ${ref} hacia la derecha. ¿Cuál es la tensión de la cuerda ${ask1 ? 1 : 2}?`,
      hints: [
        "DCL del nudo: P hacia abajo, T₁ y T₂ hacia arriba e inclinadas. ΣF_x = 0 y ΣF_y = 0.",
        fromV ? "Con ángulos desde la VERTICAL: la componente vertical de cada T va con coseno y la horizontal con seno." : "Con ángulos desde la HORIZONTAL: la componente horizontal de cada T va con coseno y la vertical con seno.",
        `Queda un sistema 2×2. Resultado general: T₁ = P·sen β / sen(α + β), con α y β medidos desde la vertical (α = ${avv}°, β = ${bvv}°).`,
      ],
      solution: [
        `P = ${m}·9,80 = ${s3(P)} N;  ángulos con la vertical: α = ${avv}°, β = ${bvv}°`,
        `ΣF_x = 0: T₁·sen ${avv}° = T₂·sen ${bvv}°`,
        `ΣF_y = 0: T₁·cos ${avv}° + T₂·cos ${bvv}° = ${s3(P)}`,
        `T₁ = ${s3(T1)} N;  T₂ = ${s3(T2)} N`,
      ],
      explanation: "Cada ecuación de equilibrio usa la proyección correcta. Si el ángulo es con la vertical, lo vertical va con coseno; si es con la horizontal, lo vertical va con seno.",
      errors: [
        [ask1 ? W1 : W2, "trigonometria", `Tomaste los ángulos como si fueran con ${fromV ? "la horizontal" : "la vertical"}: cambiaste seno por coseno en las proyecciones.`],
        [P / 2, "conceptual", "Las cuerdas no se reparten el peso por mitades: están inclinadas y con ángulos distintos."],
        [ask1 ? T2 : T1, "interpretacion", "Esa es la tensión de la otra cuerda. La cuerda más cercana a la vertical es la que más carga."],
      ],
    });
  },
};

export const fisVigaCuerda: Generator = {
  id: "fis-viga-cuerda",
  topicId: "t-momentos",
  description: "Viga articulada sostenida por una cuerda oblicua (suma de momentos)",
  generate(seed, d) {
    const r = rng(seed);
    const L = r.pick([2, 2.5, 3, 4]);
    const mv = d <= 1 ? 0 : r.pick([5, 8, 10, 12, 15]);
    const M = r.pick([20, 25, 30, 40, 50]);
    const xM = d <= 2 ? L : r.pick([0.5, 0.6, 0.75]) * L;
    const phi = d <= 2 ? 90 : r.pick([30, 37, 45, 53, 60]);
    const T = (mv * G * (L / 2) + M * G * xM) / (L * sinD(phi));
    const own = mv > 0;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: T,
      prompt: `Una viga horizontal ${own ? `homogénea de ${mv} kg y ` : "de masa despreciable y "}${n(L)} m de largo está articulada a una pared en un extremo. Del otro extremo la sostiene una cuerda que forma ${phi}° con la viga. ${xM === L ? "En el extremo libre" : `A ${n(xM)} m de la articulación`} cuelga una carga de ${M} kg. ¿Cuál es la tensión de la cuerda?`,
      hints: [
        "Tomá momentos respecto de la articulación: así la fuerza de la pared no aparece.",
        `Momento de la cuerda: T·sen ${phi}°·L (solo la componente perpendicular a la viga hace girar).`,
        own ? "No te olvides del peso propio de la viga, aplicado en su centro (L/2)." : "Igualá el momento de la cuerda con el de la carga.",
      ],
      solution: [
        "Σ M (articulación) = 0",
        `T·sen ${phi}°·${n(L)} = ${own ? `${mv}·9,80·${n(L / 2)} + ` : ""}${M}·9,80·${n(xM)}`,
        `T·${s3(L * sinD(phi))} = ${s3(mv * G * (L / 2) + M * G * xM)}`,
        `T = ${s3(T)} N`,
      ],
      explanation: "El momento de una fuerza es fuerza × distancia × sen(ángulo entre ambas). Elegir el centro de momentos en la articulación elimina la incógnita de la pared.",
      errors: [
        ...(own ? [[(M * G * xM) / (L * sinD(phi)), "conceptual", "Te olvidaste del peso propio de la viga, aplicado en su centro."] as Err] : []),
        ...(phi !== 90 ? [[(mv * G * (L / 2) + M * G * xM) / L, "trigonometria", "Te faltó el sen del ángulo: solo la componente de T perpendicular a la viga produce momento."] as Err, [(mv * G * (L / 2) + M * G * xM) / (L * cosD(phi)), "trigonometria", "Usaste coseno. La componente perpendicular a la viga es T·sen φ (φ es el ángulo cuerda–viga)."] as Err] : []),
        [(mv * L + M * xM) / (L * sinD(phi)), "unidades", "Usaste masas en lugar de pesos: multiplicá por g = 9,80 m/s²."],
      ],
    });
  },
};

export const fisMomentosApoyos: Generator = {
  id: "fis-momentos-apoyos",
  topicId: "t-momentos",
  description: "Momentos con apoyos: trampolín y centro de masa con básculas",
  generate(seed, d) {
    const r = rng(seed);
    if (d >= 4 && r.bool()) {
      const D = r.pick([3, 3.5, 4, 5]);
      const F1 = r.pick([20, 24, 30, 36]) * 1000;
      const F2 = r.pick([12, 15, 18, 22]) * 1000;
      const askX = r.bool();
      const xcm = (F2 * D) / (F1 + F2);
      const mass = (F1 + F2) / G;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: askX ? "m" : "kg", answer: askX ? xcm : mass,
        prompt: `Un camión se apoya con el eje delantero sobre una báscula y con el trasero sobre otra; los ejes están separados ${n(D)} m. La báscula delantera marca ${n(F1 / 1000)} kN y la trasera ${n(F2 / 1000)} kN. ${askX ? "¿A qué distancia del eje delantero está el centro de masa?" : "¿Cuál es la masa del camión?"}`,
        hints: ["El peso total es la suma de las dos reacciones (ΣF_y = 0).", "Para ubicar el centro de masa, tomá momentos respecto del eje delantero.", askX ? "P·x = F_trasera·D, con P = F₁ + F₂." : "m = (F₁ + F₂)/g."],
        solution: askX
          ? [`P = ${n(F1)} + ${n(F2)} = ${n(F1 + F2)} N`, `P·x = ${n(F2)}·${n(D)}`, `x = ${s3(xcm)} m`]
          : [`P = F₁ + F₂ = ${n(F1 + F2)} N`, `m = ${n(F1 + F2)} / 9,80 = ${s3(mass)} kg`],
        explanation: "El centro de masa está más cerca del apoyo que soporta más carga. Con momentos respecto de un apoyo, su reacción no aparece.",
        errors: askX
          ? [[(F1 * D) / (F1 + F2), "conceptual", "Esa es la distancia al eje TRASERO. El centro de masa está más cerca del eje que soporta más."], [D / 2, "conceptual", "El centro de masa no tiene por qué estar en el medio: está más cerca de la báscula que marca más."]]
          : [[F1 + F2, "unidades", "Ese es el peso en N. La masa es P/g."], [(F1 + F2) / 1000, "unidades", "Pasá kN a N (· 1000) y dividí por g."]],
      });
    }
    const L = r.pick([3, 3.5, 4, 5]);
    const mb = r.pick([30, 40, 50, 60]);
    const dA = r.pick([1, 1.2, 1.5]);
    const M = r.pick([55, 60, 70, 80, 90]);
    const NA = (mb * G * (L / 2) + M * G * L) / dA;
    const NB = NA - (mb + M) * G;
    const askB = d >= 3 && r.bool();
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: askB ? NB : NA,
      prompt: `Un trampolín homogéneo de ${n(L)} m y ${mb} kg está sujeto en su extremo B por un perno y apoyado sobre un soporte A ubicado a ${n(dA)} m de B. Una nadadora de ${M} kg está parada en el extremo libre. ¿Qué fuerza ejerce ${askB ? "el perno B (en módulo)" : "el soporte A"} sobre el trampolín?`,
      hints: ["Tomá momentos respecto de B: el perno no hace momento ahí.", `N_A·${n(dA)} = P_trampolín·${n(L / 2)} + P_nadadora·${n(L)}.`, askB ? "Después ΣF_y = 0: el perno tira hacia ABAJO con N_A − P_total." : "No te olvides del peso del trampolín, en su centro."],
      solution: [
        `Σ M_B = 0: N_A·${n(dA)} = ${mb}·9,80·${n(L / 2)} + ${M}·9,80·${n(L)}`,
        `N_A = ${s3(NA)} N`,
        ...(askB ? [`ΣF_y = 0: F_B = N_A − (${mb} + ${M})·9,80 = ${s3(NB)} N (hacia abajo)`] : []),
      ],
      explanation: "El soporte A está cerca del perno, así que para equilibrar los momentos tiene que empujar con una fuerza varias veces mayor que los pesos. El perno tira hacia abajo.",
      errors: askB
        ? [[NA + (mb + M) * G, "signos", "El perno tira hacia ABAJO: F_B = N_A − P_total."], [(mb + M) * G, "conceptual", "El perno no soporta el peso total: con el momento de la nadadora, A empuja mucho y B tira hacia abajo."]]
        : [[(M * G * L) / dA, "conceptual", "Te olvidaste del peso propio del trampolín, aplicado en su centro."], [(mb + M) * G, "conceptual", "Igualaste fuerzas, pero A no es el único apoyo. Tomá momentos respecto de B."], [(mb * G * L + M * G * L) / dA, "conceptual", "El peso del trampolín actúa en su centro (L/2), no en la punta."]],
    });
  },
};

// ═══════════════════════════ Dinámica ═══════════════════════════

export const fisNewton: Generator = {
  id: "fis-newton",
  topicId: "t-newton",
  description: "Segunda ley de Newton: peso vs. masa, fuerza para acelerar verticalmente",
  generate(seed, d) {
    const r = rng(seed);
    if (d <= 2) {
      const [name, gp] = r.pick([["la Luna", 1.62], ["Marte", 3.71], ["Júpiter", 24.8]] as const);
      const m = r.pick([12, 25, 40, 65, 80]);
      const askMass = r.bool();
      if (askMass) {
        const Pe = m * G;
        return num({
          gen: this.id, seed, d, topicId: this.topicId, unit: "kg", answer: m,
          prompt: `Un equipo pesa ${s3(Pe)} N en la Tierra. ¿Cuál es su masa en ${name} (g = ${n(gp)} m/s²)?`,
          hints: ["La masa es la cantidad de materia: no depende del lugar.", "En la Tierra: m = P/g con g = 9,80 m/s².", "En otro astro cambia el peso, no la masa."],
          solution: [`m = ${s3(Pe)} / 9,80 = ${s3(m)} kg`, `En ${name} la masa sigue siendo ${s3(m)} kg`],
          explanation: "Masa (kg) y peso (N) no son lo mismo: el peso es la fuerza con que el astro atrae a esa masa, P = m·g.",
          errors: [[Pe / gp, "conceptual", "Dividiste por la g del otro astro: la masa no cambia al viajar. Se calcula con la g de donde se midió el peso."], [m * gp, "conceptual", "Ese es el peso allá, en N. Te piden la masa."], [Pe, "unidades", "Eso es el peso en newtons, no la masa."]],
        });
      }
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: m * gp,
        prompt: `Un astronauta tiene una masa de ${m} kg. ¿Cuánto pesa en ${name} (g = ${n(gp)} m/s²)?`,
        hints: ["Peso = masa × gravedad del lugar.", "P = m·g.", `P = ${m}·${n(gp)}.`],
        solution: [`P = ${m}·${n(gp)} = ${s3(m * gp)} N`],
        explanation: "El peso cambia con el astro porque cambia g; la masa es la misma.",
        errors: [[m * G, "conceptual", "Usaste la g de la Tierra."], [m, "unidades", "Esa es la masa en kg. El peso es una fuerza: m·g en N."]],
      });
    }
    const m = r.pick([5, 10, 20, 50, 80, 120]);
    const a = r.pick([0.5, 1, 1.5, 2, 2.5, 3]);
    const up = d <= 3 ? true : r.bool();
    const askA = d >= 5 && r.bool();
    if (askA) {
      const F = sig3(m * (G + a));
      const aa = F / m - G;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s²", answer: aa,
        prompt: `Un cohete de prueba de ${m} kg despega verticalmente con un motor que lo empuja con ${s3(F)} N. ¿Qué aceleración tiene (despreciá el rozamiento del aire)?`,
        hints: ["Dibujá las fuerzas: empuje hacia arriba, peso hacia abajo.", "ΣF = m·a: F − m·g = m·a.", `a = (${s3(F)} − ${m}·9,80)/${m}.`],
        solution: [`P = ${m}·9,80 = ${s3(m * G)} N`, `${s3(F)} − ${s3(m * G)} = ${m}·a`, `a = ${s3(aa)} m/s²`],
        explanation: "En la segunda ley va la fuerza NETA. El empuje tiene que vencer primero al peso; solo lo que sobra acelera.",
        errors: [[F / m, "conceptual", "Usaste F = m·a sin restar el peso. La fuerza neta es F − P."], [F / m + G, "signos", "Sumaste el peso: apunta hacia abajo, en contra del empuje."]],
      });
    }
    const T = m * (up ? G + a : G - a);
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: T,
      prompt: `Una grúa mueve verticalmente una carga de ${m} kg con un cable. ${up ? `La carga sube acelerando a ${n(a)} m/s².` : `La carga baja aumentando su rapidez con aceleración de ${n(a)} m/s² (hacia abajo).`} ¿Cuál es la tensión del cable?`,
      hints: ["Fuerzas sobre la carga: tensión hacia arriba, peso hacia abajo.", `Tomá positivo el sentido de la aceleración (${up ? "arriba" : "abajo"}).`, up ? "T − m·g = m·a ⇒ T = m(g + a)." : "m·g − T = m·a ⇒ T = m(g − a)."],
      solution: [`P = ${m}·9,80 = ${s3(m * G)} N`, up ? `T − ${s3(m * G)} = ${m}·${n(a)}` : `${s3(m * G)} − T = ${m}·${n(a)}`, `T = ${s3(T)} N`],
      explanation: "Si acelera hacia arriba, el cable tiene que hacer más que el peso; si acelera hacia abajo, menos. Solo con velocidad constante T = P.",
      errors: [[m * a, "conceptual", "Usaste F = m·a sin tener en cuenta el peso. La segunda ley usa la fuerza NETA: T − P."], [m * G, "velocidad-aceleracion", "T = P solo si la velocidad es constante. Acá hay aceleración."], [m * (up ? G - a : G + a), "signos", "Pusiste la aceleración con el signo cambiado."]],
    });
  },
};

export const fisPlanoInclinado: Generator = {
  id: "fis-plano-inclinado",
  topicId: "t-plano-inclinado",
  description: "Plano inclinado con rozamiento: N, μs mínimo, aceleración, trabajo del rozamiento",
  generate(seed, d) {
    const r = rng(seed);
    const m = r.pick([2, 3, 4, 5, 8, 10]);
    const th = r.pick([20, 25, 30, 35, 40, 45]);
    const mud = Math.round(Math.min(r.pick([0.1, 0.15, 0.2, 0.25, 0.3]), tanD(th) * 0.8) * 100) / 100;
    const dist = r.pick([2, 3, 4, 5]);
    const N = m * G * cosD(th);
    const a = G * (sinD(th) - mud * cosD(th));
    const ask = d <= 1 ? "N" : d === 2 ? "mus" : d <= 4 ? "a" : r.pick(["W", "Ec"] as const);
    const intro0 = `Un bloque de ${m} kg está sobre un plano inclinado ${th}° respecto de la horizontal (g = 9,80 m/s²).`;
    if (ask === "N") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: N,
      prompt: `${intro0} ¿Cuánto vale la fuerza normal?`,
      hints: ["Descomponé el peso en una parte paralela al plano y otra perpendicular.", "La perpendicular es P·cos θ (el ángulo del plano aparece entre P y la normal).", "Perpendicular al plano no hay movimiento: N = P·cos θ."],
      solution: [`P = ${m}·9,80 = ${s3(m * G)} N`, `N = P·cos ${th}° = ${s3(N)} N`],
      explanation: "En un plano inclinado N < P: solo la componente perpendicular del peso aprieta el bloque contra el plano.",
      errors: [[m * G, "conceptual", "N = P solo en un piso horizontal. En el plano, N = P·cos θ."], [m * G * sinD(th), "trigonometria", "P·sen θ es la componente PARALELA (la «fuerza impulsora»). La normal equilibra a P·cos θ."]],
    });
    if (ask === "mus") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "", answer: tanD(th),
      prompt: `${intro0} ¿Cuál es el mínimo coeficiente de rozamiento estático para que el bloque quede en reposo?`,
      hints: ["En reposo: rozamiento estático = componente paralela del peso.", "Límite: μs·N = P·sen θ, con N = P·cos θ.", "μs mín = tg θ (no depende de la masa)."],
      solution: [`μs·m·g·cos ${th}° = m·g·sen ${th}°`, `μs = tg ${th}° = ${s3(tanD(th))}`],
      explanation: "El coeficiente mínimo es tg θ: la masa se simplifica. Por eso un bloque liviano y uno pesado del mismo material empiezan a deslizar en el mismo ángulo.",
      errors: [[sinD(th), "trigonometria", "Te faltó dividir por cos θ: N no es m·g, es m·g·cos θ."], [1 / tanD(th), "trigonometria", "Invertiste el cociente: μs = sen θ / cos θ = tg θ."]],
    });
    if (ask === "a") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "m/s²", answer: a,
      prompt: `${intro0} El coeficiente de rozamiento dinámico es ${n(mud, 2)}. Si el bloque desliza hacia abajo, ¿qué aceleración tiene?`,
      hints: ["Paralelo al plano: a favor P·sen θ, en contra F_roz = μd·N.", "N = m·g·cos θ.", "m·a = m·g·sen θ − μd·m·g·cos θ ⇒ a = g(sen θ − μd cos θ)."],
      solution: [`a = 9,80·(sen ${th}° − ${n(mud, 2)}·cos ${th}°)`, `a = 9,80·(${n(sinD(th), 3)} − ${n(mud * cosD(th), 3)})`, `a = ${s3(a)} m/s²`],
      explanation: "La masa se simplifica: todos los bloques del mismo material bajan con la misma aceleración.",
      errors: [[G * sinD(th), "conceptual", "Esa sería la aceleración sin rozamiento. Falta restar μd·g·cos θ."], [G * (sinD(th) - mud), "conceptual", "Usaste N = m·g. En el plano N = m·g·cos θ, así que el rozamiento es μd·m·g·cos θ."], [G * (cosD(th) - mud * sinD(th)), "trigonometria", "Cambiaste seno por coseno: la componente paralela del peso es P·sen θ."]],
    });
    const W = -mud * m * G * cosD(th) * dist;
    const Ec = (m * G * sinD(th) - mud * m * G * cosD(th)) * dist;
    if (ask === "W") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "J", answer: W,
      prompt: `${intro0} Con μd = ${n(mud, 2)}, el bloque desliza ${dist} m hacia abajo. ¿Cuánto vale el trabajo de la fuerza de rozamiento (con su signo)?`,
      hints: ["W = F·d·cos α, con α el ángulo entre la fuerza y el desplazamiento.", "El rozamiento se opone al movimiento: α = 180°, cos α = −1.", `F_roz = μd·m·g·cos ${th}°.`],
      solution: [`F_roz = ${n(mud, 2)}·${m}·9,80·cos ${th}° = ${s3(mud * m * G * cosD(th))} N`, `W = ${s3(mud * m * G * cosD(th))}·${dist}·cos 180°`, `W = ${s3(W)} J`],
      explanation: "El trabajo del rozamiento es negativo: le quita energía mecánica al bloque.",
      errors: [[-mud * m * G * dist, "conceptual", "Usaste N = m·g. En el plano, N = m·g·cos θ."], [-mud * m * G * sinD(th) * dist, "trigonometria", "La normal es m·g·cos θ, no m·g·sen θ."]],
    });
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "J", answer: Ec,
      prompt: `${intro0} Con μd = ${n(mud, 2)}, el bloque parte del reposo y desliza ${dist} m hacia abajo. ¿Qué energía cinética tiene al final?`,
      hints: ["Teorema trabajo–energía: ΔEc = W_neto.", "W del peso (paralelo): m·g·sen θ·d. W del rozamiento: −μd·m·g·cos θ·d. La normal no hace trabajo.", "Partió del reposo: Ec_final = W_neto."],
      solution: [`W_P = ${m}·9,80·sen ${th}°·${dist} = ${s3(m * G * sinD(th) * dist)} J`, `W_roz = ${s3(W)} J`, `Ec = ${s3(Ec)} J`],
      explanation: "La energía cinética final es lo que aporta el peso menos lo que se lleva el rozamiento.",
      errors: [[m * G * sinD(th) * dist, "conceptual", "Te olvidaste del trabajo del rozamiento (negativo)."], [m * G * sinD(th) * dist - W, "signos", "Sumaste el trabajo del rozamiento: es negativo, resta."]],
    });
  },
};

export const fisVinculados: Generator = {
  id: "fis-vinculados",
  topicId: "t-vinculados",
  description: "Cuerpos vinculados por una cuerda y una polea",
  generate(seed, d) {
    const r = rng(seed);
    if (d <= 4) {
      const mA = r.pick([2, 3, 4, 5, 6]);
      const mB = r.pick([4, 5, 6, 8, 10]);
      const mu = d <= 2 ? 0 : Math.min(r.pick([0.1, 0.2, 0.25, 0.3]), Math.floor((mA / mB) * 0.8 * 100) / 100);
      const a = ((mA - mu * mB) * G) / (mA + mB);
      const T = mA * (G - a);
      const askT = d >= 2 && r.bool();
      const fr = mu > 0 ? `, con rozamiento dinámico μd = ${n(mu, 2)}` : " sin rozamiento";
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: askT ? "N" : "m/s²", answer: askT ? T : a,
        prompt: `Un bloque B de ${mB} kg está sobre una mesa horizontal${fr}. Está unido por una cuerda que pasa por una polea a un bloque A de ${mA} kg que cuelga. ${askT ? "¿Cuál es la tensión de la cuerda?" : "¿Con qué aceleración se mueven?"}`,
        hints: ["Hacé un DCL de cada bloque; la cuerda tiene la misma tensión en ambos extremos y los dos tienen la misma |a|.", `A: m_A·g − T = m_A·a. B: T${mu > 0 ? " − μd·m_B·g" : ""} = m_B·a.`, `Sumando: a = (m_A${mu > 0 ? " − μd·m_B" : ""})·g/(m_A + m_B).`],
        solution: [`a = (${mA}${mu > 0 ? ` − ${n(mu, 2)}·${mB}` : ""})·9,80 / (${mA} + ${mB}) = ${s3(a)} m/s²`, ...(askT ? [`T = m_A(g − a) = ${mA}·(9,80 − ${s3(a)}) = ${s3(T)} N`] : [])],
        explanation: "El sistema se mueve como un todo: la fuerza que lo impulsa (peso de A menos rozamiento) acelera la masa TOTAL.",
        errors: askT
          ? [[mA * G, "conceptual", "Si la tensión fuera igual al peso de A, A no aceleraría. Como A baja acelerando, T < m_A·g."], [mB * a, mu > 0 ? "conceptual" : "calculo", mu > 0 ? "Del lado de B falta el rozamiento: T = μd·m_B·g + m_B·a." : "Revisá la cuenta: T = m_B·a."]].filter((e) => mu > 0 || e[0] !== T) as Err[]
          : [[(mA * G) / mB, "conceptual", "Dividiste por una sola masa. La fuerza impulsora acelera a los DOS bloques: dividí por m_A + m_B."], [(mA * G) / (mA + mB), "conceptual", "Te olvidaste del rozamiento sobre B."], [G, "conceptual", "A no cae libremente: la cuerda lo frena (y arrastra a B)."]],
      });
    }
    // A sobre plano liso inclinado, B sobre horizontal rugoso
    const mA = r.pick([8, 10, 12, 15]);
    const th = r.pick([30, 37, 45, 53]);
    const mus = r.pick([0.3, 0.4, 0.5]);
    const mud = Math.round(mus * 0.5 * 100) / 100;
    const mBmin = (mA * sinD(th)) / mus;
    if (d === 5) return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "kg", answer: mBmin,
      prompt: `Un bloque A de ${mA} kg está sobre un plano inclinado liso de ${th}°, unido por una cuerda (que pasa por una polea en lo alto del plano) a un bloque B apoyado en una superficie horizontal con μs = ${n(mus, 2)} y μd = ${n(mud, 2)}. ¿Cuál es la masa mínima de B para que el sistema quede en reposo?`,
      hints: ["En reposo: T = m_A·g·sen θ (lo que tira A plano abajo).", "B no se mueve si el rozamiento estático máximo alcanza: μs·m_B·g ≥ T.", "m_B mín = m_A·sen θ / μs. Ojo: va μs, no μd."],
      solution: [`T = ${mA}·9,80·sen ${th}° = ${s3(mA * G * sinD(th))} N`, `μs·m_B·g = T`, `m_B = ${mA}·sen ${th}° / ${n(mus, 2)} = ${s3(mBmin)} kg`],
      explanation: "Para «que no se mueva» se usa el rozamiento ESTÁTICO máximo. El dinámico es para cuando ya desliza.",
      errors: [[(mA * sinD(th)) / mud, "conceptual", "Usaste μd. Para que no arranque, el límite lo pone el rozamiento ESTÁTICO máximo: μs·N."], [(mA * cosD(th)) / mus, "trigonometria", "La componente del peso de A a lo largo del plano es m·g·sen θ."], [mA / mus, "conceptual", "Usaste el peso entero de A. Sobre el plano, A tira con m_A·g·sen θ."]],
    });
    const mB = Math.max(1, Math.floor(mBmin * 0.6));
    const a = (mA * G * sinD(th) - mud * mB * G) / (mA + mB);
    const T = mud * mB * G + mB * a;
    const askT = r.bool();
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: askT ? "N" : "m/s²", answer: askT ? T : a,
      prompt: `Un bloque A de ${mA} kg baja por un plano inclinado liso de ${th}°, unido por una cuerda a un bloque B de ${mB} kg que arrastra sobre una superficie horizontal (μd = ${n(mud, 2)}). ${askT ? "¿Cuál es la tensión de la cuerda?" : "¿Cuál es la aceleración del sistema?"}`,
      hints: ["A: m_A·g·sen θ − T = m_A·a. B: T − μd·m_B·g = m_B·a.", "Sumá las dos ecuaciones: la tensión se cancela.", askT ? "Con a, volvé a la ecuación de B: T = μd·m_B·g + m_B·a." : "a = (m_A·g·sen θ − μd·m_B·g)/(m_A + m_B)."],
      solution: [`a = (${mA}·9,80·sen ${th}° − ${n(mud, 2)}·${mB}·9,80)/(${mA} + ${mB}) = ${s3(a)} m/s²`, ...(askT ? [`T = ${n(mud, 2)}·${mB}·9,80 + ${mB}·${s3(a)} = ${s3(T)} N`] : [])],
      explanation: "Sumar las ecuaciones de cada cuerpo elimina la tensión: la fuerza neta del sistema acelera la masa total.",
      errors: askT
        ? [[mA * G * sinD(th), "conceptual", "T no es igual a la fuerza impulsora: A acelera, así que T es menor que m_A·g·sen θ."], [mB * a, "conceptual", "Te faltó el rozamiento sobre B: T = μd·m_B·g + m_B·a."]]
        : [[(mA * G * sinD(th)) / (mA + mB), "conceptual", "Te olvidaste del rozamiento sobre B."], [(mA * G * sinD(th) - mud * mB * G) / mA, "conceptual", "La fuerza neta acelera a los dos bloques: dividí por m_A + m_B."], [(mA * G * cosD(th) - mud * mB * G) / (mA + mB), "trigonometria", "La componente del peso de A a lo largo del plano es m·g·sen θ."]],
    });
  },
};

const DIN_CONCEPTOS: { q: string; ok: string; bad: [string, ErrorType, string][]; why: string }[] = [
  {
    q: "Un astronauta lleva una mochila de 20 kg de la Tierra a la Luna. ¿Qué cambia?",
    ok: "Su peso, no su masa",
    bad: [["Su masa, no su peso", "conceptual", "Al revés: la masa (cantidad de materia) es la misma; el peso P = m·g cambia porque cambia g."], ["Las dos cosas", "conceptual", "La masa no depende del lugar. Solo cambia el peso."], ["Nada", "conceptual", "El peso sí cambia: en la Luna g ≈ 1,62 m/s²."]],
    why: "La masa es una propiedad del cuerpo; el peso es la fuerza con que lo atrae el astro.",
  },
  {
    q: "Una caja está quieta sobre un plano inclinado. ¿Cuánto vale la fuerza de rozamiento?",
    ok: "Lo justo para equilibrar P·sen θ",
    bad: [["μs·N, siempre", "conceptual", "μs·N es el MÁXIMO que puede dar el rozamiento estático. En reposo vale lo necesario: P·sen θ."], ["μd·N", "conceptual", "μd se usa cuando la caja ya desliza. Quieta, el rozamiento es estático."], ["Cero, porque no se mueve", "conceptual", "Si no hubiera rozamiento, la caja bajaría. Hay rozamiento estático que la sostiene."]],
    why: "El rozamiento estático se adapta hasta un máximo μs·N; solo en el límite vale μs·N.",
  },
  {
    q: "Un bloque apoyado sobre un plano inclinado. ¿Cuánto vale la normal?",
    ok: "m·g·cos θ",
    bad: [["m·g", "conceptual", "N = m·g solo sobre un piso horizontal (sin otras fuerzas verticales)."], ["m·g·sen θ", "trigonometria", "m·g·sen θ es la componente paralela al plano."], ["m·g / cos θ", "trigonometria", "La normal equilibra la componente perpendicular del peso: N = m·g·cos θ."]],
    why: "La normal es perpendicular al plano y equilibra solo la componente del peso en esa dirección.",
  },
  {
    q: "Un ascensor sube con velocidad constante. Comparada con el peso de una persona, la fuerza que el piso hace sobre ella es…",
    ok: "Igual al peso",
    bad: [["Mayor que el peso", "velocidad-aceleracion", "Sería mayor si acelerara hacia arriba. Con velocidad constante, a = 0 y N = P."], ["Menor que el peso", "velocidad-aceleracion", "Sería menor si acelerara hacia abajo. Velocidad constante ⇒ fuerza neta nula."], ["Cero", "conceptual", "El piso sostiene a la persona: N = P."]],
    why: "Velocidad constante significa aceleración nula: la fuerza neta es cero aunque se mueva.",
  },
  {
    q: "Para que un cohete despegue verticalmente acelerando, el empuje del motor tiene que ser…",
    ok: "Mayor que el peso del cohete",
    bad: [["Igual a m·a", "conceptual", "m·a es la fuerza NETA. El empuje además tiene que vencer el peso: F = m(g + a)."], ["Igual al peso", "velocidad-aceleracion", "Con empuje igual al peso, la fuerza neta es cero: no acelera."], ["Cualquiera, porque está en el aire", "conceptual", "Si el empuje no supera el peso, el cohete no despega."]],
    why: "Segunda ley con la fuerza neta: F − m·g = m·a.",
  },
];

export const fisDinamicaConceptos: Generator = {
  id: "fis-dinamica-conceptos",
  topicId: "t-newton",
  description: "Preguntas conceptuales de dinámica (peso/masa, N, μs/μd, fuerza neta)",
  generate(seed, d) {
    const r = rng(seed);
    const c = DIN_CONCEPTOS[(seed + d) % DIN_CONCEPTOS.length];
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, c.q, ["Pensá en qué fuerzas actúan y cuál es la aceleración.", "La segunda ley usa la fuerza NETA.", "Separá lo que es una propiedad del cuerpo de lo que depende de la situación."], [c.why], c.why),
      [{ text: c.ok, correct: true }, ...c.bad.map(([text, type, message]) => ({ text, error: { type, message } }))],
    );
  },
};

// ═══════════════════════════ Trabajo y energía ═══════════════════════════

export const fisEnergia: Generator = {
  id: "fis-energia",
  topicId: "t-energia",
  description: "Energía cinética y potencial, conservación y trabajo del rozamiento (W_roz = ΔEm)",
  generate(seed, d) {
    const r = rng(seed);
    if (d <= 1) {
      const m = r.pick([2, 5, 60, 800, 1200]);
      const kmh = r.pick([18, 36, 54, 72, 90]);
      const v = kmh / 3.6;
      const Ec = 0.5 * m * v * v;
      const big = Ec >= 10000;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: big ? "kJ" : "J", answer: big ? Ec / 1000 : Ec,
        prompt: `¿Qué energía cinética tiene un cuerpo de ${m} kg que se mueve a ${kmh} km/h?`,
        hints: ["Ec = ½·m·v².", "La velocidad tiene que estar en m/s: dividí por 3,6.", `v = ${n(v)} m/s.`],
        solution: [`v = ${kmh}/3,6 = ${n(v)} m/s`, `Ec = ½·${m}·${n(v)}² = ${s3(Ec)} J${big ? ` = ${s3(Ec / 1000)} kJ` : ""}`],
        explanation: "Con v en m/s y m en kg, la energía sale en joules. Como v va al cuadrado, olvidarse de convertir multiplica el error por 3,6² ≈ 13.",
        errors: [[(0.5 * m * kmh * kmh) / (big ? 1000 : 1), "unidades", "No pasaste los km/h a m/s (÷ 3,6) antes de elevar al cuadrado."], [(m * v * v) / (big ? 1000 : 1), "formula", "Te faltó el ½: Ec = ½·m·v²."], [(0.5 * m * v) / (big ? 1000 : 1), "potencias", "La velocidad va al cuadrado."]],
      });
    }
    if (d <= 3) {
      const H = r.pick([2, 3, 5, 8, 10, 12]);
      const h2 = d === 3 ? r.pick([0.5, 1, 1.5]) * (H > 4 ? 2 : 1) : 0;
      const v0 = d === 3 && r.bool() ? r.pick([2, 3, 4]) : 0;
      const v = Math.sqrt(v0 * v0 + 2 * G * (H - h2));
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s", answer: v,
        prompt: `Un carrito ${v0 ? `pasa a ${v0} m/s por` : "parte del reposo desde"} un punto a ${n(H)} m de altura y baja por una pista sin rozamiento. ¿Qué rapidez tiene ${h2 ? `cuando está a ${n(h2)} m de altura` : "al llegar al nivel del piso"}?`,
        hints: ["Sin rozamiento la energía mecánica se conserva: Ec + Ep = constante.", `½·m·v₀² + m·g·${n(H)} = ½·m·v² + m·g·${n(h2)}.`, "La masa se simplifica: v = √(v₀² + 2·g·Δh)."],
        solution: [`½v₀² + g·${n(H)} = ½v² + g·${n(h2)}`, `v² = ${v0}² + 2·9,80·${n(H - h2)}`, `v = ${s3(v)} m/s`],
        explanation: "La energía potencial que pierde al bajar se transforma en cinética. No importa la forma de la pista, solo el desnivel.",
        errors: [
          ...(h2 ? [[Math.sqrt(v0 * v0 + 2 * G * H), "conceptual", `No llega al piso: el desnivel es ${n(H)} − ${n(h2)} m.`] as Err] : []),
          ...(v0 ? [[Math.sqrt(2 * G * (H - h2)), "conceptual", "Te olvidaste de la energía cinética inicial (v₀ ≠ 0)."] as Err, [v0 + Math.sqrt(2 * G * (H - h2)), "conceptual", "Las velocidades no se suman: se suman las ENERGÍAS. v² = v₀² + 2gΔh."] as Err] : []),
          [2 * G * (H - h2) + v0 * v0, "calculo", "Te faltó la raíz: eso es v²."],
          [Math.sqrt(G * (H - h2) + v0 * v0), "formula", "Te faltó el 2: de ½v² = gΔh sale v = √(2gΔh)."],
        ],
      });
    }
    if (d === 4) {
      const H = r.pick([2, 3, 4, 5, 6]);
      const mu = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]);
      const m = r.pick([2, 5, 10]);
      const dd = H / mu;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m", answer: dd,
        prompt: `Un bloque de ${m} kg parte del reposo a ${n(H)} m de altura, baja por una rampa lisa y sigue por un tramo horizontal con μd = ${n(mu, 2)}. ¿Qué distancia recorre en el tramo horizontal hasta detenerse?`,
        hints: ["En la rampa lisa se conserva la energía: al llegar abajo Ec = m·g·H.", "En el tramo horizontal, el rozamiento le saca toda esa energía: μd·m·g·d = m·g·H.", "d = H/μd (la masa se simplifica)."],
        solution: [`Ec abajo = ${m}·9,80·${n(H)} = ${s3(m * G * H)} J`, `W_roz = −μd·m·g·d = −Ec`, `d = ${n(H)} / ${n(mu, 2)} = ${s3(dd)} m`],
        explanation: "El trabajo del rozamiento es igual a la variación de energía mecánica. Toda la energía potencial inicial termina disipada en el tramo rugoso.",
        errors: [[H * mu, "despeje", "Multiplicaste: de μd·d = H sale d = H/μd."], [(H / mu) / G, "calculo", "La g se simplifica: aparece en los dos lados (m·g·H = μd·m·g·d)."], [m * G * H, "conceptual", "Esa es la energía (J), no la distancia. Igualala al trabajo del rozamiento μd·m·g·d."]],
      });
    }
    const m = r.pick([800, 1000, 1200, 1500]);
    const vaK = r.pick([72, 90, 108]);
    const vbK = vaK - r.pick([18, 36]);
    const dh = r.pick([5, 8, 10, 15, 20]);
    const va = vaK / 3.6, vb = vbK / 3.6;
    const W = 0.5 * m * (vb * vb - va * va) - m * G * dh;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "kJ", answer: W / 1000,
      prompt: `Un auto de ${m} kg baja por una pendiente: pasa de ${vaK} km/h a ${vbK} km/h mientras desciende ${dh} m de altura. ¿Cuánto vale el trabajo de las fuerzas no conservativas (rozamiento, frenos)?`,
      hints: ["W_no cons = ΔEm = ΔEc + ΔEp.", "ΔEc = ½·m·(v_B² − v_A²) con velocidades en m/s. ΔEp = m·g·(h_B − h_A).", `Baja ${dh} m: h_B − h_A = −${dh} m.`],
      solution: [`v_A = ${s3(va)} m/s;  v_B = ${s3(vb)} m/s`, `ΔEc = ½·${m}·(${s3(vb)}² − ${s3(va)}²) = ${s3(0.5 * m * (vb * vb - va * va))} J`, `ΔEp = ${m}·9,80·(−${dh}) = ${s3(-m * G * dh)} J`, `W = ${s3(W)} J = ${s3(W / 1000)} kJ`],
      explanation: "Las fuerzas no conservativas cambian la energía mecánica. Al bajar frenando se pierde cinética Y potencial: las dos variaciones suman.",
      errors: [[(0.5 * m * (vb * vb - va * va)) / 1000, "conceptual", "Omitiste la variación de energía potencial (m·g·Δh). El auto también bajó."], [(0.5 * m * (vb * vb - va * va) + m * G * dh) / 1000, "signos", "El auto BAJA: Δh es negativo y la Ep disminuye."], [(0.5 * m * (vbK * vbK - vaK * vaK) - m * G * dh) / 1000, "unidades", "Usaste las velocidades en km/h. Pasalas a m/s antes de elevar al cuadrado."]],
    });
  },
};

export const fisResorte: Generator = {
  id: "fis-resorte",
  topicId: "t-resorte-potencia",
  description: "Ley de Hooke y energía elástica",
  generate(seed, d) {
    const r = rng(seed);
    const k = r.pick([100, 200, 250, 400, 500, 800, 1200]);
    const xcm = r.pick([2, 4, 5, 8, 10, 12, 15]);
    const x = xcm / 100;
    const mode = d <= 1 ? "F" : d === 2 ? "k" : d <= 4 ? "E" : r.pick(["v", "caja"] as const);
    if (mode === "F") return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: k * x,
      prompt: `Un resorte de constante k = ${k} N/m se estira ${xcm} cm. ¿Qué fuerza ejerce (en módulo)?`,
      hints: ["Ley de Hooke: |F| = k·Δx.", "Δx en metros: dividí los cm por 100.", `F = ${k}·${n(x)}.`],
      solution: [`Δx = ${xcm} cm = ${n(x)} m`, `F = ${k}·${n(x)} = ${s3(k * x)} N`],
      explanation: "La fuerza elástica es proporcional a la deformación y se opone a ella: F = −k·Δx.",
      errors: [[k * xcm, "unidades", "Usaste los centímetros sin pasar a metros."], [k / x, "despeje", "Es k POR Δx, no dividido."]],
    });
    if (mode === "k") {
      const m = r.pick([0.5, 1, 2, 3, 5]);
      const kk = (m * G) / x;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "N/m", answer: kk,
        prompt: `Al colgar un cuerpo de ${n(m)} kg de un resorte vertical, este se estira ${xcm} cm hasta quedar en equilibrio. ¿Cuál es la constante del resorte?`,
        hints: ["En equilibrio, la fuerza del resorte equilibra al peso: k·Δx = m·g.", "Pasá Δx a metros.", `k = ${n(m)}·9,80 / ${n(x)}.`],
        solution: [`k·${n(x)} = ${n(m)}·9,80`, `k = ${s3(m * G)} / ${n(x)} = ${s3(kk)} N/m`],
        explanation: "La constante k dice cuántos newtons hacen falta por cada metro de deformación.",
        errors: [[(m * G) / xcm, "unidades", "Usaste Δx en cm. Pasalo a metros."], [m / x, "conceptual", "Usaste la masa en lugar del peso: P = m·g."]],
      });
    }
    if (mode === "E") {
      const E = 0.5 * k * x * x;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "J", answer: E,
        prompt: `¿Cuánta energía elástica almacena un resorte de k = ${k} N/m comprimido ${xcm} cm?`,
        hints: ["E_el = ½·k·Δx².", "Δx en metros.", `E = ½·${k}·${n(x)}².`],
        solution: [`Δx = ${n(x)} m`, `E = ½·${k}·${n(x * x, 4)} = ${s3(E)} J`],
        explanation: "La energía elástica crece con el cuadrado de la deformación: el doble de compresión guarda el cuádruple de energía.",
        errors: [[k * x * x, "formula", "Te faltó el ½."], [0.5 * k * x, "potencias", "La deformación va al cuadrado."], [0.5 * k * xcm * xcm, "unidades", "Usaste centímetros: pasá Δx a metros."]],
      });
    }
    if (mode === "v") {
      const m = r.pick([0.1, 0.2, 0.25, 0.5, 1]);
      const v = x * Math.sqrt(k / m);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "m/s", answer: v,
        prompt: `Un resorte horizontal de k = ${k} N/m, comprimido ${xcm} cm, lanza un bloque de ${n(m)} kg sobre una superficie sin rozamiento. ¿Con qué rapidez sale el bloque?`,
        hints: ["Sin rozamiento, la energía elástica se transforma en cinética.", "½·k·Δx² = ½·m·v².", "v = Δx·√(k/m), con Δx en metros."],
        solution: [`½·${k}·${n(x)}² = ½·${n(m)}·v²`, `v = ${n(x)}·√(${k}/${n(m)})`, `v = ${s3(v)} m/s`],
        explanation: "Conservación de la energía: lo que estaba guardado en el resorte sale como energía de movimiento.",
        errors: [[(k * x) / m, "conceptual", "Igualaste fuerza con masa (eso daría una aceleración). Usá energías: ½kΔx² = ½mv²."], [xcm * Math.sqrt(k / m), "unidades", "Usaste la compresión en cm."], [x * x * (k / m), "calculo", "Te faltó la raíz: eso es v²."]],
      });
    }
    const M = r.pick([2, 3, 4, 5]);
    const mus = r.pick([0.3, 0.4, 0.5, 0.6]);
    const k2 = r.pick([200, 300, 400, 500]);
    const dx = (mus * M * G) / k2;
    const askE = r.bool();
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: askE ? "J" : "cm", answer: askE ? 0.5 * k2 * dx * dx : dx * 100,
      prompt: `Una caja de ${M} kg está en reposo sobre un piso horizontal (μs = ${n(mus, 2)}). Se la empuja con un resorte de k = ${k2} N/m, comprimiéndolo de a poco. ${askE ? "¿Cuánta energía elástica tiene el resorte justo cuando la caja está por empezar a moverse?" : "¿Cuánto se comprimió el resorte (en cm) justo cuando la caja está por empezar a moverse?"}`,
      hints: ["La caja arranca cuando la fuerza del resorte alcanza el rozamiento estático máximo.", "k·Δx = μs·m·g.", askE ? "Con Δx, calculá E = ½·k·Δx²." : "Despejá Δx y pasalo a cm."],
      solution: [`k·Δx = ${n(mus, 2)}·${M}·9,80 = ${s3(mus * M * G)} N`, `Δx = ${s3(mus * M * G)} / ${k2} = ${s3(dx)} m`, ...(askE ? [`E = ½·${k2}·${s3(dx)}² = ${s3(0.5 * k2 * dx * dx)} J`] : [`Δx = ${s3(dx * 100)} cm`])],
      explanation: "Mientras la caja no se mueve, el rozamiento estático iguala a la fuerza del resorte; arranca cuando el resorte supera μs·N.",
      errors: askE
        ? [[k2 * dx * dx, "formula", "Te faltó el ½ en ½·k·Δx²."], [0.5 * k2 * dx, "potencias", "Δx va al cuadrado."]]
        : [[(M * G) / k2 * 100, "conceptual", "Te olvidaste de μs: la caja arranca cuando el resorte supera μs·m·g, no todo el peso."], [dx, "unidades", "Ese valor está en metros; te lo piden en cm."]],
    });
  },
};

export const fisPotencia: Generator = {
  id: "fis-potencia",
  topicId: "t-resorte-potencia",
  description: "Potencia media: P = W/t y P = F·v",
  generate(seed, d) {
    const r = rng(seed);
    const mode = d <= 2 ? "eleva" : d <= 4 ? r.pick(["eleva", "Fv"] as const) : r.pick(["acelera", "arrastra"] as const);
    if (mode === "eleva") {
      const m = r.pick([50, 80, 150, 300, 500]);
      const h = r.pick([4, 6, 10, 12, 15]);
      const t = r.pick([5, 8, 10, 20, 30]);
      const P = (m * G * h) / t;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "W", answer: P,
        prompt: `Un montacargas sube ${m} kg a velocidad constante hasta ${h} m de altura en ${t} s. ¿Qué potencia media desarrolla?`,
        hints: ["A velocidad constante, el motor hace el trabajo de subir el peso: W = m·g·h.", "Potencia = trabajo / tiempo.", `P = ${m}·9,80·${h} / ${t}.`],
        solution: [`W = ${m}·9,80·${h} = ${s3(m * G * h)} J`, `P = ${s3(m * G * h)} / ${t} = ${s3(P)} W`],
        explanation: "La potencia mide qué tan rápido se entrega energía: 1 W = 1 J por segundo.",
        errors: [[(m * h) / t, "conceptual", "Usaste la masa como si fuera una fuerza: falta g."], [m * G * h, "conceptual", "Ese es el trabajo (J). La potencia es W/t."], [m * G * h * t, "despeje", "Es trabajo DIVIDIDO por el tiempo."]],
      });
    }
    if (mode === "Fv") {
      const F = r.pick([300, 500, 800, 1200]);
      const kmh = r.pick([36, 54, 72, 90]);
      const P = F * (kmh / 3.6);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "kW", answer: P / 1000,
        prompt: `Un auto avanza a ${kmh} km/h constantes; las fuerzas de rozamiento que lo frenan suman ${F} N. ¿Qué potencia entrega el motor?`,
        hints: ["A velocidad constante, la fuerza del motor iguala al rozamiento.", "P = F·v, con v en m/s.", `v = ${kmh}/3,6 = ${n(kmh / 3.6)} m/s.`],
        solution: [`F_motor = ${F} N`, `P = ${F}·${n(kmh / 3.6)} = ${s3(P)} W = ${s3(P / 1000)} kW`],
        explanation: "P = W/t = F·d/t = F·v. Para mantener la velocidad, el motor compensa exactamente lo que el rozamiento disipa.",
        errors: [[(F * kmh) / 1000, "unidades", "Usaste km/h. Pasá la velocidad a m/s."], [P, "unidades", "Ese valor está en W; te lo piden en kW (÷ 1000)."]],
      });
    }
    if (mode === "acelera") {
      const m = r.pick([900, 1000, 1200, 1500]);
      const kmh = r.pick([72, 90, 108]);
      const t = r.pick([6, 8, 10, 12]);
      const v = kmh / 3.6;
      const P = (0.5 * m * v * v) / t;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "kW", answer: P / 1000,
        prompt: `Un auto de ${m} kg acelera desde el reposo hasta ${kmh} km/h en ${t} s sobre un camino horizontal. Despreciando rozamientos, ¿qué potencia media entrega el motor?`,
        hints: ["El trabajo del motor se convierte en energía cinética: W = ΔEc.", "ΔEc = ½·m·v², con v en m/s.", "P = W/t; pasá a kW."],
        solution: [`v = ${s3(v)} m/s`, `W = ½·${m}·${s3(v)}² = ${s3(0.5 * m * v * v)} J`, `P = W/${t} = ${s3(P)} W = ${s3(P / 1000)} kW`],
        explanation: "Sin rozamiento, todo el trabajo del motor aumenta la energía cinética.",
        errors: [[(0.5 * m * kmh * kmh) / t / 1000, "unidades", "Usaste km/h: pasá a m/s antes de elevar al cuadrado."], [(m * v * v) / t / 1000, "formula", "Te faltó el ½ de la energía cinética."], [(0.5 * m * v * v) / 1000, "conceptual", "Ese es el trabajo en kJ. Falta dividir por el tiempo."]],
      });
    }
    const M = r.pick([20, 30, 40, 50]);
    const mu = r.pick([0.2, 0.3, 0.4]);
    const dist = r.pick([5, 8, 10, 12]);
    const t = r.pick([4, 5, 8, 10]);
    const P = (mu * M * G * dist) / t;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "W", answer: P,
      prompt: `Una persona arrastra una caja de ${M} kg a velocidad constante ${dist} m sobre un piso horizontal (μd = ${n(mu, 2)}) en ${t} s, tirando de ella horizontalmente. ¿Qué potencia media desarrolla?`,
      hints: ["A velocidad constante, la fuerza que hace iguala al rozamiento: F = μd·m·g.", "W = F·d.", "P = W/t."],
      solution: [`F = ${n(mu, 2)}·${M}·9,80 = ${s3(mu * M * G)} N`, `W = ${s3(mu * M * G)}·${dist} = ${s3(mu * M * G * dist)} J`, `P = ${s3(P)} W`],
      explanation: "La potencia es el ritmo al que se hace el trabajo. A velocidad constante, la fuerza aplicada solo compensa el rozamiento.",
      errors: [[(M * G * dist) / t, "conceptual", "Usaste el peso como fuerza. Para arrastrar a velocidad constante alcanza con vencer el rozamiento μd·m·g."], [mu * M * G * dist, "conceptual", "Ese es el trabajo; la potencia es W/t."]],
    });
  },
};

// ═══════════════════════════ Hidrostática ═══════════════════════════

const PATM = 101.3; // kPa

export const fisPresion: Generator = {
  id: "fis-presion",
  topicId: "t-presion",
  description: "Presión hidrostática p = δ·g·h (manométrica y absoluta)",
  generate(seed, d) {
    const r = rng(seed);
    const [liq, dens] = r.pick(d <= 2 ? [["agua", 1]] as const : [["agua", 1], ["agua de mar", 1.03], ["aceite", 0.92], ["glicerina", 1.26], ["mercurio", 13.6]] as const);
    const inCm = d >= 3 && (liq === "mercurio" || r.bool());
    const h = inCm ? r.pick([20, 35, 50, 76, 80]) : r.pick([2, 5, 8, 12, 15, 20, 30]);
    const hm = inCm ? h / 100 : h;
    const p = (dens * 1000 * G * hm) / 1000; // kPa
    const mode = d <= 3 ? "man" : d === 4 ? r.pick(["man", "abs"] as const) : r.pick(["abs", "dif"] as const);
    const dTxt = liq === "agua" ? "" : ` (δ = ${n(dens, 2)} g/cm³)`;
    if (mode === "dif") {
      const h2 = hm + r.pick([3, 4, 6, 10]) * (inCm ? 0.1 : 1);
      const dp = (dens * 1000 * G * (h2 - hm)) / 1000;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "kPa", answer: dp,
        prompt: `En un tanque con ${liq}${dTxt}, ¿cuál es la diferencia de presión entre un punto a ${n(hm)} m de profundidad y otro a ${n(h2)} m?`,
        hints: ["Por el teorema fundamental: Δp = δ·g·Δh.", "La presión atmosférica actúa sobre los dos puntos: se cancela.", "δ en kg/m³: multiplicá los g/cm³ por 1000."],
        solution: [`Δh = ${n(h2 - hm)} m`, `Δp = ${n(dens * 1000)}·9,80·${n(h2 - hm)} = ${s3(dp * 1000)} Pa`, `Δp = ${s3(dp)} kPa`],
        explanation: "La diferencia de presión entre dos puntos de un líquido solo depende del desnivel entre ellos.",
        errors: [[(dens * 1000 * G * h2) / 1000, "conceptual", "Esa es la presión en el punto más profundo. Te piden la DIFERENCIA: usá Δh."], [(dens * 1000 * G * (h2 - hm)) / 1000 + PATM, "conceptual", "La presión atmosférica actúa sobre los dos puntos y se cancela en la diferencia."]],
      });
    }
    const abs = mode === "abs";
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "kPa", answer: abs ? p + PATM : p,
      prompt: `¿Cuál es la presión ${abs ? "absoluta" : "manométrica (la debida solo al líquido)"} a ${h} ${inCm ? "cm" : "m"} de profundidad en ${liq}${dTxt}?${abs ? ` (p_atm = ${n(PATM)} kPa)` : ""}`,
      hints: ["Teorema fundamental: p = δ·g·h.", `Todo en SI: δ = ${n(dens * 1000)} kg/m³${inCm ? `, h = ${n(hm)} m` : ""}.`, abs ? "La absoluta suma la presión atmosférica de la superficie." : "Pasá de Pa a kPa (÷ 1000)."],
      solution: [`p_líq = ${n(dens * 1000)}·9,80·${n(hm)} = ${s3(p * 1000)} Pa = ${s3(p)} kPa`, ...(abs ? [`p_abs = ${n(PATM)} + ${s3(p)} = ${s3(p + PATM)} kPa`] : [])],
      explanation: "La presión crece linealmente con la profundidad. La manométrica cuenta solo el líquido; la absoluta le suma la atmósfera.",
      errors: [
        abs ? [p, "conceptual", "Esa es la presión manométrica. La absoluta suma la atmosférica: p = p_atm + δgh."] : [p + PATM, "conceptual", "Sumaste la presión atmosférica. Te piden solo la del líquido (manométrica)."],
        [(dens * G * hm) / 1000 + (abs ? PATM : 0), "unidades", "Usaste la densidad en g/cm³. En SI es en kg/m³: multiplicá por 1000."],
        ...(inCm ? [[(dens * 1000 * G * h) / 1000 + (abs ? PATM : 0), "unidades", "Usaste la profundidad en cm. Pasala a metros."] as Err] : []),
      ],
    });
  },
};

export const fisPrensa: Generator = {
  id: "fis-prensa",
  topicId: "t-presion",
  description: "Principio de Pascal: prensa hidráulica con diámetros",
  generate(seed, d) {
    const r = rng(seed);
    const d1 = r.pick([2, 3, 4, 5]);
    const d2 = d1 * r.pick([5, 6, 8, 10]) + (d >= 4 ? r.pick([0, 2, 5]) : 0);
    const M = r.pick([800, 1000, 1200, 1500, 2000]);
    const W = M * G;
    const F1 = W * (d1 / d2) ** 2;
    const askP = d >= 3 && r.bool();
    const A2 = Math.PI * (d2 / 200) ** 2;
    const p = W / A2 / 1000; // kPa
    if (askP) return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "kPa", answer: p,
      prompt: `En un elevador hidráulico, el pistón grande tiene ${d2} cm de diámetro y sostiene un auto de ${M} kg. ¿Qué presión (manométrica) hay en el líquido?`,
      hints: ["p = F/A, con F el peso del auto.", "El área del pistón es π·r², con r = diámetro/2, en metros.", `r = ${n(d2 / 200, 4)} m.`],
      solution: [`P = ${M}·9,80 = ${s3(W)} N`, `A = π·(${n(d2 / 200, 4)})² = ${s3(A2)} m²`, `p = ${s3(W)} / ${s3(A2)} = ${s3(p * 1000)} Pa = ${s3(p)} kPa`],
      explanation: "La presión es fuerza por unidad de área. El área de un círculo se calcula con el RADIO.",
      errors: [[p / 4, "formula", "Usaste el diámetro como si fuera el radio: el área salió 4 veces más grande."], [(M / A2) / 1000, "unidades", "Usaste la masa en lugar del peso (falta g)."], [(W / (Math.PI * (d2 / 2) ** 2)) / 1000, "unidades", "Dejaste el radio en cm: pasalo a metros."]],
    });
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: F1,
      prompt: `Una prensa hidráulica tiene un pistón chico de ${d1} cm de diámetro y uno grande de ${d2} cm. ¿Qué fuerza hay que hacer sobre el chico para sostener un auto de ${M} kg apoyado en el grande?`,
      hints: ["Pascal: la presión es la misma en los dos pistones: F₁/A₁ = F₂/A₂.", "Las áreas están en la razón de los CUADRADOS de los diámetros.", `F₁ = P·(${d1}/${d2})².`],
      solution: [`F₂ = ${M}·9,80 = ${s3(W)} N`, `F₁ = F₂·(d₁/d₂)² = ${s3(W)}·(${d1}/${d2})²`, `F₁ = ${s3(F1)} N`],
      explanation: "Como A = π d²/4, el cociente de áreas es (d₁/d₂)². Reducir 10 veces el diámetro reduce 100 veces la fuerza necesaria.",
      errors: [[W * (d1 / d2), "potencias", "Usaste la razón de diámetros sin elevar al cuadrado. Las áreas van con d²."], [M * (d1 / d2) ** 2, "unidades", "Usaste la masa: la fuerza que hay que equilibrar es el peso m·g."], [W * (d2 / d1) ** 2, "despeje", "Invertiste la razón: el pistón chico necesita MENOS fuerza."]],
    });
  },
};

export const fisFlotacion: Generator = {
  id: "fis-flotacion",
  topicId: "t-arquimedes",
  description: "Empuje (Arquímedes), flotación y cuerpo apoyado en el fondo",
  generate(seed, d) {
    const r = rng(seed);
    const mode = d <= 2 ? "frac" : d === 3 ? r.pick(["empuje", "frac"] as const) : d === 4 ? r.pick(["fondo", "vsum"] as const) : r.pick(["fondo", "aparente", "frac"] as const);
    if (mode === "frac") {
      const [bName, db] = r.pick([["madera", 0.6], ["pino", 0.5], ["hielo", 0.92], ["corcho", 0.25], ["plástico", 0.75], ["roble", 0.8]] as const);
      const [lName, dl] = d <= 3 ? (["agua", 1] as const) : r.pick([["agua", 1], ["agua de mar", 1.03], ["glicerina", 1.26]] as const);
      const askEm = d >= 2 && r.bool();
      const sub = (db / dl) * 100;
      const ans = askEm ? 100 - sub : sub;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "%", answer: ans,
        prompt: `Un bloque de ${bName} (δ = ${n(db, 2)} g/cm³) flota en ${lName}${dl !== 1 ? ` (δ = ${n(dl, 2)} g/cm³)` : ""}. ¿Qué porcentaje de su volumen queda ${askEm ? "FUERA del líquido (emergido)" : "sumergido"}?`,
        hints: ["Flota en equilibrio: empuje = peso.", "δ_L·V_sum·g = δ_c·V·g ⇒ V_sum/V = δ_c/δ_L.", askEm ? "Lo emergido es lo que falta para el 100 %." : "Pasalo a porcentaje."],
        solution: [`V_sum/V = ${n(db, 2)}/${n(dl, 2)} = ${s3(db / dl)}`, `Sumergido: ${s3(sub)} %`, ...(askEm ? [`Emergido: 100 − ${s3(sub)} = ${s3(100 - sub)} %`] : [])],
        explanation: "La fracción sumergida es el cociente de densidades: un cuerpo con la mitad de densidad que el líquido flota con la mitad adentro.",
        errors: [[askEm ? sub : 100 - sub, "interpretacion", askEm ? "Ese es el porcentaje SUMERGIDO. Te piden lo que queda afuera: 100 % menos eso." : "Ese es el porcentaje EMERGIDO. Lo sumergido es δ_c/δ_L."], [(dl / db) * 100, "fracciones", "Invertiste el cociente: la fracción sumergida es δ_cuerpo/δ_líquido (menor que 1 si flota)."]],
      });
    }
    if (mode === "empuje") {
      const VL = r.pick([0.5, 1.2, 2, 2.5, 4, 6]);
      const [lName, dl] = r.pick([["agua", 1], ["aceite", 0.92], ["agua de mar", 1.03]] as const);
      const E = dl * 1000 * (VL / 1000) * G;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: E,
        prompt: `Un objeto de ${n(VL)} L está totalmente sumergido en ${lName} (δ = ${n(dl, 2)} g/cm³). ¿Qué empuje recibe?`,
        hints: ["Arquímedes: E = δ_L·V_sum·g.", "1 L = 1 dm³ = 0,001 m³; δ en kg/m³ (× 1000).", `E = ${n(dl * 1000)}·${n(VL / 1000, 4)}·9,80.`],
        solution: [`V = ${n(VL)} L = ${n(VL / 1000, 4)} m³`, `E = ${n(dl * 1000)}·${n(VL / 1000, 4)}·9,80 = ${s3(E)} N`],
        explanation: "El empuje es el peso del líquido desalojado. Para un cuerpo totalmente sumergido no depende de la profundidad ni del material del cuerpo.",
        errors: [[dl * 1000 * VL * G, "unidades", "Dejaste el volumen en litros. Pasalo a m³ (÷ 1000)."], [dl * VL, "conceptual", "Esa es la masa de líquido desalojado (kg). El empuje es su PESO: multiplicá por g."]],
      });
    }
    const m = r.pick([5, 8, 12, 15, 20, 30]);
    const dc = r.pick([2.5, 3, 4, 7.8]);
    const VL = m / dc; // litros (δ en kg/L)
    const E = 1000 * (VL / 1000) * G;
    if (mode === "vsum") {
      const mb = r.pick([3, 5, 8, 12]);
      const [lName, dl] = r.pick([["agua", 1], ["agua de mar", 1.03], ["aceite", 0.92]] as const);
      const V = mb / dl;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "L", answer: V,
        prompt: `Un bote de juguete de ${mb} kg flota en ${lName} (δ = ${n(dl, 2)} g/cm³). ¿Qué volumen de líquido desaloja?`,
        hints: ["Si flota, empuje = peso.", "δ_L·V_sum·g = m·g ⇒ V_sum = m/δ_L.", "δ en g/cm³ es lo mismo que kg/L."],
        solution: [`V_sum = ${mb} / ${n(dl, 2)} kg/L`, `V_sum = ${s3(V)} L`],
        explanation: "Un cuerpo que flota desaloja exactamente su propia masa de líquido (no su volumen).",
        errors: [[mb * dl, "despeje", "Multiplicaste: V = m/δ."], [mb * G, "conceptual", "Ese es el peso (N), no el volumen desalojado."]],
      });
    }
    const P = m * G;
    if (mode === "fondo") {
      const Nn = P - E;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: Nn,
        prompt: `Una pieza maciza de ${m} kg y ${s3(VL)} L de volumen está apoyada en el fondo de un tanque lleno de agua. ¿Qué fuerza hace el fondo sobre ella?`,
        hints: ["Fuerzas sobre la pieza: peso (abajo), empuje y normal (arriba).", "Está en equilibrio: N + E = P.", "E = δ_agua·V·g con V en m³."],
        solution: [`P = ${m}·9,80 = ${s3(P)} N`, `E = 1000·${n(VL / 1000, 5)}·9,80 = ${s3(E)} N`, `N = P − E = ${s3(Nn)} N`],
        explanation: "El fondo no sostiene todo el peso: el agua ayuda con el empuje. Por eso las piedras parecen más livianas bajo el agua.",
        errors: [[P, "conceptual", "Te olvidaste del empuje: el agua sostiene una parte del peso."], [E, "conceptual", "Ese es el empuje. La normal es lo que falta para equilibrar el peso: N = P − E."], [P + E, "signos", "El empuje apunta hacia ARRIBA: N = P − E."]],
      });
    }
    const T = P - E;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "N", answer: T,
      prompt: `Un objeto de ${m} kg y densidad ${n(dc, 2)} g/cm³ cuelga de un dinamómetro, totalmente sumergido en agua. ¿Qué marca el dinamómetro?`,
      hints: ["Primero el volumen: V = m/δ.", "E = δ_agua·V·g.", "Dinamómetro: T = P − E (peso aparente)."],
      solution: [`V = ${m}/${n(dc, 2)} = ${s3(VL)} L`, `E = 1000·${n(VL / 1000, 5)}·9,80 = ${s3(E)} N`, `T = ${s3(P)} − ${s3(E)} = ${s3(T)} N`],
      explanation: "Dentro del agua el dinamómetro marca el peso aparente, menor que el real en el valor del empuje.",
      errors: [[P, "conceptual", "Ese es el peso real. Sumergido, el empuje lo «aliviana»."], [P - dc * 1000 * (VL / 1000) * G, "conceptual", "Usaste la densidad del objeto en el empuje. E depende del LÍQUIDO: δ_agua·V·g."]],
    });
  },
};

const HIDRO_CONCEPTOS: { q: string; ok: string; bad: [string, ErrorType, string][]; why: string }[] = [
  {
    q: "Una piedra totalmente sumergida baja desde 1 m hasta 5 m de profundidad. El empuje que recibe…",
    ok: "No cambia",
    bad: [["Aumenta", "conceptual", "La presión aumenta con la profundidad, pero el empuje depende del volumen sumergido, que ya es todo."], ["Disminuye", "conceptual", "El empuje es δ_L·V_sum·g: ninguno de esos factores cambia."], ["Se anula al tocar el fondo", "conceptual", "El empuje sigue actuando apoyada o no; lo que aparece en el fondo es además una normal."]],
    why: "E = δ_L·V_sum·g: totalmente sumergido, V_sum es fijo.",
  },
  {
    q: "Dos recipientes con agua hasta la misma altura: uno ancho y otro angosto. La presión en el fondo…",
    ok: "Es la misma en los dos",
    bad: [["Es mayor en el ancho", "conceptual", "Hay más agua, pero p = δ·g·h solo depende de la profundidad."], ["Es mayor en el angosto", "conceptual", "La forma del recipiente no importa (paradoja hidrostática)."], ["Depende de la masa total de agua", "conceptual", "La presión es fuerza por área: en el fondo vale δ·g·h."]],
    why: "Teorema fundamental: p = p_atm + δ·g·h, sin importar la forma.",
  },
  {
    q: "En una prensa hidráulica, el pistón grande tiene el triple de diámetro que el chico. La fuerza en el grande es…",
    ok: "9 veces la del chico",
    bad: [["3 veces la del chico", "potencias", "Las áreas van con el cuadrado del diámetro: 3² = 9."], ["Igual a la del chico", "conceptual", "Lo que es igual es la PRESIÓN; la fuerza es presión × área."], ["6 veces la del chico", "potencias", "No es el doble del diámetro: es el cuadrado. (3)² = 9."]],
    why: "Pascal: F₁/A₁ = F₂/A₂ y A ∝ d².",
  },
  {
    q: "Un cubo de densidad 0,600 g/cm³ flota en agua. ¿Qué parte queda fuera del agua?",
    ok: "El 40 %",
    bad: [["El 60 %", "interpretacion", "El 60 % es lo SUMERGIDO (δ_c/δ_L = 0,6). Afuera queda el 40 %."], ["Nada: se hunde", "conceptual", "Su densidad es menor que la del agua: flota."], ["El 50 %", "conceptual", "La fracción sumergida es el cociente de densidades: 0,6."]],
    why: "V_sum/V = δ_c/δ_L = 0,6 ⇒ emerge 0,4.",
  },
  {
    q: "Un barco pasa de un río (agua dulce) al mar (agua salada, más densa). ¿Qué pasa con su línea de flotación?",
    ok: "Flota un poco más alto",
    bad: [["Se hunde un poco más", "conceptual", "Con un líquido más denso, hace falta MENOS volumen sumergido para igualar el peso."], ["No cambia", "conceptual", "V_sum = m/δ_L: si δ_L aumenta, V_sum disminuye."], ["Se hunde", "conceptual", "El empuje sigue igualando al peso; solo cambia cuánto se sumerge."]],
    why: "Flotando, E = P siempre; con δ_L mayor alcanza menos V_sum.",
  },
];

export const fisHidroConceptos: Generator = {
  id: "fis-hidro-conceptos",
  topicId: "t-arquimedes",
  description: "Preguntas conceptuales de hidrostática",
  generate(seed, d) {
    const r = rng(seed);
    const c = HIDRO_CONCEPTOS[(seed + d) % HIDRO_CONCEPTOS.length];
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, c.q, ["Recordá de qué depende cada magnitud.", "Presión: δ·g·h. Empuje: δ_L·V_sum·g.", "Fracción sumergida = δ_cuerpo/δ_líquido."], [c.why], c.why),
      [{ text: c.ok, correct: true }, ...c.bad.map(([text, type, message]) => ({ text, error: { type, message } }))],
    );
  },
};

export const FISICA_GENERATORS: Generator[] = [
  fisVecComponente,
  fisVecAngulo,
  fisVecResta,
  fisVecEquilibrante,
  fisVecProductoVectorial,
  fisMruEncuentro,
  fisMruDesfase,
  fisFrenado,
  fisPersecucion,
  fisGraficoVt,
  fisTiroOblicuo,
  fisTiroAltura,
  fisCaidaAstros,
  fisNudo,
  fisVigaCuerda,
  fisMomentosApoyos,
  fisNewton,
  fisPlanoInclinado,
  fisVinculados,
  fisDinamicaConceptos,
  fisEnergia,
  fisResorte,
  fisPotencia,
  fisPresion,
  fisPrensa,
  fisFlotacion,
  fisHidroConceptos,
];
