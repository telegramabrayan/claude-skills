import type { Generator, NumericExercise } from "../types";
import { fmt, fracText } from "../math/parser";
import { rng } from "./rng";
import { base, byDifficulty, choice, par } from "./helpers";

const S = "preparacion";

export const signosSuma: Generator = {
  id: "signos-suma",
  topicId: "t-signos",
  description: "Sumas y restas con números negativos",
  generate(seed, d) {
    const r = rng(seed);
    const max = byDifficulty(d, [9, 12, 20, 30, 60, 99]);
    const a = d <= 1 ? r.int(1, max) : r.nz(-max, max);
    const b = d <= 1 ? -r.int(1, max) : r.nz(-max, max);
    const op = d <= 2 ? "+" : r.pick(["+", "−"] as const);
    const ans = op === "+" ? a + b : a - b;
    const flipped = op === "+" ? a - b : a + b;
    const expr = `${fmt(a)} ${op} ${par(b)}`;
    const rule =
      op === "−" && b < 0
        ? `Restar un número negativo es lo mismo que sumarlo: ${fmt(a)} − (${fmt(b)}) = ${fmt(a)} + ${fmt(-b)}.`
        : op === "+" && b < 0
          ? `Sumar un número negativo es lo mismo que restarlo: ${fmt(a)} + (${fmt(b)}) = ${fmt(a)} − ${fmt(-b)}.`
          : `Restar un positivo es moverse hacia la izquierda en la recta numérica.`;
    const ex: NumericExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Calculá: $${expr}$`,
        hints: [
          "Imaginá la recta numérica: sumar mueve a la derecha, restar a la izquierda.",
          op === "−" && b < 0 ? "Dos signos menos seguidos se convierten en un más: −(−n) = +n." : "Fijate el signo del segundo número antes de operar.",
          rule,
        ],
        solution: [rule, `Resultado: ${fmt(ans)}`],
        explanation: rule,
        frequentErrors: flipped !== ans ? [{ match: flipped, type: "signos", message: `Ese resultado sale si se ignora el signo del ${fmt(b)}. ${rule}` }] : [],
        visual: { type: "numberline", min: Math.min(a, ans, 0) - 2, max: Math.max(a, ans, 0) + 2, marks: [a, ans] },
      }),
      kind: "numeric",
      answer: ans,
    };
    return ex;
  },
};

export const signosProducto: Generator = {
  id: "signos-producto",
  topicId: "t-signos",
  description: "Regla de los signos en multiplicación y división",
  generate(seed, d) {
    const r = rng(seed);
    const max = byDifficulty(d, [5, 9, 9, 12, 15, 20]);
    const a = r.nz(-max, max);
    const b = r.nz(-max, max);
    const division = d >= 2 && r.bool();
    const [x, y, ans] = division ? [a * b, b, a] : [a, b, a * b];
    const op = division ? "÷" : "·";
    const rule = "Regla de los signos: signos iguales dan positivo (+·+ y −·−); signos distintos dan negativo.";
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Calculá: $${par(x)} ${op} ${par(y)}$`,
        hints: [
          "Separá el problema en dos: primero el número, después el signo.",
          `Sin signos: ${fmt(Math.abs(x))} ${op} ${fmt(Math.abs(y))} = ${fmt(Math.abs(ans))}.`,
          rule,
        ],
        solution: [`${fmt(Math.abs(x))} ${op} ${fmt(Math.abs(y))} = ${fmt(Math.abs(ans))}`, rule, `Resultado: ${fmt(ans)}`],
        explanation: rule,
      }),
      kind: "numeric",
      answer: ans,
    };
  },
};

