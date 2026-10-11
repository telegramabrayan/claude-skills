/**
 * Análisis de los modelos de parcial de Física cargados en la plataforma
 * (claves de corrección de la cátedra Torti, UBA XXI, año 2023, aportadas
 * por el estudiante). Cada ejercicio está descripto con palabras propias: no
 * se reproducen los enunciados. Los porcentajes de la app se CALCULAN a
 * partir de esta lista; no hay ningún número cargado a mano.
 *
 * "twinOf" marca los temas gemelos (mismo examen con otros números): para
 * las frecuencias se cuentan los exámenes distintos, no las copias.
 */

export type Parcial = "1P" | "2P" | "final";

export type Feature =
  | "conversion" // hay que convertir unidades (km/h, g/cm³, L, t, cm)
  | "figura" // datos solo en la figura
  | "dosEtapas" // un ítem usa el resultado de otro
  | "dcl" // pide o exige diagrama de cuerpo libre
  | "infoExtra" // datos narrativos que no se usan
  | "dosMoviles" // dos cuerpos o móviles
  | "trig" // descomponer con seno/coseno
  | "grafico" // leer o dibujar un gráfico
  | "conceptual"; // ítem teórico (V/F, elegir diagrama)

export interface ExamItem {
  topicId: string;
  /** Qué se pide, con palabras propias. */
  pide: string;
  puntos: number;
}

export interface ExamExercise {
  n: number;
  resumen: string;
  subtema: string;
  items: ExamItem[];
  /** 1 (directo) a 5 (integrador). */
  dificultad: 1 | 2 | 3 | 4 | 5;
  formulas: string[];
  razonamiento: string;
  pasos: number;
  unidades: string[];
  previos: string[];
  trampas: string[];
  features: Feature[];
}

export interface ExamModel {
  id: string;
  parcial: Parcial;
  titulo: string;
  fecha: string;
  twinOf?: string;
  exercises: ExamExercise[];
}

const E = (x: ExamExercise) => x;

const P1_23_1_T2: ExamModel = {
  id: "1p-2023-1-t2",
  parcial: "1P",
  titulo: "1.er parcial 2023-1 · Tema 2",
  fecha: "2023-04-28",
  exercises: [
    E({ n: 1, resumen: "Dos trenes salen a la vez en el mismo sentido desde ciudades distintas; el más rápido alcanza al otro.", subtema: "Encuentro en MRU (mismo sentido)", items: [{ topicId: "t-encuentro", pide: "tiempo de alcance", puntos: 1.5 }, { topicId: "t-encuentro", pide: "posición del encuentro respecto de la ciudad de llegada", puntos: 1 }], dificultad: 3, formulas: ["x = x₀ + v·t"], razonamiento: "Plantear dos ecuaciones horarias e igualarlas.", pasos: 4, unidades: ["km/h", "km"], previos: ["t-despeje", "t-unidades"], trampas: ["Sumar velocidades cuando van en el mismo sentido", "Responder la distancia desde el origen y no desde donde pregunta"], features: ["dosMoviles", "dosEtapas", "infoExtra"] }),
    E({ n: 2, resumen: "Pileta muy profunda: presión en el fondo y un tubo de buceo apoyado en el fondo.", subtema: "Presión hidrostática y cuerpo apoyado en el fondo", items: [{ topicId: "t-presion", pide: "presión hidrostática en el fondo", puntos: 1.5 }, { topicId: "t-arquimedes", pide: "fuerza con la que se apoya en el fondo (P − E)", puntos: 1.5 }, { topicId: "t-arquimedes", pide: "diagrama de cuerpo libre", puntos: 1.5 }], dificultad: 3, formulas: ["p = δ·g·h", "E = V·δ_L·g", "N = P − E"], razonamiento: "Equilibrio de fuerzas con empuje.", pasos: 4, unidades: ["L → m³", "Pa"], previos: ["t-unidades", "t-newton"], trampas: ["No convertir litros a m³", "Olvidar el empuje: N ≠ P", "Sumar la presión atmosférica cuando piden la hidrostática"], features: ["conversion", "dcl", "infoExtra"] }),
    E({ n: 3, resumen: "Viga articulada en la pared, sostenida por una cuerda oblicua, con una campana colgada.", subtema: "Cuerpo rígido: equilibrio de momentos", items: [{ topicId: "t-momentos", pide: "tensión de la cuerda", puntos: 1.5 }, { topicId: "t-momentos", pide: "posición máxima de la carga para una tensión límite", puntos: 1.5 }], dificultad: 4, formulas: ["ΣM = 0", "M = F·d·sen θ"], razonamiento: "Tomar momentos respecto de la articulación; despejar una distancia en el segundo ítem.", pasos: 5, unidades: ["N", "m"], previos: ["t-trigonometria", "t-despeje"], trampas: ["Olvidar el peso propio de la viga (en el centro)", "Brazo de la tensión sin el sen θ"], features: ["figura", "trig", "dosEtapas"] }),
  ],
};

