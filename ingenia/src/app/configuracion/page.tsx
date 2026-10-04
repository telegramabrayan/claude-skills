"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { actions, store, useProgress } from "@/lib/store";
import { exportJson, importJson } from "@/lib/storage";
import { Gate } from "@/components/layout/Gate";
import { PageHeader, SectionTitle } from "@/components/ui/primitives";

function Settings() {
  const s = useProgress();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const download = () => {
    const blob = new Blob([exportJson(store.getState())], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ingenia-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const upload = async (f: File) => {
    try {
      actions.replaceState(importJson(await f.text()));
      setMsg("Respaldo restaurado.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Configuración" />
      <SectionTitle>Apariencia</SectionTitle>
      <div className="card flex flex-wrap gap-2 p-4" role="radiogroup" aria-label="Tema">
        {([["light", "☀️ Claro"], ["dark", "🌙 Oscuro"], ["system", "Automático"]] as const).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={s.settings.theme === k} className={`btn ${s.settings.theme === k ? "btn-primary" : "btn-secondary"}`} onClick={() => actions.updateSettings({ theme: k })}>
            {l}
          </button>
        ))}
      </div>

      <SectionTitle>Juego</SectionTitle>
      <div className="card space-y-4 p-4">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-semibold">Corazones en los desafíos</span>
            <span className="text-sm text-muted">Cada error en un desafío quita un corazón. Las lecciones y prácticas normales nunca quitan corazones.</span>
          </span>
          <input type="checkbox" className="h-6 w-6 accent-[var(--primary)]" checked={s.settings.hearts} onChange={(e) => actions.updateSettings({ hearts: e.target.checked })} />
        </label>
        <label className="block">
          <span className="font-semibold">Meta diaria</span>
          <select className="input mt-1" value={s.settings.dailyMinutes} onChange={(e) => actions.updateSettings({ dailyMinutes: Number(e.target.value) })}>
            {[5, 10, 15, 20, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} minutos por día
              </option>
            ))}
          </select>
        </label>
      </div>

      <SectionTitle>Tus datos</SectionTitle>
      <div className="card space-y-3 p-4">
        <p className="text-sm text-muted">Tu progreso se guarda en este navegador. Descargá un respaldo para no perderlo o para pasarlo a otro dispositivo.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-secondary" onClick={download}>
            Descargar respaldo
          </button>
          <button className="btn btn-secondary" onClick={() => file.current?.click()}>
            Restaurar respaldo
          </button>
          <input ref={file} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
        {msg && <p className="text-sm" role="status">{msg}</p>}
        <hr className="border-line" />
        <button
          className="btn btn-ghost !text-danger"
          onClick={async () => {
            if (window.confirm("¿Borrar todo tu progreso? Esta acción no se puede deshacer.")) {
              await actions.reset();
              router.replace("/bienvenida");
            }
          }}
        >
          Borrar todo el progreso
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Settings />
    </Gate>
  );
}
