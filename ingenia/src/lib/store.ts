"use client";
/**
 * Store global del progreso (sin dependencias): un objeto fuera de React con
 * subscribe/getState, leído con useSyncExternalStore. Las acciones son
 * funciones puras del motor; acá solo se orquestan, se persisten y se emiten
 * eventos para la UI (XP ganada, logros, subida de nivel).
 */
import { useSyncExternalStore } from "react";
import type { CareerGoal, Difficulty, SkillId } from "@/engine/types";
import { initialState, newTopicState, type ExamRecord, type ProgressState } from "@/engine/progress/state";
import { addStudyTime as addTime, addXp, completeLesson as completeLessonRule, levelInfo, recordAttempt as recordAttemptRule, saveLessonCard, XP, type AttemptInput } from "@/engine/progress/rules";
import { dayKey } from "@/engine/progress/dates";
import { ACHIEVEMENTS, newlyUnlocked } from "@/content/achievements";
import { routeFromDiagnostic, unitsWithLessons, fullRoute } from "./learning";
import { repository } from "./storage";

type UiEventBody =
  | { type: "xp"; amount: number; label?: string }
  | { type: "achievement"; achievementId: string }
  | { type: "level"; level: number }
  | { type: "unit"; unitId: string };

export type UiEvent = UiEventBody & { id: number };

type Listener = () => void;

let state: ProgressState = initialState();
let hydrated = false;
const listeners = new Set<Listener>();
const eventListeners = new Set<(e: UiEvent) => void>();
let eventId = 0;
let savePending = false;

function emitChange() {
  listeners.forEach((l) => l());
}

function emit(e: UiEventBody) {
  const ev: UiEvent = { ...e, id: ++eventId };
  eventListeners.forEach((l) => l(ev));
}

/**
 * Guarda al final de la tarea actual (agrupa varios cambios seguidos en una
 * sola escritura) y nunca más tarde: así no se pierde nada si el estudiante
 * navega o cierra la pestaña enseguida.
 */
function scheduleSave() {
  if (savePending) return;
  savePending = true;
  queueMicrotask(() => {
    savePending = false;
    void repository.save(state);
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    if (hydrated) void repository.save(state);
  });
}

/** Aplica un cambio, otorga logros nuevos y emite eventos de nivel. */
function commit(next: ProgressState) {
  const before = levelInfo(state.xp).level;
  const unlocked = newlyUnlocked(next);
  if (unlocked.length) {
    const now = new Date().toISOString();
    next = { ...next, achievements: { ...next.achievements, ...Object.fromEntries(unlocked.map((a) => [a.id, now])) } };
  }
  state = next;
  const after = levelInfo(state.xp).level;
  emitChange();
  scheduleSave();
  unlocked.forEach((a) => emit({ type: "achievement", achievementId: a.id }));
  if (after > before) emit({ type: "level", level: after });
}

export const store = {
  getState: () => state,
  isHydrated: () => hydrated,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  onEvent(l: (e: UiEvent) => void) {
    eventListeners.add(l);
    return () => {
      eventListeners.delete(l);
    };
  },
  async hydrate() {
    if (hydrated) return;
    const loaded = await repository.load();
    if (loaded) state = loaded;
    hydrated = true;
    emitChange();
  },
};

// ───────────────────────── Acciones ─────────────────────────

export const actions = {
  completeOnboarding(goal: CareerGoal, startMode: "diagnostico" | "cero", name = "") {
    commit({
      ...state,
      profile: { ...state.profile, goal, startMode, name, onboarded: true },
      route: startMode === "cero" ? fullRoute() : state.route,
    });
  },

  setGoal(goal: CareerGoal) {
    commit({ ...state, profile: { ...state.profile, goal } });
  },

  setName(name: string) {
    commit({ ...state, profile: { ...state.profile, name } });
  },

  saveDiagnostic(skills: Partial<Record<SkillId, number>>) {
    const out = routeFromDiagnostic(skills);
    const topics = { ...state.topics };
    for (const [id, seed] of Object.entries(out.topicSeeds)) {
      const prev = topics[id] ?? newTopicState();
      topics[id] = { ...prev, level: seed.level as Difficulty, mastery: Math.max(prev.mastery, seed.mastery) };
    }
    commit({
      ...state,
      diagnostic: { completedAt: new Date().toISOString(), skills },
      route: out.route,
      unlocked: [...new Set([...state.unlocked, ...out.unlocked])],
      topics,
    });
  },

  recordAttempt(input: AttemptInput) {
    const r = recordAttemptRule(state, input);
    commit(r.state);
    if (r.xpGained) emit({ type: "xp", amount: r.xpGained });
    if (r.streakBonus) emit({ type: "xp", amount: r.streakBonus, label: "Bonus de racha" });
    return r;
  },

  saveLessonCard(lessonId: string, card: number) {
    const next = saveLessonCard(state, lessonId, card);
    if (next !== state) commit(next);
  },

  completeLesson(lessonId: string) {
    const r = completeLessonRule(state, lessonId, unitsWithLessons());
    commit(r.state);
    if (r.xpGained) emit({ type: "xp", amount: r.xpGained, label: "Lección completada" });
    r.unitsCompleted.forEach((u) => emit({ type: "unit", unitId: u }));
    return r;
  },

  winChallenge() {
    commit(addXp({ ...state, challengesWon: state.challengesWon + 1 }, XP.challenge));
    emit({ type: "xp", amount: XP.challenge, label: "Desafío superado" });
  },

  saveExam(record: ExamRecord) {
    const xp = Math.round(record.score * 5);
    commit(addXp({ ...state, exams: [...state.exams, record] }, xp));
    if (xp) emit({ type: "xp", amount: xp, label: "Examen" });
  },

  claimMission(key: string, xp: number) {
    if (state.missions[key]) return;
    commit(addXp({ ...state, missions: { ...state.missions, [key]: dayKey() } }, xp));
    emit({ type: "xp", amount: xp, label: "Misión cumplida" });
  },

  unlockNode(nodeId: string) {
    if (state.unlocked.includes(nodeId)) return;
    commit({ ...state, unlocked: [...state.unlocked, nodeId] });
  },

  /** Logros que dependen de eventos (no de una condición sobre el estado). */
  grantAchievement(id: string) {
    if (state.achievements[id] || !ACHIEVEMENTS.some((a) => a.id === id)) return;
    commit({ ...state, achievements: { ...state.achievements, [id]: new Date().toISOString() } });
    emit({ type: "achievement", achievementId: id });
  },

  addStudyTime(seconds: number) {
    state = addTime(state, seconds);
    emitChange();
    scheduleSave();
  },

  updateSettings(patch: Partial<ProgressState["settings"]>) {
    commit({ ...state, settings: { ...state.settings, ...patch } });
  },

  replaceState(next: ProgressState) {
    commit(next);
  },

  async reset() {
    await repository.clear();
    state = initialState();
    emitChange();
  },
};

// ───────────────────────── Hooks ─────────────────────────

const serverState = initialState();

export function useProgress(): ProgressState {
  return useSyncExternalStore(store.subscribe, store.getState, () => serverState);
}

export function useHydrated(): boolean {
  return useSyncExternalStore(store.subscribe, store.isHydrated, () => false);
}
