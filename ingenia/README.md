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

## Qué incluye esta primera versión

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