export const jerarquia: Generator = {
  id: "jerarquia",
  topicId: "t-jerarquia",
  description: "Orden de las operaciones",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    const c = r.int(2, 6);
    const forms = byDifficulty(d, [[0], [0, 1], [0, 1, 2], [2, 3], [3, 4], [4]]);
    const form = r.pick(forms);
    let expr = "";
    let ans = 0;
    let wrong = 0;
    let why = "";
    switch (form) {
      case 0:
        expr = `${a} + ${b} · ${c}`;
        ans = a + b * c;
        wrong = (a + b) * c;
        why = `Primero la multiplicación: ${b} · ${c} = ${b * c}. Después la suma: ${a} + ${b * c} = ${ans}.`;
        break;
      case 1:
        expr = `${a * c + b} − ${b} · ${c}`;
        ans = a * c + b - b * c;
        wrong = (a * c + b - b) * c;
        why = `Primero ${b} · ${c} = ${b * c}. Después ${a * c + b} − ${b * c} = ${ans}.`;
        break;
      case 2: {
        expr = `(${a} + ${b}) · ${c}`;
        ans = (a + b) * c;
        wrong = a + b * c;
        why = `El paréntesis va primero: ${a} + ${b} = ${a + b}. Después ${a + b} · ${c} = ${ans}.`;
        break;
      }
      case 3: {
        const k = r.int(2, 5);
        expr = `${a} + ${k * b} ÷ ${b} · ${c}`;
        ans = a + k * c;
        wrong = (a + k * b) / b * c;
        why = `Multiplicación y división tienen la misma prioridad y se hacen de izquierda a derecha: ${k * b} ÷ ${b} = ${k}; ${k} · ${c} = ${k * c}. Al final la suma: ${a} + ${k * c} = ${ans}.`;
        break;
      }
      default: {
        expr = `${a} · ${c}^2 − ${b}`;
        ans = a * c * c - b;
        wrong = (a * c) ** 2 - b;
        why = `La potencia va antes que la multiplicación: ${c}² = ${c * c}. Luego ${a} · ${c * c} = ${a * c * c} y por último − ${b}: ${ans}.`;
      }
    }
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Calculá respetando el orden de las operaciones: $${expr}$`,
        hints: [
          "No se resuelve de izquierda a derecha sin más: hay un orden de prioridad.",
          "Orden: paréntesis → potencias y raíces → multiplicaciones y divisiones → sumas y restas.",
          why.split(".")[0] + ".",
        ],
        solution: why.split(". ").map((s) => s.replace(/\.$/, "") + "."),
        explanation: "Paréntesis, después potencias, después multiplicación/división (de izquierda a derecha) y por último suma/resta.",
        frequentErrors: wrong !== ans ? [{ match: wrong, type: "jerarquia", message: `Ese resultado sale de operar en el orden en que aparece. ${why}` }] : [],
      }),
      kind: "numeric",
      answer: ans,
    };
  },
};

export const fraccionesSuma: Generator = {
  id: "fracciones-suma",
  topicId: "t-fracciones",
  description: "Suma y resta de fracciones",
  generate(seed, d) {
    const r = rng(seed);
    let b = r.int(2, 6);
    let dd = d <= 1 ? b : r.int(2, 9);
    while (d >= 2 && dd === b) dd = r.int(2, 9);
    if (d >= 4) {
      b = r.int(3, 9);
      while (dd === b) dd = r.int(2, 12);
    }
    const a = r.int(1, b + 2);
    const c = r.int(1, dd + 2);
    const minus = d >= 3 && r.bool();
    const num = minus ? a * dd - c * b : a * dd + c * b;
    const den = b * dd;
    const ans = num / den;
    const wrongNum = minus ? a - c : a + c;
    const wrongDen = b === dd ? b + dd : b + dd;
    const op = minus ? "−" : "+";
    const same = b === dd;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Calculá y escribí el resultado como fracción: $${a}/${b} ${op} ${c}/${dd}$`,
        hints: [
          same ? "Si los denominadores son iguales, se conserva el denominador." : "Solo se pueden sumar partes del mismo tamaño: necesitás un denominador común.",
          same ? `Operá solo los numeradores: ${a} ${op} ${c}.` : `Un denominador común es ${b} · ${dd} = ${den}.`,
          same ? `${a} ${op} ${c} = ${minus ? a - c : a + c}, y el denominador sigue siendo ${b}.` : `${a}/${b} = ${a * dd}/${den} y ${c}/${dd} = ${c * b}/${den}.`,
        ],
        solution: same
          ? [`Mismo denominador: ${a} ${op} ${c} = ${minus ? a - c : a + c}`, `Resultado: ${fracText(num, den)}`]
          : [
              `Denominador común: ${b} · ${dd} = ${den}`,
              `${a}/${b} = ${a * dd}/${den}   y   ${c}/${dd} = ${c * b}/${den}`,
              `${a * dd} ${op} ${c * b} = ${num}  →  ${num}/${den}`,
              `Simplificado: ${fracText(num, den)}`,
            ],
        explanation: "Para sumar fracciones las partes tienen que ser del mismo tamaño: primero se lleva todo a un denominador común y después se suman los numeradores.",
        frequentErrors: [
          {
            match: wrongNum / wrongDen,
            type: "fracciones",
            message: `Sumaste numeradores con numeradores y denominadores con denominadores (${wrongNum}/${wrongDen}). Eso no funciona: ½ + ½ daría 2/4 = ½, ¡y debería dar 1! Primero hay que llevar a denominador común.`,
          },
        ],
      }),
      kind: "numeric",
      answer: ans,
    };
  },
};

