/**
 * Contenido del MODO EMERGENCIA de IPC (040, UBA XXI, Cátedra A, programa 2026).
 *
 * Fuente: las lecciones de Ingenia, armadas a partir del material cargado
 * (programa 2026, claves de 1.er parcial 2023-2024, resúmenes). Solo aparecen
 * autores que están en ese material. Todas las preguntas de este archivo son
 * de práctica generada (`sourceType: "generatedPractice"`): ninguna es una
 * pregunta real de examen.
 */
import type { IpcParcial } from "./mission";

export type SourceType = "modelExam" | "studyMaterial" | "generatedPractice";

// ───────── Conceptos: en una frase y qué podrían preguntar ─────────

export const CONCEPT: Record<string, { frase: string; preguntan: string; tier: "necesitas" | "conviene" | "si-queda" }> = {
  "t-ipc-argumentos": { frase: "Un argumento es una conclusión apoyada en premisas: si nadie está dando razones para algo, no hay argumento.", preguntan: "¿Cuál es la conclusión? ¿Este texto es un argumento o solo describe/explica?", tier: "necesitas" },
  "t-ipc-enunciados": { frase: "Según de cuántos casos hablan, los enunciados son singulares, universales («todos»), existenciales («algún») o estadísticos («el 80 %»).", preguntan: "¿Qué tipo de enunciado es? ¿Se puede verificar o refutar con un caso?", tier: "necesitas" },
  "t-ipc-conectivas": { frase: "La verdad de un enunciado compuesto depende solo de la verdad de sus partes y de la conectiva.", preguntan: "Si A es V y B es F, ¿qué valor tiene «Si A, entonces B»?", tier: "necesitas" },
  "t-ipc-condiciones": { frase: "En «Si A, B», A es suficiente para B y B es necesaria para A; lo que sigue a «solo si» es la necesaria.", preguntan: "¿Qué oración dice lo mismo que…? ¿Cuál es la condición necesaria?", tier: "necesitas" },
  "t-ipc-tautologias": { frase: "Tautología: verdadera por su forma en todos los casos; contradicción: falsa por su forma; contingencia: depende del mundo.", preguntan: "¿Es tautología, contradicción o contingencia?", tier: "necesitas" },
  "t-ipc-validez": { frase: "Un argumento es válido si es imposible que sus premisas sean verdaderas y su conclusión falsa; no habla de si son verdaderas.", preguntan: "¿Qué afirmación sobre validez y verdad es correcta?", tier: "necesitas" },
  "t-ipc-formas": { frase: "Válidas: modus ponens, modus tollens, silogismos hipotético y disyuntivo. Falacias: afirmar el consecuente y negar el antecedente.", preguntan: "¿Qué forma tiene este argumento? ¿Cuál es válido?", tier: "necesitas" },
  "t-ipc-inductivos": { frase: "Los inductivos no garantizan la conclusión: se evalúan por su fuerza (enumeración incompleta, silogismo inductivo, analogía).", preguntan: "¿Qué tipo de inductivo es? ¿Qué premisa lo fortalece sin cambiar su tipo?", tier: "necesitas" },
  "t-ipc-pre-darwin": { frase: "Antes de Darwin: creacionismo y fijismo; Lamarck propone evolución por uso y desuso y herencia de lo adquirido.", preguntan: "¿Qué tomó Darwin de Lyell / Malthus / Lamarck?", tier: "necesitas" },
  "t-ipc-seleccion-natural": { frase: "Hay variación al azar y heredable; en la lucha por la existencia sobreviven y se reproducen más los más aptos para ese ambiente.", preguntan: "¿Qué afirmación sobre la selección natural es correcta?", tier: "necesitas" },
  "t-ipc-pruebas": { frase: "Una prueba justifica cada paso con una regla (MP, MT, SH, SD…) o es premisa; la indirecta parte de suponer lo contrario.", preguntan: "¿Qué regla justifica este paso?", tier: "si-queda" },
  "t-ipc-contrastacion": { frase: "De la hipótesis (con condiciones iniciales e hipótesis auxiliares) se deduce una consecuencia observacional que se compara con la observación.", preguntan: "¿Qué permite concluir que la consecuencia observacional se cumpla / no se cumpla?", tier: "necesitas" },
  "t-ipc-pl-popper": { frase: "El positivismo lógico confirma inductivamente; Popper rechaza la inducción: las hipótesis se ponen a prueba intentando refutarlas.", preguntan: "¿Qué sostiene Popper sobre la confirmación? ¿Qué es un falsador potencial?", tier: "necesitas" },
  "t-ipc-explicacion": { frase: "Explicar (Hempel) es mostrar el hecho como caso de una ley: explanans (leyes + condiciones) → explanandum.", preguntan: "¿Qué es el explanans? ¿Qué diferencia hay entre N-D e I-E?", tier: "conviene" },
  "t-ipc-kuhn": { frase: "La ciencia avanza por paradigmas: ciencia normal, anomalías, crisis y revolución; paradigmas rivales son inconmensurables.", preguntan: "¿Qué es un paradigma? ¿Qué diferencia hay entre enigma y anomalía?", tier: "necesitas" },
  "t-ipc-feminismo": { frase: "La epistemología feminista muestra sesgos de género en la ciencia y sostiene que el conocimiento es situado, sin caer en el relativismo.", preguntan: "¿Qué sostiene el empirismo feminista (Longino)?", tier: "conviene" },
  "t-ipc-etica": { frase: "Los hechos no dictan normas (falacia naturalista); la ética de la ciencia mira la investigación (internalista) y su impacto (externalista).", preguntan: "¿Qué sostiene el cientificismo sobre la responsabilidad?", tier: "conviene" },
  "t-ipc-politicas": { frase: "Una política científica es una política pública de ciencia y tecnología; el modelo lineal va de la ciencia básica al bienestar.", preguntan: "¿Qué es el modelo lineal? ¿Medida absoluta o relativa?", tier: "si-queda" },
};

