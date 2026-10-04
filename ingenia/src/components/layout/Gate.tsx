"use client";
import type { ReactNode } from "react";
import { useHydrated } from "@/lib/store";
import { Loading } from "../ui/primitives";

/** Espera a que el progreso se cargue del almacenamiento antes de mostrar la página. */
export function Gate({ children }: { children: ReactNode }) {
  return useHydrated() ? <>{children}</> : <Loading />;
}
