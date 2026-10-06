"use client";
/**
 * Renderiza el mini-markup del contenido:
 *   $...$     matemática (superíndices con ^2, ^{n+1}, ^(−1); subíndices con _0, _{máx})
 *   **texto** negrita · `código` · ```bloque de código``` · \x carácter literal · párrafos separados por línea en blanco
 * Los símbolos especiales (Δ, Σ, ∫, ∈, ℝ, lim, …) se pueden tocar para ver qué significan.
 */
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { GLOSSARY_SYMBOLS } from "@/content/glossary";

const TAPPABLE = new Set(["≠", "≤", "≥", "√", "π", "∞", "Δ", "Σ", "∑", "∫", "→", "∀", "∃", "∈", "∉", "ℕ", "ℤ", "ℚ", "ℝ", "∪", "∩", "θ", "α", "ε", "δ", "≈", "⇔"]);
const WORDS = ["lim", "dx", "dy"];

export function Sym({ symbol, children }: { symbol: string; children?: ReactNode }) {
  const entry = GLOSSARY_SYMBOLS.get(symbol);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  if (!entry) return <>{children ?? symbol}</>;
  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        className="cursor-help rounded px-[1px] underline decoration-dotted decoration-primary underline-offset-4 hover:bg-primary-soft"
        title={entry.name}
      >
        {children ?? symbol}
      </button>
      {open && (
        <span id={id} role="tooltip" className="anim-pop absolute left-1/2 top-full z-40 mt-2 block w-64 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 text-left font-sans text-sm font-normal not-italic shadow-xl">
          <span className="block text-base font-bold">
            <span className="math mr-2">{entry.symbol}</span>
            {entry.name}
          </span>
          <span className="mt-1 block text-muted">{entry.meaning}</span>
          {entry.example && <span className="mt-2 block rounded-lg bg-surface-2 px-2 py-1 text-xs">{entry.example}</span>}
          <Link href={`/diccionario?q=${encodeURIComponent(entry.symbol)}`} className="mt-2 block text-xs font-semibold text-primary">
            Ver en el diccionario →
          </Link>
        </span>
      )}
    </span>
  );
}

/** Divide texto plano en partes resaltando símbolos tocables. */
function withSymbols(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let buf = "";
  let k = 0;
  const flush = () => {
    if (buf) out.push(<Fragment key={`${keyBase}-t${k++}`}>{buf}</Fragment>);
    buf = "";
  };
  for (let i = 0; i < text.length; i++) {
    const word = WORDS.find((w) => text.startsWith(w, i) && !/[a-záéíóú]/i.test(text[i - 1] ?? "") && !/[a-záéíóú]/i.test(text[i + w.length] ?? ""));
    if (word) {
      flush();
      out.push(<Sym key={`${keyBase}-s${k++}`} symbol={word} />);
      i += word.length - 1;
      continue;
    }
    const ch = text[i];
    if (TAPPABLE.has(ch)) {
      flush();
      out.push(<Sym key={`${keyBase}-s${k++}`} symbol={ch} />);
      continue;
    }
    buf += ch;
  }
  flush();
  return out;
}

/** Lee un grupo tras ^ o _: {…}, (…) o una corrida de caracteres simples. */
function readGroup(s: string, i: number): [string, number] {
  if (s[i] === "{") {
    const j = s.indexOf("}", i);
    return j < 0 ? [s.slice(i + 1), s.length] : [s.slice(i + 1, j), j + 1];
  }
  if (s[i] === "(") {
    let depth = 0;
    for (let j = i; j < s.length; j++) {
      if (s[j] === "(") depth++;
      else if (s[j] === ")" && --depth === 0) return [s.slice(i + 1, j), j + 1];
    }
    return [s.slice(i + 1), s.length];
  }
  const m = /^[−-]?[A-Za-z0-9áéíóú.,]+/.exec(s.slice(i));
  if (!m) return ["", i];
  // En subíndices de una letra seguidos de texto (x_0 + ...) alcanza con la corrida.
  return [m[0], i + m[0].length];
}

