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

## Novedades de la v4 (rediseño completo de la experiencia)

Auditoría, referencias y sistema visual en [`docs/REDISENO.md`](docs/REDISENO.md).

- **Identidad propia:** tipografía Nunito, botones y fichas con relieve que se hunden al tocar, fondo de cuaderno con dibujos tenues (π, x², átomos, engranajes, código…) que cambia de color y de motivos según la materia, ilustraciones animadas por materia (`SubjectArt`).
- **Nodo, el guía, de cuerpo entero:** expresiones (piensa, festeja, se sorprende, explica con su pizarrita, da ánimo), parpadeo y saltos cortos. Acompaña el inicio, el camino, los ejercicios y los finales.
- **Inicio:** saludo según la hora, racha/nivel/XP, tarjeta grande «Continuar aprendiendo», materias como tarjetas ilustradas (carrusel en el celular), objetivo del día con anillo, minijuegos, desafíos, reforzar y misiones; lo secundario quedó plegado.
- **Camino:** cada nodo muestra su título, estrellas según la precisión (1–3), una línea que se pinta al avanzar y Nodo junto a la lección actual.
- **Ejercicios:** tarjeta de pregunta grande, opciones como fichas, escenas que reaccionan al acertar (puerta, cohete, fábrica, laboratorio, puente), botón **COMPROBAR** fijo abajo, barra de progreso gruesa con vidas, festejo corto con +XP, y al errar «**Casi. Revisemos este paso.**» con: 💡 pista · 📖 explicámelo · ▶ ver un ejemplo resuelto · 🧠 de otra manera · ✏️ intentar nuevamente.
- **Escalera de pistas:** Pista 1 (orientación) → Pista 2 (qué concepto usar) → Pista 3 (el primer paso) → ayuda completa en la pizarra. Si fallás de nuevo, la ayuda sube sola un escalón; nunca salta directo a la solución.
- **Nuevas mecánicas** (con dedo, mouse o teclado): arrastrar fichas a huecos (`fill`), construir la respuesta con bloques (`build`), ordenar arrastrando, unir con líneas, tocar o mover un punto sobre el gráfico (`graph`), encontrar el renglón equivocado (`find-error`).
- **Motor de actividades** (`src/engine/generators/activities.ts`): el mismo concepto en el formato que mejor lo muestra, sumado automáticamente a los temas para que la práctica alterne formatos. Incluye problemas con contexto de Ingeniería Industrial (costos de producción, inventario).
- **Minijuegos** (`/juegos`): Contrarreloj, Escalera, Encontrá el error, Memoria de conceptos, Verdadero o falso, y una galería para probar cada formato. Los aciertos cuentan para el dominio; los récords quedan en el navegador.
- **Finales:** medalla y «¡UNIDAD COMPLETADA!» al superar el desafío, estadísticas (aciertos, precisión, XP, tiempo).
- **Química:** animación de una reacción (2 H₂ + O₂ → 2 H₂O) con átomos que se separan y se reacomodan.
- **Modo interactivo / modo estudio** (Configuración): el progreso es el mismo; el modo estudio quita personaje, confeti y doodles. También: tamaño de texto (100/112/125 %) y «Reducir animaciones».

## Novedades de la v3.1

- **Pizarra con dibujos**: además de ecuaciones, cada renglón puede traer un dibujo que evoluciona paso a paso (gráficos de funciones, áreas entre curvas, recta tangente, vectores y componentes, matrices que se completan celda por celda, código con la línea en ejecución y sus variables, diagramas de cuerpo libre en el plano inclinado, triángulos). Lo nuevo de cada paso se dibuja animado y en color; lo anterior queda tenue. Ver `src/components/board/BoardFigure.tsx`.
- **ICSE** (16 lecciones, 31 generadores) y **Química** (11 unidades, 18 lecciones, 34 generadores) dejaron de estar vacías. Son contenido general escrito por Ingenia (no hubo material del estudiante para estas materias) y la app lo dice: en Química solo los títulos de las unidades 1–5 se cotejaron con el programa analítico; las unidades 6–11 están marcadas para verificar.
- Auditoría automática de secuencia: las 144 lecciones tienen intro → explicación → ejemplo/pizarra → visual → ejercicio guiado → ejercicios → resumen, y el guion completo del profesor (simple, analogía, desde cero, por qué, de dónde sale).
- Totales: 144 lecciones, 145 temas, 240 generadores de ejercicios.

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
