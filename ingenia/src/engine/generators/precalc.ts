import type { ExpressionExercise, FrequentError, Generator, NumericExercise } from "../types";
import { fmt } from "../math/parser";
import { rng } from "./rng";
import { base, byDifficulty, choice, coef, par, sgn, termX } from "./helpers";

/** (x + a) con signo prolijo: bin(-3) = "(x − 3)". */
const bin = (a: number, v = "x") => (a === 0 ? v : `(${v} ${sgn(a)})`);

export const factorizar: Generator = {
  id: "factorizar",
  topicId: "t-factorizacion",
  description: "Factor común, diferencia de cuadrados y trinomios",
  generate(seed, d) {
    const r = rng(seed);
    const mode = r.pick(byDifficulty(d, [["comun"], ["comun", "cuadrados"], ["cuadrados", "trinomio"], ["trinomio", "cuadrados"], ["trinomio"], ["trinomio", "completar"]] as const));
    if (mode === "comun") {
      const k = r.int(2, 6);
      const b = r.nz(-7, 7);
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: `Factorizá sacando factor común: $${k}x ${sgn(k * b)}$`,
          hints: ["Buscá un número que divida a los dos términos.", `Ambos términos son múltiplos de ${k}.`, `${k}x ÷ ${k} = x y ${fmt(k * b)} ÷ ${k} = ${fmt(b)}.`],
          solution: [`${k}x ${sgn(k * b)} = ${k}·x + ${k}·${par(b)}`, `= ${k}${bin(b)}`],
          explanation: "Sacar factor común es aplicar la distributiva al revés: a·b + a·c = a(b + c).",
        }),
        [
          { text: `$${k}${bin(b)}$`, correct: true },
          { text: `$${k}${bin(k * b)}$`, error: { type: "factorizacion", message: `Si distribuís ${k}(x ${sgn(k * b)}) obtenés ${k}x ${sgn(k * k * b)}, no lo original. Al sacar factor común hay que DIVIDIR cada término por ${k}.` } },
          { text: `$${k}${bin(-b)}$`, error: { type: "signos", message: "Revisá el signo: al dividir por un número positivo, el signo del término no cambia." } },
          { text: `$x${bin(k * b)}$`, error: { type: "factorizacion", message: "El factor común es el número que divide a ambos términos, no la x (el segundo término no tiene x)." } },
        ],
      );
    }
    if (mode === "cuadrados") {
      const a = r.int(2, 9);
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: `Factorizá: $x^2 − ${a * a}$`,
          hints: [`${a * a} es un cuadrado perfecto: ${a}².`, "Diferencia de cuadrados: a² − b² = (a − b)(a + b).", `Con a = x y b = ${a}.`],
          solution: [`x² − ${a * a} = x² − ${a}²`, `= (x − ${a})(x + ${a})`, `Verificación: (x − ${a})(x + ${a}) = x² + ${a}x − ${a}x − ${a * a} = x² − ${a * a} ✓`],
          explanation: "Una diferencia de cuadrados se factoriza como (a − b)(a + b): los términos del medio se cancelan.",
        }),
        [
          { text: `$(x − ${a})(x + ${a})$`, correct: true },
          { text: `$(x − ${a})^2$`, error: { type: "factorizacion", message: `(x − ${a})² = x² − ${2 * a}x + ${a * a}: aparece un término con x. La diferencia de cuadrados es (x − ${a})(x + ${a}).` } },
          { text: `$(x + ${a})^2$`, error: { type: "factorizacion", message: `(x + ${a})² = x² + ${2 * a}x + ${a * a}, no x² − ${a * a}.` } },
          { text: `$(x − ${a * a})(x + ${a * a})$`, error: { type: "factorizacion", message: `Se usa la raíz: ${a * a} = ${a}², así que va (x − ${a})(x + ${a}).` } },
        ],
      );
    }
    const p = r.nz(-6, 6);
    let q = r.nz(-6, 6);
    if (q === p) q = p > 0 ? -p : p - 1 || 2;
    const S = p + q;
    const P = p * q;
    if (mode === "completar") {
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: `Completá: $x^2 ${termX(S)} ${sgn(P)} = ${bin(p)}(x + \\_\\_)$. ¿Qué número va en el espacio?`,
          hints: ["En (x + m)(x + n) los dos números suman el coeficiente de x y multiplican el término independiente.", `Uno de los números es ${fmt(p)}.`, `Buscá n tal que ${fmt(p)} · n = ${fmt(P)}.`],
          solution: [`${fmt(p)} · n = ${fmt(P)} → n = ${fmt(q)}`, `Control: ${fmt(p)} + ${par(q)} = ${fmt(S)} ✓`],
          explanation: "x² + (m + n)x + m·n = (x + m)(x + n).",
        }),
        kind: "numeric",
        answer: q,
      } as NumericExercise;
    }
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
        prompt: `Factorizá: $x^2 ${termX(S)} ${sgn(P)}$`,
        hints: ["Buscá dos números que multiplicados den el término independiente y sumados den el coeficiente de x.", `Producto: ${fmt(P)}. Suma: ${fmt(S)}.`, `Los números son ${fmt(p)} y ${fmt(q)}.`],
        solution: [`Dos números con producto ${fmt(P)} y suma ${fmt(S)}: ${fmt(p)} y ${fmt(q)}`, `x² ${termX(S)} ${sgn(P)} = ${bin(p)}${bin(q)}`],
        explanation: "x² + (m + n)x + m·n = (x + m)(x + n). Siempre se puede verificar distribuyendo.",
      }),
      [
        { text: `$${bin(p)}${bin(q)}$`, correct: true },
        { text: `$${bin(-p)}${bin(-q)}$`, error: { type: "signos", message: "Los números tienen el signo cambiado. Verificá distribuyendo: el término con x tiene que quedar igual." } },
        { text: `$${bin(S)}${bin(P)}$`, error: { type: "factorizacion", message: "Usaste la suma y el producto como si fueran los números. Hay que buscar dos números que SUMEN y MULTIPLIQUEN eso." } },
        { text: `$${bin(p)}${bin(-q)}$`, error: { type: "signos", message: "Uno de los signos está mal: con esos números el producto no da el término independiente." } },
      ],
    );
  },
};

