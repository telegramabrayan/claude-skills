# Ingenia · tu camino a Ingeniería

Plataforma web educativa, interactiva y gamificada para llegar **desde el secundario
hasta las materias de Ingeniería** (Industrial e Informática), tomando como
referencia el CBC y la Facultad de Ingeniería de la UBA.

Pensada para alguien que terminó la secundaria hace tiempo: no asume que recordás
nada. Cada concepto sigue el ciclo
**explicación → ejemplo → interacción → ejercicio → corrección → refuerzo → progreso**.

## Cómo correrla

```bash
cd ingenia
npm install
npm run dev        # http://localhost:3000
npm test           # 54 tests: motor, generadores, integridad del contenido, progreso
npm run build      # build de producción (todas las rutas son estáticas)
```

Requiere Node 20+. El progreso se guarda en el navegador (con respaldo JSON desde
Configuración).

## Novedades de la v3 (profesor particular + material de la cátedra)

- **Contenido a partir del material del estudiante** (carpeta «Material de estudio» de Drive, analizada y
  organizada en la **Biblioteca**): claves de Análisis Matemático A (cátedra Cabana), Física (cátedra Torti),
  Pensamiento Computacional (cátedra Camejo) e IPC (UBA XXI, programa oficial 2026). Los exámenes no se copian:
  se usaron para saber qué y cómo se evalúa, y los generadores producen ejercicios propios del mismo estilo.
  Simulacros con la distribución de temas y puntajes de cada cátedra.
- **110 lecciones, 175 generadores, 111 temas**: Preparación 25, Álgebra A 21, Análisis A 23, Física 23,
  Pensamiento Computacional 15, IPC 18. ICSE sigue sin contenido (no hay material).
- **"No entendí" que cambia de estrategia** (6 formas: normal → más simple → situación cotidiana → ejemplo
  numérico → visual/pizarra → detectar qué base falta) + desde cero, paso a paso, ¿por qué?, ¿de dónde sale?,
  ¿qué necesito antes? y practiquemos juntos.
- **Pizarra animada** que escribe procedimientos renglón por renglón y resalta lo que cambió.
- **Corrección que enseña**: "Lo que hiciste / Problema / Correcto" desde el último paso bien hecho, y ayuda
  escalonada (pista → pista más clara → concepto → solución).
- **Profesor con IA** (dentro de claude.ai, capacidad `sample` del artifact): conoce la lección, el ejercicio,
  la respuesta y el historial; fuera de claude.ai responde con el contenido curado.
- **Comprobación de bases** antes de cada lección, modo **Enseñame desde cero**, mensajes de dificultad
  adaptativa y estilos de práctica (ejemplo resuelto, guiado, independiente, desafío, repaso).
- **Animaciones**: movimiento, fuerzas, tiro oblicuo, flotación, componentes, tangente, Riemann, familias de
  funciones, matrices; intérprete de Python ampliado (strings, listas, tuplas, dicts) verificado contra CPython.

## Novedades de la v2 (experiencia tipo app)

- **Camino**: un nodo por lección y un **desafío final** por unidad (10 ejercicios
  mezclados, sin ayudas, 3 vidas, +150 XP). Siempre hay un único "siguiente paso";
  nada queda cerrado del todo ("Entrar igual"). "Explorar libremente" sigue disponible.
- **Inicio rediseñado** con **Nodo**, el guía propio: continuar, objetivo de hoy,
  racha semanal sin ansiedad (protectores de racha), reforzar, entrenamiento rápido
  de 5/10/15/30 min, desafíos disponibles, tarjetas visuales por materia y progreso.
- **Lecciones v2**: fila "😵 No entiendo / Más fácil / Otro ejemplo / Ver dibujo /
  ¿Para qué sirve?", ⭐ guardar, 📝 notas, pantalla final con XP, precisión y
  tiempo, lección perfecta (+30 XP) y celebración de fin de unidad.
- **Ejercicios v2**: ordenar pasos, relacionar, elegir el gráfico, encontrar el
  error, verdadero/falso; 🔖 "Repasar después"; **remediación automática por
  prerrequisito** ("El problema parece estar en factorización, no en límites" →
  repaso de 5 min → vuelta al ejercicio).
- **Herramientas**: Tarjetas con repetición espaciada (fórmulas, símbolos, ideas
  clave), Guardados (favoritos, notas, ejercicios para repasar), Plan de estudio
  con fecha de examen, simulador de 1.er/2.º parcial y final con o sin tiempo,
  mapa de calor de constancia, Taller de cosméticos con engranajes (nunca bloquea
  contenido), sonidos discretos con ON/OFF.

## Qué incluía la primera versión

- **Primer ingreso** con elección de carrera y **diagnóstico** por habilidad
  ("Tu punto de partida") que arma una **ruta personalizada**.
- **Preparación para Ingeniería** (5 niveles) y unidades del CBC con
  **21 lecciones completas**: signos, jerarquía, fracciones, porcentajes, potencias,
  expresiones, ecuaciones, despeje, funciones, función lineal, dominio, unidades,
  vectores, producto escalar, MRU, MRUV, caída libre, algoritmos, condicionales,
  bucles y cómo estudiar.
- **33 generadores** de ejercicios con variantes infinitas, 6 niveles de dificultad,
  3 pistas, solución paso a paso y errores frecuentes anticipados.
- **Corrección inteligente**: en ecuaciones podés escribir tu procedimiento y el
  sistema marca **el paso exacto** donde está el error y por qué.
- **Clasificación de errores** (signos, despeje, unidades, velocidad vs.
  aceleración, off-by-one…) con dashboard "Mis errores", tendencia y refuerzo.
- **Profesor** con explicaciones en varios registros (normal, más fácil, como si
  tuviera 12 años, ejemplo, gráfico, pista, paso a paso).
- **Laboratorio**: cinemática, vectores, Newton, energía, hidrostática; funciones,
  límites, derivadas, integrales, sistemas 2×2; editor de código con ejecución
  paso a paso.
- **Mapa** tipo videojuego, XP, niveles, rachas, logros, misiones diarias/semanales,
  corazones en desafíos, repetición espaciada, entrenamiento diario, exámenes
  cronometrados con nota y plan, estadísticas, formulario, diccionario, buscador.
- Modo claro/oscuro, diseño mobile-first, navegación por teclado.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Cómo agregar contenido](docs/CONTENT_GUIDE.md) (lecciones, ejercicios, materias, carreras)
- [Fuentes académicas y estado de verificación](docs/ACADEMIC_SOURCES.md)
- [Esquema PostgreSQL/Supabase](db/schema.sql)

## Honestidad académica

Los datos oficiales (materias, unidades, correlatividades) llevan su **estado de
verificación** y sus fuentes, visibles en la app. Lo no confirmado está marcado
como tal; no se inventaron programas ni correlatividades. Ver
[ACADEMIC_SOURCES.md](docs/ACADEMIC_SOURCES.md).

## Versión de un solo archivo

```bash
npm run build:standalone   # genera dist-standalone/ingenia.html
```

Empaqueta toda la app (mismas páginas, navegación por `#/ruta`) en un único HTML que
se puede abrir directamente en el navegador o publicar como página. Está en
`standalone/`: un router por hash reemplaza a `next/link` y `next/navigation`.
