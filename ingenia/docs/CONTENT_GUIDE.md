# Guía para agregar contenido

Todo el contenido vive en `src/content/` como datos tipados (`src/engine/types.ts`),
separado de la interfaz. Para agregar contenido **no hace falta tocar componentes**.
Después de cada cambio corré `npm test`: el test de integridad
(`src/content/content.test.ts`) verifica que toda referencia exista y que cada
ejercicio reconozca su propia respuesta.

## Nueva lección

1. Elegí el archivo por área en `src/content/lessons/` (o creá uno nuevo y sumalo
   en `lessons/index.ts`).
2. Usá los helpers de `lessons/helpers.ts`. Estructura pedagógica obligatoria
   (el test la exige): empieza con `intro` y termina con `summary`, y tiene al
   menos un ejercicio.

```ts
export const miLeccion: Lesson = {
  id: "l-mi-tema",
  title: "Título corto",
  subtitle: "Una línea",
  subjectId: "fisica",
  topicIds: ["t-mi-tema"],
  estimatedMinutes: 10,
  prerequisites: ["t-mru"],
  cards: [
    intro("Título", "¿Qué vamos a aprender?", "¿Para qué sirve?"),
    explain("Idea intuitiva", "Texto con $matemática$ y **negrita**.", { tag: "intuitivo" }),
    explain("En la vida real", "…", { tag: "cotidiano" }),
    explain("La fórmula", "…", { tag: "matematico", widget: { type: "plot", mode: "free", initial: "x^2" } }),
    example("Ejemplo resuelto", "Enunciado", ["Paso 1", "Paso 2"], "Resultado"),
    practice("Ejercicio guiado", "mi-generador", 2, 7, true), // generador, dificultad, semilla, guiado
    practice("Tu turno", "mi-generador", 3, 11),
    practice("Mini desafío", "mi-generador", 5, 13),
    summary(["Punto 1", "Punto 2"]),
  ],
  tutor: { normal: "…", simple: "…", nino: "…", ejemplo: "…", visual: { type: "plot", mode: "linear" } },
};
```

3. Referenciala desde una unidad (`lessonIds`) en `curriculum.ts`.

**Mini-markup de textos:** `$…$` matemática (`x^2`, `x^{n+1}`, `v_0`, `sqrt(x)`),
`**negrita**`, `` `código` ``, `\$` para un signo pesos literal, línea en blanco =
párrafo nuevo. Los símbolos del diccionario (Δ, Σ, ∫, ∈, ℝ, lim…) se vuelven
tocables automáticamente.

**Widgets disponibles** (`type`): `numberline`, `fraction-bars`, `balance`, `plot`
(`free`/`linear`), `vector`, `kinematics`, `code`, `percent`, `power`, `units`.

## Nuevo tema y generador de ejercicios

Un **tema** (`topics.ts`) es la unidad que se mide (dominio, dificultad adaptativa,
repaso espaciado). Cada tema tiene uno o más **generadores**.

Un generador (`src/engine/generators/*.ts`) recibe `(semilla, dificultad 1..6)` y
devuelve un `Exercise` completo: enunciado, respuesta exacta, 3 pistas, solución
paso a paso, explicación y errores frecuentes. Reglas:

- Construí los datos **desde la respuesta** (elegí x y calculá el resto) para que
  la solución sea exacta.
- Usá `rng(seed)` para que la misma semilla dé el mismo ejercicio (necesario para
  "rehacer" desde *Mis errores*).
- Anticipá errores típicos en `frequentErrors` (`match` = respuesta equivocada que
  delata el error, `type` = `ErrorType`, `message` = explicación específica).
- Registralo en `generators/index.ts`. El test `generators.test.ts` lo prueba
  automáticamente en 240 variantes.

Tipos de ejercicio: `choice`, `numeric` (con `unit` y `tolerance`), `expression`
(equivalencia algebraica por muestreo), `steps` (ecuación lineal con corrección paso a
paso) y `trace` (seguimiento de código; la respuesta se calcula ejecutando el programa).

## Nueva materia, unidad o carrera

- **Materia/unidad:** `curriculum.ts`. Una unidad sin lecciones queda como
  `contentStatus: "estructura"` (se muestra como temario, no como contenido).
- **Carrera:** agregar en `CAREERS`, sus materias en `SUBJECTS` y una sección en
  `src/content/map.ts` con `career`. `CareerId` está en `src/engine/types.ts`.
- **Datos oficiales:** siempre con `official` (estado + fuentes). Ver
  `ACADEMIC_SOURCES.md`.

## Fórmulas, diccionario, logros, misiones

`formulas.ts`, `glossary.ts`, `achievements.ts` (con `check(state)` o por evento),
`missions.ts` (plantillas diarias/semanales con su medición).
