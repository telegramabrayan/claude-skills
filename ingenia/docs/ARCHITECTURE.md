# Arquitectura

```
src/
├── engine/            Lógica pura, sin React (testeable, portable a un servidor)
│   ├── types.ts       Modelo de datos de todo el sistema
│   ├── math/          Parser/evaluador de expresiones, ecuaciones lineales, formato es-AR
│   ├── evaluation/    Corrección de respuestas y diagnóstico de errores (incluye paso a paso)
│   ├── code/          Intérprete de un subconjunto de Python con traza por pasos
│   ├── generators/    Generadores de ejercicios con semilla (variantes infinitas)
│   └── progress/      Estado del estudiante y reglas: XP, niveles, racha, dominio,
│                      dificultad adaptativa, repetición espaciada
├── content/           DATOS: currículo, temas, lecciones, fórmulas, glosario,
│                      diagnóstico, mapa, logros, misiones
├── lib/               Une contenido + motor: store, persistencia, ruta, recomendaciones,
│                      búsqueda, profesor
├── components/        UI reutilizable (ejercicios, lecciones, widgets, laboratorio, layout)
└── app/               Páginas (Next.js App Router)
```

Dependencias en una sola dirección: `app → components → lib → content → engine`.
`engine` no importa nada de las otras capas.

## Decisiones

- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4.
  Sin otras dependencias de runtime. Vitest solo para desarrollo.
- **Matemática sin KaTeX:** el contenido usa un mini-markup (`$…$`, `^`, `_`) que
  se renderiza con tipografía matemática del sistema. Permite que cada símbolo sea
  tocable (diccionario en contexto) y evita ~300 KB. Si más adelante hacen falta
  fracciones apiladas o matrices, se puede sumar KaTeX solo en `MathSegment`.
- **Gráficos sin librería:** `Plot` es SVG propio (muestreo, cortes en
  discontinuidades, grilla con pasos "lindos"). Alcanza para funciones, cinemática y
  estadísticas.
- **Todas las páginas son estáticas** (se prerenderizan en el build). El estado vive en
  el cliente.

## Estado y persistencia

- `ProgressState` (`engine/progress/state.ts`) es un único objeto serializable.
- `lib/store.ts`: store externo leído con `useSyncExternalStore`. Las acciones llaman
  a funciones puras del motor, otorgan logros, emiten eventos de UI (XP, logros,
  nivel) y guardan al final de la tarea actual (y en `pagehide`).
- `lib/storage.ts`: interfaz `ProgressRepository`. Hoy `LocalStorageRepository`;
  para PostgreSQL/Supabase implementar la misma interfaz sobre `db/schema.sql`.
- Respaldo/restauración en JSON desde Configuración.

## Evaluación y errores

1. `evaluateAnswer` despacha por tipo de ejercicio.
2. Primero se buscan **errores frecuentes** declarados por el ejercicio; después,
   diagnósticos genéricos (signo cambiado, factor 3,6 en unidades, potencias de 10…).
3. **Paso a paso** (`evaluation/steps.ts`): cada paso debe ser una ecuación con la
   misma solución que la original. El primer paso que cambia la solución es el error;
   se compara contra hipótesis (transponer sin cambiar signo, multiplicar en vez de
   dividir, dividir al revés…) para explicar exactamente qué pasó. Los pasos
   siguientes que son coherentes con el error se marcan como "arrastre".
4. Cada intento guarda su `errorType`; `recurringErrors` detecta tipos repetidos y
   `ERROR_REMEDIATION` los mapea a un tema de refuerzo.

## Aprendizaje adaptativo

- **Dominio** por tema: media móvil; un acierto sin ayuda en dificultad alta empuja
  hacia 1, con pistas empuja menos, viendo la solución casi nada. Dominado ≥ 85 %.
- **Dificultad** 1..6 por tema: 3 aciertos limpios seguidos suben; 2 errores
  seguidos bajan (nunca queda atrapado).
- **Repetición espaciada** (Leitner): intervalos 1, 2, 4, 8, 16, 32 días.
- **Diagnóstico**: 3 ítems por habilidad con dificultad creciente; si falla, no ve
  los más difíciles. Arma la ruta salteando lo dominado (≥ 80 %) y desbloquea.
- **Entrenamiento diario**: 2 repasos + 1 lección + 5 ejercicios de temas flojos +
  1 desafío.

## Profesor

`TutorPanel` explica con los guiones curados de cada lección (normal, más fácil,
"como si tuviera 12 años", ejemplo, gráfico) y comparte pistas/solución con el
ejercicio. `lib/tutor.ts` define `TutorProvider`: hoy responde buscando en el
contenido; se puede enchufar un proveedor conversacional implementando `ask`.
