"use client";
import Link from "next/link";
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
  const [confirmReset, setConfirmReset] = useState(false);
  const [pasted, setPasted] = useState("");
  // Dentro de un visor embebido (p. ej. claude.ai) las descargas están bloqueadas.
  const [canDownload] = useState(() => {
    try {
      return window.self === window.top;
    } catch {
      return false;
    }
  });

  const copy = async () => {
    const text = exportJson(store.getState());
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Respaldo copiado. Pegalo en una nota o un mail para guardarlo.");
    } catch {
      setPasted(text);
      setMsg("No pude copiar automáticamente: seleccioná el texto de abajo y copialo.");
    }
  };

  const restoreText = () => {
    try {
      actions.replaceState(importJson(pasted));
      setMsg("Respaldo restaurado.");
      setPasted("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Ese texto no es un respaldo válido.");
    }
  };

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
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-semibold">Sonidos</span>
            <span className="text-sm text-muted">Sonidos cortos y discretos al acertar, equivocarte o subir de nivel.</span>
          </span>
          <input type="checkbox" className="h-6 w-6 accent-[var(--primary)]" checked={s.settings.sound} onChange={(e) => actions.updateSettings({ sound: e.target.checked })} />
        </label>
        <p className="text-sm">
          Colores y estilo del guía:{" "}
          <Link href="/taller" className="font-semibold text-primary">
            Taller
          </Link>
          .
        </p>
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
          <button className="btn btn-secondary" onClick={copy}>
            Copiar respaldo
          </button>
          {canDownload && (
            <button className="btn btn-secondary" onClick={download}>
              Descargar respaldo
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => file.current?.click()}>
            Restaurar respaldo
          </button>
          <input ref={file} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
        {msg && <p className="text-sm" role="status">{msg}</p>}
        <label className="block">
          <span className="text-sm font-semibold">Restaurar pegando el texto del respaldo</span>
          <textarea id="respaldo" className="input mt-1 min-h-24 font-mono text-xs" value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Pegá acá el respaldo copiado" />
        </label>
        <button className="btn btn-secondary" onClick={restoreText} disabled={!pasted.trim()}>
          Restaurar desde el texto
        </button>
        <hr className="border-line" />
        {confirmReset ? (
          <div className="rounded-xl bg-danger-soft p-3">
            <p className="font-semibold">¿Borrar todo tu progreso? No se puede deshacer.</p>
            <div className="mt-2 flex gap-2">
              <button
                className="btn btn-primary !bg-danger"
                onClick={async () => {
                  await actions.reset();
                  router.replace("/bienvenida");
                }}
              >
                Sí, borrar todo
              </button>
              <button className="btn btn-secondary" onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-ghost !text-danger" onClick={() => setConfirmReset(true)}>
            Borrar todo el progreso
          </button>
        )}
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