const P1_23_1_T4: ExamModel = {
  id: "1p-2023-1-t4",
  parcial: "1P",
  titulo: "1.er parcial 2023-1 · Tema 4",
  fecha: "2023-04-28",
  exercises: [
    E({ n: 1, resumen: "Prenda mojada colgada de dos cuerdas con ángulos distintos.", subtema: "Equilibrio de una partícula (dos cuerdas)", items: [{ topicId: "t-estatica-particula", pide: "tensión en cada cuerda", puntos: 2.5 }], dificultad: 3, formulas: ["ΣFx = 0", "ΣFy = 0"], razonamiento: "Sistema 2×2 con componentes.", pasos: 5, unidades: ["N"], previos: ["t-trigonometria", "t-vec-componentes"], trampas: ["Seno ↔ coseno según desde dónde se mide el ángulo", "Suponer que cada cuerda soporta la mitad del peso"], features: ["figura", "trig"] }),
    E({ n: 2, resumen: "Barco que flota vacío y cargado: elegir diagramas y calcular el volumen de agua desplazado.", subtema: "Flotación", items: [{ topicId: "t-arquimedes", pide: "asociar diagramas de cuerpo libre", puntos: 1 }, { topicId: "t-arquimedes", pide: "volumen desplazado al flotar", puntos: 1.5 }], dificultad: 2, formulas: ["E = P", "V = m/δ_L"], razonamiento: "Flotar ⇒ empuje = peso.", pasos: 3, unidades: ["g/cm³ → kg/m³", "t → kg", "L"], previos: ["t-unidades"], trampas: ["Toneladas y g/cm³ sin convertir", "Confundir volumen total con sumergido"], features: ["conversion", "dcl", "conceptual"] }),
    E({ n: 3, resumen: "Auto que ve un accidente: tiempo de reacción a velocidad constante y luego frena hasta detenerse.", subtema: "Reacción + frenado (MRU + MRUV)", items: [{ topicId: "t-frenado", pide: "distancia total recorrida", puntos: 2.5 }], dificultad: 3, formulas: ["d = v·t", "d = (v₀ + v)/2 · t"], razonamiento: "Dos tramos: uno uniforme y otro uniformemente variado.", pasos: 4, unidades: ["km/h → m/s", "m"], previos: ["t-mru", "t-mruv", "t-unidades"], trampas: ["No convertir km/h", "Olvidar el tramo de reacción"], features: ["conversion", "dosEtapas"] }),
    E({ n: 4, resumen: "Trampolín apoyado y articulado; conocida la fuerza en el apoyo, hallar la masa de la nadadora.", subtema: "Cuerpo rígido: momentos (incógnita inversa)", items: [{ topicId: "t-momentos", pide: "masa de la persona", puntos: 2.5 }], dificultad: 4, formulas: ["ΣM = 0"], razonamiento: "Momentos respecto de la articulación, despejando la masa.", pasos: 4, unidades: ["N", "kg"], previos: ["t-despeje", "t-newton"], trampas: ["Olvidar el peso del trampolín", "Dar peso en vez de masa"], features: ["figura"] }),
  ],
};

