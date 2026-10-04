import type { OfficialInfo } from "@/engine/types";

const LABEL: Record<OfficialInfo["status"], { text: string; cls: string }> = {
  verificado: { text: "Verificado contra fuente oficial", cls: "!bg-success-soft !text-success" },
  parcial: { text: "Verificado en parte", cls: "!bg-warn-soft !text-warn" },
  pendiente: { text: "Pendiente de verificación", cls: "!bg-danger-soft !text-danger" },
};

/** Muestra con honestidad qué tan confirmado está un dato académico y de dónde sale. */
export function OfficialBox({ info, title = "Información académica" }: { info: OfficialInfo; title?: string }) {
  const l = LABEL[info.status];
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">{title}</p>
        <span className={`chip ${l.cls}`}>{l.text}</span>
      </div>
      {info.note && <p className="mt-2 text-muted">{info.note}</p>}
      {info.sources.length > 0 && (
        <ul className="mt-2 space-y-1">
          {info.sources.map((s) => (
            <li key={s.label}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                  {s.label}
                </a>
              ) : (
                s.label
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-muted">Última revisión: {new Date(info.lastChecked + "T12:00:00").toLocaleDateString("es-AR")}</p>
    </div>
  );
}
