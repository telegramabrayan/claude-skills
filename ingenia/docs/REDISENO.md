# Rediseño v4 — auditoría y sistema visual

## 1. Auditoría de la interfaz actual (antes del rediseño)

Capturas en celular (390 px) de inicio, camino, materias, práctica, lección, desafío y logros.

| Pantalla | Problema | Evidencia |
|---|---|---|
| Inicio | Demasiado largo (≈4700 px en celular) y plano: 12 bloques apilados con el mismo peso visual (tarjeta "desde cero", continuar, objetivo, racha, reforzar, entrenamiento, desafíos, misiones, materias, progreso, modos). "Continuar" no domina. | Todo es una tarjeta blanca con borde gris. |
| Inicio | Las materias son franjas de color con texto; no se reconocen por su dibujo. | Sólo un emoji pequeño. |
| Camino | Los nodos no dicen qué lección son; las secciones son iguales entre materias. | Círculos con estrella/candado sin título. |
| Ejercicio | Formulario: enunciado + casilleros + "Comprobar". Sin personaje, sin escena, sin barra de acción fija. | Ecuación por pasos = dos inputs vacíos. |
| Ejercicio | Ordenar y relacionar se resuelven tocando listas, sin arrastrar ni líneas. | `OrderInput`, `MatchInput`. |
| Feedback | Correcto/incorrecto se muestran como texto en la tarjeta; el error no ofrece un menú claro de ayudas. | — |
| Fondo | Plano (#f4f6fb), vacío. | — |
| Tipografía | Sistema; títulos sin personalidad. | — |
| Modos | No existe modo estudio/juego, ni tamaño de texto, ni control de animaciones propio. | Configuración. |

**Se conserva (funciona bien):** motor de ejercicios y evaluación, escalera de ayudas, pizarra con dibujos, widgets animados, tutor IA, camino zigzag, XP/niveles/racha/engranajes/logros, desafío final por unidad, sonidos, tema claro/oscuro, acentos.

## 2. Lectura de las referencias

1. **Trivia** — tarjeta de pregunta enorme y blanca, respuestas como botones gruesos con "relieve" (borde inferior), tipografía redonda y pesada, un personaje con expresión en la escena.
2. **App de idiomas** — barra de progreso gruesa + vidas arriba, personaje con globo de diálogo, banco de fichas que se colocan sobre renglones, un único botón ancho "Comprobar" fijo abajo.

Lo que las hace atractivas: **una sola acción clara por pantalla, objetos táctiles grandes con profundidad, un personaje que reacciona, progreso siempre visible.** No se copia ningún personaje, ilustración ni layout literal.

## 3. Identidad propia

- **Personaje: Nodo** (ya existía como ícono). Ahora es un robot-hexágono de cuerpo entero con antena-lamparita, brazos, y una mini pizarra. Expresiones: `neutral`, `happy`, `celebrate`, `thinking`, `surprised`, `explain`, `encourage`, `sleepy`. Animaciones cortas (salto, parpadeo, saludo).
- **Tipografía:** Nunito (títulos 800–900, cuerpo 600) — redonda pero legible para adultos; fórmulas siguen en tipografía matemática.
- **Profundidad "táctil":** botones y fichas con borde inferior de 4 px que se hunden al tocar (`.btn-3d`, `.tile`).
- **Fondo de "cuaderno":** doodles SVG de baja opacidad (libro, lápiz, regla, π, x², átomo, engranaje, `</>`, gráfico) — cada materia cambia el set.
- **Colores por materia** (variables `--subj`, `--subj-soft`, `--subj-deep`) con escena ilustrada en tarjetas y encabezados:
  Preparación (turquesa, cuaderno), Análisis (azul, curva y π), Álgebra (violeta, matriz), Física (naranja, planeta y cohete), Programación (cian, terminal), IPC (magenta, lupa), ICSE (rosado, columnas y línea de tiempo), Química (verde, matraz y molécula).

## 4. Componentes del sistema

`Mascot`, `SubjectArt`, `Doodles`, `.btn-3d` (primary/secondary/success), `.tile`, `.card-hero`, `ProgressBar` gruesa, `StatChip`, `Ring` (objetivo diario), `FeedbackSheet` (correcto/casi), `ActionBar` fija inferior, `HintLadder`.

## 5. Mecánicas de ejercicio (motor de actividades)

| Concepto | Formato | Tipo |
|---|---|---|
| Procedimiento | ordenar pasos arrastrando | `order` (arrastre táctil) |
| Operación faltante | arrastrar el operador al hueco | `fill` (nuevo) |
| Fórmula | construir con bloques | `build` (nuevo) |
| Definiciones / unidades | unir con líneas | `match` (líneas SVG) |
| Gráfica | tocar el punto / mover el punto | `graph` (nuevo) |
| Revisión | encontrar el paso equivocado | `find-error` (nuevo) |
| Cálculo | pizarra + respuesta | existentes |
| Aplicación | problema contextual (incl. Ing. Industrial) | generadores con contexto |

`src/engine/activities.ts` deriva variantes (ordenar, hueco, error) de un mismo procedimiento para que la práctica alterne formatos.

## 6. Gamificación y modos

- **Modo juego** (por defecto): personaje, celebraciones cortas (<1 s), +XP flotante, minijuegos.
- **Modo estudio:** misma progresión, sin personaje ni confeti, fondo sin doodles, tarjetas más sobrias.
- Corazones: sólo en desafíos; la práctica siempre es ilimitada.
- Minijuegos: Contrarreloj, Escalera, Encontrá el error, Memoria de conceptos, Verdadero o falso.

## 7. Accesibilidad y rendimiento

Tamaño de texto (100/112/125 %), "Reducir animaciones" propio además de `prefers-reduced-motion`, contraste AA en ambos temas, todo operable con teclado (arrastre con alternativa de tocar/Enter), `aria-label` en dibujos. Ilustraciones en SVG inline (sin imágenes pesadas).
