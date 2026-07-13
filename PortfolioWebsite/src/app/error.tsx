"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-white">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold">页面暂时无法显示</h1>
        <p className="mt-4 text-white/70">内容读取或渲染失败，这不是“页面不存在”。</p>
        {error.digest ? <p className="mt-3 text-xs text-white/40">错误标识：{error.digest}</p> : null}
        <button className="mt-8 underline underline-offset-4" onClick={reset} type="button">
          重试
        </button>
      </div>
    </main>
  );
}