export const ecuacionCuadratica: Generator = {
  id: "ecuacion-cuadratica",
  topicId: "t-cuadratica",
  description: "Ecuaciones cuadráticas por factorización o fórmula resolvente",
  generate(seed, d) {
    const r = rng(seed);
    if (d >= 5 && r.bool()) {
      const b = r.nz(-6, 6);
      const c = r.nz(-5, 9);
      const disc = b * b - 4 * c;
      const n = disc > 0 ? 2 : disc === 0 ? 1 : 0;
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: `¿Cuántas soluciones reales tiene $x^2 ${termX(b)} ${sgn(c)} = 0$?`,
          hints: ["No hace falta resolverla: alcanza con el discriminante.", "Δ = b² − 4ac.", `Δ = ${par(b)}² − 4·1·${par(c)} = ${disc}.`],
          solution: [`Δ = ${b * b} − ${4 * c} = ${disc}`, disc > 0 ? "Δ > 0 → dos soluciones reales" : disc === 0 ? "Δ = 0 → una solución (doble)" : "Δ < 0 → ninguna solución real"],
          explanation: "El discriminante Δ = b² − 4ac decide: positivo, dos soluciones; cero, una; negativo, ninguna real.",
        }),
        [
          { text: "Dos", correct: n === 2 },
          { text: "Una", correct: n === 1 },
          { text: "Ninguna", correct: n === 0 },
        ],
      );
    }
    const r1 = r.nz(-6, 6);
    let r2 = r.nz(-6, 6);
    if (r2 === -r1) r2 = r1 + 1 || 2;
    const a = d >= 4 ? r.pick([2, 3]) : 1;
    const S = r1 + r2;
    const P = r1 * r2;
    const eq = `${coef(a)}x^2 ${termX(-a * S)} ${sgn(a * P)} = 0`;
    const set = (u: number, v: number) => `$x = ${fmt(Math.min(u, v))}$ y $x = ${fmt(Math.max(u, v))}$`;
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
        prompt: `Resolvé: $${eq}$`,
        hints: [
          a !== 1 ? `Primero dividí todo por ${a}.` : "Probá factorizar: buscá dos números con la suma y el producto adecuados.",
          `Queda x² ${termX(-S)} ${sgn(P)} = 0 → (x ${sgn(-r1)})(x ${sgn(-r2)}) = 0.`,
          "Un producto da 0 cuando alguno de los factores es 0.",
        ],
        solution: [
          ...(a !== 1 ? [`Dividimos por ${a}: x² ${termX(-S)} ${sgn(P)} = 0`] : []),
          `(x ${sgn(-r1)})(x ${sgn(-r2)}) = 0`,
          `x ${sgn(-r1)} = 0 → x = ${fmt(r1)};  x ${sgn(-r2)} = 0 → x = ${fmt(r2)}`,
          "También sirve la fórmula resolvente: x = (−b ± √(b² − 4ac)) / (2a)",
        ],
        explanation: "Si (x − r₁)(x − r₂) = 0, entonces x = r₁ o x = r₂. La fórmula resolvente da lo mismo.",
      }),
      [
        { text: set(r1, r2), correct: true },
        { text: set(-r1, -r2), error: { type: "signos", message: `De (x ${sgn(-r1)}) = 0 sale x = ${fmt(r1)}: el número cambia de signo al despejar.` } },
        { text: `$x = ${fmt(S)}$ y $x = ${fmt(P)}$`, error: { type: "factorizacion", message: "Esos son la suma y el producto de las soluciones, no las soluciones." } },
        { text: `$x = ${fmt(Math.max(r1, r2))}$ solamente`, error: { type: "conceptual", message: "Una cuadrática con Δ > 0 tiene dos soluciones: no te olvides de la otra." } },
      ],
    );
  },
};

