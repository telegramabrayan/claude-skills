import type { Generator, NumericExercise } from "../types";
import { fmt } from "../math/parser";
import { rng } from "./rng";
import { base, choice, par, sgn } from "./helpers";

const G = 9.8; // m/s², valor usado habitualmente en los cursos de Física del CBC

const TRIPLES: [number, number][] = [[3, 4], [6, 8], [5, 12], [8, 6], [12, 5], [9, 12], [8, 15]];

export const vectorModulo: Generator = {
  id: "vector-modulo",
  topicId: "t-vectores",
  description: "Módulo de un vector a partir de sus componentes",
  generate(seed, d) {
    const r = rng(seed);
    let [x, y] = d <= 3 ? r.pick(TRIPLES) : [r.nz(-9, 9), r.nz(-9, 9)];
    if (d >= 2) {
      if (r.bool()) x = -x;
      if (r.bool()) y = -y;
    }
    const mod = Math.hypot(x, y);
    const ex: NumericExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `¿Cuál es el módulo del vector $v = (${fmt(x)}, ${fmt(y)})$?${Number.isInteger(mod) ? "" : " (redondeá a 2 decimales)"}`,
        hints: [
          "El módulo es el largo de la flecha.",
          "Las componentes forman un triángulo rectángulo con el vector: usá Pitágoras.",
          `|v| = √(${par(x)}² + ${par(y)}²) = √(${x * x} + ${y * y}).`,
        ],
        solution: [`|v| = √(${par(x)}² + ${par(y)}²)`, `= √(${x * x} + ${y * y}) = √${x * x + y * y}`, `= ${fmt(mod, 2)}`],
        explanation: "El módulo de (x, y) es √(x² + y²), por el teorema de Pitágoras. Siempre es positivo.",
        frequentErrors: [
          { match: Math.abs(x) + Math.abs(y), type: "vectores", message: "Sumaste las componentes. El largo de la flecha no es x + y: es la hipotenusa del triángulo, √(x² + y²)." },
          { match: x + y, type: "vectores", message: "Sumaste las componentes. El módulo se calcula con Pitágoras: √(x² + y²)." },
          { match: x * x + y * y, type: "calculo", message: "Te faltó la raíz cuadrada al final." },
        ].filter((e) => Math.abs((e.match as number) - mod) > 0.01),
        formulaId: "modulo-vector",
        visual: { type: "vector", vectors: [{ x, y, label: "v" }] },
      }),
      kind: "numeric",
      answer: Math.round(mod * 100) / 100,
      tolerance: 0.011,
    };
    return ex;
  },
};

