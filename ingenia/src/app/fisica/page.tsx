"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Gate } from "@/components/layout/Gate";
import { FisicaHub } from "@/components/fisica/Hub";
import {
  AreaView,
  Checklist,
  DiagnosticView,
  ErrorsView,
  FormulasView,
  MaterialView,
  MethodCard,
  ModelsView,
  PlanView,
  PracticeView,
  QuickSessionView,
  SimulationsView,
  SimulatorView,
  TodayView,
} from "@/components/fisica/Views";
import { ResolveWithMe } from "@/components/fisica/ResolveWithMe";
import { BackToMission } from "@/components/fisica/ui";
import { useSubjectTheme } from "@/lib/subjectTheme";

function Router() {
  const p = useSearchParams();
  useSubjectTheme("fisica");
  const vista = p.get("vista");
  switch (vista) {
    case "diagnostico":
      return <DiagnosticView />;
    case "hoy":
      return <TodayView minutes={Number(p.get("min")) || 35} />;
    case "plan":
      return <PlanView />;
    case "simulacro":
      return <SimulatorView parcial={p.get("parcial") ?? undefined} />;
    case "sorpresa":
      return <SimulatorView parcial="sorpresa" />;
    case "modelos":
      return <ModelsView />;
    case "formulas":
      return <FormulasView />;
    case "tema":
      return <AreaView id={p.get("id") ?? ""} />;
    case "practicar":
      return <PracticeView tema={p.get("tema") ?? "t-mruv"} nivel={Number(p.get("nivel")) || undefined} gen={p.get("gen") ?? undefined} />;
    case "errores":
      return <ErrorsView />;
    case "importante":
    case "5min":
    case "queusarias":
    case "signos":
    case "unidades":
    case "graficos":
      return <QuickSessionView kind={vista} />;
    case "resolver":
      return <ResolveWithMe kind={p.get("tipo") ?? undefined} />;
    case "simulaciones":
      return <SimulationsView />;
    case "material":
      return <MaterialView />;
    case "checklist":
      return (
        <div className="mx-auto max-w-2xl space-y-4">
          <BackToMission />
          <Checklist />
          <MethodCard />
        </div>
      );
    default:
      return <FisicaHub />;
  }
}

export default function Page() {
  return (
    <Gate>
      <Suspense>
        <Router />
      </Suspense>
    </Gate>
  );
}
