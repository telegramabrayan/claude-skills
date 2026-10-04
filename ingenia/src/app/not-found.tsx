import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="math text-6xl">∄</p>
      <h1 className="mt-4 text-2xl font-bold">Esta página no existe</h1>
      <p className="mt-2 text-muted">(«∄» significa «no existe».)</p>
      <Link href="/" className="btn btn-primary mt-6">
        Volver al inicio
      </Link>
    </div>
  );
}