// ───────── Autores (solo los del material) ─────────

export interface Author {
  id: string;
  name: string;
  parcial: IpcParcial;
  topicId: string;
  idea: string;
  claves: { k: string; why: string }[];
  defiende: string;
  noDefiende: string;
  confusion: string;
  pregunta: string;
  frase: string;
}

export const AUTHORS: Author[] = [
  {
    id: "lamarck",
    name: "Lamarck",
    parcial: "1P",
    topicId: "t-ipc-pre-darwin",
    idea: "Las especies cambian: los órganos se fortalecen con el uso o se atrofian con el desuso, y esos cambios adquiridos se heredan.",
    claves: [
      { k: "Uso y desuso", why: "es su mecanismo: el ambiente genera necesidades y el uso modifica el órgano." },
      { k: "Herencia de caracteres adquiridos", why: "lo que el individuo adquiere en vida pasa a la descendencia." },
      { k: "Evolución (transformismo)", why: "rompe con el fijismo: las especies no son fijas." },
    ],
    defiende: "Que hay evolución y que la variación surge dirigida por las necesidades del ambiente.",
    noDefiende: "La selección natural ni la variación al azar.",
    confusion: "Con Darwin: los dos aceptan evolución y herencia, pero para Lamarck la variación es dirigida (uso y desuso) y para Darwin es al azar.",
    pregunta: "«La jirafa estiró el cuello para alcanzar las hojas y transmitió ese cuello a sus crías.» ¿Qué explicación es?",
    frase: "Lamarck: «lo usás, cambia y lo heredás».",
  },
  {
    id: "darwin",
    name: "Darwin",
    parcial: "1P",
    topicId: "t-ipc-seleccion-natural",
    idea: "Las especies evolucionan por selección natural: entre variaciones al azar y heredables, dejan más descendencia los más aptos para su ambiente.",
    claves: [
      { k: "Selección natural", why: "es el mecanismo: el ambiente «filtra» variaciones que ya existen." },
      { k: "Variación no dirigida", why: "las diferencias aparecen al azar, no porque se necesiten." },
      { k: "Lucha por la existencia", why: "nacen más individuos de los que pueden sobrevivir (idea tomada de Malthus)." },
      { k: "Ancestro común", why: "todas las especies descienden de antepasados comunes." },
    ],
    defiende: "Evolución gradual por causas antecedentes (no por un fin), con variación al azar y selección no azarosa.",
    noDefiende: "El uso y desuso como mecanismo, un fin o meta de la evolución, ni que la evolución sea progreso.",
    confusion: "Pensar que la selección es al azar (lo azaroso es la variación) o que el individuo se adapta porque lo necesita (eso es Lamarck).",
    pregunta: "¿Qué afirmación sobre la selección natural es correcta?",
    frase: "Darwin: «aparece al azar, sobrevive el que encaja».",
  },
  {
    id: "lyell",
    name: "Lyell",
    parcial: "1P",
    topicId: "t-ipc-pre-darwin",
    idea: "La Tierra cambió de forma gradual, por las mismas causas que actúan hoy, durante muchísimo tiempo.",
    claves: [
      { k: "Gradualismo", why: "cambios lentos y acumulativos, no saltos." },
      { k: "Actualismo (uniformismo)", why: "las causas del pasado son las mismas que vemos actuar hoy." },
      { k: "Tiempo profundo", why: "le da a Darwin el tiempo que necesita la evolución." },
    ],
    defiende: "Cambio geológico gradual con causas actuales.",
    noDefiende: "Catástrofes súbitas como motor del cambio (eso es Cuvier).",
    confusion: "Con Cuvier (catastrofismo) y con Malthus (Lyell es geología, Malthus es población).",
    pregunta: "¿Qué idea tomó Darwin de Lyell?",
    frase: "Lyell: «despacito y con las causas de siempre».",
  },
  {
    id: "cuvier",
    name: "Cuvier",
    parcial: "1P",
    topicId: "t-ipc-pre-darwin",
    idea: "Catastrofismo: grandes catástrofes explican la desaparición de especies que muestran los fósiles.",
    claves: [
      { k: "Catastrofismo", why: "cambios súbitos y violentos en la historia de la Tierra." },
      { k: "Extinción", why: "los fósiles muestran especies que ya no existen." },
    ],
    defiende: "Cambios por catástrofes.",
    noDefiende: "El gradualismo de Lyell.",
    confusion: "Con Lyell: son opuestos (catástrofes vs. cambio gradual).",
    pregunta: "¿Qué postura se opone al gradualismo de Lyell?",
    frase: "Cuvier: «catástrofe».",
  },
  {
    id: "malthus",
    name: "Malthus",
    parcial: "1P",
    topicId: "t-ipc-pre-darwin",
    idea: "La población crece más rápido que los recursos, así que hay escasez y competencia.",
    claves: [{ k: "Lucha por la existencia", why: "Darwin la aplica a todos los seres vivos: no todos los que nacen sobreviven." }],
    defiende: "Que el crecimiento de la población supera al de los alimentos.",
    noDefiende: "Una teoría de la evolución.",
    confusion: "Con Lyell: Darwin toma de Malthus la lucha por la existencia, de Lyell el gradualismo.",
    pregunta: "¿Qué idea tomó Darwin de Malthus?",
    frase: "Malthus: «somos muchos y no alcanza».",
  },
  {
    id: "pl",
    name: "Positivismo lógico (Carnap)",
    parcial: "2P",
    topicId: "t-ipc-pl-popper",
    idea: "La ciencia se justifica por la experiencia: las hipótesis se confirman inductivamente, y lo que no se traduce a observación no es ciencia (ni tiene sentido).",
    claves: [
      { k: "Confirmación inductiva", why: "cada caso favorable aumenta el apoyo a la hipótesis." },
      { k: "Traducibilidad", why: "criterio de demarcación: los términos teóricos deben poder traducirse a observacionales." },
      { k: "Criterio de sentido", why: "para ellos la demarcación también separa lo que tiene sentido de lo que no." },
    ],
    defiende: "Inducción y confirmación; demarcación como criterio de sentido.",
    noDefiende: "El falsacionismo.",
    confusion: "Con Popper: ambos separan descubrimiento y justificación, pero el PL confirma y Popper refuta.",
    pregunta: "¿Qué diferencia hay entre la demarcación del PL y la de Popper?",
    frase: "PL: «confirmar con casos».",
  },
  {
    id: "popper",
    name: "Popper",
    parcial: "2P",
    topicId: "t-ipc-pl-popper",
    idea: "No hay inducción válida: la ciencia propone conjeturas audaces y trata de refutarlas; lo científico es lo falsable.",
    claves: [
      { k: "Falsabilidad", why: "criterio de demarcación: debe haber observaciones posibles que la contradigan." },
      { k: "Falsador potencial", why: "enunciado básico, observacional e incompatible con la hipótesis." },
      { k: "Corroboración", why: "la hipótesis resistió el intento de refutarla; se acepta provisoriamente." },
    ],
    defiende: "Refutación por modus tollens; aceptación provisoria.",
    noDefiende: "Que una hipótesis corroborada sea verdadera o probable, ni la confirmación inductiva.",
    confusion: "«Corroborada» no es «verificada». Y la falsabilidad no es criterio de sentido.",
    pregunta: "Según Popper, ¿qué se puede concluir si una hipótesis supera una contrastación?",
    frase: "Popper: «intentá refutarla».",
  },
  {
    id: "hempel",
    name: "Hempel",
    parcial: "2P",
    topicId: "t-ipc-explicacion",
    idea: "Explicar es subsumir el hecho bajo leyes: del explanans (leyes + condiciones antecedentes) se obtiene el explanandum.",
    claves: [
      { k: "Nomológico-deductivo", why: "leyes universales y deducción." },
      { k: "Inductivo-estadístico", why: "ley estadística: el hecho resulta solo probable." },
      { k: "Simetría explicación-predicción", why: "tienen la misma estructura." },
    ],
    defiende: "El modelo de cobertura legal.",
    noDefiende: "Que una explicación pueda prescindir de leyes.",
    confusion: "Explanans (lo que explica) con explanandum (lo explicado).",
    pregunta: "¿Qué contiene el explanans en el modelo N-D?",
    frase: "Hempel: «ley + condiciones → hecho».",
  },
  {
    id: "kuhn",
    name: "Kuhn",
    parcial: "2P",
    topicId: "t-ipc-kuhn",
    idea: "La ciencia es la práctica de una comunidad bajo un paradigma; cambia por revoluciones, no por acumulación.",
    claves: [
      { k: "Paradigma", why: "matriz disciplinar y ejemplares compartidos por la comunidad." },
      { k: "Ciencia normal", why: "resolver enigmas dentro del paradigma." },
      { k: "Anomalía y crisis", why: "problemas que se resisten y hacen dudar del paradigma." },
      { k: "Inconmensurabilidad", why: "no hay criterio neutral para comparar paradigmas." },
    ],
    defiende: "Giro historicista; observación cargada de teoría.",
    noDefiende: "Que una sola refutación haga abandonar una teoría (contra Popper).",
    confusion: "Enigma (se culpa al científico) vs. anomalía (se resiste al paradigma).",
    pregunta: "¿Qué ocurre en la ciencia normal cuando un problema no se resuelve?",
    frase: "Kuhn: «paradigma, crisis, revolución».",
  },
  {
    id: "longino",
    name: "Longino",
    parcial: "2P",
    topicId: "t-ipc-feminismo",
    idea: "Empirismo feminista: la objetividad no es de un individuo neutral, sino de la crítica entre sujetos dentro de la comunidad científica.",
    claves: [{ k: "Crítica intersubjetiva", why: "la objetividad surge del control crítico mutuo." }],
    defiende: "Objetividad social, sin relativismo.",
    noDefiende: "Que todo punto de vista valga lo mismo.",
    confusion: "Con la teoría del punto de vista (privilegio epistémico, Harding).",
    pregunta: "¿Cómo entiende la objetividad el empirismo feminista?",
    frase: "Longino: «objetividad = crítica entre muchos».",
  },
  {
    id: "bunge",
    name: "Bunge",
    parcial: "2P",
    topicId: "t-ipc-politicas",
    idea: "Cientificismo en política científica: priorizar la investigación básica.",
    claves: [{ k: "Prioridad de lo básico", why: "la ciencia básica es la fuente de la aplicada." }],
    defiende: "Financiar primero la ciencia básica.",
    noDefiende: "El practicismo (prioridad de lo aplicado).",
    confusion: "Con el modelo lineal de Bush, que describe el camino básica → aplicada → tecnología → bienestar.",
    pregunta: "¿Qué postura de política científica prioriza la investigación básica?",
    frase: "Bunge: «primero lo básico».",
  },
];