export const fraccionesProducto: Generator = {
  id: "fracciones-producto",
  topicId: "t-fracciones",
  description: "Multiplicación y división de fracciones",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.int(1, 7), b = r.int(2, 9), c = r.int(1, 7), e = r.int(2, 9);
    const div = d >= 2 && r.bool();
    const num = div ? a * e : a * c;
    const den = div ? b * c : b * e;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Calculá: $${a}/${b} ${div ? "÷" : "·"} ${c}/${e}$`,
        hints: div
          ? ["Dividir por una fracción es multiplicar por su inversa.", `La inversa de ${c}/${e} es ${e}/${c}.`, `Queda ${a}/${b} · ${e}/${c}.`]
          : ["Para multiplicar fracciones no hace falta denominador común.", "Se multiplica numerador por numerador y denominador por denominador.", `${a} · ${c} arriba y ${b} · ${e} abajo.`],
        solution: div
          ? [`${a}/${b} ÷ ${c}/${e} = ${a}/${b} · ${e}/${c}`, `= ${a * e}/${b * c}`, `Simplificado: ${fracText(num, den)}`]
          : [`${a}/${b} · ${c}/${e} = ${a * c}/${b * e}`, `Simplificado: ${fracText(num, den)}`],
        explanation: div ? "a/b ÷ c/d = a/b · d/c (se invierte la segunda fracción)." : "a/b · c/d = (a·c)/(b·d).",
        frequentErrors: div
          ? [{ match: (a * c) / (b * e), type: "fracciones", message: `Multiplicaste directamente. Para dividir hay que invertir la segunda fracción: ${a}/${b} · ${e}/${c}.` }]
          : [],
      }),
      kind: "numeric",
      answer: num / den,
    };
  },
};

export const porcentaje: Generator = {
  id: "porcentaje",
  topicId: "t-porcentajes",
  description: "Porcentajes, aumentos y descuentos",
  generate(seed, d) {
    const r = rng(seed);
    const p = r.pick(d <= 2 ? [10, 20, 25, 50] : [5, 12, 15, 30, 35, 40, 60, 75]);
    const n = r.pick([40, 80, 120, 200, 250, 360, 400, 1500, 2400]);
    const mode = d <= 2 ? 0 : r.int(0, 2);
    const part = (p * n) / 100;
    if (mode === 0) {
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `¿Cuánto es el ${p}% de ${fmt(n)}?`,
          hints: [`"${p}%" significa ${p} de cada 100.`, `Calculá ${p}/100 · ${fmt(n)}.`, `${p}/100 = ${fmt(p / 100)}, entonces ${fmt(p / 100)} · ${fmt(n)}.`],
          solution: [`${p}% = ${p}/100 = ${fmt(p / 100)}`, `${fmt(p / 100)} · ${fmt(n)} = ${fmt(part)}`],
          explanation: "El p% de N es p/100 · N.",
          frequentErrors: [{ match: p * n, type: "calculo", message: `Te faltó dividir por 100: "por ciento" significa "de cada 100".` }],
        }),
        kind: "numeric",
        answer: part,
      };
    }
    const up = mode === 1;
    const ans = up ? n + part : n - part;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: up
          ? `Un producto cuesta $${fmt(n)} y aumenta un ${p}%. ¿Cuál es el precio nuevo?`
          : `Un producto cuesta $${fmt(n)} y tiene un descuento del ${p}%. ¿Cuánto se paga?`,
        hints: [
          `Primero calculá cuánto es el ${p}% de ${fmt(n)}.`,
          `${p}% de ${fmt(n)} = ${fmt(part)}.`,
          up ? `Sumalo al precio original. Atajo: ${fmt(n)} · ${fmt(1 + p / 100)}.` : `Restalo al precio original. Atajo: ${fmt(n)} · ${fmt(1 - p / 100)}.`,
        ],
        solution: [`${p}% de ${fmt(n)} = ${fmt(part)}`, up ? `${fmt(n)} + ${fmt(part)} = ${fmt(ans)}` : `${fmt(n)} − ${fmt(part)} = ${fmt(ans)}`],
        explanation: up ? "Aumentar un p% es multiplicar por (1 + p/100)." : "Descontar un p% es multiplicar por (1 − p/100).",
        frequentErrors: [
          { match: part, type: "interpretacion", message: `Ese es el ${up ? "aumento" : "descuento"}, no el precio final. Falta ${up ? "sumarlo al" : "restarlo del"} precio original.` },
          { match: up ? n + p : n - p, type: "conceptual", message: `${up ? "Sumaste" : "Restaste"} ${p} pesos, no el ${p}%. Primero hay que calcular cuánto es el ${p}% de ${fmt(n)}.` },
        ],
      }),
      kind: "numeric",
      answer: ans,
    };
  },
};

export const reglaDeTres: Generator = {
  id: "regla-tres",
  topicId: "t-porcentajes",
  description: "Regla de tres simple directa e inversa",
  generate(seed, d) {
    const r = rng(seed);
    const inversa = d >= 4 && r.bool();
    if (!inversa) {
      const k = r.int(2, 6);
      const unit = r.int(2, 15) * (d >= 3 ? 10 : 1);
      const m = r.int(2, 12);
      const ans = unit * m;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Si ${k} cuadernos cuestan $${fmt(unit * k)}, ¿cuánto cuestan ${m} cuadernos?`,
          hints: [
            "Más cuadernos → más plata. Es una proporción directa.",
            `Primero averiguá cuánto cuesta 1 cuaderno: ${fmt(unit * k)} ÷ ${k}.`,
            `1 cuaderno cuesta ${fmt(unit)}; multiplicalo por ${m}.`,
          ],
          solution: [`${k} → ${fmt(unit * k)}`, `${m} → x`, `x = ${fmt(unit * k)} · ${m} ÷ ${k} = ${fmt(ans)}`],
          explanation: "En una proporción directa, si una cantidad se multiplica por algo, la otra se multiplica por lo mismo.",
          frequentErrors: [{ match: (unit * k * k) / m, type: "conceptual", message: "Planteaste la regla de tres al revés. Pensá: si compro más cuadernos, ¿pago más o menos?" }],
        }),
        kind: "numeric",
        answer: ans,
      };
    }
    const w = r.pick([2, 3, 4, 6]);
    const days = r.pick([6, 8, 12, 24]);
    const w2 = r.pick([w * 2, w * 3]);
    const ans = (w * days) / w2;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `${w} personas pintan una casa en ${days} días. Trabajando al mismo ritmo, ¿cuántos días tardarían ${w2} personas?`,
        hints: [
          "Más personas → MENOS días. Es una proporción inversa.",
          `El trabajo total es ${w} · ${days} = ${w * days} "días-persona".`,
          `Repartí ese trabajo entre ${w2} personas: ${w * days} ÷ ${w2}.`,
        ],
        solution: [`Trabajo total: ${w} · ${days} = ${w * days}`, `Días = ${w * days} ÷ ${w2} = ${fmt(ans)}`],
        explanation: "En una proporción inversa, si una cantidad se multiplica, la otra se divide por lo mismo: el producto se mantiene constante.",
        frequentErrors: [{ match: (days * w2) / w, type: "conceptual", message: "Usaste una regla de tres directa, pero acá con más personas se tarda MENOS. Es inversa." }],
      }),
      kind: "numeric",
      answer: ans,
    };
  },
};