function MathSegment({ src, k }: { src: string; k: string }) {
  const s = src.replace(/sqrt\(/g, "√(").replace(/\*/g, "·").replace(/(\d)\s*\/\s*(\d)/g, "$1/$2");
  const parts: ReactNode[] = [];
  let buf = "";
  let n = 0;
  const flush = () => {
    if (buf) parts.push(...withSymbols(buf, `${k}-${n++}`));
    buf = "";
  };
  for (let i = 0; i < s.length; ) {
    const c = s[i];
    // Fracción apilada: \frac{numerador}{denominador}
    if (s.startsWith("\\frac{", i)) {
      const [num, afterNum] = readGroup(s, i + 5);
      const [den, afterDen] = s[afterNum] === "{" ? readGroup(s, afterNum) : ["", afterNum];
      flush();
      parts.push(
        <span key={`${k}-f${n++}`} className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.92em] leading-tight">
          <span className="border-b border-current px-1">
            <MathSegment src={num} k={`${k}-fn${n}`} />
          </span>
          <span className="px-1">
            <MathSegment src={den} k={`${k}-fd${n}`} />
          </span>
        </span>,
      );
      i = afterDen;
      continue;
    }
    if (c === "\\" && i + 1 < s.length) {
      buf += s[i + 1];
      i += 2;
      continue;
    }
    if ((c === "^" || c === "_") && i + 1 < s.length) {
      const [group, next] = readGroup(s, i + 1);
      if (group) {
        flush();
        const Tag = c === "^" ? "sup" : "sub";
        parts.push(
          <Tag key={`${k}-g${n++}`} className="text-[0.72em]">
            <MathSegment src={group} k={`${k}-in${n}`} />
          </Tag>,
        );
        i = next;
        continue;
      }
    }
    buf += c;
    i++;
  }
  flush();
  return <>{parts}</>;
}

function Inline({ text, k }: { text: string; k: string }) {
  const nodes: ReactNode[] = [];
  let i = 0;
  let buf = "";
  let n = 0;
  const flush = () => {
    if (buf) nodes.push(...withSymbols(buf, `${k}-p${n++}`));
    buf = "";
  };
  while (i < text.length) {
    const c = text[i];
    if (c === "\\" && i + 1 < text.length) {
      buf += text[i + 1];
      i += 2;
      continue;
    }
    if (c === "$") {
      let j = i + 1;
      while (j < text.length && !(text[j] === "$" && text[j - 1] !== "\\")) j++;
      flush();
      nodes.push(
        <span key={`${k}-m${n++}`} className="math whitespace-nowrap">
          <MathSegment src={text.slice(i + 1, j)} k={`${k}-m${n}`} />
        </span>,
      );
      i = j + 1;
      continue;
    }
    if (c === "*" && text[i + 1] === "*") {
      const j = text.indexOf("**", i + 2);
      if (j > 0) {
        flush();
        nodes.push(
          <strong key={`${k}-b${n++}`} className="font-bold">
            <Inline text={text.slice(i + 2, j)} k={`${k}-bi${n}`} />
          </strong>,
        );
        i = j + 2;
        continue;
      }
    }
    if (c === "`") {
      const j = text.indexOf("`", i + 1);
      if (j > 0) {
        flush();
        nodes.push(
          <code key={`${k}-c${n++}`} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em]">
            {text.slice(i + 1, j)}
          </code>,
        );
        i = j + 1;
        continue;
      }
    }
    buf += c;
    i++;
  }
  flush();
  return <>{nodes}</>;
}

/** Separa los bloques de código ```…``` del resto del texto. */
function splitFences(text: string): { code: boolean; text: string }[] {
  const out: { code: boolean; text: string }[] = [];
  const re = /```[A-Za-z]*\n?([\s\S]*?)\n?```\n?/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ code: false, text: text.slice(last, m.index) });
    out.push({ code: true, text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ code: false, text: text.slice(last) });
  return out;
}

function Paragraphs({ text, k }: { text: string; k: string }) {
  const paragraphs = text.replace(/^\s*\n|\n\s*$/g, "").split(/\n\s*\n/).filter((p, i, all) => p.trim() || all.length === 1);
  return (
    <>
      {paragraphs.map((p, pi) => (
        <p key={`${k}-${pi}`}>
          {p.split("\n").map((line, li) => (
            <Fragment key={li}>
              {li > 0 && <br />}
              <Inline text={line} k={`${k}-${pi}-${li}`} />
            </Fragment>
          ))}
        </p>
      ))}
    </>
  );
}

export function MathText({ text, className = "", block = true }: { text: string; className?: string; block?: boolean }) {
  const parts = text.includes("```") ? splitFences(text) : [{ code: false, text }];
  if (!block)
    return (
      <span className={className}>
        {parts.map((p, i) =>
          p.code ? (
            <span key={i} className="my-1 block overflow-x-auto whitespace-pre rounded-md bg-surface-2 px-2 py-1 text-left font-mono text-[0.9em] leading-snug">
              {p.text}
            </span>
          ) : (
            <Inline key={i} text={p.text} k={`i${i}`} />
          ),
        )}
      </span>
    );
  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {parts.map((p, i) =>
        p.code ? (
          <pre key={i} className="overflow-x-auto rounded-xl border border-line bg-surface-2 px-3 py-2 font-mono text-sm leading-6">
            {p.text}
          </pre>
        ) : (
          <Paragraphs key={i} text={p.text} k={`b${i}`} />
        ),
      )}
    </div>
  );
}