export const vectorSuma: Generator = {
  id: "vector-suma",
  topicId: "t-vectores",
  description: "Suma y resta de vectores por componentes",
  generate(seed, d) {
    const r = rng(seed);
    const u = [r.int(-6, 6), r.int(-6, 6)];
    const v = [r.int(-6, 6), r.int(-6, 6)];
    const minus = d >= 3 && r.bool();
    const k = d >= 4 ? r.pick([2, 3, -1]) : 1;
    const res = [u[0] * k + (minus ? -v[0] : v[0]), u[1] * k + (minus ? -v[1] : v[1])];
    const kTxt = k === 1 ? "" : k === -1 ? "−" : `${k}·`;
    const t = (p: number[]) => `(${fmt(p[0])}, ${fmt(p[1])})`;
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `Si $u = ${t(u)}$ y $v = ${t(v)}$, calculá $${kTxt}u ${minus ? "−" : "+"} v$`,
        hints: [
          "Los vectores se operan componente a componente: x con x, y con y.",
          k !== 1 ? `Primero multiplicá cada componente de u por ${k}: ${t([u[0] * k, u[1] * k])}.` : `Componente x: ${fmt(u[0])} ${minus ? "−" : "+"} ${par(v[0])}.`,
          `Componente y: ${fmt(u[1] * k)} ${minus ? "−" : "+"} ${par(v[1])}.`,
        ],
        solution: [
          ...(k !== 1 ? [`${kTxt}u = ${t([u[0] * k, u[1] * k])}`] : []),
          `x: ${fmt(u[0] * k)} ${minus ? "−" : "+"} ${par(v[0])} = ${fmt(res[0])}`,
          `y: ${fmt(u[1] * k)} ${minus ? "−" : "+"} ${par(v[1])} = ${fmt(res[1])}`,
          `Resultado: ${t(res)}`,
        ],
        explanation: "(a, b) + (c, d) = (a + c, b + d). Geométricamente: se pone una flecha a continuación de la otra.",
        visual: { type: "vector", vectors: [{ x: u[0] * k, y: u[1] * k, label: `${kTxt}u` }, { x: minus ? -v[0] : v[0], y: minus ? -v[1] : v[1], label: minus ? "−v" : "v" }, { x: res[0], y: res[1], label: "resultado" }] },
      }),
      [
        { text: t(res), correct: true },
        { text: t([u[0] * k + (minus ? v[0] : -v[0]), u[1] * k + (minus ? v[1] : -v[1])]), error: { type: "signos", message: minus ? "Restar v es sumar −v: cada componente de v cambia de signo." : "Es una suma: las componentes de v se suman, no se restan." } },
        { text: t([u[0] * k + (minus ? -v[1] : v[1]), u[1] * k + (minus ? -v[0] : v[0])]), error: { type: "vectores", message: "Mezclaste componentes: la x se opera con la x y la y con la y." } },
        ...(k !== 1 ? [{ text: t([u[0] + (minus ? -v[0] : v[0]), u[1] + (minus ? -v[1] : v[1])]), error: { type: "vectores" as const, message: `Te olvidaste de multiplicar u por ${k} antes de sumar.` } }] : []),
      ],
    );
  },
};

export const vectorComponentes: Generator = {
  id: "vector-componentes",
  topicId: "t-vectores",
  description: "Componentes de un vector dado módulo y ángulo",
  generate(seed, d) {
    const r = rng(seed);
    const mod = r.pick([10, 20, 50, 100, 8, 12]);
    const ang = r.pick([30, 45, 60, d >= 4 ? 120 : 30, d >= 5 ? 210 : 60]);
    const askX = r.bool();
    const rad = (ang * Math.PI) / 180;
    const val = Math.round(mod * (askX ? Math.cos(rad) : Math.sin(rad)) * 100) / 100;
    const wrong = Math.round(mod * (askX ? Math.sin(rad) : Math.cos(rad)) * 100) / 100;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `Un vector tiene módulo ${mod} y forma un ángulo de ${ang}° con el eje x positivo. ¿Cuánto vale su componente ${askX ? "x" : "y"}? (2 decimales)`,
        hints: [
          "Dibujá el triángulo rectángulo: el vector es la hipotenusa.",
          "La componente x es el cateto adyacente al ángulo; la y, el opuesto.",
          askX ? `vx = |v| · cos(θ) = ${mod} · cos(${ang}°)` : `vy = |v| · sen(θ) = ${mod} · sen(${ang}°)`,
        ],
        solution: [askX ? `vx = ${mod} · cos(${ang}°)` : `vy = ${mod} · sen(${ang}°)`, `= ${fmt(val, 2)}`],
        explanation: "vx = |v|·cos θ y vy = |v|·sen θ, con θ medido desde el eje x positivo. La calculadora tiene que estar en grados (DEG).",
        frequentErrors: [
          { match: wrong, type: "vectores", message: `Usaste ${askX ? "seno" : "coseno"}. Con el ángulo medido desde el eje x: x ↔ coseno, y ↔ seno.` },
          { match: Math.round(mod * (askX ? Math.cos(ang) : Math.sin(ang)) * 100) / 100, type: "calculo", message: "La calculadora está en radianes. Ponela en grados (DEG)." },
        ].filter((e) => Math.abs((e.match as number) - val) > 0.02),
        formulaId: "componentes-vector",
        visual: { type: "vector", vectors: [{ x: mod * Math.cos(rad), y: mod * Math.sin(rad), label: "v" }] },
      }),
      kind: "numeric",
      answer: val,
      tolerance: 0.02,
    } as NumericExercise;
  },
};