const P1_23_2_T2: ExamModel = {
  id: "1p-2023-2-t2",
  parcial: "1P",
  titulo: "1.er parcial 2023-2 · Tema 2",
  fecha: "2023-09-22",
  exercises: [
    E({ n: 1, resumen: "Objetos que caen en la Luna desde poca altura en un tiempo medido.", subtema: "Caída libre en otro astro", items: [{ topicId: "t-tiro-altura", pide: "aceleración de la gravedad lunar", puntos: 1 }, { topicId: "t-caida-libre", pide: "rapidez al llegar al suelo", puntos: 1 }, { topicId: "t-newton", pide: "fuerza de apoyo (peso en la Luna)", puntos: 1 }], dificultad: 2, formulas: ["h = ½·g·t²", "v = g·t", "P = m·g"], razonamiento: "Despejar g y reutilizarlo.", pasos: 3, unidades: ["m/s²", "N"], previos: ["t-despeje", "t-mruv"], trampas: ["Usar 9,80 en vez de la g lunar", "Masa ≠ peso"], features: ["dosEtapas", "infoExtra"] }),
    E({ n: 2, resumen: "Persona colgada en reposo de tres hilos (vertical, horizontal y oblicuo).", subtema: "Equilibrio de una partícula (tres hilos)", items: [{ topicId: "t-estatica-particula", pide: "tensión vertical", puntos: 1 }, { topicId: "t-estatica-particula", pide: "tensión horizontal", puntos: 1 }, { topicId: "t-estatica-particula", pide: "tensión del hilo oblicuo", puntos: 1 }], dificultad: 3, formulas: ["T·cos α = m·g", "ΣFx = 0"], razonamiento: "Nudo en equilibrio; ángulo medido desde la vertical.", pasos: 4, unidades: ["N"], previos: ["t-trigonometria"], trampas: ["Ángulo respecto de la pared (vertical): el coseno va con la vertical"], features: ["figura", "trig", "infoExtra"] }),
    E({ n: 3, resumen: "Esfera que flota con una fracción sumergida en un recipiente.", subtema: "Flotación y presión", items: [{ topicId: "t-arquimedes", pide: "empuje", puntos: 1.5 }, { topicId: "t-arquimedes", pide: "densidad del líquido", puntos: 1.5 }, { topicId: "t-presion", pide: "presión en el fondo", puntos: 1 }], dificultad: 3, formulas: ["V = 4/3·π·r³", "E = P", "δ_L = δ_c / fracción", "p = δ·g·h"], razonamiento: "Flotar ⇒ E = P; fracción sumergida = δc/δL.", pasos: 5, unidades: ["cm → m", "g/cm³"], previos: ["t-unidades", "t-potencias"], trampas: ["Radio en cm sin convertir", "Usar el volumen total para el empuje"], features: ["conversion", "figura", "dosEtapas"] }),
  ],
};

const P1_23_2_T4: ExamModel = {
  id: "1p-2023-2-t4",
  parcial: "1P",
  titulo: "1.er parcial 2023-2 · Tema 4",
  fecha: "2023-09-22",
  exercises: [
    E({ n: 1, resumen: "Tres fuerzas dibujadas en una cuadrícula: módulo, ángulo con +x y equilibrante.", subtema: "Vectores desde un gráfico", items: [{ topicId: "t-vec-componentes", pide: "módulo de una fuerza", puntos: 1 }, { topicId: "t-vec-componentes", pide: "ángulo con +x (cuadrante)", puntos: 1 }, { topicId: "t-vec-operaciones", pide: "módulo de la equilibrante", puntos: 1 }, { topicId: "t-vec-operaciones", pide: "dibujar la equilibrante", puntos: 1 }], dificultad: 3, formulas: ["|A| = √(Ax² + Ay²)", "θ = arctg(Ay/Ax) (+180° si Ax < 0)", "E = −ΣF"], razonamiento: "Leer componentes de la figura y operar.", pasos: 4, unidades: ["N", "°"], previos: ["t-pitagoras", "t-trigonometria"], trampas: ["No corregir el cuadrante", "Dar la resultante en vez de la equilibrante"], features: ["figura", "grafico", "trig"] }),
    E({ n: 2, resumen: "Persecución: uno pasa a velocidad constante y el otro arranca desde el reposo acelerando.", subtema: "Persecución (MRU vs MRUV)", items: [{ topicId: "t-frenado", pide: "tiempo de alcance", puntos: 1 }, { topicId: "t-frenado", pide: "distancia hasta alcanzarlo", puntos: 1 }, { topicId: "t-frenado", pide: "rapidez al alcanzarlo", puntos: 1 }], dificultad: 3, formulas: ["v·t = ½·a·t²", "v = a·t"], razonamiento: "Igualar posiciones (t = 2v/a).", pasos: 4, unidades: ["km/h → m/s"], previos: ["t-mru", "t-mruv", "t-unidades"], trampas: ["No convertir km/h", "Pensar que se alcanzan cuando tienen la misma velocidad"], features: ["dosMoviles", "conversion", "dosEtapas", "infoExtra"] }),
    E({ n: 3, resumen: "Prensa hidráulica con palanca: presión del líquido y masa que equilibra un vehículo.", subtema: "Pascal + palanca", items: [{ topicId: "t-presion", pide: "presión del líquido (sobre la atmosférica)", puntos: 1 }, { topicId: "t-presion", pide: "masa de la pesa en la palanca", puntos: 2 }], dificultad: 4, formulas: ["p = F/S", "F₁/S₁ = F₂/S₂", "ΣM = 0"], razonamiento: "Pascal y después momentos en la palanca.", pasos: 5, unidades: ["cm → m (diámetro)", "Pa"], previos: ["t-momentos", "t-unidades"], trampas: ["Tomar diámetro como radio", "Razón de diámetros en vez de áreas"], features: ["figura", "conversion", "dosEtapas"] }),
  ],
};