const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]];

export const pitagoras: Generator = {
  id: "pitagoras",
  topicId: "t-pitagoras",
  description: "Teorema de Pitágoras y distancia entre puntos",
  generate(seed, d) {
    const r = rng(seed);
    const mode = r.pick(byDifficulty(d, [["hip"], ["hip", "cat"], ["cat", "dist"], ["dist", "hip"], ["dist", "cat"], ["dist"]] as const));
    if (mode === "dist") {
      const [a, b, c] = r.pick(TRIPLES);
      const x1 = r.int(-4, 4), y1 = r.int(-4, 4);
      const x2 = x1 + (r.bool() ? a : -a), y2 = y1 + (r.bool() ? b : -b);
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: `¿Cuál es la distancia entre $(${fmt(x1)}, ${fmt(y1)})$ y $(${fmt(x2)}, ${fmt(y2)})$?`,
          hints: ["Dibujá los dos puntos: forman un triángulo rectángulo con los ejes.", "Los catetos son Δx y Δy.", "d = √((x₂ − x₁)² + (y₂ − y₁)²)"],
          solution: [`Δx = ${fmt(x2)} − ${par(x1)} = ${fmt(x2 - x1)}`, `Δy = ${fmt(y2)} − ${par(y1)} = ${fmt(y2 - y1)}`, `d = √(${(x2 - x1) ** 2} + ${(y2 - y1) ** 2}) = √${c * c} = ${c}`],
          explanation: "La distancia entre dos puntos es Pitágoras aplicado a las diferencias de coordenadas.",
          frequentErrors: [{ match: Math.abs(x2 - x1) + Math.abs(y2 - y1), type: "formula", message: "Sumaste las diferencias. La distancia en línea recta es la hipotenusa: √(Δx² + Δy²)." }],
          visual: { type: "vector", vectors: [{ x: x2 - x1, y: y2 - y1, label: "d" }] },
        }),
        kind: "numeric",
        answer: c,
      } as NumericExercise;
    }
    const triple = d >= 4 ? null : r.pick(TRIPLES);
    const [a, b, c] = triple ?? [r.int(2, 9), r.int(2, 9), 0];
    const hyp = triple ? c : Math.round(Math.hypot(a, b) * 100) / 100;
    if (mode === "hip") {
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: `Un triángulo rectángulo tiene catetos de ${a} cm y ${b} cm. ¿Cuánto mide la hipotenusa?${triple ? "" : " (2 decimales)"}`,
          hints: ["La hipotenusa es el lado opuesto al ángulo recto (el más largo).", "Pitágoras: h² = a² + b².", `h = √(${a}² + ${b}²) = √${a * a + b * b}.`],
          solution: [`h² = ${a * a} + ${b * b} = ${a * a + b * b}`, `h = √${a * a + b * b} ${triple ? "=" : "≈"} ${fmt(hyp, 2)} cm`],
          explanation: "En un triángulo rectángulo, el cuadrado de la hipotenusa es la suma de los cuadrados de los catetos.",
          frequentErrors: [
            { match: a + b, type: "formula", message: "Sumaste los catetos. Pitágoras suma los CUADRADOS y después saca la raíz." },
            { match: a * a + b * b, type: "calculo", message: "Ese es h². Falta la raíz cuadrada." },
          ],
        }),
        kind: "numeric",
        answer: hyp,
        unit: "cm",
        tolerance: triple ? undefined : 0.011,
      } as NumericExercise;
    }
    const legs = triple ? c : Math.ceil(Math.hypot(a, b)) + 1;
    const other = triple ? b : Math.round(Math.sqrt(legs * legs - a * a) * 100) / 100;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
        prompt: `La hipotenusa de un triángulo rectángulo mide ${legs} m y un cateto ${a} m. ¿Cuánto mide el otro cateto?${triple ? "" : " (2 decimales)"}`,
        hints: ["Pitágoras: h² = a² + b². Ahora la incógnita es un cateto.", `b² = h² − a² = ${legs * legs} − ${a * a}.`, "Despejá y sacá la raíz."],
        solution: [`b² = ${legs * legs} − ${a * a} = ${legs * legs - a * a}`, `b = √${legs * legs - a * a} ${triple ? "=" : "≈"} ${fmt(other, 2)} m`],
        explanation: "Para un cateto se resta: b² = h² − a².",
        frequentErrors: [{ match: Math.round(Math.sqrt(legs * legs + a * a) * 100) / 100, type: "despeje", message: "Sumaste los cuadrados. Si buscás un cateto, hay que RESTAR: b² = h² − a²." }],
      }),
      kind: "numeric",
      answer: other,
      unit: "m",
      tolerance: triple ? undefined : 0.011,
    } as NumericExercise;
  },
};

