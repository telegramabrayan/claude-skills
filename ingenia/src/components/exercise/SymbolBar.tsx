"use client";

const COMMON = ["−", "/", ",", "^", "(", ")", "√(", "π"];

/** Teclado de símbolos para el celular: inserta en el campo que tiene el foco. */
export function SymbolBar({ onInsert, kind }: { onInsert: (s: string) => void; kind: "numeric" | "expression" | "steps" }) {
  const keys = kind === "steps" ? ["x", "=", ...COMMON.slice(0, 6)] : kind === "expression" ? [...COMMON, "·"] : COMMON;
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Símbolos">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onInsert(k === "−" ? "-" : k === "·" ? "*" : k)}
          className="math min-h-10 min-w-10 rounded-lg border border-line bg-surface px-2 text-base hover:border-primary"
          aria-label={`Insertar ${k}`}
        >
          {k}
        </button>
      ))}
    </div>
  );
}
