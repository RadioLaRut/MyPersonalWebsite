"use client";

import { PUBLIC_COPY } from "@/lib/public-copy";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-white">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold">{PUBLIC_COPY.errors.title}</h1>
        <p className="mt-4 text-white/70">{PUBLIC_COPY.errors.description}</p>
        <button className="mt-8 underline underline-offset-4" onClick={reset} type="button">
          {PUBLIC_COPY.errors.retry}
        </button>
      </div>
    </main>
  );
}
