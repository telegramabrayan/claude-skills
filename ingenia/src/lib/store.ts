"use client";
/**
 * Store global del progreso (sin dependencias): un objeto fuera de React con
 * subscribe/getState, leído con useSyncExternalStore. Las acciones son
 * funciones puras del motor; acá solo se orquestan, se persisten y se emiten
 * eventos para la UI (XP ganada, logros, subida de nivel).
 */
import { useSyncExternalStore } from "react";
import type { CareerGoal, Difficulty, SkillId } from "@/engine/types";
import { initialState, newTopicState, type ExamRecord, type LaterItem, type ProgressState, type SavedItem, type StudyPlan } from "@/engine/progress/state";
import { addGears, addStudyTime as addTime, addXp, completeLesson as completeLessonRule, levelInfo, recordAttempt as recordAttemptRule, saveLessonCard, winBoss as winBossRule, XP, type AttemptInput } from "@/engine/progress/rules";
import { addDays, dayKey } from "@/engine/progress/dates";
import { SHOP } from "@/content/shop";
import { play, setSoundEnabled } from "./sound";
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
  if (unlocked.length) play("achievement");
  if (after > before) {
    emit({ type: "level", level: after });
    play("levelup");
  }
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
    setSoundEnabled(state.settings.sound);
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

  completeLesson(lessonId: string, accuracy = 1) {
    const r = completeLessonRule(state, lessonId, unitsWithLessons(), { accuracy });
    commit(r.state);
    play(r.unitsCompleted.length ? "unlock" : "complete");
    r.unitsCompleted.forEach((u) => emit({ type: "unit", unitId: u }));
    return r;
  },

  winChallenge() {
    commit(addGears(addXp({ ...state, challengesWon: state.challengesWon + 1 }, XP.challenge), 30));
    emit({ type: "xp", amount: XP.challenge, label: "Desafío superado" });
    play("unlock");
  },

  winBoss(unitId: string) {
    const r = winBossRule(state, unitId);
    commit(r.state);
    emit({ type: "xp", amount: r.xpGained, label: "Desafío final" });
    play("achievement");
    return r;
  },

  saveExam(record: ExamRecord) {
    const xp = Math.round(record.score * XP.examPerPoint);
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

  buy(itemId: string): string | null {
    const item = SHOP.find((i) => i.id === itemId);
    if (!item) return "Ese artículo no existe.";
    if (item.kind === "freeze" && state.streakFreezes >= 2) return "Ya tenés el máximo de 2 protectores.";
    if (item.kind !== "freeze" && state.owned.includes(item.id)) return null;
    if (state.gears < item.price) return `Te faltan ${item.price - state.gears} engranajes.`;
    commit({
      ...state,
      gears: state.gears - item.price,
      streakFreezes: item.kind === "freeze" ? state.streakFreezes + 1 : state.streakFreezes,
      owned: item.kind === "freeze" ? state.owned : [...state.owned, item.id],
    });
    play("unlock");
    return null;
  },

  toggleSaved(item: Omit<SavedItem, "at">) {
    const exists = state.saved.some((x) => x.kind === item.kind && x.id === item.id);
    commit({ ...state, saved: exists ? state.saved.filter((x) => !(x.kind === item.kind && x.id === item.id)) : [...state.saved, { ...item, at: new Date().toISOString() }] });
  },

  saveNote(key: string, text: string) {
    const notes = { ...state.notes };
    if (text.trim()) notes[key] = { text, updatedAt: new Date().toISOString() };
    else delete notes[key];
    commit({ ...state, notes });
  },

  toggleLater(item: Omit<LaterItem, "at">) {
    const exists = state.later.some((x) => x.id === item.id);
    commit({ ...state, later: exists ? state.later.filter((x) => x.id !== item.id) : [...state.later, { ...item, at: new Date().toISOString() }].slice(-100) });
  },

  /** Tarjeta de memoria: Leitner con intervalos 1, 3, 7, 14, 30 días. */
  reviewCard(cardId: string, knew: boolean) {
    const ladder = [1, 3, 7, 14, 30];
    const prev = state.cards[cardId] ?? { box: 0, due: dayKey() };
    const box = knew ? Math.min(ladder.length - 1, prev.box + 1) : 0;
    commit({ ...state, cards: { ...state.cards, [cardId]: { box, due: addDays(dayKey(), knew ? ladder[box] : 0) } } });
  },

  setPlan(plan: StudyPlan | null) {
    commit({ ...state, plan });
  },

  addStudyTime(seconds: number) {
    state = addTime(state, seconds);
    emitChange();
    scheduleSave();
  },

  updateSettings(patch: Partial<ProgressState["settings"]>) {
    if (patch.sound !== undefined) setSoundEnabled(patch.sound);
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