export const potencias: Generator = {
  id: "potencias",
  topicId: "t-potencias",
  description: "Potencias: definición, signos, exponente 0 y negativo",
  generate(seed, d) {
    const r = rng(seed);
    const mode = r.pick(byDifficulty(d, [[0], [0, 1], [1, 2], [2, 3], [3, 4], [4]]));
    if (mode === 0) {
      const b = r.int(2, 5), n = r.int(2, 4);
      const ans = b ** n;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Calculá: $${b}^${n}$`,
          hints: [`El exponente dice cuántas veces se multiplica la base por sí misma.`, `${b}^${n} = ${Array(n).fill(b).join(" · ")}`, `Multiplicá de a dos: ${b} · ${b} = ${b * b}...`],
          solution: [`${b}^${n} = ${Array(n).fill(b).join(" · ")} = ${ans}`],
          explanation: "aⁿ significa multiplicar a por sí misma n veces.",
          frequentErrors: [{ match: b * n, type: "potencias", message: `Multiplicaste ${b} · ${n}. La potencia no es "base por exponente": es ${Array(n).fill(b).join(" · ")}.` }],
        }),
        kind: "numeric",
        answer: ans,
      };
    }
    if (mode === 1 || mode === 2) {
      const b = r.int(2, 5), n = r.pick([2, 3, 4]);
      const withPar = mode === 1 ? true : r.bool();
      const ans = withPar ? (-b) ** n : -(b ** n);
      const expr = withPar ? `(−${b})^${n}` : `−${b}^${n}`;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Calculá: $${expr}$`,
          hints: withPar
            ? ["El paréntesis indica que la base es el número negativo completo.", `(−${b})^${n} = ${Array(n).fill(`(−${b})`).join(" · ")}`, n % 2 === 0 ? "Exponente par con base negativa → resultado positivo." : "Exponente impar con base negativa → resultado negativo."]
            : ["Sin paréntesis, la potencia afecta solo al número, no al signo.", `−${b}^${n} = −(${b}^${n})`, `Calculá ${b}^${n} = ${b ** n} y después agregale el signo menos.`],
          solution: withPar ? [`${expr} = ${Array(n).fill(`(−${b})`).join(" · ")}`, `= ${ans}`] : [`${expr} = −(${b}^${n})`, `= −${b ** n}`],
          explanation: "(−a)ⁿ eleva el número negativo completo; −aⁿ eleva solo a y después cambia el signo.",
          frequentErrors: [{ match: -ans, type: "signos", message: withPar ? `Con paréntesis la base es −${b}: ${n % 2 === 0 ? "exponente par da positivo" : "exponente impar da negativo"}.` : `Sin paréntesis, −${b}^${n} = −(${b ** n}). El signo menos no se eleva.` }],
        }),
        kind: "numeric",
        answer: ans,
      };
    }
    if (mode === 3) {
      const b = r.int(2, 5), n = r.int(1, 3);
      const zero = r.bool();
      if (zero) {
        return {
          ...base({
            gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
            prompt: `Calculá: $${b * 7}^0$`,
            hints: ["Pensá en el patrón: 2³ = 8, 2² = 4, 2¹ = 2... cada vez se divide por 2.", "El siguiente paso del patrón es 2⁰ = 2 ÷ 2.", "Todo número distinto de 0 elevado a 0 da 1."],
            solution: ["Cualquier número (distinto de 0) elevado a la 0 es 1."],
            explanation: "a⁰ = 1 para todo a ≠ 0. Sale de que aⁿ ÷ aⁿ = aⁿ⁻ⁿ = a⁰ y también es 1.",
            frequentErrors: [{ match: 0, type: "potencias", message: "Es muy común pensar que da 0, pero a⁰ = 1: cada vez que el exponente baja 1, el resultado se divide por la base (8, 4, 2, 1...)." }],
          }),
          kind: "numeric",
          answer: 1,
        };
      }
      const ans = 1 / b ** n;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Calculá y escribilo como fracción: $${b}^(−${n})$`,
          hints: ["Un exponente negativo NO hace negativo al resultado.", "a^(−n) = 1/aⁿ", `${b}^(−${n}) = 1/${b}^${n}.`],
          solution: [`${b}^(−${n}) = 1/${b}^${n}`, `= 1/${b ** n}`],
          explanation: "a^(−n) = 1/aⁿ: el exponente negativo indica el inverso.",
          frequentErrors: [{ match: -(b ** n), type: "potencias", message: `El exponente negativo no cambia el signo: indica el inverso. ${b}^(−${n}) = 1/${b ** n}.` }],
        }),
        kind: "numeric",
        answer: ans,
      };
    }
    const b = r.int(2, 3), m = r.int(2, 5), n = r.int(2, 4);
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Escribí el resultado como una sola potencia y decí cuál es el exponente: $${b}^${m} · ${b}^${n} = ${b}^?$`,
        hints: ["Escribí cada potencia como multiplicación repetida.", `${b}^${m} tiene ${m} factores ${b} y ${b}^${n} tiene ${n} factores ${b}.`, "En total hay m + n factores: los exponentes se SUMAN."],
        solution: [`${b}^${m} · ${b}^${n} = ${b}^(${m}+${n})`, `= ${b}^${m + n}`],
        explanation: "Producto de potencias de igual base: se conserva la base y se suman los exponentes.",
        frequentErrors: [{ match: m * n, type: "potencias", message: `Multiplicaste los exponentes. Eso es para una potencia de potencia (aᵐ)ⁿ. Acá se suman: ${m} + ${n}.` }],
      }),
      kind: "numeric",
      answer: m + n,
    };
  },
};

