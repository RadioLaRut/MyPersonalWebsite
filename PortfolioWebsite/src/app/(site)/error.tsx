"use client";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-white">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold">作品内容加载失败</h1>
        <p className="mt-4 text-white/70">内容文件可能损坏或版本不兼容，请检查权威 JSON。</p>
        <button className="mt-8 underline underline-offset-4" onClick={reset} type="button">
          重新加载
        </button>
      </div>
    </main>
  );
}