const P1_23_2_T6: ExamModel = {
  id: "1p-2023-2-t6",
  parcial: "1P",
  titulo: "1.er parcial 2023-2 · Tema 6",
  fecha: "2023-09-22",
  exercises: [
    E({ n: 1, resumen: "Recipiente con mercurio medido con regla; una esfera de cobre flota en él.", subtema: "Presión y fracción emergida", items: [{ topicId: "t-presion", pide: "diferencia de presión fondo–superficie", puntos: 1 }, { topicId: "t-arquimedes", pide: "porcentaje emergido", puntos: 1.5 }], dificultad: 3, formulas: ["p = δ·g·h", "fracción sumergida = δc/δL"], razonamiento: "Leer la altura de la figura; flotación.", pasos: 3, unidades: ["g/cm³ → kg/m³", "cm → m"], previos: ["t-unidades", "t-porcentajes"], trampas: ["Dar el % sumergido cuando piden el emergido"], features: ["figura", "conversion", "infoExtra"] }),
    E({ n: 2, resumen: "Equilibrista en una cuerda floja con tramos a distintos ángulos.", subtema: "Equilibrio de una partícula", items: [{ topicId: "t-estatica-particula", pide: "masa de la persona", puntos: 1.5 }], dificultad: 3, formulas: ["ΣFx = 0", "ΣFy = 0"], razonamiento: "Con una tensión conocida hallar la otra y luego el peso.", pasos: 4, unidades: ["N", "kg"], previos: ["t-trigonometria"], trampas: ["Ángulos respecto de la horizontal", "Dar peso en vez de masa"], features: ["figura", "trig"] }),
    E({ n: 3, resumen: "Trampolín con persona en el extremo: fuerza en el apoyo.", subtema: "Cuerpo rígido: momentos", items: [{ topicId: "t-momentos", pide: "fuerza en el apoyo", puntos: 1.5 }], dificultad: 3, formulas: ["ΣM = 0"], razonamiento: "Momentos respecto de la articulación.", pasos: 3, unidades: ["N"], previos: ["t-newton"], trampas: ["Olvidar el peso propio del trampolín"], features: ["figura"] }),
    E({ n: 4, resumen: "Gráfico v–t de un camión en varios tramos.", subtema: "Gráficos velocidad–tiempo", items: [{ topicId: "t-graficos-vt", pide: "aceleración en un tramo (pendiente)", puntos: 1 }, { topicId: "t-graficos-vt", pide: "distancia en un intervalo (área)", puntos: 1 }], dificultad: 2, formulas: ["a = Δv/Δt", "Δx = área bajo v(t)"], razonamiento: "Pendiente y área.", pasos: 2, unidades: ["m/s²", "m"], previos: ["t-recta"], trampas: ["Calcular el área de todo el gráfico y no del intervalo pedido", "La masa es un dato que sobra"], features: ["grafico", "infoExtra"] }),
    E({ n: 5, resumen: "Dos fuerzas dibujadas: ángulo entre ellas y producto vectorial.", subtema: "Ángulo entre vectores y producto vectorial", items: [{ topicId: "t-vec-operaciones", pide: "ángulo entre los vectores", puntos: 1 }, { topicId: "t-vec-operaciones", pide: "componente z de A×B", puntos: 1.5 }], dificultad: 3, formulas: ["(A×B)z = Ax·By − Ay·Bx", "cos α = A·B/(|A||B|)"], razonamiento: "Leer componentes y aplicar definiciones.", pasos: 3, unidades: ["N²", "°"], previos: ["t-producto-escalar"], trampas: ["Confundir producto escalar y vectorial", "Unidad N² en el vectorial"], features: ["figura", "grafico"] }),
  ],
};

