"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import type { CreatePageRequest } from "@/lib/editor-page-contract";

import styles from "../editor-shell.module.css";

function DialogShell({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className={styles.dialogBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div className={styles.dialogPanel}>
        <header>
          <h2>{title}</h2>
        </header>
        {children}
      </div>
    </div>
  );
}

export function UnsavedChangesDialog({
  isSaving,
  onCancel,
  onDiscard,
  onSaveAndContinue,
}: {
  isSaving: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onSaveAndContinue: () => void;
}) {
  return (
    <DialogShell onClose={onCancel} title="当前页面有未保存修改">
      <p className={styles.dialogDescription}>
        离开后，这些修改将无法恢复。你可以先保存，也可以明确放弃。
      </p>
      <div className={styles.dialogActions}>
        <button className={styles.ghostButton} onClick={onCancel} type="button">
          取消
        </button>
        <button
          className={styles.dangerButton}
          disabled={isSaving}
          onClick={onDiscard}
          type="button"
        >
          放弃修改
        </button>
        <button
          autoFocus
          className={styles.saveButton}
          disabled={isSaving}
          onClick={onSaveAndContinue}
          type="button"
        >
          {isSaving ? "保存中" : "保存并继续"}
        </button>
      </div>
    </DialogShell>
  );
}

export function LocalEditorTokenDialog({
  errorMessage,
  onClose,
  onSubmit,
}: {
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (token: string) => void;
}) {
  const [token, setToken] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalizedToken = token.trim();
    if (!normalizedToken) return;
    onSubmit(normalizedToken);
  };

  const describedBy = [
    "local-editor-token-help",
    errorMessage ? "local-editor-token-error" : null,
  ].filter(Boolean).join(" ");

  return (
    <DialogShell onClose={onClose} title="设置本机编辑 Token">
      <form onSubmit={submit}>
        <label className={styles.dialogField}>
          <span>本机编辑 Token</span>
          <input
            aria-describedby={describedBy}
            autoComplete="off"
            autoFocus
            onChange={(event) => setToken(event.currentTarget.value)}
            placeholder="粘贴 .env.local 中允许的 Token"
            spellCheck={false}
            type="password"
            value={token}
          />
          <small id="local-editor-token-help">
            仅保存在当前浏览器与当前站点地址，不会写入页面内容或 Git。
          </small>
        </label>
        {errorMessage && (
          <p className={styles.dialogError} id="local-editor-token-error" role="alert">
            {errorMessage}
          </p>
        )}
        <div className={styles.dialogActions}>
          <button className={styles.ghostButton} onClick={onClose} type="button">
            取消
          </button>
          <button
            className={styles.saveButton}
            disabled={!token.trim()}
            type="submit"
          >
            保存 Token 并重试
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

export function CreatePageDialog({
  errorMessage,
  isCreating,
  onClose,
  onSubmit,
  sourceSlug,
}: {
  errorMessage: string | null;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (request: CreatePageRequest) => void;
  sourceSlug: string;
}) {
  const [slug, setSlug] = useState("");
  const [mode, setMode] = useState<CreatePageRequest["mode"]>("blank");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) return;
    onSubmit(
      mode === "blank"
        ? { mode, slug: normalizedSlug }
        : { mode, slug: normalizedSlug, sourceSlug },
    );
  };

  return (
    <DialogShell onClose={onClose} title="新建页面">
      <form onSubmit={submit}>
        <label className={styles.dialogField}>
          <span>公开路径</span>
          <input
            aria-describedby={errorMessage ? "create-page-error" : undefined}
            autoFocus
            disabled={isCreating}
            onChange={(event) => setSlug(event.currentTarget.value)}
            placeholder="/new-page"
            value={slug}
          />
          <small>使用现有路径校验；不会覆盖同名页面。</small>
        </label>
        <fieldset className={styles.dialogOptions}>
          <legend>创建方式</legend>
          <label>
            <input
              checked={mode === "blank"}
              disabled={isCreating}
              name="create-mode"
              onChange={() => setMode("blank")}
              type="radio"
            />
            <span>
              <strong>空白页面</strong>
              <small>空内容、空 SEO，默认不被搜索引擎收录。</small>
            </span>
          </label>
          <label>
            <input
              checked={mode === "duplicate"}
              disabled={isCreating}
              name="create-mode"
              onChange={() => setMode("duplicate")}
              type="radio"
            />
            <span>
              <strong>复制当前已保存页面</strong>
              <small>保留内容与显示名称，生成新的组件 ID。</small>
            </span>
          </label>
        </fieldset>
        {errorMessage && (
          <p className={styles.dialogError} id="create-page-error" role="alert">
            {errorMessage}
          </p>
        )}
        <div className={styles.dialogActions}>
          <button
            className={styles.ghostButton}
            disabled={isCreating}
            onClick={onClose}
            type="button"
          >
            取消
          </button>
          <button
            className={styles.saveButton}
            disabled={isCreating || !slug.trim()}
            type="submit"
          >
            {isCreating ? "正在创建" : "创建页面"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
