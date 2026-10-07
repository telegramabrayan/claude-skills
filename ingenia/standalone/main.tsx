/** Punto de entrada de la versión de un solo archivo: mismas páginas, router por hash. */
import { createRoot } from "react-dom/client";
import type { ComponentType } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useLocation } from "./router";
import Home from "@/app/page";
import Bienvenida from "@/app/bienvenida/page";
import Diagnostico from "@/app/diagnostico/page";
import Mapa from "@/app/mapa/page";
import Materias from "@/app/materias/page";
import Practicar from "@/app/practicar/page";
import Repasar from "@/app/repasar/page";
import Entrenamiento from "@/app/entrenamiento/page";
import Laboratorio from "@/app/laboratorio/page";
import Juegos from "@/app/juegos/page";
import Examenes from "@/app/examenes/page";
import Profesor from "@/app/profesor/page";
import Estadisticas from "@/app/estadisticas/page";
import Errores from "@/app/errores/page";
import Logros from "@/app/logros/page";
import Perfil from "@/app/perfil/page";
import Configuracion from "@/app/configuracion/page";
import Formulas from "@/app/formulas/page";
import Diccionario from "@/app/diccionario/page";
import Buscar from "@/app/buscar/page";
import Camino from "@/app/camino/page";
import Desafio from "@/app/desafio/page";
import Tarjetas from "@/app/tarjetas/page";
import Plan from "@/app/plan/page";
import Guardados from "@/app/guardados/page";
import Taller from "@/app/taller/page";
import Biblioteca from "@/app/biblioteca/page";
import NotFound from "@/app/not-found";
import { LessonView } from "@/app/leccion/[id]/view";
import { SubjectView } from "@/app/materias/[id]/view";
import { getLesson } from "@/content/lessons";
import { getSubject } from "@/content/curriculum";

const ROUTES: Record<string, ComponentType> = {
  "/": Home,
  "/bienvenida": Bienvenida,
  "/diagnostico": Diagnostico,
  "/mapa": Mapa,
  "/materias": Materias,
  "/practicar": Practicar,
  "/repasar": Repasar,
  "/entrenamiento": Entrenamiento,
  "/laboratorio": Laboratorio,
  "/juegos": Juegos,
  "/examenes": Examenes,
  "/profesor": Profesor,
  "/estadisticas": Estadisticas,
  "/errores": Errores,
  "/logros": Logros,
  "/perfil": Perfil,
  "/configuracion": Configuracion,
  "/formulas": Formulas,
  "/diccionario": Diccionario,
  "/buscar": Buscar,
  "/camino": Camino,
  "/desafio": Desafio,
  "/tarjetas": Tarjetas,
  "/plan": Plan,
  "/guardados": Guardados,
  "/taller": Taller,
  "/biblioteca": Biblioteca,
};

function Router() {
  const { path, query } = useLocation();
  const lesson = path.match(/^\/leccion\/([\w-]+)$/);
  if (lesson && getLesson(lesson[1])) return <LessonView key={lesson[1]} id={lesson[1]} />;
  const subject = path.match(/^\/materias\/([\w-]+)$/);
  if (subject && getSubject(subject[1])) return <SubjectView key={subject[1]} id={subject[1]} />;
  const Page = ROUTES[path.replace(/\/$/, "") || "/"] ?? NotFound;
  return <Page key={`${path}?${query}`} />;
}

createRoot(document.getElementById("root")!).render(
  <AppShell>
    <Router />
  </AppShell>,
);