const R1_23_1_T1: ExamModel = {
  id: "r1p-2023-1-t1",
  parcial: "1P",
  titulo: "Recuperatorio 1.er parcial 2023-1 · Tema 1",
  fecha: "2023-06-22",
  exercises: [
    E({ n: 1, resumen: "Dos vectores por componentes: resta, dibujo y ángulo con el eje +y.", subtema: "Resta de vectores y ángulo", items: [{ topicId: "t-vec-operaciones", pide: "módulo de B − A", puntos: 1 }, { topicId: "t-vec-operaciones", pide: "dibujar B − A", puntos: 1 }, { topicId: "t-vec-componentes", pide: "ángulo con +y", puntos: 1 }], dificultad: 2, formulas: ["B − A = (Bx − Ax; By − Ay)", "tg α = cateto opuesto/adyacente"], razonamiento: "Operar por componentes; ángulo con el eje vertical.", pasos: 3, unidades: ["°"], previos: ["t-pitagoras", "t-trigonometria"], trampas: ["Hacer A − B", "Medir el ángulo desde +x cuando piden +y"], features: ["grafico", "trig"] }),
    E({ n: 2, resumen: "Dos autos parten desde la misma distancia de una vía con velocidades distintas y deben cruzarla a la vez.", subtema: "Desfase en MRU", items: [{ topicId: "t-encuentro", pide: "cuánto después debe salir el rápido", puntos: 2 }], dificultad: 2, formulas: ["t = d/v"], razonamiento: "Diferencia de tiempos de viaje.", pasos: 3, unidades: ["km/h → m/s"], previos: ["t-unidades"], trampas: ["No convertir km/h", "Restar velocidades en vez de tiempos"], features: ["conversion", "dosMoviles", "infoExtra"] }),
    E({ n: 3, resumen: "Dos cuerpos iguales sumergidos a distinta profundidad: V/F sobre empuje y densidad, y presión.", subtema: "Empuje (conceptual) y presión", items: [{ topicId: "t-arquimedes", pide: "afirmaciones verdaderas sobre empuje y densidad", puntos: 1 }, { topicId: "t-presion", pide: "presión hidrostática a cierta profundidad", puntos: 1 }], dificultad: 2, formulas: ["E = V·δ_L·g", "p = δ·g·h"], razonamiento: "El empuje no depende de la profundidad si está totalmente sumergido.", pasos: 2, unidades: ["g/cm³ → kg/m³", "cm → m", "Pa"], previos: ["t-unidades"], trampas: ["Creer que a más profundidad hay más empuje"], features: ["conceptual", "figura", "conversion"] }),
    E({ n: 4, resumen: "Camión sobre básculas: centro de masa entre ejes y masa total.", subtema: "Cuerpo rígido: centro de masa", items: [{ topicId: "t-momentos", pide: "posición del centro de masa", puntos: 2 }, { topicId: "t-newton", pide: "masa del camión", puntos: 1 }], dificultad: 3, formulas: ["ΣM = 0", "P = m·g"], razonamiento: "Cada eje lleva dos ruedas; momentos respecto de un eje.", pasos: 4, unidades: ["N", "kg", "m"], previos: ["t-despeje"], trampas: ["Olvidar que cada eje tiene dos ruedas", "Medir desde el eje equivocado"], features: ["dosEtapas"] }),
  ],
};

const R1_23_1_T2: ExamModel = { ...R1_23_1_T1, id: "r1p-2023-1-t2", titulo: "Recuperatorio 1.er parcial 2023-1 · Tema 2", twinOf: "r1p-2023-1-t1" };

const P2_23_1_T1: ExamModel = {
  id: "2p-2023-1-t1",
  parcial: "2P",
  titulo: "2.º parcial 2023-1 · Tema 1",
  fecha: "2023-06-16",
  exercises: [
    E({ n: 1, resumen: "Dos clavadistas se dejan caer desde plataformas de distinta altura y deben llegar juntos.", subtema: "Caída libre: desfase de tiempos", items: [{ topicId: "t-caida-libre", pide: "cuánto después salta el de abajo", puntos: 2 }, { topicId: "t-caida-libre", pide: "rapidez al llegar al agua", puntos: 1 }], dificultad: 3, formulas: ["h = ½·g·t²", "v = √(2·g·h)"], razonamiento: "Calcular cada tiempo y restar.", pasos: 4, unidades: ["s", "m/s"], previos: ["t-despeje", "t-potencias"], trampas: ["Restar alturas y calcular un solo tiempo", "Elegir mal quién salta primero"], features: ["dosMoviles", "figura"] }),
    E({ n: 2, resumen: "Bloque sobre un plano inclinado rugoso: μ mínimo, aceleración al deslizar, trabajo del rozamiento y energía cinética.", subtema: "Plano inclinado con rozamiento + energía", items: [{ topicId: "t-plano-inclinado", pide: "μ estático mínimo", puntos: 1 }, { topicId: "t-plano-inclinado", pide: "aceleración con μ dinámico", puntos: 2 }, { topicId: "t-energia", pide: "trabajo del rozamiento", puntos: 2 }, { topicId: "t-energia", pide: "energía cinética tras recorrer cierta distancia", puntos: 2 }], dificultad: 4, formulas: ["μs = tg θ", "a = g(sen θ − μd·cos θ)", "W = F·d·cos 180°", "Ec = ½·m·v²"], razonamiento: "DCL, descomponer el peso, 2.ª ley y luego energía (o cinemática).", pasos: 7, unidades: ["J", "m/s²"], previos: ["t-trigonometria", "t-newton", "t-mruv"], trampas: ["Usar N = m·g en el plano", "Signo del trabajo del rozamiento", "μ estático ↔ dinámico"], features: ["figura", "trig", "dcl", "dosEtapas"] }),
  ],
};