export const raices: Generator = {
  id: "raices",
  topicId: "t-potencias",
  description: "Raíces cuadradas y cúbicas exactas",
  generate(seed, d) {
    const r = rng(seed);
    const cubic = d >= 3 && r.bool();
    const x = cubic ? r.int(2, d >= 4 ? 6 : 4) * (d >= 5 && r.bool() ? -1 : 1) : r.int(2, d <= 1 ? 9 : 15);
    const radicand = cubic ? x ** 3 : x * x;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: cubic ? `Calculá la raíz cúbica de ${fmt(radicand)}` : `Calculá: $√${radicand}$`,
        hints: cubic
          ? ["La raíz cúbica pregunta: ¿qué número multiplicado 3 veces por sí mismo da eso?", "Probá con números chicos: 2³ = 8, 3³ = 27, 4³ = 64...", radicand < 0 ? "Un número negativo al cubo da negativo, así que la raíz cúbica de un negativo existe." : "Buscá el número cuyo cubo coincide."]
          : ["La raíz cuadrada pregunta: ¿qué número multiplicado por sí mismo da eso?", "Probá multiplicando: 5·5 = 25, 6·6 = 36...", `Buscá cuál da ${radicand}.`],
        solution: cubic ? [`${fmt(x)}³ = ${fmt(radicand)}`, `Raíz cúbica: ${fmt(x)}`] : [`${x} · ${x} = ${radicand}`, `√${radicand} = ${x}`],
        explanation: "La raíz es la operación inversa de la potencia.",
        frequentErrors: [{ match: radicand / (cubic ? 3 : 2), type: "potencias", message: "Dividiste por el índice. La raíz no es una división: buscá el número que, multiplicado por sí mismo, da el radicando." }],
      }),
      kind: "numeric",
      answer: x,
    };
  },
};

