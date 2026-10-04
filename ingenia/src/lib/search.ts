/** Índice de búsqueda local sobre todo el contenido (sin servidor). */
import { SUBJECTS } from "@/content/curriculum";
import { LESSONS } from "@/content/lessons";
import { TOPICS } from "@/content/topics";
import { FORMULAS } from "@/content/formulas";
import { GLOSSARY } from "@/content/glossary";
import { GENERATORS } from "@/engine/generators";
import { lessonContext } from "./learning";

export type ResultType = "Materia" | "Unidad" | "Lección" | "Tema" | "Fórmula" | "Definición" | "Ejercicio";

export interface SearchEntry {
  type: ResultType;
  title: string;
  path: string;
  href: string;
  text: string;
}

export function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[$*`_^]/g, " ");
}

function build(): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const s of SUBJECTS) {
    out.push({ type: "Materia", title: s.name, path: s.cycle === "cbc" ? "CBC" : s.cycle === "preparacion" ? "Preparación" : "Segundo ciclo", href: `/materias/${s.id}`, text: `${s.description} ${s.objectives.join(" ")}` });
    for (const u of s.units) out.push({ type: "Unidad", title: u.title, path: s.name, href: `/materias/${s.id}`, text: u.summary });
  }
  for (const l of LESSONS) {
    const ctx = lessonContext(l.id);
    const body = l.cards.map((c) => (c.kind === "explain" ? `${c.title} ${c.body}` : c.kind === "intro" ? `${c.learn} ${c.why}` : c.kind === "example" ? `${c.title} ${c.problem}` : c.kind === "summary" ? c.points.join(" ") : c.title)).join(" ");
    out.push({ type: "Lección", title: l.title, path: ctx ? `${ctx.subject.shortName} → ${ctx.unit.title}` : l.subtitle, href: `/leccion/${l.id}`, text: `${l.subtitle} ${body}` });
  }
  for (const t of TOPICS) {
    const ctx = t.lessonId ? lessonContext(t.lessonId) : undefined;
    out.push({ type: "Tema", title: t.name, path: ctx ? `${ctx.subject.shortName} → ${ctx.unit.title}` : "", href: `/practicar?tema=${t.id}`, text: "" });
  }
  for (const f of FORMULAS) out.push({ type: "Fórmula", title: `${f.name}: ${f.expression}`, path: "Formulario", href: `/formulas#${f.id}`, text: `${f.meaning} ${f.whenToUse} ${f.tags.join(" ")} ${f.variables.map((v) => v.meaning).join(" ")}` });
  for (const g of GLOSSARY) out.push({ type: "Definición", title: `${g.symbol} · ${g.name}`, path: "Diccionario", href: `/diccionario?q=${encodeURIComponent(g.symbol)}`, text: `${g.meaning} ${g.example ?? ""} ${(g.aliases ?? []).join(" ")}` });
  for (const g of GENERATORS) {
    const topic = TOPICS.find((t) => t.id === g.topicId);
    out.push({ type: "Ejercicio", title: g.description, path: topic?.name ?? "", href: `/practicar?tema=${g.topicId}`, text: "" });
  }
  return out;
}

let INDEX: { entry: SearchEntry; title: string; path: string; text: string }[] | null = null;

export function search(query: string, limit = 30): SearchEntry[] {
  const words = normalize(query).split(/\s+/).filter((w) => w.length > 0);
  if (!words.length) return [];
  INDEX ??= build().map((entry) => ({ entry, title: normalize(entry.title), path: normalize(entry.path), text: normalize(entry.text) }));
  const raw = query.trim();
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const it of INDEX) {
    let score = 0;
    let all = true;
    for (const w of words) {
      const s = (it.title.includes(w) ? 5 : 0) + (it.path.includes(w) ? 2 : 0) + (it.text.includes(w) ? 1 : 0);
      if (!s) {
        all = false;
        break;
      }
      score += s;
    }
    // Búsqueda de símbolos (Σ, ∫, ℝ…): coincidencia exacta en el título original.
    if (!all && raw.length <= 3 && it.entry.title.includes(raw)) {
      all = true;
      score = 10;
    }
    if (all) scored.push({ e: it.entry, score: score + (it.entry.type === "Lección" ? 1 : 0) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.e);
}
