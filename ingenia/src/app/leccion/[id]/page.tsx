import { notFound } from "next/navigation";
import { LESSONS, getLesson } from "@/content/lessons";
import { LessonView } from "./view";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: getLesson(id)?.title ?? "Lección" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getLesson(id)) notFound();
  return <LessonView id={id} />;
}