export const productoEscalar: Generator = {
  id: "producto-escalar",
  topicId: "t-producto-escalar",
  description: "Producto escalar en R² y R³",
  generate(seed, d) {
    const r = rng(seed);
    const dim = d >= 3 ? 3 : 2;
    const u = Array.from({ length: dim }, () => r.int(-5, 5));
    const v = Array.from({ length: dim }, () => r.int(-5, 5));
    const ans = u.reduce((s, ui, i) => s + ui * v[i], 0);
    const t = (p: number[]) => `(${p.map(fmt).join(", ")})`;
    const crossed = dim === 2 ? u[0] * v[1] + u[1] * v[0] : NaN;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "algebra-a", topicId: this.topicId,
        prompt: `Calculá el producto escalar $u · v$ con $u = ${t(u)}$ y $v = ${t(v)}$`,
        hints: [
          "El producto escalar da un NÚMERO, no un vector.",
          "Multiplicá componente a componente y sumá los resultados.",
          `${u.map((ui, i) => `${par(ui)}·${par(v[i])}`).join(" + ")}`,
        ],
        solution: [`u·v = ${u.map((ui, i) => `${par(ui)}·${par(v[i])}`).join(" + ")}`, `= ${u.map((ui, i) => par(ui * v[i])).join(" + ")}`, `= ${fmt(ans)}`],
        explanation: "u·v = u₁v₁ + u₂v₂ (+ u₃v₃). Si da 0, los vectores son perpendiculares (ortogonales).",
        frequentErrors: Number.isFinite(crossed) && crossed !== ans ? [{ match: crossed, type: "vectores", message: "Cruzaste las componentes. Se multiplica x con x e y con y." }] : [],
        formulaId: "producto-escalar",
      }),
      kind: "numeric",
      answer: ans,
    };
  },
};

export const conversionUnidades: Generator = {
  id: "conversion-unidades",
  topicId: "t-unidades",
  description: "Conversión de unidades (velocidad, longitud, tiempo, masa)",
  generate(seed, d) {
    const r = rng(seed);
    const kind = r.pick(d <= 2 ? ["longitud", "masa", "tiempo"] as const : ["velocidad", "velocidad", "longitud", "tiempo"] as const);
    if (kind === "velocidad") {
      const ms = r.pick([5, 10, 15, 20, 25, 30, 40]);
      const kmh = ms * 3.6;
      const toMs = r.bool();
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
          prompt: toMs ? `Pasá ${fmt(kmh)} km/h a m/s.` : `Pasá ${fmt(ms)} m/s a km/h.`,
          hints: [
            "1 km = 1000 m y 1 h = 3600 s.",
            `${toMs ? fmt(kmh) + " km/h" : fmt(ms) + " m/s"} = ${toMs ? `${fmt(kmh)} · 1000 m / 3600 s` : `${fmt(ms)} · (1/1000 km) / (1/3600 h)`}.`,
            "Atajo: de km/h a m/s se divide por 3,6; de m/s a km/h se multiplica por 3,6.",
          ],
          solution: toMs ? [`${fmt(kmh)} km/h = ${fmt(kmh)} · 1000 m / 3600 s`, `= ${fmt(kmh)} / 3,6 m/s`, `= ${fmt(ms)} m/s`] : [`${fmt(ms)} m/s · 3,6 = ${fmt(kmh)} km/h`],
          explanation: "Convertir es multiplicar por 1 escrito de forma conveniente (1000 m / 1 km, 1 h / 3600 s).",
        }),
        kind: "numeric",
        answer: toMs ? ms : kmh,
        unit: toMs ? "m/s" : "km/h",
      } as NumericExercise;
    }
    const table = {
      longitud: [["km", "m", 1000], ["m", "cm", 100], ["cm", "m", 0.01], ["m", "km", 0.001], ["mm", "m", 0.001]],
      masa: [["kg", "g", 1000], ["g", "kg", 0.001], ["t", "kg", 1000]],
      tiempo: [["h", "min", 60], ["min", "s", 60], ["h", "s", 3600], ["min", "h", 1 / 60]],
    } as const;
    const [from, to, factor] = r.pick(table[kind]);
    const val = factor < 1 ? r.pick([250, 500, 1500, 30, 90, 120, 4500]) : r.pick([2, 3.5, 0.75, 1.2, 12, 0.5]);
    const ans = Math.round(val * factor * 1e6) / 1e6;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `Pasá ${fmt(val)} ${from} a ${to}.`,
        hints: [
          `¿Cuántos ${to} hay en 1 ${from}?`,
          `1 ${from} = ${fmt(factor, 6)} ${to}.`,
          `Multiplicá: ${fmt(val)} · ${fmt(factor, 6)}.`,
        ],
        solution: [`1 ${from} = ${fmt(factor, 6)} ${to}`, `${fmt(val)} ${from} = ${fmt(val)} · ${fmt(factor, 6)} ${to} = ${fmt(ans, 6)} ${to}`],
        explanation: "Para pasar a una unidad más chica, el número crece; para pasar a una más grande, el número se achica.",
        frequentErrors: [{ match: Math.round((val / factor) * 1e6) / 1e6, type: "unidades", message: `Dividiste en lugar de multiplicar. Pensá: ¿${to} es una unidad más chica o más grande que ${from}? Si es más chica, el número tiene que crecer.` }],
      }),
      kind: "numeric",
      answer: ans,
      unit: to,
      tolerance: Math.abs(ans) * 1e-6 + 1e-9,
    } as NumericExercise;
  },
};

