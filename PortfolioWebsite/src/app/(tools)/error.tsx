"use client";

export default function ToolsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-950 px-6 text-white">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold">内部工具加载失败</h1>
        <p className="mt-4 text-white/70">请检查测试模式、内容契约和本地配置文件。</p>
        <button className="mt-8 underline underline-offset-4" onClick={reset} type="button">
          重试
        </button>
      </div>
    </main>
  );
}