// ───────── Diferencia entre… ─────────

export interface Difference {
  id: string;
  parcial: IpcParcial;
  topicId: string;
  a: [string, string];
  b: [string, string];
  key: string;
  pregunta: string;
}

export const DIFFERENCES: Difference[] = [
  { id: "nec-suf", parcial: "1P", topicId: "t-ipc-condiciones", a: ["Condición suficiente", "Alcanza para que ocurra lo otro. En «Si A, B», es A."], b: ["Condición necesaria", "Sin ella no ocurre lo otro. En «Si A, B», es B. Lo que sigue a «solo si»."], key: "«A solo si B» = «Si A, B»: B es la necesaria.", pregunta: "«Aprobás solo si estudiás.» ¿Cuál es la condición necesaria?" },
  { id: "val-ver", parcial: "1P", topicId: "t-ipc-validez", a: ["Validez", "Propiedad de los argumentos: es imposible premisas V y conclusión F. Depende de la forma."], b: ["Verdad", "Propiedad de los enunciados: corresponde o no con los hechos."], key: "Un válido puede tener todo falso; un inválido puede tener todo verdadero.", pregunta: "¿Puede un argumento válido tener conclusión falsa? (Sí, si alguna premisa es falsa.)" },
  { id: "mt-ac", parcial: "1P", topicId: "t-ipc-formas", a: ["Modus tollens (válido)", "Si A, B · no B · ∴ no A."], b: ["Afirmación del consecuente (falacia)", "Si A, B · B · ∴ A."], key: "Negar el consecuente es válido; afirmarlo, no.", pregunta: "¿Qué forma tiene «Si llueve, el piso se moja. El piso está mojado. Llovió»?" },
  { id: "mp-na", parcial: "1P", topicId: "t-ipc-formas", a: ["Modus ponens (válido)", "Si A, B · A · ∴ B."], b: ["Negación del antecedente (falacia)", "Si A, B · no A · ∴ no B."], key: "Afirmar el antecedente es válido; negarlo, no.", pregunta: "«Si estudio, apruebo. No estudié. No aprobé.» ¿Es válido?" },
  { id: "univ-exist", parcial: "1P", topicId: "t-ipc-enunciados", a: ["Universal («todos»)", "Un contraejemplo lo refuta; ningún número de casos lo verifica."], b: ["Existencial («algún», «hay»)", "Un caso lo verifica; ninguna observación finita lo refuta."], key: "Son simétricos: lo que a uno le alcanza para verificar, al otro le alcanza para refutar.", pregunta: "¿Qué tipo de enunciado se puede verificar con un solo caso?" },
  { id: "tau-cont", parcial: "1P", topicId: "t-ipc-tautologias", a: ["Tautología", "Verdadera en todas las filas, por su forma («A o no A»)."], b: ["Contingencia", "Su verdad depende del mundo, aunque sea obvia («El agua moja»)."], key: "Lo obvio no es tautología: hace falta que sea V por la forma.", pregunta: "«Los perros son mamíferos»: ¿tautología o contingencia?" },
  { id: "ded-ind", parcial: "1P", topicId: "t-ipc-inductivos", a: ["Deductivo", "Pretende que la conclusión se siga necesariamente. Se evalúa: válido o inválido."], b: ["Inductivo", "Pretende que la conclusión sea probable. Se evalúa por grados de fuerza."], key: "Validez es sí/no; fuerza es más o menos.", pregunta: "¿Cómo se evalúa un argumento por analogía?" },
  { id: "enum-sil", parcial: "1P", topicId: "t-ipc-inductivos", a: ["Enumeración incompleta", "Casos observados → «todos los X son Z»."], b: ["Silogismo inductivo", "«El 90 % de los X es Z; a es X» → «a es Z»."], key: "Uno generaliza; el otro aplica un porcentaje a un caso.", pregunta: "«El 95 % de los que estudian aprueba; Ana estudia; Ana aprobará.» ¿Qué tipo es?" },
  { id: "darwin-lamarck", parcial: "1P", topicId: "t-ipc-seleccion-natural", a: ["Lamarck", "Variación dirigida por necesidad: uso y desuso + herencia de lo adquirido."], b: ["Darwin", "Variación al azar + selección natural."], key: "Coinciden en que hay evolución y herencia; difieren en el ORIGEN de la variación.", pregunta: "¿En qué coinciden Darwin y Lamarck?" },
  { id: "var-sel", parcial: "1P", topicId: "t-ipc-seleccion-natural", a: ["Variación", "Aparece al azar, no dirigida."], b: ["Selección", "No es azarosa: favorece a los más aptos para ESE ambiente."], key: "«La evolución es puro azar» es falso.", pregunta: "¿Qué parte del proceso darwiniano es azarosa?" },
  { id: "lyell-cuvier", parcial: "1P", topicId: "t-ipc-pre-darwin", a: ["Lyell", "Gradualismo y actualismo."], b: ["Cuvier", "Catastrofismo."], key: "Cambio lento con causas actuales vs. catástrofes súbitas.", pregunta: "¿Qué idea de Lyell aprovechó Darwin?" },
  { id: "teleo-causal", parcial: "1P", topicId: "t-ipc-pre-darwin", a: ["Explicación teleológica", "Por un fin: «tiene alas para volar»."], b: ["Explicación causal (Darwin)", "Por causas anteriores: variación y selección."], key: "Darwin reemplaza el «para qué» por el «por qué pasó».", pregunta: "¿Qué tipo de explicación reemplaza Darwin?" },
  { id: "conf-corr", parcial: "2P", topicId: "t-ipc-pl-popper", a: ["Confirmación (PL)", "Casos favorables aumentan el apoyo inductivo a la hipótesis."], b: ["Corroboración (Popper)", "Resistió un intento de refutación; aceptación provisoria, no más probable."], key: "Popper no acepta la inducción.", pregunta: "Para Popper, ¿una hipótesis corroborada es más probable?" },
  { id: "enig-anom", parcial: "2P", topicId: "t-ipc-kuhn", a: ["Enigma", "Problema de la ciencia normal: si no sale, se culpa al científico."], b: ["Anomalía", "Problema que se resiste al paradigma y puede llevar a la crisis."], key: "El enigma no pone en duda el paradigma; la anomalía, sí.", pregunta: "¿Qué puede desencadenar una crisis según Kuhn?" },
  { id: "nd-ie", parcial: "2P", topicId: "t-ipc-explicacion", a: ["Nomológico-deductiva", "Leyes universales; el explanandum se deduce."], b: ["Inductivo-estadística", "Ley estadística; el explanandum es solo probable."], key: "Deducción vs. probabilidad.", pregunta: "¿Qué tipo de ley usa una explicación I-E?" },
  { id: "desc-just", parcial: "2P", topicId: "t-ipc-pl-popper", a: ["Contexto de descubrimiento", "Cómo se llega a una idea (psicología, historia)."], b: ["Contexto de justificación", "Cómo se pone a prueba y se acepta."], key: "La filosofía clásica (PL y Popper) se ocupa de la justificación.", pregunta: "¿De qué contexto se ocupa la filosofía clásica de la ciencia?" },
  { id: "int-ext", parcial: "2P", topicId: "t-ipc-etica", a: ["Ética internalista", "Conducta durante la investigación (fraude, consentimiento)."], b: ["Ética externalista", "Impacto social de la ciencia y sus aplicaciones."], key: "Adentro del proceso vs. sus consecuencias afuera.", pregunta: "Discutir el uso militar de un descubrimiento, ¿qué enfoque es?" },
];