export const ordenarNumeros: Generator = {
  id: "comparar-numeros",
  topicId: "t-signos",
  description: "Comparar números negativos y decimales",
  generate(seed, d) {
    const r = rng(seed);
    const a = -r.int(2, 9);
    const b = -r.int(2, 9) - (d >= 3 ? 0.5 : 0);
    const big = Math.max(a, b);
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Cuál es el número **mayor**: $${fmt(a)}$ o $${fmt(b)}$?`,
        hints: ["Ubicá los dos números en la recta numérica.", "En la recta, el mayor es el que está más a la derecha.", "Entre negativos, el mayor es el que está más cerca del 0."],
        solution: [`En la recta, ${fmt(big)} está más a la derecha.`, `Por lo tanto ${fmt(big)} es mayor.`],
        explanation: "Entre dos negativos es mayor el que está más cerca del cero (por ejemplo, −2 > −7: deber 2 pesos es mejor que deber 7).",
        visual: { type: "numberline", min: Math.floor(Math.min(a, b)) - 1, max: 1, marks: [a, b] },
      }),
      [
        { text: fmt(big), correct: true },
        { text: fmt(Math.min(a, b)), error: { type: "signos", message: "Entre negativos, el que tiene la cifra más grande es el MENOR. Pensalo como deudas: deber más es tener menos." } },
        { text: "Son iguales" },
      ],
    );
  },
};

export const arithmeticGenerators = [signosSuma, signosProducto, ordenarNumeros, jerarquia, fraccionesSuma, fraccionesProducto, porcentaje, reglaDeTres, potencias, raices];