const ANG: Record<number, { sin: number; cos: number; tan: number }> = {
  30: { sin: 0.5, cos: Math.sqrt(3) / 2, tan: 1 / Math.sqrt(3) },
  45: { sin: Math.SQRT1_2, cos: Math.SQRT1_2, tan: 1 },
  60: { sin: Math.sqrt(3) / 2, cos: 0.5, tan: Math.sqrt(3) },
};

export const trigonometria: Generator = {
  id: "trigonometria",
  topicId: "t-trigonometria",
  description: "Seno, coseno, tangente y radianes",
  generate(seed, d) {
    const r = rng(seed);
    const mode = r.pick(byDifficulty(d, [["concepto"], ["concepto", "lado"], ["lado", "rad"], ["lado", "rad"], ["lado", "angulo"], ["angulo", "rad"]] as const));
    if (mode === "concepto") {
      const which = r.pick(["sen", "cos", "tan"] as const);
      const right = { sen: "opuesto / hipotenusa", cos: "adyacente / hipotenusa", tan: "opuesto / adyacente" }[which];
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: `En un triángulo rectángulo, ¿qué es el **${which === "sen" ? "seno" : which === "cos" ? "coseno" : "tangente"}** de un ángulo agudo?`,
          hints: ["Ubicate en el ángulo: el cateto opuesto está enfrente; el adyacente lo toca.", "Regla mnemotécnica: «SOH-CAH-TOA» (Seno = O/H, Coseno = A/H, Tangente = O/A).", `Para este caso: ${right}.`],
          solution: [`${which} = ${right}`],
          explanation: "sen = opuesto/hipotenusa, cos = adyacente/hipotenusa, tan = opuesto/adyacente.",
        }),
        [
          { text: "Cateto opuesto / hipotenusa", correct: which === "sen", error: which === "sen" ? undefined : { type: "trigonometria", message: "Ese cociente es el seno." } },
          { text: "Cateto adyacente / hipotenusa", correct: which === "cos", error: which === "cos" ? undefined : { type: "trigonometria", message: "Ese cociente es el coseno." } },
          { text: "Cateto opuesto / cateto adyacente", correct: which === "tan", error: which === "tan" ? undefined : { type: "trigonometria", message: "Ese cociente es la tangente." } },
          { text: "Hipotenusa / cateto opuesto", error: { type: "trigonometria", message: "La hipotenusa va abajo en el seno y el coseno: es el lado más largo, así que esos cocientes son menores que 1." } },
        ],
      );
    }
    if (mode === "rad") {
      const deg = r.pick([30, 45, 60, 90, 120, 180, 270, 360]);
      const toRad = r.bool();
      if (toRad) {
        return {
          ...base({
            gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
            prompt: `Pasá ${deg}° a radianes. (Podés escribir con «pi», por ejemplo pi/4)`,
            hints: ["Una vuelta completa: 360° = 2π rad, o sea 180° = π rad.", `Multiplicá por π/180.`, `${deg} · π / 180 = ?`],
            solution: [`${deg}° · π/180 = ${deg}π/180`, `≈ ${fmt((deg * Math.PI) / 180, 4)} rad`],
            explanation: "180° equivalen a π radianes. Para pasar de grados a radianes se multiplica por π/180.",
            frequentErrors: [{ match: (deg * 180) / Math.PI, type: "unidades", message: "Multiplicaste por 180/π: eso es de radianes a grados. Al revés: por π/180." }],
          }),
          kind: "numeric",
          answer: (deg * Math.PI) / 180,
          tolerance: 0.002,
        } as NumericExercise;
      }
      const rad = (deg * Math.PI) / 180;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: `¿A cuántos grados equivalen ${fmt(deg / 180, 3)}π radianes?`,
          hints: ["π rad = 180°.", "Multiplicá por 180/π.", `${fmt(deg / 180, 3)} · 180 = ?`],
          solution: [`${fmt(deg / 180, 3)}π · 180/π = ${deg}°`],
          explanation: "Para pasar de radianes a grados se multiplica por 180/π.",
          frequentErrors: [{ match: rad, type: "unidades", message: "Ese es el valor en radianes. Pasalo a grados multiplicando por 180/π." }],
        }),
        kind: "numeric",
        answer: deg,
        unit: "°",
      } as NumericExercise;
    }
    if (mode === "angulo") {
      const ang = r.pick([30, 45, 60]);
      const h = r.pick([2, 4, 6, 8, 10]);
      const opp = Math.round(h * ANG[ang].sin * 1000) / 1000;
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: `Un triángulo rectángulo tiene hipotenusa ${h} y el cateto opuesto a un ángulo α mide ${fmt(opp, 3)}. ¿Cuánto vale α?`,
          hints: ["Con opuesto e hipotenusa, la razón que sirve es el seno.", `sen α = ${fmt(opp, 3)} / ${h} = ${fmt(opp / h, 3)}.`, "¿Qué ángulo tiene ese seno? sen 30° = 0,5; sen 45° ≈ 0,707; sen 60° ≈ 0,866."],
          solution: [`sen α = ${fmt(opp / h, 3)}`, `α = ${ang}°`],
          explanation: "Para hallar un ángulo se usa la razón inversa (arcsen, arccos, arctan) o una tabla de ángulos notables.",
        }),
        [30, 45, 60, 90].map((a) => ({ text: `${a}°`, correct: a === ang, error: a === ang ? undefined : { type: "trigonometria" as const, message: `sen ${a}° = ${fmt(Math.sin((a * Math.PI) / 180), 3)}, no ${fmt(opp / h, 3)}.` } })),
      );
    }
    const ang = r.pick([30, 45, 60]);
    const h = r.pick([4, 6, 8, 10, 12, 20]);
    const findOpp = r.bool();
    const val = Math.round(h * (findOpp ? ANG[ang].sin : ANG[ang].cos) * 100) / 100;
    const wrong = Math.round(h * (findOpp ? ANG[ang].cos : ANG[ang].sin) * 100) / 100;
    const fe: FrequentError[] = wrong !== val ? [{ match: wrong, type: "trigonometria", message: findOpp ? "Usaste el coseno. Para el cateto OPUESTO se usa el seno: opuesto = h · sen α." : "Usaste el seno. Para el cateto ADYACENTE se usa el coseno: adyacente = h · cos α." }] : [];
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
        prompt: `En un triángulo rectángulo la hipotenusa mide ${h} y uno de los ángulos agudos es ${ang}°. ¿Cuánto mide el cateto ${findOpp ? "opuesto" : "adyacente"} a ese ángulo? (2 decimales)`,
        hints: [findOpp ? "Opuesto e hipotenusa: seno." : "Adyacente e hipotenusa: coseno.", findOpp ? `sen ${ang}° = opuesto / ${h}.` : `cos ${ang}° = adyacente / ${h}.`, `Despejá multiplicando por ${h}. La calculadora en DEG.`],
        solution: [findOpp ? `opuesto = ${h} · sen ${ang}°` : `adyacente = ${h} · cos ${ang}°`, `= ${fmt(val, 2)}`],
        explanation: "En un triángulo rectángulo: opuesto = h·sen α y adyacente = h·cos α.",
        frequentErrors: fe,
      }),
      kind: "numeric",
      answer: val,
      tolerance: 0.011,
    } as NumericExercise;
  },
};