// ───────── Mapas conceptuales ─────────

export const MAPS: { id: string; parcial: IpcParcial; title: string; steps: string[]; note: string }[] = [
  { id: "validez", parcial: "1P", title: "¿Es válido este argumento?", steps: ["Encontrá premisas y conclusión", "Pasalo a letras (A, B…)", "Escribí el esquema", "¿Es MP, MT, SH o SD? → válido", "¿Afirma el consecuente o niega el antecedente? → falacia", "Si dudás: buscá un caso con premisas V y conclusión F"], note: "La verdad de las oraciones no decide la validez: decide la forma." },
  { id: "darwin", parcial: "1P", title: "El argumento de Darwin", steps: ["Nacen más individuos de los que sobreviven (Malthus)", "Hay variación al azar entre ellos", "Parte de la variación se hereda", "Los más aptos para ese ambiente dejan más descendencia", "Se acumulan cambios graduales (Lyell)", "Nuevas especies desde un ancestro común"], note: "Sin meta ni progreso: el ambiente filtra lo que ya apareció al azar." },
  { id: "contrastacion", parcial: "2P", title: "Contrastación de una hipótesis", steps: ["Hipótesis (H) + hipótesis auxiliares (HA) + condiciones iniciales (CI)", "Se deduce una consecuencia observacional (CO)", "Se observa", "Si NO se cumple: cae la conjunción (modus tollens)", "Si se cumple: NO prueba H (sería afirmar el consecuente)"], note: "PL: el caso favorable confirma. Popper: la hipótesis queda corroborada, provisoriamente." },
  { id: "kuhn", parcial: "2P", title: "El ciclo de Kuhn", steps: ["Preciencia", "Paradigma → ciencia normal (enigmas)", "Anomalías", "Crisis", "Revolución científica", "Nuevo paradigma"], note: "Los paradigmas rivales son inconmensurables." },
];

