/**
 * Modo examen de IPC (040, UBA XXI, Cátedra A).
 *
 * Pesos: el 1.er parcial sale de las claves 2023 y 1.er cuatrimestre 2024
 * cargadas (10 preguntas de opción múltiple, 1 punto cada una, sin puntaje
 * parcial: ocho de la Unidad 1 y dos de Darwin, una por tema). El 2.º
 * parcial no tiene claves en el material: su estructura es inferida de los
 * resúmenes (needsVerification).
 *
 * Las trampas son redacción propia a partir de las lecciones de Ingenia y de
 * los errores típicos del tema; no hay texto copiado de exámenes.
 */
export type IpcParcial = "1P" | "2P";

export interface IpcTopicInfo {
  topicId: string;
  short: string;
  icon: string;
  unit: string;
  /** Preguntas por parcial en el formato de las claves (1P) o en el inferido (2P). */
  questions: number;
  /** Tema de apoyo: no tiene pregunta propia pero sostiene a otros. */
  support?: boolean;
  traps: string[];
}

export const IPC_EXAM: Record<IpcParcial, { title: string; topics: IpcTopicInfo[]; needsVerification: boolean; source: string }> = {
  "1P": {
    title: "1.er parcial",
    needsVerification: false,
    source: "Claves de 1.er parcial 2023 y 2024 (8 temas): 10 preguntas, 8 de la Unidad 1 y 2 de Darwin.",
    topics: [
      {
        topicId: "t-ipc-condiciones",
        short: "Condiciones necesarias y suficientes",
        icon: "🔑",
        unit: "Unidad 1",
        questions: 1,
        traps: [
          "«A solo si B»: la condición NECESARIA es B (lo que viene después de «solo si»).",
          "«Si A, B» NO equivale a «Si B, A» (recíproco). Sí equivale a «Si no B, no A» (contrarrecíproco).",
          "«Si y solo si» = necesaria Y suficiente a la vez (bicondicional).",
        ],
      },
      {
        topicId: "t-ipc-formas",
        short: "Formas válidas y falacias",
        icon: "🧩",
        unit: "Unidad 1",
        questions: 1,
        traps: [
          "Modus tollens: Si A, B · no B · ∴ no A. Se niega el CONSECUENTE.",
          "Afirmación del consecuente (Si A, B · B · ∴ A) es FALACIA aunque todo suene verdadero.",
          "Negación del antecedente (Si A, B · no A · ∴ no B) también es falacia.",
          "Ojo: algunos resúmenes de estudiantes definen mal el modus tollens. Fiate de la forma, no del nombre.",
        ],
      },
      {
        topicId: "t-ipc-validez",
        short: "Validez, verdad y solidez",
        icon: "⚖️",
        unit: "Unidad 1",
        questions: 1,
        traps: [
          "Válido = IMPOSIBLE premisas V y conclusión F. No dice nada de si las premisas son verdaderas.",
          "Un argumento con todo verdadero puede ser inválido; uno válido puede tener premisas falsas.",
          "Sólido = válido + premisas verdaderas. Los enunciados son V/F; los argumentos, válidos/inválidos.",
        ],
      },
      {
        topicId: "t-ipc-conectivas",
        short: "Conectivas y valor de verdad",
        icon: "🔗",
        unit: "Unidad 1",
        questions: 1,
        traps: [
          "Condicional: SOLO es falso con antecedente V y consecuente F. Con antecedente F, es V.",
          "«Pero», «aunque», «sin embargo» funcionan como conjunción.",
          "Disyunción inclusiva: también es V si las dos son V. Resolvé de adentro hacia afuera.",
        ],
      },
      {
        topicId: "t-ipc-argumentos",
        short: "Argumentos: premisas y conclusión",
        icon: "💬",
        unit: "Unidad 1",
        questions: 1,
        traps: [
          "Un condicional solo («Si llueve, se suspende») NO es un argumento.",
          "La conclusión no siempre está al final: buscá qué se intenta probar.",
          "Describir, narrar o explicar no es argumentar aunque aparezca «porque».",
        ],
      },
      {
        topicId: "t-ipc-enunciados",
        short: "Tipos de enunciados",
        icon: "📝",
        unit: "Unidad 1",
        questions: 1,
        traps: [
          "Universal («todos»): un contraejemplo lo refuta, ningún caso lo verifica.",
          "Existencial («algún», «hay»): un caso lo verifica, ningún caso lo refuta.",
          "Estadístico («el 80 %»): ningún caso aislado lo verifica ni lo refuta.",
          "Preguntas y órdenes no son verdaderas ni falsas.",
        ],
      },
      {
        topicId: "t-ipc-tautologias",
        short: "Tautologías y contradicciones",
        icon: "🔁",
        unit: "Unidad 1",
        questions: 1,
        traps: [
          "Algo obviamente verdadero («Los perros son mamíferos») es CONTINGENCIA: no es V por su forma.",
          "«A o no A» = tautología. «A y no A» / «A pero no A» = contradicción.",
          "En duda, hacé la tabla completa.",
        ],
      },
      {
        topicId: "t-ipc-inductivos",
        short: "Argumentos inductivos",
        icon: "📊",
        unit: "Unidad 1",
        questions: 1,
        traps: [
          "Casos → «todos»: enumeración incompleta (cantidad y representatividad).",
          "Porcentaje + caso: silogismo inductivo (frecuencia alta, menor a 100 %, y evidencia total).",
          "Semejanzas: analogía (que sean RELEVANTES, más aspectos y más casos).",
          "Para fortalecer sin cambiar el tipo: nada de «todos», «los únicos» ni 100 %.",
        ],
      },
      {
        topicId: "t-ipc-pre-darwin",
        short: "Antes de Darwin",
        icon: "🦕",
        unit: "Unidad 2",
        questions: 1,
        traps: [
          "Darwin toma de Lamarck la IDEA de evolución, no el mecanismo (uso y desuso, herencia de lo adquirido).",
          "Lyell: gradualismo y actualismo (contra el catastrofismo de Cuvier). Malthus: lucha por la existencia.",
          "Teleológico = explicar por un fin. Darwin explica por causas anteriores.",
        ],
      },
      {
        topicId: "t-ipc-seleccion-natural",
        short: "Selección natural",
        icon: "🐢",
        unit: "Unidad 2",
        questions: 1,
        traps: [
          "La variación es al azar (no dirigida); la selección NO es azarosa.",
          "La selección no tiene meta ni implica progreso.",
          "Darwin y Lamarck coinciden en evolución y herencia; difieren en el ORIGEN de la variación.",
        ],
      },
      {
        topicId: "t-ipc-pruebas",
        short: "Reglas de inferencia y pruebas",
        icon: "🪜",
        unit: "Unidad 1",
        questions: 0,
        support: true,
        traps: [
          "Cada línea: premisa o regla aplicada a líneas anteriores (MP, MT, SH, SD, simplificación, adjunción).",
          "Prueba indirecta: suponés lo contrario, llegás a una contradicción y rechazás el supuesto.",
        ],
      },
    ],
  },
  "2P": {
    title: "2.º parcial",
    needsVerification: true,
    source: "No hay claves de 2.º parcial en el material: estructura inferida de los resúmenes (unidades 3 y 4).",
    topics: [
      {
        topicId: "t-ipc-contrastacion",
        short: "Contrastación de hipótesis",
        icon: "🔬",
        unit: "Unidad 3",
        questions: 2,
        traps: [
          "Que se cumpla la consecuencia observacional NO prueba la hipótesis (sería afirmación del consecuente).",
          "Si falla la CO, cae la conjunción (H y HA y CI): la lógica no dice cuál falló.",
          "CI y CO son enunciados básicos; H y HA, generales.",
        ],
      },
      {
        topicId: "t-ipc-pl-popper",
        short: "Positivismo lógico y Popper",
        icon: "❌",
        unit: "Unidad 3",
        questions: 2,
        traps: [
          "Corroborada (Popper) ≠ verdadera ni probable: se acepta provisoriamente.",
          "Para el positivismo la demarcación también era criterio de SENTIDO; para Popper, no.",
          "Falsador potencial: básico, singular/existencial, observacional e incompatible con la hipótesis.",
        ],
      },
      {
        topicId: "t-ipc-kuhn",
        short: "Kuhn",
        icon: "🔄",
        unit: "Unidad 3",
        questions: 2,
        traps: [
          "Enigma: si falla, se culpa al científico. Anomalía: se resiste al paradigma.",
          "Secuencia: preciencia → ciencia normal → anomalías → crisis → revolución.",
          "Inconmensurabilidad: no hay criterio neutral para comparar paradigmas.",
        ],
      },
      {
        topicId: "t-ipc-explicacion",
        short: "Explicación científica",
        icon: "❓",
        unit: "Unidad 3",
        questions: 1,
        traps: [
          "Explanans = leyes + condiciones antecedentes. Explanandum = el hecho a explicar.",
          "N-D: ley universal, deducción. I-E: ley estadística, solo hace probable.",
          "Explicación y predicción tienen la misma estructura.",
        ],
      },
      {
        topicId: "t-ipc-feminismo",
        short: "Epistemología feminista",
        icon: "♀️",
        unit: "Unidad 3",
        questions: 1,
        traps: [
          "Conocimiento situado NO implica relativismo.",
          "Punto de vista: privilegio epistémico. Empirismo feminista (Longino): objetividad como crítica intersubjetiva.",
        ],
      },
      {
        topicId: "t-ipc-etica",
        short: "Ética y ciencia",
        icon: "🧭",
        unit: "Unidad 4",
        questions: 1,
        traps: [
          "Falacia naturalista: derivar normas («debe») de hechos («es»).",
          "Internalista: conducta durante la investigación. Externalista: impacto social.",
          "Cientificismo: ciencia neutral, responsables los usuarios. Responsabilidad ≠ culpabilidad.",
        ],
      },
      {
        topicId: "t-ipc-politicas",
        short: "Políticas científicas",
        icon: "🏛️",
        unit: "Unidad 4",
        questions: 1,
        traps: [
          "Modelo lineal (Bush, 1945): básica → aplicada → tecnología → bienestar.",
          "Cientificismo (Bunge): prioridad a lo básico. Practicismo: a lo aplicado.",
          "Medida absoluta: monto total. Relativa: % del PBI.",
        ],
      },
    ],
  },
};

/** Rutina para un examen de opción múltiple sin puntaje parcial. */
export const IPC_CHECKLIST = [
  "Leé la pregunta completa y TODAS las opciones antes de marcar.",
  "Subrayá las palabras trampa: «solo si», «no», «todos», «algunos», «siempre», «necesaria», «suficiente».",
  "En lógica, pasá el enunciado a letras (A, B…) y escribí el esquema.",
  "¿Validez? Buscá un contraejemplo: premisas V y conclusión F.",
  "Descartá primero las opciones claramente falsas.",
  "Cada pregunta vale 1 punto y no hay puntaje parcial: no te quedes trabado en una; marcala y volvé.",
  "Antes de entregar, revisá que cada respuesta esté marcada donde corresponde.",
];