const P2_23_1_T2: ExamModel = { ...P2_23_1_T1, id: "2p-2023-1-t2", titulo: "2.º parcial 2023-1 · Tema 2", twinOf: "2p-2023-1-t1" };

const P2_23_1_T4: ExamModel = {
  id: "2p-2023-1-t4",
  parcial: "2P",
  titulo: "2.º parcial 2023-1 · Tema 4",
  fecha: "2023-06-16",
  exercises: [
    E({ n: 1, resumen: "Lanzamiento oblicuo desde cierta altura: altura máxima, alcance, rapidez y ángulo al llegar.", subtema: "Tiro oblicuo desde una altura", items: [{ topicId: "t-tiro-altura", pide: "altura máxima respecto del suelo", puntos: 1 }, { topicId: "t-tiro-altura", pide: "alcance horizontal", puntos: 1 }, { topicId: "t-tiro-altura", pide: "rapidez al llegar al suelo", puntos: 2 }, { topicId: "t-tiro-altura", pide: "ángulo de llegada", puntos: 1 }], dificultad: 4, formulas: ["v₀x = v₀·cos θ", "v₀y = v₀·sen θ", "y = h₀ + v₀y·t − ½·g·t²", "resolvente"], razonamiento: "Separar en x (MRU) e y (MRUV); resolvente para el tiempo de vuelo.", pasos: 7, unidades: ["km/h → m/s", "°"], previos: ["t-cuadratica", "t-trigonometria", "t-unidades"], trampas: ["No sumar la altura inicial", "Raíz negativa del tiempo", "sen ↔ cos", "La masa sobra"], features: ["conversion", "trig", "dosEtapas", "infoExtra"] }),
    E({ n: 2, resumen: "Cuerpo que baja una colina sin rozamiento y frena en una zona rugosa.", subtema: "Energía con rozamiento", items: [{ topicId: "t-energia", pide: "energía cinética al pie de la colina", puntos: 1 }, { topicId: "t-energia", pide: "distancia hasta detenerse", puntos: 2 }, { topicId: "t-energia", pide: "trabajo del rozamiento en un tramo", puntos: 1 }, { topicId: "t-newton", pide: "aceleración en la zona rugosa", puntos: 1 }], dificultad: 4, formulas: ["Ec = m·g·H", "W_roz = −μd·m·g·d", "a = −μd·g"], razonamiento: "Conservación de energía y luego trabajo del rozamiento.", pasos: 5, unidades: ["J", "m"], previos: ["t-newton"], trampas: ["Usar μ estático para el frenado", "Signo de la aceleración"], features: ["figura", "dosEtapas"] }),
  ],
};

const R2_23_1_T1: ExamModel = {
  id: "r2p-2023-1-t1",
  parcial: "2P",
  titulo: "Recuperatorio 2.º parcial 2023-1 · Tema 1",
  fecha: "2023-06-22",
  exercises: [
    E({ n: 1, resumen: "Proyectil disparado desde el suelo con ángulo: altura máxima, tiempo de vuelo y alcance.", subtema: "Tiro oblicuo desde el suelo", items: [{ topicId: "t-tiro-oblicuo", pide: "altura máxima", puntos: 1 }, { topicId: "t-tiro-oblicuo", pide: "tiempo de vuelo", puntos: 1 }, { topicId: "t-tiro-oblicuo", pide: "alcance", puntos: 1 }], dificultad: 3, formulas: ["h = v₀y²/(2g)", "t = 2·v₀y/g", "x = v₀x·t"], razonamiento: "Descomponer y usar simetría.", pasos: 5, unidades: ["km/h → m/s"], previos: ["t-trigonometria", "t-unidades"], trampas: ["No convertir km/h", "Usar el tiempo de subida como tiempo total", "La masa sobra"], features: ["conversion", "trig", "infoExtra", "dosEtapas"] }),
    E({ n: 2, resumen: "Carrito de montaña rusa que pasa por dos puntos a distinta altura y rapidez.", subtema: "Trabajo del rozamiento = ΔEm", items: [{ topicId: "t-energia", pide: "trabajo del rozamiento entre los puntos", puntos: 2 }], dificultad: 3, formulas: ["W_roz = ΔEc + ΔEp"], razonamiento: "Variación de energía mecánica.", pasos: 4, unidades: ["km/h → m/s", "J"], previos: ["t-unidades"], trampas: ["Omitir el término m·g·Δh", "Signo del trabajo", "No convertir km/h"], features: ["conversion", "figura"] }),
    E({ n: 3, resumen: "Bloque en plano inclinado liso unido por cuerda y polea a otro sobre superficie rugosa.", subtema: "Cuerpos vinculados", items: [{ topicId: "t-vinculados", pide: "masa mínima para que no se mueva", puntos: 1.5 }, { topicId: "t-vinculados", pide: "aceleración del sistema", puntos: 1 }, { topicId: "t-vinculados", pide: "tensión de la cuerda", puntos: 1 }, { topicId: "t-vinculados", pide: "diagrama de cuerpo libre", puntos: 1.5 }], dificultad: 4, formulas: ["m_B·g·μs = m_A·g·sen θ", "a = (m_A·g·sen θ − μd·m_B·g)/(m_A + m_B)", "T − Froz = m_B·a"], razonamiento: "DCL de cada cuerpo, 2.ª ley al sistema y a un cuerpo.", pasos: 6, unidades: ["N", "m/s²"], previos: ["t-plano-inclinado", "t-newton"], trampas: ["Usar μ dinámico para la condición de reposo", "Tensión = peso colgante"], features: ["figura", "trig", "dcl", "dosMoviles", "dosEtapas"] }),
  ],
};

