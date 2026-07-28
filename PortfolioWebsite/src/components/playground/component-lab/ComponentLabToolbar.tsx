"use client";

import {
  Grid3X3,
  Minus,
  Plus,
  Redo2,
  Undo2,
} from "lucide-react";

import type { ComponentDesignBreakpoint } from "@/lib/component-design-v2";

const DEVICE_LABELS: Record<ComponentDesignBreakpoint, string> = {
  desktop: "桌面",
  mobile: "手机",
  tablet: "平板",
};

export type ComponentLabSaveState =
  | "error"
  | "idle"
  | "saved"
  | "saving";

export default function ComponentLabToolbar({
  activeDevice,
  canRedo,
  canUndo,
  onDeviceChange,
  onFit,
  onRedo,
  onSaveErrorClick,
  onToggleGrid,
  onUndo,
  onZoomIn,
  onZoomOut,
  saveState,
  showGrid,
  zoomPercent,
}: {
  activeDevice: ComponentDesignBreakpoint;
  canRedo: boolean;
  canUndo: boolean;
  onDeviceChange: (device: ComponentDesignBreakpoint) => void;
  onFit: () => void;
  onRedo: () => void;
  onSaveErrorClick?: () => void;
  onToggleGrid: () => void;
  onUndo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  saveState: ComponentLabSaveState;
  showGrid: boolean;
  zoomPercent: number;
}) {
  const saveLabel = saveState === "saving"
    ? "保存中"
    : saveState === "error"
      ? "保存失败"
      : "已保存";

  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
      <div className="flex items-center border border-white/10">
        {(["desktop", "tablet", "mobile"] as const).map((device) => (
          <button
            key={device}
            type="button"
            aria-pressed={activeDevice === device}
            onClick={() => onDeviceChange(device)}
            className={`min-h-8 px-3 text-[11px] transition-colors ${
              activeDevice === device
                ? "bg-white text-black"
                : "text-white/50 hover:text-white"
            }`}
          >
            {DEVICE_LABELS[device]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="撤销"
          disabled={!canUndo}
          onClick={onUndo}
          className="grid size-8 place-items-center text-white/55 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
        >
          <Undo2 aria-hidden="true" className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="重做"
          disabled={!canRedo}
          onClick={onRedo}
          className="grid size-8 place-items-center text-white/55 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
        >
          <Redo2 aria-hidden="true" className="size-3.5" />
        </button>
        <span className="mx-1 h-4 w-px bg-white/10" />
        <button
          type="button"
          aria-label="缩小画布"
          onClick={onZoomOut}
          className="grid size-8 place-items-center text-white/55 hover:bg-white/[0.05] hover:text-white"
        >
          <Minus aria-hidden="true" className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onFit}
          className="min-w-12 px-1 text-[11px] text-white/60 hover:text-white"
        >
          {zoomPercent}%
        </button>
        <button
          type="button"
          aria-label="放大画布"
          onClick={onZoomIn}
          className="grid size-8 place-items-center text-white/55 hover:bg-white/[0.05] hover:text-white"
        >
          <Plus aria-hidden="true" className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={showGrid ? "隐藏 12 栏网格" : "显示 12 栏网格"}
          aria-pressed={showGrid}
          onClick={onToggleGrid}
          className={`ml-1 grid size-8 place-items-center ${
            showGrid ? "bg-cyan-200/10 text-cyan-100" : "text-white/55"
          }`}
        >
          <Grid3X3 aria-hidden="true" className="size-3.5" />
        </button>
      </div>

      <button
        type="button"
        aria-label={onSaveErrorClick
          ? "保存失败，设置本机编辑 Token"
          : saveLabel}
        disabled={!onSaveErrorClick}
        onClick={onSaveErrorClick}
        className={`min-w-14 text-right text-[11px] ${
          saveState === "error"
            ? onSaveErrorClick
              ? "cursor-pointer text-red-300 underline decoration-red-300/40 underline-offset-4"
              : "cursor-default text-red-300"
            : saveState === "saving"
              ? "cursor-default text-amber-100"
              : "cursor-default text-white/40"
        }`}
      >
        <span role="status">{saveLabel}</span>
      </button>
    </div>
  );
}