export const notacionCientifica: Generator = {
  id: "notacion-cientifica",
  topicId: "t-unidades",
  description: "Notación científica",
  generate(seed, d) {
    const r = rng(seed);
    const mant = r.pick([3.4, 2.5, 7.1, 1.2, 9.3, 4.05]);
    const exp = d <= 2 ? r.int(2, 6) : r.pick([-2, -3, -4, -5, 3, 5, 7]);
    const num = mant * 10 ** exp;
    const written = exp < 0 ? num.toFixed(-exp + 2).replace(/0+$/, "").replace(".", ",") : fmt(num);
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `Escribí $${written}$ en notación científica: $${fmt(mant)} × 10^n$. ¿Cuánto vale n?`,
        hints: [
          "n es cuántos lugares hay que mover la coma para llegar al número original.",
          exp < 0 ? "El número es menor que 1: la coma se mueve a la izquierda, así que el exponente es negativo." : "El número es grande: el exponente es positivo.",
          `Contá los lugares desde ${fmt(mant)} hasta ${written}.`,
        ],
        solution: [`${written} = ${fmt(mant)} × 10^${exp}`, `n = ${exp}`],
        explanation: "En notación científica, a × 10ⁿ con 1 ≤ a < 10. n > 0 para números grandes y n < 0 para números chicos.",
        frequentErrors: [{ match: -exp, type: "signos", message: exp < 0 ? "Para números menores que 1 el exponente es negativo." : "Para números grandes el exponente es positivo." }],
      }),
      kind: "numeric",
      answer: exp,
    };
  },
};