const R2_23_1_T2: ExamModel = { ...R2_23_1_T1, id: "r2p-2023-1-t2", titulo: "Recuperatorio 2.º parcial 2023-1 · Tema 2", twinOf: "r2p-2023-1-t1" };

const F_23_T1: ExamModel = {
  id: "final-2023-07-t1",
  parcial: "final",
  titulo: "Final julio 2023 · Tema 1",
  fecha: "2023-07-14",
  exercises: [
    E({ n: 1, resumen: "Cohete de fiesta que acelera con motor y luego sigue subiendo y cae libremente.", subtema: "Integrador: MRUV + caída libre + energía + dinámica", items: [{ topicId: "t-mruv", pide: "rapidez al apagarse el motor", puntos: 1 }, { topicId: "t-caida-libre", pide: "altura máxima", puntos: 1 }, { topicId: "t-energia", pide: "energía mecánica", puntos: 1 }, { topicId: "t-caida-libre", pide: "tiempo de caída", puntos: 1 }, { topicId: "t-newton", pide: "fuerza del motor", puntos: 1 }], dificultad: 5, formulas: ["h = ½·a·t²", "v = a·t", "h = v²/(2g)", "Em = Ec + Ep", "F − m·g = m·a"], razonamiento: "Dos etapas; la segunda usa el resultado de la primera.", pasos: 8, unidades: ["g → kg", "J", "N"], previos: ["t-mruv", "t-newton"], trampas: ["F = m·a sin el peso", "Olvidar sumar la altura de la primera etapa", "Masa en gramos"], features: ["dosEtapas", "conversion"] }),
    E({ n: 2, resumen: "Caja arrastrada con una soga que incluye un resorte, sobre piso rugoso.", subtema: "Integrador: rozamiento + resorte + trabajo + potencia", items: [{ topicId: "t-resorte-potencia", pide: "estiramiento al empezar a moverse", puntos: 1 }, { topicId: "t-resorte-potencia", pide: "energía elástica", puntos: 1 }, { topicId: "t-energia", pide: "trabajo del rozamiento", puntos: 1 }, { topicId: "t-energia", pide: "trabajo de la tensión", puntos: 1 }, { topicId: "t-resorte-potencia", pide: "potencia", puntos: 1 }], dificultad: 5, formulas: ["k·Δx = μs·m·g", "Eel = ½·k·Δx²", "W = F·d·cos θ", "P = W/t"], razonamiento: "Rozamiento estático para arrancar; dinámico a velocidad constante.", pasos: 6, unidades: ["J", "W"], previos: ["t-newton", "t-plano-inclinado"], trampas: ["μ estático ↔ dinámico", "Signos de los trabajos"], features: ["figura", "dosEtapas"] }),
  ],
};

const F_23_T2: ExamModel = { ...F_23_T1, id: "final-2023-07-t2", titulo: "Final julio 2023 · Tema 2", twinOf: "final-2023-07-t1" };

export const EXAM_MODELS: ExamModel[] = [P1_23_1_T2, P1_23_1_T4, P1_23_2_T2, P1_23_2_T4, P1_23_2_T6, R1_23_1_T1, R1_23_1_T2, P2_23_1_T1, P2_23_1_T2, P2_23_1_T4, R2_23_1_T1, R2_23_1_T2, F_23_T1, F_23_T2];

