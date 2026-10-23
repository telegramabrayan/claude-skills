"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Gate } from "@/components/layout/Gate";
import { useSubjectTheme } from "@/lib/subjectTheme";
import { BackToIpc, FichaView, FichasView, IpcBlockView, IpcChecklist, IpcHub, IpcPractice, IpcQuick, IpcSimulator, TrapsView } from "@/components/ipc/IpcMission";

function Router() {
  const p = useSearchParams();
  useSubjectTheme("ipc");
  const vista = p.get("vista");
  switch (vista) {
    case "bloque":
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
      return (
        <div className="mx-auto max-w-2xl space-y-4">
          <BackToIpc />
          <IpcChecklist />
        </div>
      );
    default:
      return <IpcHub />;
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