export const mru: Generator = {
  id: "mru",
  topicId: "t-mru",
  description: "Movimiento rectilíneo uniforme",
  generate(seed, d) {
    const r = rng(seed);
    const x0 = d <= 1 ? 0 : r.int(-20, 30);
    const v = d <= 2 ? r.int(2, 15) : r.nz(-15, 15);
    const t = r.int(2, 10);
    const askTime = d >= 3 && r.bool();
    if (askTime) {
      const x = x0 + v * t;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
          prompt: `Un móvil parte de $x_0 = ${fmt(x0)}$ m con velocidad constante $v = ${fmt(v)}$ m/s. ¿En qué instante pasa por $x = ${fmt(x)}$ m?`,
          hints: ["En MRU: x(t) = x₀ + v·t.", `Reemplazá: ${fmt(x)} = ${fmt(x0)} ${sgn(v)}·t.`, `Despejá t: t = (${fmt(x)} − ${par(x0)}) / ${par(v)}.`],
          solution: [`${fmt(x)} = ${fmt(x0)} ${sgn(v)}·t`, `${fmt(x - x0)} = ${fmt(v)}·t`, `t = ${fmt(t)} s`],
          explanation: "En el MRU la velocidad no cambia: la posición aumenta (o disminuye) lo mismo cada segundo.",
          frequentErrors: [{ match: x / v, type: "formula", message: "Te olvidaste de la posición inicial x₀: el desplazamiento es x − x₀." }].filter((e) => Math.abs(e.match - t) > 1e-9),
          formulaId: "mru",
        }),
        kind: "numeric",
        answer: t,
        unit: "s",
      } as NumericExercise;
    }
    const x = x0 + v * t;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `Un móvil parte de $x_0 = ${fmt(x0)}$ m con velocidad constante $v = ${fmt(v)}$ m/s. ¿Dónde está a los ${t} s?`,
        hints: ["En MRU: x(t) = x₀ + v·t.", `Reemplazá: x(${t}) = ${fmt(x0)} + ${par(v)}·${t}.`, `${par(v)}·${t} = ${fmt(v * t)}.`],
        solution: [`x(${t}) = ${fmt(x0)} + ${par(v)}·${t}`, `= ${fmt(x0)} ${sgn(v * t)}`, `= ${fmt(x)} m`],
        explanation: "x(t) = x₀ + v·t: posición inicial más lo que avanzó.",
        frequentErrors: [
          { match: v * t, type: "formula", message: `Calculaste cuánto avanzó (${fmt(v * t)} m), pero falta sumarle dónde empezó: x₀ = ${fmt(x0)} m.` },
          { match: x0 + v, type: "formula", message: "Sumaste la velocidad sin multiplicarla por el tiempo." },
        ].filter((e) => Math.abs(e.match - x) > 1e-9),
        formulaId: "mru",
        visual: { type: "plot", functions: [`${x0} + ${v}*x`], xRange: [0, t + 2], points: [[t, x]] },
      }),
      kind: "numeric",
      answer: x,
      unit: "m",
    } as NumericExercise;
  },
};

