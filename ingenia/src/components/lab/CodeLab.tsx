"use client";
import { useState } from "react";
import { actions } from "@/lib/store";
import { CodeStepper } from "../code/CodeStepper";

const EXAMPLES: Record<string, string> = {
  "Variables": "x = 5\ny = 3\nresultado = x + y\nprint(resultado)",
  "Condicional": "edad = 17\nif edad >= 18:\n    print(\"Puede votar obligatoriamente\")\nelif edad >= 16:\n    print(\"Voto optativo\")\nelse:\n    print(\"Todavía no vota\")",
  "Suma con for": "suma = 0\nfor i in range(1, 6):\n    suma = suma + i\nprint(\"La suma es\", suma)",
  "While: dividir": "n = 100\npasos = 0\nwhile n > 1:\n    n = n // 2\n    pasos += 1\nprint(pasos)",
  "Función": "def area_triangulo(base, altura):\n    return base * altura / 2\n\na = area_triangulo(4, 3)\nprint(a)",
  "Máximo de una lista": "numeros = [4, 17, 2, 9, 11]\nmayor = numeros[0]\nfor n in numeros:\n    if n > mayor:\n        mayor = n\nprint(mayor)",
  "Factorial": "def factorial(n):\n    resultado = 1\n    for i in range(2, n + 1):\n        resultado = resultado * i\n    return resultado\n\nprint(factorial(5))",
};

/** Editor + visualizador paso a paso. El código corre en un intérprete propio (subconjunto de Python), sin acceso al sistema. */
export function CodeLab() {
  const [code, setCode] = useState(EXAMPLES["Variables"]);
  const [ran, setRan] = useState(code);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Escribí código en un subconjunto de Python (variables, if, for, while, def, listas, print) y ejecutalo paso a paso para ver cómo cambian las variables.
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.keys(EXAMPLES).map((k) => (
          <button key={k} className="chip !text-sm" onClick={() => { setCode(EXAMPLES[k]); setRan(EXAMPLES[k]); }}>
            {k}
          </button>
        ))}
      </div>
      <textarea
        className="input min-h-48 font-mono text-sm leading-6"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const el = e.currentTarget;
            const s = el.selectionStart;
            const v = code.slice(0, s) + "    " + code.slice(el.selectionEnd);
            setCode(v);
            requestAnimationFrame(() => el.setSelectionRange(s + 4, s + 4));
          }
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) setRan(code);
        }}
        spellCheck={false}
        autoCapitalize="off"
        aria-label="Editor de código"
      />
      <button className="btn btn-primary" onClick={() => setRan(code)}>
        Ejecutar (Ctrl+Enter)
      </button>
      <CodeStepper
        code={ran}
        autoStart
        onRun={(ok) => {
          if (!ok) return;
          actions.grantAchievement("primer-programa");
          if (/^\s*def\s/m.test(ran) && /\w+\(/.test(ran.replace(/^\s*def .*$/gm, ""))) actions.grantAchievement("primera-funcion");
        }}
      />
    </div>
  );
}
