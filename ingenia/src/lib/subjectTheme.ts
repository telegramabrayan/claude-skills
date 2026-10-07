"use client";
import { useEffect } from "react";
import { subjectKey } from "@/components/ui/SubjectArt";

/** Pinta la app con la identidad de la materia (color de los doodles del fondo y acentos). */
export function useSubjectTheme(subjectId: string | undefined | null) {
  useEffect(() => {
    if (!subjectId) return;
    const el = document.documentElement;
    const key = subjectKey(subjectId);
    el.dataset.subject = key;
    return () => {
      if (el.dataset.subject === key) delete el.dataset.subject;
    };
  }, [subjectId]);
}