export const mruv: Generator = {
  id: "mruv",
  topicId: "t-mruv",
  description: "Movimiento rectilíneo uniformemente variado",
  generate(seed, d) {
    const r = rng(seed);
    const v0 = d <= 2 ? r.int(0, 10) : r.int(-10, 20);
    const a = d <= 2 ? r.int(1, 4) : r.nz(-5, 5);
    const t = r.int(2, 8);
    const x0 = d >= 4 ? r.int(-10, 20) : 0;
    const askPos = d >= 2 && r.bool();
    if (!askPos) {
      const v = v0 + a * t;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
          prompt: `Un móvil tiene velocidad inicial $v_0 = ${fmt(v0)}$ m/s y aceleración constante $a = ${fmt(a)}$ m/s². ¿Cuál es su velocidad a los ${t} s?`,
          hints: ["La aceleración dice cuánto cambia la velocidad cada segundo.", "v(t) = v₀ + a·t", `v(${t}) = ${fmt(v0)} + ${par(a)}·${t}.`],
          solution: [`v(${t}) = ${fmt(v0)} + ${par(a)}·${t}`, `= ${fmt(v0)} ${sgn(a * t)}`, `= ${fmt(v)} m/s`],
          explanation: "Con aceleración constante, la velocidad cambia lo mismo cada segundo: v = v₀ + a·t.",
          frequentErrors: [
            { match: a * t, type: "formula", message: "Te faltó sumar la velocidad inicial v₀." },
            { match: v0 + a, type: "velocidad-aceleracion", message: `La aceleración se suma una vez POR CADA SEGUNDO: hay que multiplicarla por t = ${t}.` },
            { match: v0 + a * t * t / 2, type: "velocidad-aceleracion", message: "Usaste la fórmula de la POSICIÓN. Para la velocidad es v = v₀ + a·t." },
          ].filter((e) => Math.abs(e.match - v) > 1e-9),
          formulaId: "mruv-velocidad",
        }),
        kind: "numeric",
        answer: v,
        unit: "m/s",
      } as NumericExercise;
    }
    const x = x0 + v0 * t + 0.5 * a * t * t;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `Un móvil parte de $x_0 = ${fmt(x0)}$ m con $v_0 = ${fmt(v0)}$ m/s y aceleración constante $a = ${fmt(a)}$ m/s². ¿Dónde está a los ${t} s?`,
        hints: ["x(t) = x₀ + v₀·t + ½·a·t²", `El término de la aceleración es ½·${par(a)}·${t}² = ${fmt(0.5 * a * t * t)}.`, `Sumá todo: ${fmt(x0)} + ${fmt(v0 * t)} + ${par(0.5 * a * t * t)}.`],
        solution: [`x(${t}) = ${fmt(x0)} + ${par(v0)}·${t} + ½·${par(a)}·${t}²`, `= ${fmt(x0)} ${sgn(v0 * t)} ${sgn(0.5 * a * t * t)}`, `= ${fmt(x)} m`],
        explanation: "La posición en el MRUV tiene un término con t² porque la velocidad va cambiando: x = x₀ + v₀t + ½at².",
        frequentErrors: [
          { match: x0 + v0 * t + a * t * t, type: "formula", message: "Te olvidaste del ½ en el término ½·a·t²." },
          { match: x0 + v0 * t + 0.5 * a * t, type: "formula", message: "El tiempo va al cuadrado en el término de la aceleración: ½·a·t²." },
          { match: x0 + v0 * t, type: "velocidad-aceleracion", message: "Calculaste como si la velocidad fuera constante (MRU). Con aceleración hay que sumar ½·a·t²." },
        ].filter((e) => Math.abs(e.match - x) > 1e-9),
        formulaId: "mruv-posicion",
        visual: { type: "plot", functions: [`${x0} + ${v0}*x + ${0.5 * a}*x^2`], xRange: [0, t + 1], points: [[t, x]] },
      }),
      kind: "numeric",
      answer: x,
      unit: "m",
    } as NumericExercise;
  },
};

