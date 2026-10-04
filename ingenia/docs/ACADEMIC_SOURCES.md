# Fuentes académicas y estado de verificación

**Regla del proyecto:** no se inventan programas, unidades ni correlatividades. Cada
materia y carrera en `src/content/curriculum.ts` lleva un campo `official` con
`status` (`verificado` / `parcial` / `pendiente`), sus fuentes y la fecha de revisión.
La interfaz muestra ese estado al estudiante (componente `OfficialBox`).

## Cómo se hizo la investigación (2026-10-04)

Los sitios oficiales (`fi.uba.ar`, `cms.fi.uba.ar`, `cbc.uba.ar`, `mate.cbc.uba.ar`,
`fisica.cbc.uba.ar`, `ubaxxi.uba.ar`) **no eran accesibles** desde el entorno donde se
construyó esta versión (bloqueo de red). Por eso los datos se confirmaron con
resultados de búsqueda que citan esos documentos, y todo lo que no se pudo confirmar
quedó marcado como `parcial` o `pendiente`. **Antes de confiar en un dato para tu
cursada, verificalo en el enlace oficial.**

## Lo que se pudo confirmar

| Dato | Estado | Fuente |
|---|---|---|
| Pensamiento Computacional es materia del CBC, obligatoria para ingresantes a FIUBA desde 2023 | parcial | [Res. CS UBA 2022 — creación de la asignatura](https://cms.fi.uba.ar/uploads/RESCS_2022_9_E_UBA_REC_Creacion_de_asignatura_Pensamiento_computacional_017078f40f.pdf) |
| CBC de Ingeniería: AM A, Álgebra A, IPC, ICSE + 2 materias de {Física, Química, Pensamiento Computacional} | parcial | [FIUBA — «El CBC de Ingeniería con una nueva asignatura»](https://www.fi.uba.ar/noticias/el-cbc-de-ingenieria-con-una-nueva-asignatura) |
| Física (03): guías de Magnitudes y vectores, Cinemática, Dinámica, Trabajo y energía, Hidrostática | parcial | [Cátedra de Física CBC](https://fisica.cbc.uba.ar/materias/) |
| Análisis Matemático A (66): 11 prácticas (Funciones … Series) | parcial | [Área de Matemática CBC](https://mate.cbc.uba.ar/66.html) (vía fuentes secundarias) |
| Álgebra A (62): Unidad 1 (conjuntos, ℝⁿ, vectores, producto escalar, norma, ángulo, ortogonalidad); transformaciones lineales; determinantes; cónicas | parcial | fuentes secundarias del programa |
| Ing. en Informática: plan 2023 aprobado (10 cuatrimestres, 3616 h); incluye Análisis Matemático II, Fundamentos de Programación, Algoritmos y Estructuras de Datos (correlativa: Fundamentos de Programación) | parcial | [Res. CD FIUBA 2023/526](https://cms.fi.uba.ar/uploads/RESCD_2023_526_Informatica_Plan_2023_Aprobacion_15d3cee700.pdf) |
| Ing. Industrial: plan 2023 (modificado 2024); incluye Álgebra Lineal, Análisis Matemático II, Física de los Sistemas de Partículas, Estadística Aplicada, Economía, Desarrollo Económico, Ingeniería Económica, Investigación Operativa, Materiales y Aplicaciones I, Trabajo Profesional | parcial | [Res. CD FIUBA 2023/525](https://cms.fi.uba.ar/uploads/RESCD_2023_525_Industrial_Plan_2023_Aprobacion_2743f4c98b.pdf), [Res. CS 2024/63](https://cms.fi.uba.ar/uploads/RCS_2024_63_MOD_INGENIERIA_INDUSTRIAL_fa83c5599d.pdf) |

## Lo que está pendiente (y cómo cargarlo)

1. **Qué dos materias del grupo Física/Química/Pensamiento Computacional exige cada
   carrera.** Hoy `CAREERS[].cbcSubjects` asume Física + PC para Informática y Física +
   Química para Industrial, marcado como a verificar en la nota de cada carrera.
2. **Listado completo del segundo ciclo** de ambas carreras, su ubicación por
   cuatrimestre y sus correlatividades. Agregarlas en `LATER_SUBJECTS`
   (`curriculum.ts`) y, si corresponde, sus correlatividades **confirmadas** en
   `requires` de `src/content/map.ts`.
3. **Programas de IPC, ICSE y Química**: hoy figuran sin unidades a propósito.
4. **Unidades 2, 3 de Álgebra A** ("Rectas y planos", "Sistemas"): cargadas como
   estructura habitual, pendientes de confirmar.

Al actualizar un dato: cambiar `status`, agregar la fuente y actualizar `CHECKED`
(fecha de revisión) en `curriculum.ts`.

## Exámenes

Los simulacros usan ejercicios **generados por Ingenia** sobre los temas del
programa. No se reproducen parciales oficiales: si en el futuro se incorpora
material público de la UBA, debe confirmarse que su uso está permitido y citarse.
