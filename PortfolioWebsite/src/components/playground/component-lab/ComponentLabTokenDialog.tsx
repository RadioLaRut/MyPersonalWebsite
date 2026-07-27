"use client";

import {
  type FormEvent,
  useEffect,
  useId,
  useState,
} from "react";

export default function ComponentLabTokenDialog({
  errorMessage,
  onClose,
  onSubmit,
}: {
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (token: string) => void;
}) {
  const titleId = useId();
  const helpId = useId();
  const errorId = useId();
  const [token, setToken] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedToken = token.trim();
    if (!normalizedToken) return;
    onSubmit(normalizedToken);
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center px-6">
      <button
        type="button"
        aria-label="关闭本机编辑 Token 对话框"
        className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative w-full max-w-[440px] border border-white/15 bg-[#080808] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.7)]"
        role="dialog"
      >
        <header className="border-b border-white/10 pb-4">
          <h2 id={titleId} className="text-sm font-medium text-white">
            设置本机编辑 Token
          </h2>
          <p className="mt-2 text-xs leading-5 text-white/50">
            ComponentLab 需要本机编辑权限才能保存当前修改。
          </p>
        </header>

        <form className="pt-4" onSubmit={submit}>
          <label className="grid gap-2 text-xs text-white/65">
            本机编辑 Token
            <input
              aria-describedby={[
                helpId,
                errorMessage ? errorId : null,
              ].filter(Boolean).join(" ")}
              autoComplete="off"
              autoFocus
              className="min-h-10 w-full border border-white/15 bg-black px-3 font-mono text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/45"
              onChange={(event) => setToken(event.currentTarget.value)}
              placeholder="输入本机允许的编辑 Token"
              spellCheck={false}
              type="password"
              value={token}
            />
          </label>
          <p id={helpId} className="mt-2 text-[11px] leading-5 text-white/40">
            Token 仅保存在当前浏览器与当前站点地址，不会写入页面内容或 Git。
          </p>
          {errorMessage ? (
            <p
              id={errorId}
              className="mt-3 border border-red-300/25 bg-red-300/[0.06] px-3 py-2 text-xs leading-5 text-red-200"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="min-h-9 border border-white/15 px-3 text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="min-h-9 bg-white px-3 text-xs font-medium text-black transition-colors hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!token.trim()}
            >
              保存 Token 并重试
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