export const caidaLibre: Generator = {
  id: "caida-libre",
  topicId: "t-caida-libre",
  description: "Caída libre y tiro vertical (g = 9,8 m/s²)",
  generate(seed, d) {
    const r = rng(seed);
    const mode = r.pick(d <= 2 ? ["subida"] as const : ["subida", "altura", "caida"] as const);
    if (mode === "subida") {
      const v0 = r.pick([9.8, 19.6, 29.4, 14.7, 24.5]);
      const t = v0 / G;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
          prompt: `Se lanza una pelota hacia arriba con $v_0 = ${fmt(v0)}$ m/s. ¿Cuánto tarda en llegar a la altura máxima? (g = 9,8 m/s²)`,
          hints: ["En la altura máxima la velocidad es 0 (deja de subir y empieza a bajar).", "v(t) = v₀ − g·t. Igualá a 0.", `0 = ${fmt(v0)} − 9,8·t.`],
          solution: [`0 = ${fmt(v0)} − 9,8·t`, `t = ${fmt(v0)} / 9,8`, `t = ${fmt(t)} s`],
          explanation: "La gravedad le resta 9,8 m/s de velocidad por segundo; sube hasta que la velocidad llega a 0.",
          frequentErrors: [{ match: v0 * G, type: "despeje", message: "Para despejar t de 9,8·t = v₀ se divide por 9,8, no se multiplica." }],
          formulaId: "mruv-velocidad",
        }),
        kind: "numeric",
        answer: Math.round(t * 100) / 100,
        unit: "s",
        tolerance: 0.011,
      } as NumericExercise;
    }
    if (mode === "altura") {
      const v0 = r.pick([9.8, 19.6, 14, 20, 28]);
      const h = (v0 * v0) / (2 * G);
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
          prompt: `Se lanza un objeto hacia arriba con $v_0 = ${fmt(v0)}$ m/s. ¿Qué altura máxima alcanza? (g = 9,8 m/s², 2 decimales)`,
          hints: ["Primero encontrá el tiempo de subida: t = v₀/g.", "Después reemplazá ese t en y(t) = v₀·t − ½·g·t².", "Atajo: h_máx = v₀² / (2g)."],
          solution: [`t = ${fmt(v0)} / 9,8 = ${fmt(v0 / G, 3)} s`, `h = v₀² / (2g) = ${fmt(v0 * v0)} / 19,6`, `h = ${fmt(h, 2)} m`],
          explanation: "La altura máxima ocurre cuando v = 0. Combinando las ecuaciones del MRUV: h = v₀²/(2g).",
          frequentErrors: [
            { match: Math.round(((v0 * v0) / G) * 100) / 100, type: "formula", message: "Te faltó el 2 del denominador: h = v₀²/(2g)." },
            { match: Math.round(v0 * (v0 / G) * 100) / 100, type: "formula", message: "Calculaste v₀·t, que sería si la velocidad no bajara. Falta restar ½·g·t²." },
          ],
          formulaId: "altura-maxima",
        }),
        kind: "numeric",
        answer: Math.round(h * 100) / 100,
        unit: "m",
        tolerance: 0.011,
      } as NumericExercise;
    }
    const h = r.pick([5, 20, 45, 80, 10, 30]);
    const t = Math.sqrt((2 * h) / G);
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `Se deja caer una piedra desde ${h} m de altura (sin velocidad inicial). ¿Cuánto tarda en llegar al suelo? (g = 9,8 m/s², 2 decimales)`,
        hints: ["Caída libre: y(t) = y₀ − ½·g·t².", `Llega al suelo cuando y = 0: 0 = ${h} − 4,9·t².`, `t² = ${h} / 4,9 → t = √(${h}/4,9).`],
        solution: [`0 = ${h} − 4,9·t²`, `t² = ${h}/4,9 = ${fmt((2 * h) / G, 3)}`, `t = ${fmt(t, 2)} s`],
        explanation: "En caída libre la velocidad crece 9,8 m/s cada segundo, por eso la distancia recorrida crece con t².",
        frequentErrors: [
          { match: Math.round((h / G) * 100) / 100, type: "formula", message: "Ese sería un movimiento con velocidad constante. En caída libre: h = ½·g·t², entonces t = √(2h/g)." },
          { match: Math.round(((2 * h) / G) * 100) / 100, type: "calculo", message: "Ese es t². Falta sacar la raíz cuadrada." },
        ],
        formulaId: "caida-libre",
      }),
      kind: "numeric",
      answer: Math.round(t * 100) / 100,
      unit: "s",
      tolerance: 0.011,
    } as NumericExercise;
  },
};

interface ConceptQ {
  prompt: string;
  options: { text: string; correct?: boolean; why?: string }[];
  explanation: string;
  hints: [string, string, string];
}

