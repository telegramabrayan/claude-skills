"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Gate } from "@/components/layout/Gate";
import { useSubjectTheme } from "@/lib/subjectTheme";
import { BackToIpc, FichaView, FichasView, IpcBlockView, IpcChecklist, IpcHub, IpcPractice, IpcQuick, IpcSimulator, TrapsView } from "@/components/ipc/IpcMission";
import { AuthorsView, CompareView, ConceptView, DiffsView, EBlockView, EChecklist, EmergencyHub, FlashView, MapsView, QuickView, ResumenView, TopView } from "@/components/ipc/Emergency";

function Router() {
  const p = useSearchParams();
  useSubjectTheme("ipc");
  const vista = p.get("vista");
  switch (vista) {
    // ── Modo emergencia (por defecto) ──
    case "bloque":
      return <EBlockView key={p.get("k") ?? ""} k={p.get("k") ?? ""} />;
    case "concepto":
      return <ConceptView key={p.get("id") ?? ""} id={p.get("id") ?? ""} />;
    case "quick":
      return <QuickView key={`${p.get("modo")}${p.get("tema")}`} modo={p.get("modo") ?? undefined} tema={p.get("tema") ?? undefined} />;
    case "top":
      return <TopView />;
    case "flash":
      return <FlashView />;
    case "resumen":
      return <ResumenView />;
    case "autores":
      return <AuthorsView />;
    case "comparar":
      return <CompareView />;
    case "diferencias":
      return <DiffsView />;
    case "mapas":
      return <MapsView />;
    // ── Modo clásico ──
    case "clasico":
      return <IpcHub />;
    case "clasico-bloque":
      return <IpcBlockView key={p.get("k") ?? ""} k={p.get("k") ?? ""} />;
    case "simulacro":
      return <IpcSimulator />;
    case "fichas":
      return <FichasView />;
    case "ficha":
      return <FichaView id={p.get("id") ?? ""} />;
    case "practicar":
      return <IpcPractice id={p.get("id") ?? "t-ipc-condiciones"} />;
    case "trampas":
      return <TrapsView />;
    case "importante":
    case "5min":
    case "errores":
    case "diagnostico":
      return <IpcQuick kind={vista} />;
    case "checklist":
      return <EChecklist />;
    case "checklist-clasico":
      return (
        <div className="mx-auto max-w-2xl space-y-4">
          <BackToIpc />
          <IpcChecklist />
        </div>
      );
    default:
      return <EmergencyHub />;
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