/** Exámenes distintos (sin contar los temas gemelos). */
export const distinctModels = (p?: Parcial) => EXAM_MODELS.filter((m) => !m.twinOf && (!p || m.parcial === p));

export const FEATURE_LABELS: Record<Feature, string> = {
  conversion: "Hay que convertir unidades (km/h, g/cm³, litros, toneladas, cm)",
  figura: "Datos que solo están en la figura (ángulos, alturas, distancias)",
  dosEtapas: "Un ítem usa el resultado de otro (dos etapas)",
  dcl: "Diagrama de cuerpo libre (pedido o imprescindible)",
  infoExtra: "Datos que sobran (historia, masa que no se usa)",
  dosMoviles: "Dos móviles o dos cuerpos",
  trig: "Descomponer con seno y coseno",
  grafico: "Leer o dibujar un gráfico",
  conceptual: "Ítem conceptual (verdadero/falso, elegir un diagrama)",
};

export interface TopicStat {
  topicId: string;
  /** Exámenes distintos donde aparece. */
  models: number;
  total: number;
  share: number;
  points: number;
  items: number;
  subtemas: string[];
}

/** Frecuencia de cada tema en los exámenes distintos (por parcial o global). */
export function topicStats(p?: Parcial): TopicStat[] {
  const models = distinctModels(p);
  const map = new Map<string, TopicStat>();
  for (const m of models) {
    const seen = new Set<string>();
    for (const ex of m.exercises)
      for (const it of ex.items) {
        const st = map.get(it.topicId) ?? { topicId: it.topicId, models: 0, total: models.length, share: 0, points: 0, items: 0, subtemas: [] };
        if (!seen.has(it.topicId)) {
          st.models++;
          seen.add(it.topicId);
        }
        st.points += it.puntos;
        st.items++;
        if (!st.subtemas.includes(ex.subtema)) st.subtemas.push(ex.subtema);
        map.set(it.topicId, st);
      }
  }
  return [...map.values()].map((s) => ({ ...s, share: s.models / s.total })).sort((a, b) => b.share - a.share || b.points - a.points);
}

/** Qué fracción de los ejercicios (de exámenes distintos) tiene cada característica. */
export function featureStats(p?: Parcial): { feature: Feature; count: number; total: number; share: number }[] {
  const exs = distinctModels(p).flatMap((m) => m.exercises);
  const keys = Object.keys(FEATURE_LABELS) as Feature[];
  return keys.map((f) => {
    const count = exs.filter((e) => e.features.includes(f)).length;
    return { feature: f, count, total: exs.length, share: exs.length ? count / exs.length : 0 };
  }).sort((a, b) => b.share - a.share);
}

/** Trampas, agrupadas por categoría de error, con en cuántos ejercicios aparecen. */
export const TRAP_CATEGORIES: { key: string; label: string; match: RegExp; topic: string }[] = [
  { key: "unidades", label: "Unidades sin convertir (km/h, g/cm³, litros, cm, gramos, toneladas)", match: /convert|km\/h|litros|toneladas|cm|gramos|g\/cm/i, topic: "t-unidades" },
  { key: "trig", label: "Seno ↔ coseno según desde dónde se mide el ángulo", match: /seno|sen ↔|sen θ|coseno|ángulo/i, topic: "t-vec-componentes" },
  { key: "peso", label: "Olvidar un peso (propio, de la viga) o usar F = m·a sin el peso", match: /peso|F = m·a/i, topic: "t-newton" },
  { key: "mu", label: "μ estático ↔ μ dinámico", match: /μ/i, topic: "t-plano-inclinado" },
  { key: "signo", label: "Signo del trabajo o de la aceleración", match: /signo/i, topic: "t-fis-signos" },
  { key: "normal", label: "Normal = m·g en el plano inclinado", match: /N = m·g/i, topic: "t-plano-inclinado" },
  { key: "pregunta", label: "Responder otra cosa (sumergido/emergido, resultante/equilibrante, desde otro punto)", match: /cuando piden|en vez de|desde el origen|A − B|resultante/i, topic: "t-arquimedes" },
  { key: "etapas", label: "Olvidar un tramo o la altura inicial", match: /olvidar el tramo|altura inicial|sumar la altura|tiempo de subida/i, topic: "t-frenado" },
];

export function trapStats(p?: Parcial) {
  const exs = distinctModels(p).flatMap((m) => m.exercises);
  return TRAP_CATEGORIES.map((c) => ({ ...c, count: exs.filter((e) => e.trampas.some((t) => c.match.test(t))).length, total: exs.length })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
}
