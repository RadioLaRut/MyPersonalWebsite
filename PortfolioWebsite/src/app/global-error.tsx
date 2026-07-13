"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-black text-white">
        <main className="grid min-h-screen place-items-center px-6 text-center">
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold">站点配置读取失败</h1>
            <p className="mt-4 text-white/70">
              页面配置暂时无法加载，请重试。若问题持续出现，请检查权威 JSON 的版本与结构。
            </p>
            {error.digest ? (
              <p className="mt-3 font-mono text-xs text-white/40">错误编号：{error.digest}</p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="mt-8 border border-white/30 px-5 py-3 text-sm transition-colors hover:bg-white hover:text-black"
            >
              重新加载
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