// ───────── Preguntas rápidas (todas de práctica generada) ─────────

export type QuickMode = "vf" | "quien" | "error" | "trampa" | "mc";

export interface QuickQ {
  id: string;
  parcial: IpcParcial;
  topicId: string;
  mode: QuickMode;
  q: string;
  options: string[];
  answer: number;
  /** Explicación de cada opción, en el mismo orden. */
  why: string[];
  /** Tipo de error si fallás: para «Mis errores». */
  errorKind: "autor" | "concepto" | "distractor" | "logica" | "palabra";
  sourceType: SourceType;
}

const VF = ["Verdadero", "Falso"];
const g = (x: Omit<QuickQ, "sourceType">): QuickQ => ({ ...x, sourceType: "generatedPractice" });

export const QUICK: QuickQ[] = [
  // ── Verdadero / falso (1P) ──
  g({ id: "vf1", parcial: "1P", topicId: "t-ipc-validez", mode: "vf", q: "Si un argumento es válido, su conclusión es verdadera.", options: VF, answer: 1, why: ["No: la validez solo garantiza que NO puede haber premisas V y conclusión F.", "Correcto: si alguna premisa es falsa, un válido puede tener conclusión falsa."], errorKind: "concepto" }),
  g({ id: "vf2", parcial: "1P", topicId: "t-ipc-conectivas", mode: "vf", q: "Un condicional con antecedente falso es verdadero.", options: VF, answer: 0, why: ["Correcto: el condicional solo es falso con antecedente V y consecuente F.", "No: con antecedente falso, el condicional es verdadero."], errorKind: "logica" }),
  g({ id: "vf3", parcial: "1P", topicId: "t-ipc-condiciones", mode: "vf", q: "«A solo si B» equivale a «Si B, entonces A».", options: VF, answer: 1, why: ["No: ese es el recíproco.", "Correcto: «A solo si B» = «Si A, entonces B». B es la necesaria."], errorKind: "logica" }),
  g({ id: "vf4", parcial: "1P", topicId: "t-ipc-enunciados", mode: "vf", q: "Un enunciado existencial puede verificarse con un solo caso.", options: VF, answer: 0, why: ["Correcto: alcanza encontrar uno.", "No: «hay un…» se verifica encontrando uno."], errorKind: "concepto" }),
  g({ id: "vf5", parcial: "1P", topicId: "t-ipc-tautologias", mode: "vf", q: "«El agua hierve a 100 °C a nivel del mar» es una tautología.", options: VF, answer: 1, why: ["No: es verdadera por cómo es el mundo, no por su forma.", "Correcto: es una contingencia (aunque sea verdadera)."], errorKind: "distractor" }),
  g({ id: "vf6", parcial: "1P", topicId: "t-ipc-inductivos", mode: "vf", q: "Un argumento inductivo fuerte puede tener premisas verdaderas y conclusión falsa.", options: VF, answer: 0, why: ["Correcto: lo inductivo nunca garantiza la conclusión.", "No: la fuerza es probabilidad, no garantía."], errorKind: "concepto" }),
  g({ id: "vf7", parcial: "1P", topicId: "t-ipc-seleccion-natural", mode: "vf", q: "Para Darwin, la selección natural es un proceso azaroso.", options: VF, answer: 1, why: ["No: lo azaroso es la aparición de la variación.", "Correcto: la selección favorece sistemáticamente a los más aptos para ese ambiente."], errorKind: "distractor" }),
  g({ id: "vf8", parcial: "1P", topicId: "t-ipc-pre-darwin", mode: "vf", q: "Darwin tomó de Lamarck el mecanismo de uso y desuso.", options: VF, answer: 1, why: ["No: Darwin toma la idea de que hay evolución, no el mecanismo.", "Correcto: el mecanismo de Darwin es la selección natural."], errorKind: "autor" }),
  g({ id: "vf9", parcial: "1P", topicId: "t-ipc-argumentos", mode: "vf", q: "«Si mañana llueve, se suspende el partido» es un argumento.", options: VF, answer: 1, why: ["No: un condicional solo no apoya ninguna conclusión.", "Correcto: es un único enunciado condicional."], errorKind: "concepto" }),
  g({ id: "vf10", parcial: "1P", topicId: "t-ipc-formas", mode: "vf", q: "«Si A, B. B. Por lo tanto, A» es una forma válida.", options: VF, answer: 1, why: ["No: es la falacia de afirmación del consecuente.", "Correcto: B puede ser verdadera por otra causa."], errorKind: "logica" }),
  // ── Verdadero / falso (2P) ──
  g({ id: "vf11", parcial: "2P", topicId: "t-ipc-pl-popper", mode: "vf", q: "Para Popper, una hipótesis corroborada es verdadera.", options: VF, answer: 1, why: ["No: corroborada = resistió hasta ahora; se acepta provisoriamente.", "Correcto: ni verdadera ni más probable."], errorKind: "autor" }),
  g({ id: "vf12", parcial: "2P", topicId: "t-ipc-contrastacion", mode: "vf", q: "Si la consecuencia observacional se cumple, queda probada la hipótesis.", options: VF, answer: 1, why: ["No: concluir H desde CO sería afirmar el consecuente.", "Correcto: un resultado favorable no prueba la hipótesis."], errorKind: "logica" }),
  g({ id: "vf13", parcial: "2P", topicId: "t-ipc-kuhn", mode: "vf", q: "Según Kuhn, durante la ciencia normal un enigma sin resolver se atribuye al científico.", options: VF, answer: 0, why: ["Correcto: no se cuestiona el paradigma.", "No: eso es justamente lo que pasa con los enigmas."], errorKind: "autor" }),
  g({ id: "vf14", parcial: "2P", topicId: "t-ipc-explicacion", mode: "vf", q: "Para Hempel, explicación y predicción tienen la misma estructura lógica.", options: VF, answer: 0, why: ["Correcto: tesis de la simetría.", "No: Hempel sostiene la simetría."], errorKind: "autor" }),
  // ── ¿De quién es esta idea? ──
  g({ id: "q1", parcial: "1P", topicId: "t-ipc-pre-darwin", mode: "quien", q: "«Los órganos que se usan se fortalecen y esos cambios se transmiten a la descendencia.»", options: ["Darwin", "Lamarck", "Lyell", "Malthus"], answer: 1, why: ["Darwin explica por selección de variaciones al azar.", "Uso y desuso + herencia de lo adquirido = Lamarck.", "Lyell es geología: gradualismo.", "Malthus habla de población y recursos."], errorKind: "autor" }),
  g({ id: "q2", parcial: "1P", topicId: "t-ipc-pre-darwin", mode: "quien", q: "«La población crece más rápido que los alimentos.»", options: ["Malthus", "Cuvier", "Lamarck", "Lyell"], answer: 0, why: ["Malthus: de ahí Darwin saca la lucha por la existencia.", "Cuvier: catastrofismo.", "Lamarck: uso y desuso.", "Lyell: gradualismo geológico."], errorKind: "autor" }),
  g({ id: "q3", parcial: "1P", topicId: "t-ipc-pre-darwin", mode: "quien", q: "«Los cambios de la Tierra se produjeron lentamente, por las mismas causas que actúan hoy.»", options: ["Cuvier", "Malthus", "Lyell", "Lamarck"], answer: 2, why: ["Cuvier dice lo contrario: catástrofes.", "Malthus es población.", "Lyell: gradualismo y actualismo.", "Lamarck habla de seres vivos, no de geología."], errorKind: "autor" }),
  g({ id: "q4", parcial: "1P", topicId: "t-ipc-pre-darwin", mode: "quien", q: "«La desaparición de especies se explica por grandes catástrofes.»", options: ["Lyell", "Cuvier", "Darwin", "Malthus"], answer: 1, why: ["Lyell se opone: cambio gradual.", "Catastrofismo = Cuvier.", "Darwin: cambio gradual por selección.", "Malthus: población."], errorKind: "autor" }),
  g({ id: "q5", parcial: "1P", topicId: "t-ipc-seleccion-natural", mode: "quien", q: "«Entre variaciones que aparecen al azar, dejan más descendencia las más aptas para el ambiente.»", options: ["Lamarck", "Darwin", "Cuvier", "Lyell"], answer: 1, why: ["Lamarck: variación dirigida por necesidad.", "Selección natural = Darwin.", "Cuvier: catástrofes.", "Lyell: geología."], errorKind: "autor" }),
  g({ id: "q6", parcial: "2P", topicId: "t-ipc-pl-popper", mode: "quien", q: "«Una teoría es científica si hay observaciones posibles que podrían refutarla.»", options: ["Positivismo lógico", "Popper", "Kuhn", "Hempel"], answer: 1, why: ["El PL usa traducibilidad y confirmación.", "Falsabilidad = Popper.", "Kuhn habla de paradigmas.", "Hempel: explicación."], errorKind: "autor" }),
  g({ id: "q7", parcial: "2P", topicId: "t-ipc-kuhn", mode: "quien", q: "«Los paradigmas rivales no pueden compararse con un criterio neutral.»", options: ["Popper", "Hempel", "Kuhn", "Longino"], answer: 2, why: ["Popper compara por refutación.", "Hempel: explicación.", "Inconmensurabilidad = Kuhn.", "Longino: objetividad como crítica."], errorKind: "autor" }),
  g({ id: "q8", parcial: "2P", topicId: "t-ipc-pl-popper", mode: "quien", q: "«Cada caso favorable aumenta el grado de confirmación de una hipótesis.»", options: ["Positivismo lógico", "Popper", "Kuhn", "Bunge"], answer: 0, why: ["Confirmación inductiva = PL.", "Popper rechaza la inducción.", "Kuhn no plantea confirmación.", "Bunge: política científica."], errorKind: "autor" }),
  g({ id: "q9", parcial: "2P", topicId: "t-ipc-explicacion", mode: "quien", q: "«Explicar un hecho es deducirlo de leyes y condiciones antecedentes.»", options: ["Kuhn", "Hempel", "Popper", "Longino"], answer: 1, why: ["Kuhn: paradigmas.", "Modelo de cobertura legal = Hempel.", "Popper: falsación.", "Longino: epistemología feminista."], errorKind: "autor" }),
  // ── Encontrá el error ──
  g({ id: "e1", parcial: "1P", topicId: "t-ipc-seleccion-natural", mode: "error", q: "«Según Darwin, las jirafas alargaron el cuello porque lo necesitaban para alcanzar las hojas.» ¿Qué está mal?", options: ["Nada, es correcto", "Es la explicación de Lamarck: variación dirigida por la necesidad", "Darwin no habla de jirafas", "Darwin niega la herencia"], answer: 1, why: ["Tiene un error de autor.", "Correcto: para Darwin las variaciones aparecen al azar y se seleccionan; «porque lo necesitaban» es lamarckiano.", "El ejemplo no es lo importante: el mecanismo sí.", "Darwin acepta la herencia."], errorKind: "autor" }),
  g({ id: "e2", parcial: "1P", topicId: "t-ipc-formas", mode: "error", q: "«El modus tollens tiene la forma: Si A, B; B; por lo tanto, A.» ¿Qué está mal?", options: ["Nada", "Esa es la afirmación del consecuente; el MT es: Si A, B; no B; ∴ no A", "Esa es el modus ponens", "El MT no es válido"], answer: 1, why: ["Tiene un error.", "Correcto: es la confusión típica (hasta en algunos resúmenes).", "El MP es: Si A, B; A; ∴ B.", "El MT es válido."], errorKind: "logica" }),
  g({ id: "e3", parcial: "1P", topicId: "t-ipc-validez", mode: "error", q: "«Como todas sus premisas y su conclusión son verdaderas, el argumento es válido.» ¿Qué está mal?", options: ["Nada", "La verdad no determina la validez: depende de la forma", "Debería decir «sólido»", "Los argumentos no tienen conclusión"], answer: 1, why: ["Tiene un error.", "Correcto: un argumento con todo verdadero puede tener una forma inválida.", "Sólido exige primero que sea válido.", "Sí la tienen."], errorKind: "concepto" }),
  g({ id: "e4", parcial: "2P", topicId: "t-ipc-pl-popper", mode: "error", q: "«Para Popper, cuantas más veces se corrobora una hipótesis, más probable es que sea verdadera.» ¿Qué está mal?", options: ["Nada", "Popper rechaza que la corroboración la haga más probable", "Popper habla de confirmación", "Popper no acepta hipótesis"], answer: 1, why: ["Tiene un error.", "Correcto: eso sería inducción, que Popper rechaza.", "Confirmación es del PL.", "Las acepta provisoriamente."], errorKind: "distractor" }),
  g({ id: "e5", parcial: "2P", topicId: "t-ipc-kuhn", mode: "error", q: "«Según Kuhn, una sola anomalía alcanza para abandonar un paradigma.» ¿Qué está mal?", options: ["Nada", "Las anomalías se acumulan y llevan a una crisis; no se abandona por una sola", "Kuhn no habla de anomalías", "Kuhn dice que nunca se abandona"], answer: 1, why: ["Tiene un error.", "Correcto: esa idea de rechazo inmediato se parece más a Popper.", "Sí habla.", "Sí se abandona, en una revolución."], errorKind: "autor" }),
  // ── Palabra trampa ──
  g({ id: "t1", parcial: "1P", topicId: "t-ipc-inductivos", mode: "trampa", q: "«Un argumento inductivo fuerte NECESARIAMENTE tiene conclusión verdadera si sus premisas lo son.»", options: VF, answer: 1, why: ["«Necesariamente» lo convierte en una propiedad deductiva.", "Correcto: lo inductivo solo hace PROBABLE la conclusión. Si dijera «probablemente», sería verdadero."], errorKind: "palabra" }),
  g({ id: "t2", parcial: "1P", topicId: "t-ipc-validez", mode: "trampa", q: "«Un argumento válido PUEDE tener premisas falsas.»", options: VF, answer: 0, why: ["Correcto: acá «puede» hace verdadera la afirmación. Si dijera «siempre tiene», sería falsa.", "La validez no exige premisas verdaderas."], errorKind: "palabra" }),
  g({ id: "t3", parcial: "1P", topicId: "t-ipc-seleccion-natural", mode: "trampa", q: "«La selección natural SIEMPRE produce organismos más complejos y perfectos.»", options: VF, answer: 1, why: ["«Siempre» y «perfectos» implican una meta o progreso.", "Correcto: la selección es ciega, sin meta ni dirección de progreso."], errorKind: "palabra" }),
  g({ id: "t4", parcial: "1P", topicId: "t-ipc-enunciados", mode: "trampa", q: "«Un enunciado universal NUNCA puede verificarse de manera concluyente con casos.»", options: VF, answer: 0, why: ["Correcto: acá «nunca» es la palabra justa: siempre puede haber un caso no observado.", "Ningún número finito de casos alcanza."], errorKind: "palabra" }),
  g({ id: "t5", parcial: "2P", topicId: "t-ipc-contrastacion", mode: "trampa", q: "«Si la consecuencia observacional falla, la hipótesis principal es DEFINITIVAMENTE falsa.»", options: VF, answer: 1, why: ["«Definitivamente» ignora las hipótesis auxiliares y condiciones iniciales.", "Correcto: cae la conjunción; puede haber fallado una HA o una CI."], errorKind: "palabra" }),
  g({ id: "t6", parcial: "1P", topicId: "t-ipc-condiciones", mode: "trampa", q: "«En ‹Si A, B›, A es ÚNICAMENTE condición suficiente de B, y no necesaria.»", options: VF, answer: 1, why: ["El condicional no dice que A no sea necesaria: solo dice que es suficiente.", "Correcto: «únicamente… y no necesaria» agrega algo que el condicional no afirma."], errorKind: "palabra" }),
];
