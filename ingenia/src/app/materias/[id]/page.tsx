import { notFound } from "next/navigation";
import { SUBJECTS, getSubject } from "@/content/curriculum";
import { SubjectView } from "./view";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: getSubject(id)?.name ?? "Materia" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getSubject(id)) notFound();
  return <SubjectView id={id} />;
}
