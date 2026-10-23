"use client";
/**
 * Explica por qué el profesor no responde con IA y ofrece el arreglo:
 * dar el permiso, reactivarlo o abrir Ingenia desde claude.ai.
 */
import { useEffect, useState } from "react";
import { aiAvailability, ARTIFACT_URL, managePermissions, requestAi, type AiAvailability } from "@/lib/ai";

export function AiStatus({ onReady }: { onReady: () => void }) {
  const [st, setSt] = useState<AiAvailability | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    void aiAvailability().then(setSt);
  }, []);
  if (!st || st === "granted") return null;
  const box = "rounded-xl bg-surface-2 p-3 text-sm space-y-2";
  if (st === "outside")
    return (
      <div className={box}>
        <p>
          <b>El profesor con IA no funciona en esta página.</b> Estás usando Ingenia fuera del visor de claude.ai (abierta sola en el navegador o como archivo). Acá tampoco se guarda tu progreso en la nube.
        </p>
        <p>Abrila desde el link de claude.ai, con tu cuenta iniciada. Mientras tanto te respondo con el contenido de la plataforma.</p>
        <a href={ARTIFACT_URL} target="_top" rel="noopener" className="btn btn-primary !min-h-10 text-sm">
          Abrir Ingenia en claude.ai
        </a>
      </div>
    );
  if (st === "prompt")
    return (
      <div className={box}>
        <p>Para que el profesor te responda con IA, Claude necesita tu permiso (una sola vez).</p>
        <button
          className="btn btn-primary !min-h-10 text-sm"
          onClick={async () => {
            const r = await requestAi();
            setSt(r);
            if (r === "granted") onReady();
          }}
        >
          Activar el profesor
        </button>
      </div>
    );
  if (st === "denied")
    return (
      <div className={box}>
        <p>El permiso del profesor con IA está desactivado para esta app. Activalo y volvé a preguntar.</p>
        <button
          className="btn btn-primary !min-h-10 text-sm"
          onClick={async () => {
            const ok = await managePermissions();
            if (!ok) setMsg("No se pudo abrir el panel. Buscá «Permisos» en el menú de la app en claude.ai.");
            const r = await aiAvailability();
            setSt(r);
            if (r === "granted") onReady();
          }}
        >
          Revisar permisos
        </button>
        {msg && <p className="text-xs text-muted">{msg}</p>}
      </div>
    );
  return (
    <div className={box}>
      <p>En esta vista el profesor con IA no está disponible (puede pasar en algunos navegadores o en la vista previa). Probalo desde la app de Claude o desde claude.ai en Chrome o Safari actualizados. Mientras tanto te respondo con el contenido de la plataforma.</p>
    </div>
  );
}