export const limite: Generator = {
  id: "limite",
  topicId: "t-limites",
  description: "Límites por sustitución y por factorización (0/0)",
  generate(seed, d) {
    const r = rng(seed);
    const mode = r.pick(byDifficulty(d, [["directo"], ["directo", "cuadrados"], ["cuadrados"], ["cuadrados", "trinomio"], ["trinomio"], ["trinomio", "cuadrados"]] as const));
    if (mode === "directo") {
      const a = r.nz(-3, 3), b = r.int(-5, 5), k = r.int(-3, 3);
      const val = k * k + a * k + b;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "am-a", topicId: this.topicId,
          prompt: `Calculá $lim_{x→${fmt(k)}} (x^2 ${termX(a)} ${sgn(b)})$`,
          hints: ["Los polinomios son continuos: el límite es el valor de la función en ese punto.", `Reemplazá x por ${par(k)}.`, `${par(k)}² ${sgn(a)}·${par(k)} ${sgn(b)}.`],
          solution: [`Reemplazo x = ${fmt(k)}: ${par(k)}² ${sgn(a)}·${par(k)} ${sgn(b)}`, `= ${fmt(val)}`],
          explanation: "Si no aparece una indeterminación (como 0/0), el límite de un polinomio se calcula reemplazando.",
        }),
        kind: "numeric",
        answer: val,
      } as NumericExercise;
    }
    if (mode === "cuadrados") {
      const a = r.nz(-6, 6);
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "am-a", topicId: this.topicId,
          prompt: `Calculá $lim_{x→${fmt(a)}} \\frac{x^2 − ${a * a}}{x ${sgn(-a)}}$`,
          hints: [`Si reemplazás x = ${fmt(a)} da 0/0: es una indeterminación, NO vale 0.`, "Factorizá el numerador: es una diferencia de cuadrados.", `x² − ${a * a} = ${bin(-a)}${bin(a)}: simplificá el factor que se repite con el denominador.`],
          solution: [`Reemplazar da 0/0 → hay que simplificar`, `x² − ${a * a} = ${bin(-a)}${bin(a)}`, `Simplifico ${bin(-a)}: queda x ${sgn(a)}`, `lim = ${fmt(a)} ${sgn(a)} = ${fmt(2 * a)}`],
          explanation: "0/0 indica que numerador y denominador comparten un factor. Se factoriza, se simplifica y recién ahí se reemplaza.",
          frequentErrors: [
            { match: 0, type: "factorizacion", message: `0/0 no es 0, y si factorizaste x² − ${a * a} como (x ${sgn(-a)})² también llegás a 0. La diferencia de cuadrados es (x ${sgn(-a)})(x ${sgn(a)}): al simplificar queda x ${sgn(a)}.` },
            { match: 1, type: "limites", message: "0/0 no es 1: es una indeterminación. Hay que factorizar y simplificar antes de reemplazar." },
            { match: a, type: "calculo", message: `Al simplificar queda x ${sgn(a)}; reemplazando x = ${fmt(a)} da ${fmt(a)} ${sgn(a)} = ${fmt(2 * a)}.` },
          ],
        }),
        kind: "numeric",
        answer: 2 * a,
        prerequisites: ["t-factorizacion"],
      } as NumericExercise;
    }
    const p = r.nz(-5, 5);
    let q = r.nz(-5, 5);
    if (q === p) q = -p || 3;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "am-a", topicId: this.topicId,
        prompt: `Calculá $lim_{x→${fmt(p)}} \\frac{x^2 ${termX(-(p + q))} ${sgn(p * q)}}{x ${sgn(-p)}}$`,
        hints: [`Reemplazando x = ${fmt(p)} da 0/0.`, "Factorizá el trinomio: dos números que sumen y multipliquen lo indicado.", `x² ${termX(-(p + q))} ${sgn(p * q)} = ${bin(-p)}${bin(-q)}.`],
        solution: [`${bin(-p)}${bin(-q)} / ${bin(-p)} = x ${sgn(-q)}`, `lim = ${fmt(p)} ${sgn(-q)} = ${fmt(p - q)}`],
        explanation: "Si al reemplazar aparece 0/0, el valor del límite está escondido: factorizar y simplificar lo muestra.",
        frequentErrors: [
          { match: 0, type: "factorizacion", message: `0/0 no es 0. Factorizá el numerador: ${bin(-p)}${bin(-q)}; al simplificar queda x ${sgn(-q)}.` },
          { match: p + q, type: "factorizacion", message: `La factorización tiene el signo cambiado: es ${bin(-p)}${bin(-q)}, que se simplifica a x ${sgn(-q)}.` },
        ].filter((e) => e.match !== p - q) as FrequentError[],
      }),
      kind: "numeric",
      answer: p - q,
      prerequisites: ["t-factorizacion"],
    } as NumericExercise;
  },
};

