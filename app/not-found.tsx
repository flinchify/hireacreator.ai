import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <h1 className="font-display text-6xl font-bold text-neutral-900 mb-2">404</h1>
        <p className="text-neutral-500 mb-6">This page doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
