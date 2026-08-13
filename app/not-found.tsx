import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-6xl font-bold gradient-text">404</p>
        <p className="mt-4 text-slate-500">This page could not be found.</p>
        <Link href="/" className="btn-primary mt-6">Back Home</Link>
      </div>
    </div>
  );
}
