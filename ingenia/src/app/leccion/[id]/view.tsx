"use client";
import { getLesson } from "@/content/lessons";
import { Gate } from "@/components/layout/Gate";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export function LessonView({ id }: { id: string }) {
  const lesson = getLesson(id)!;
  return (
    <Gate>
      <LessonPlayer key={id} lesson={lesson} />
    </Gate>
  );
}
