# Auditoría · 2026-10-05

Auditoría previa a la versión 2 (pedido "Duolingo para Ingeniería"). Se hizo antes de
tocar código, para conservar lo que funciona y completar lo que falta.

## 1. Estado del proyecto

### Lo que existe y funciona (se conserva)
| Área | Estado | Notas |
|---|---|---|
| Motor matemático (parser, equivalencias, ecuaciones lineales) | ✅ | 12 tests. Acepta coma decimal, multiplicación implícita, fracciones |
| Corrector paso a paso | ✅ | Marca el paso exacto del error y la hipótesis (signo, despeje…) |
| Intérprete Python con traza | ✅ | Usado en lecciones, ejercicios y laboratorio |
| 33 generadores de ejercicios | ✅ | Probados en 240 variantes cada uno |
| Progreso: dominio, dificultad adaptativa, repetición espaciada | ✅ | Funciones puras con tests |
| Diagnóstico por habilidad + ruta | ✅ | |
| Mapa por unidades, lecciones, práctica, repaso, exámenes, laboratorio, estadísticas, errores, logros, misiones, diccionario, fórmulas, buscador | ✅ | |
| Persistencia local + respaldo copiar/pegar | ✅ | |
| Versión de un solo archivo publicada en claude.ai | ✅ | |

### Lo que falta o está flojo (se trabaja en v2)
| Punto del pedido | Antes | Acción |
|---|---|---|
| 2 · Camino tipo app (nodos = lecciones) | El mapa mostraba unidades, no lecciones | Nueva página **Camino**: un nodo por lección, jefe final por unidad, "Explorar libremente" |
| 4 · Inicio | Correcto pero plano | Rediseño con objetivo de hoy, tarjetas de materia, entrenamiento por duración |
| 5 · Retroceder al prerrequisito | No existía | Detección por tipo de error + cadena de prerrequisitos, repaso de 5 min y vuelta al ejercicio |
| 6 · Guía propio | No existía | "Nodo", un pequeño robot hexagonal con mensajes cortos |
| 7-10 · XP, niveles, racha, moneda | XP sin títulos, sin moneda, racha sin calendario | Valores pedidos, títulos de nivel, **engranajes**, calendario de racha sin castigo |
| 13-14 · Sonido y animaciones | Mínimas | Sonidos sintetizados (sin archivos) con ON/OFF, celebraciones discretas |
| 19 · Formatos de ejercicio | 5 tipos | + ordenar pasos, relacionar, elegir gráfico, encontrar el error, verdadero/falso |
| 34-35 · "No entiendo" y otras explicaciones | Solo dentro del profesor | Botón visible en cada explicación |
| 39 · Desafío final por unidad | No existía | 10 ejercicios mezclados, sin pistas, 3 vidas, +150 XP |
| 40 · Parcial 1°/2°/final, con/sin tiempo | Simulacro único | Selector de instancia y modo |
| 42 · Entrenamiento 5/10/15/30 min | Solo plan diario | Sesiones por duración |
| 43 · Calendario de estudio | No existía | Objetivo diario, materia prioritaria, fecha de parcial → plan día por día |
| 31 · Flashcards | No existía | Mazos de símbolos, fórmulas y unidades con repetición espaciada |
| 56 · Heatmap | No existía | Mes / 3 meses / año |
| 58-60 · Guardados, notas, repasar después | No existía | Implementado |
| 54 · Progreso en todos los niveles | Parcial | Lección, unidad, materia, CBC, carrera |
| 75 · Fin de lección con precisión y tiempo | Solo XP | Precisión, tiempo, "lección perfecta" |
| 65 · KaTeX | Mini-markup propio | Se mantiene (ver decisión en ARCHITECTURE.md): permite que cada símbolo sea tocable. Se agrega fracción apilada |

## 2. Auditoría de materias

**Limitación:** los sitios oficiales (`*.uba.ar`) siguen inaccesibles desde el entorno de
construcción (verificado de nuevo el 2026-10-05). Las estructuras siguientes se tomaron de
resultados de búsqueda que citan programas oficiales o campus de cátedra. Por eso
ninguna materia queda como `verified`: el estado más alto es `partial`, y cada unidad cuyo
orden o alcance no se pudo confirmar lleva `needsVerification: true`.

Estados: `draft` (estructura sin contenido) · `partial` (contenido en parte) ·
`verified` (contrastado con programa oficial) · `complete` (verificado y con todo el
contenido).

| Materia | Unidades encontradas (fuente secundaria) | Antes en la plataforma | Faltante principal | Estado |
|---|---|---|---|---|
| Preparación (propia) | — | 5 niveles, 21 lecciones | factorización, cuadrática, geometría, trigonometría, notación, límites intuitivos | partial |
| Análisis Matemático A (66) | 11 prácticas: funciones, reales, sucesiones, límites y continuidad, derivadas, TVM y L'Hôpital, estudio de funciones y optimización, Taylor, integrales, área y ED, series | 1 unidad con lecciones | límites, derivadas, resto | partial |
| Álgebra A (62) | conjuntos; números complejos y polinomios; vectores, rectas y planos (producto mixto, proyección, distancias); matrices y sistemas (Gauss-Jordan, rango, Rouché-Frobenius); determinantes; transformaciones lineales; cónicas | vectores y producto escalar | casi todo | partial |
| Física (03) | magnitudes y vectores; estática (momento, cuerpos extensos, equilibrio); cinemática 1D; cinemática 2D (circular, relativo); dinámica; oscilaciones; trabajo y energía; hidrostática | magnitudes, vectores, cinemática 1D | estática, 2D, dinámica, oscilaciones, energía, hidrostática (solo laboratorio) | partial |
| Pensamiento Computacional (90) | 1 algoritmia y programación; 2 tipos de datos, expresiones y funciones; estructuras de control; 4 estructuras de datos (listas, tuplas, diccionarios, cadenas); 5 entrada/salida; 6 bibliotecas (NumPy, Pandas, Matplotlib); lenguaje Python | algoritmos, condicionales, bucles | tipos y funciones, estructuras de datos, E/S, bibliotecas | partial |
| IPC (40) | U1 historia de la ciencia; U2 consideraciones sobre el lenguaje; objetivos: tipos de conocimiento, argumentos e inferencias, tipos de enunciados | sin unidades | todo | draft |
| ICSE (24) | contenidos mínimos en tres ejes: sociedad; el Estado; Estado y desarrollo socioeconómico | sin unidades | todo | draft |

Fuentes consultadas (secundarias): resultados de búsqueda sobre programas de
cátedra (Escayola, Álgebra A), campus virtual CBC (Física, IPC 1º C 2026), programa
analítico ICSE (FFyB-UBA), programa UBA XXI de Pensamiento Computacional y
`pensamientocomputacional.dev.ar`. Ver `ACADEMIC_SOURCES.md`.

## 3. Prioridades aplicadas en esta versión

1. Experiencia: camino, lecciones cortas, celebraciones, guía, prerrequisitos, nuevos ejercicios.
2. Contenido nuevo donde el camino tenía huecos: factorización (prerrequisito de límites), cuadrática,
   Pitágoras, trigonometría, límites intuitivos y derivadas (pendiente → regla de la potencia).
3. Estructura de materias actualizada con las unidades encontradas, marcadas para verificar.