const CONCEPTOS: ConceptQ[] = [
  {
    prompt: "Una pelota lanzada hacia arriba llega a su punto más alto. En ese instante, ¿cuánto vale su aceleración?",
    options: [
      { text: "−9,8 m/s² (la gravedad sigue actuando)", correct: true },
      { text: "0, porque está quieta", why: "Confusión entre velocidad y aceleración: la VELOCIDAD es 0 en el punto más alto, pero la gravedad sigue actuando, así que la aceleración sigue siendo −9,8 m/s²." },
      { text: "+9,8 m/s²", why: "Tomando hacia arriba como positivo, la gravedad apunta hacia abajo: −9,8 m/s²." },
    ],
    explanation: "La aceleración de la gravedad es la misma durante todo el vuelo; lo que cambia es la velocidad.",
    hints: ["Separá dos preguntas: ¿cuánto vale la velocidad? ¿y la aceleración?", "Si la aceleración fuera 0 en ese punto, ¿volvería a caer?", "La gravedad no se apaga en ningún momento del vuelo."],
  },
  {
    prompt: "Un auto tiene velocidad negativa y aceleración positiva. ¿Qué le pasa?",
    options: [
      { text: "Se mueve hacia atrás (sentido negativo) y está frenando", correct: true },
      { text: "Se mueve hacia adelante y acelera", why: "El signo de la velocidad indica el sentido del movimiento: negativa = hacia el sentido negativo." },
      { text: "Se mueve hacia atrás cada vez más rápido", why: "Velocidad y aceleración con signos opuestos significa que la rapidez DISMINUYE: frena." },
    ],
    explanation: "Si velocidad y aceleración tienen el mismo signo, el móvil se apura; si tienen signos opuestos, frena.",
    hints: ["El signo de la velocidad dice hacia dónde va.", "Compará el signo de v con el de a.", "Signos opuestos → la rapidez disminuye."],
  },
  {
    prompt: "En un gráfico posición–tiempo, una recta horizontal significa que el móvil...",
    options: [
      { text: "Está quieto", correct: true },
      { text: "Se mueve con velocidad constante", why: "Velocidad constante es una recta INCLINADA en el gráfico x(t). Horizontal significa que la posición no cambia." },
      { text: "Acelera", why: "Con aceleración la curva x(t) es una parábola." },
    ],
    explanation: "En x(t), la pendiente es la velocidad. Pendiente 0 → velocidad 0.",
    hints: ["¿Qué mide la pendiente de un gráfico posición–tiempo?", "Si la recta es horizontal, ¿cambia la posición con el tiempo?", "Pendiente cero significa velocidad cero."],
  },
  {
    prompt: "En un gráfico velocidad–tiempo, ¿qué representa la pendiente?",
    options: [
      { text: "La aceleración", correct: true },
      { text: "La posición", why: "La posición (desplazamiento) es el ÁREA bajo la curva v(t), no la pendiente." },
      { text: "La velocidad", why: "La velocidad es lo que se lee en el eje vertical; la pendiente es cuánto cambia: la aceleración." },
    ],
    explanation: "Pendiente de v(t) = aceleración. Área bajo v(t) = desplazamiento.",
    hints: ["La pendiente es 'cuánto cambia lo de arriba por cada unidad de lo de abajo'.", "Acá: cuánto cambia la velocidad por segundo.", "Eso tiene nombre propio en física."],
  },
  {
    prompt: "Si se dejan caer al mismo tiempo una piedra y una moneda (sin aire), ¿cuál llega primero?",
    options: [
      { text: "Llegan juntas", correct: true },
      { text: "La piedra, porque es más pesada", why: "Sin rozamiento con el aire, todos los cuerpos caen con la misma aceleración g, sin importar su masa." },
      { text: "La moneda, porque es más chica", why: "El tamaño solo importa por el rozamiento del aire; sin aire caen igual." },
    ],
    explanation: "En caída libre la aceleración es g para todos los cuerpos, independientemente de la masa.",
    hints: ["¿La fórmula de caída libre tiene la masa en algún lado?", "y = y₀ − ½·g·t²: solo aparece g.", "Mismo g, misma altura → mismo tiempo."],
  },
];

export const cinematicaConceptos: Generator = {
  id: "cinematica-conceptos",
  topicId: "t-mruv",
  description: "Preguntas conceptuales de cinemática",
  generate(seed, d) {
    const r = rng(seed);
    const q = CONCEPTOS[seed % CONCEPTOS.length];
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: q.prompt,
        hints: q.hints,
        solution: [q.explanation],
        explanation: q.explanation,
      }),
      q.options.map((o) => ({ text: o.text, correct: o.correct, error: o.why ? { type: o.why.startsWith("Confusión") ? "velocidad-aceleracion" : "conceptual", message: o.why } : undefined })),
    );
  },
};

export const physicsGenerators = [vectorModulo, vectorSuma, vectorComponentes, productoEscalar, conversionUnidades, notacionCientifica, mru, mruv, caidaLibre, cinematicaConceptos];