export const derivadaPotencia: Generator = {
  id: "derivada-potencia",
  topicId: "t-derivadas",
  description: "Regla de la potencia y pendiente de la tangente",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.nz(-5, 6);
    const n = r.int(2, d >= 4 ? 5 : 3);
    const b = d >= 3 ? r.nz(-6, 6) : 0;
    const c = d >= 3 ? r.int(-9, 9) : 0;
    const f = `${coef(a)}x^${n}${b ? ` ${termX(b)}` : ""}${c ? ` ${sgn(c)}` : ""}`;
    const deriv = `${a * n}*x^${n - 1}${b ? ` + ${b}` : ""}`;
    const derivText = `${fmt(a * n)}x${n - 1 > 1 ? `^${n - 1}` : ""}${b ? ` ${sgn(b)}` : ""}`;
    if (d >= 5 && r.bool()) {
      const k = r.nz(-2, 2);
      const slope = a * n * k ** (n - 1) + b;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: "am-a", topicId: this.topicId,
          prompt: `Si $f(x) = ${f}$, ¿cuál es la pendiente de la recta tangente en $x = ${fmt(k)}$?`,
          hints: ["La pendiente de la tangente es la derivada evaluada en el punto.", `f′(x) = ${derivText}.`, `Reemplazá x = ${par(k)} en f′.`],
          solution: [`f′(x) = ${derivText}`, `f′(${fmt(k)}) = ${fmt(a * n)}·${par(k)}${n - 1 > 1 ? `^${n - 1}` : ""}${b ? ` ${sgn(b)}` : ""} = ${fmt(slope)}`],
          explanation: "f′(a) es la pendiente de la recta tangente al gráfico de f en x = a.",
          frequentErrors: [{ match: a * k ** n + b * k + c, type: "derivacion", message: "Ese es f(x), el valor de la función. La pendiente es la DERIVADA evaluada en el punto." }],
          visual: { type: "plot", functions: [`${a}*x^${n} + ${b}*x + ${c}`, `${slope}*(x - ${k}) + ${a * k ** n + b * k + c}`], points: [[k, a * k ** n + b * k + c]] },
        }),
        kind: "numeric",
        answer: slope,
      } as NumericExercise;
    }
    const ex: ExpressionExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "am-a", topicId: this.topicId,
        prompt: `Derivá: $f(x) = ${f}$. Escribí $f′(x)$.`,
        hints: ["Regla de la potencia: la derivada de xⁿ es n·xⁿ⁻¹ (el exponente baja multiplicando y se le resta 1).", `La derivada de ${coef(a)}x^${n} es ${a}·${n}·x^${n - 1}.${b ? ` La de ${coef(b)}x es ${b}.` : ""}${c ? " La de una constante es 0." : ""}`, `f′(x) = ${derivText}`],
        solution: [`(${coef(a)}x^${n})′ = ${a}·${n}·x^${n - 1} = ${fmt(a * n)}x^${n - 1}`, ...(b ? [`(${coef(b)}x)′ = ${b}`] : []), ...(c ? [`(${c})′ = 0`] : []), `f′(x) = ${derivText}`],
        explanation: "Regla de la potencia: (xⁿ)′ = n·xⁿ⁻¹. Una constante multiplicando se mantiene; una constante sumando desaparece.",
        frequentErrors: [
          { match: `${a}*x^${n - 1}${b ? ` + ${b}` : ""}`, type: "derivacion", message: `Faltó multiplicar por el exponente: (x^${n})′ = ${n}·x^${n - 1}.` },
          { match: `${a * n}*x^${n}${b ? ` + ${b}` : ""}`, type: "derivacion", message: `El exponente baja multiplicando y además se le resta 1: queda x^${n - 1}.` },
          ...(c ? [{ match: `${deriv} + ${c}`, type: "derivacion" as const, message: "La derivada de una constante es 0: no cambia, así que su tasa de cambio es nula." }] : []),
        ],
      }),
      kind: "expression",
      answer: deriv,
      variables: ["x"],
      sampleRange: [-3, 3],
      prerequisites: ["t-potencias", "t-recta"],
    };
    return ex;
  },
};

export const precalcGenerators = [factorizar, ecuacionCuadratica, pitagoras, trigonometria, limite, derivadaPotencia];
