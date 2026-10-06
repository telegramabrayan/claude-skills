import type { Difficulty, Exercise, Generator } from "../types";
import { arithmeticGenerators } from "./arithmetic";
import { algebraGenerators } from "./algebra";
import { functionGenerators } from "./functions";
import { physicsGenerators } from "./physics";
import { codeGenerators } from "./code";
import { precalcGenerators } from "./precalc";
import { formatGenerators } from "./formats";
import { FISICA_GENERATORS } from "./fisica";
import { PC_GENERATORS } from "./pc";
import { AM_GENERATORS } from "./am";
import { ALGEBRA_GENERATORS } from "./algebra-a";
import { IPC_GENERATORS } from "./ipc";
import { newSeed } from "./rng";

/**
 * Red de seguridad: descarta "errores frecuentes" que, para unos datos
 * concretos, coinciden con la respuesta correcta (p. ej. √4 = 4/2).
 */
function sanitize(ex: Exercise): Exercise {
  if (ex.kind !== "numeric" && ex.kind !== "steps") return ex;
  const tol = ex.kind === "numeric" && ex.tolerance !== undefined ? ex.tolerance : 1e-9;
  const frequentErrors = ex.frequentErrors.filter(
    (fe) => typeof fe.match !== "number" || (Number.isFinite(fe.match) && Math.abs(fe.match - ex.answer) > tol),
  );
  return { ...ex, frequentErrors };
}

function safe(g: Generator): Generator {
  return { ...g, generate: (seed, d) => sanitize(g.generate.call(g, seed, d)) };
}

export const GENERATORS: Generator[] = [
  ...arithmeticGenerators,
  ...algebraGenerators,
  ...functionGenerators,
  ...physicsGenerators,
  ...codeGenerators,
  ...precalcGenerators,
  ...formatGenerators,
  ...FISICA_GENERATORS,
  ...PC_GENERATORS,
  ...AM_GENERATORS,
  ...ALGEBRA_GENERATORS,
  ...IPC_GENERATORS,
].map(safe);

const BY_ID = new Map(GENERATORS.map((g) => [g.id, g]));

export function getGenerator(id: string): Generator {
  const g = BY_ID.get(id);
  if (!g) throw new Error(`Generador desconocido: ${id}`);
  return g;
}

export function generate(id: string, difficulty: Difficulty, seed = newSeed()): Exercise {
  return getGenerator(id).generate(seed, difficulty);
}

/** Recrea un ejercicio a partir de su id ("generador:semilla:dificultad"). */
export function fromId(exerciseId: string): Exercise | null {
  const [gen, seed, diff] = exerciseId.split(":");
  const g = BY_ID.get(gen);
  if (!g || !seed) return null;
  return g.generate(Number(seed), Math.min(6, Math.max(1, Number(diff) || 1)) as Difficulty);
}

export { newSeed };
