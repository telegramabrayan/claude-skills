"use client";
import { useState } from "react";
import { Gate } from "@/components/layout/Gate";
import { PageHeader } from "@/components/ui/primitives";
import { EnergyLab, KinematicsLab, NewtonLab, PressureLab, VectorsLab } from "@/components/lab/PhysicsLabs";
import { DerivativeLab, FunctionLab, IntegralLab, LimitLab, SystemLab } from "@/components/lab/MathLabs";
import { CodeLab } from "@/components/lab/CodeLab";

const AREAS = {
  fisica: {
    label: "Física",
    labs: [
      { id: "cinematica", title: "Movimiento", text: "MRU, MRUV, frenado y tiro vertical", C: KinematicsLab },
      { id: "vectores", title: "Vectores", text: "Componentes, módulo y suma", C: VectorsLab },
      { id: "newton", title: "Fuerzas y Newton", text: "F = m·a con rozamiento", C: NewtonLab },
      { id: "energia", title: "Trabajo y energía", text: "Conservación de la energía", C: EnergyLab },
      { id: "presion", title: "Hidrostática", text: "Presión y profundidad", C: PressureLab },
    ],
  },
  matematica: {
    label: "Matemática",
    labs: [
      { id: "funciones", title: "Funciones", text: "Fórmula ↔ gráfico", C: FunctionLab },
      { id: "limites", title: "Límites", text: "Acercarse sin llegar", C: LimitLab },
      { id: "derivadas", title: "Derivadas", text: "La pendiente de la tangente", C: DerivativeLab },
      { id: "integrales", title: "Integrales", text: "Área con rectángulos", C: IntegralLab },
      { id: "sistemas", title: "Sistemas 2×2", text: "Dos rectas que se cortan", C: SystemLab },
    ],
  },
  programacion: {
    label: "Programación",
    labs: [{ id: "codigo", title: "Editor paso a paso", text: "Ejecutá y mirá las variables", C: CodeLab }],
  },
} as const;

type Area = keyof typeof AREAS;

function Lab() {
  const [area, setArea] = useState<Area>("fisica");
  const [lab, setLab] = useState<string>(AREAS.fisica.labs[0].id);
  const labs = AREAS[area].labs;
  const current = labs.find((l) => l.id === lab) ?? labs[0];
  const C = current.C;
  return (
    <div>
      <PageHeader title="Laboratorio" subtitle="Experimentá: cambiá variables y mirá qué pasa. Lo que se ve, se entiende." />
      <div className="mb-4 flex gap-1 rounded-xl bg-surface-2 p-1" role="tablist" aria-label="Áreas del laboratorio">
        {(Object.keys(AREAS) as Area[]).map((a) => (
          <button
            key={a}
            role="tab"
            aria-selected={a === area}
            onClick={() => {
              setArea(a);
              setLab(AREAS[a].labs[0].id);
            }}
            className={`min-h-10 flex-1 rounded-lg text-sm font-semibold ${a === area ? "bg-surface shadow" : "text-muted"}`}
          >
            {AREAS[a].label}
          </button>
        ))}
      </div>
      {labs.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {labs.map((l) => (
            <button key={l.id} onClick={() => setLab(l.id)} className={`shrink-0 rounded-xl border px-3 py-2 text-left ${l.id === current.id ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}>
              <span className="block text-sm font-bold">{l.title}</span>
              <span className="block text-xs text-muted">{l.text}</span>
            </button>
          ))}
        </div>
      )}
      <div className="card p-4 sm:p-6" role="tabpanel">
        <h2 className="mb-4 text-xl font-bold">{current.title}</h2>
        <C key={current.id} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Lab />
    </Gate>
  );
}
