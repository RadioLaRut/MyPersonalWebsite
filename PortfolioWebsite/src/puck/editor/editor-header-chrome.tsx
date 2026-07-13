import { memo, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react/dist/cjs/lucide-react.js";

import { MotionButton } from "@/components/motion";
import type { FontLabSyncState } from "./types";
import { splitPublicPathSegments } from "@/lib/public-paths";

const FONT_LAB_SYNC_LABEL: Record<FontLabSyncState, string> = {
  idle: "FontLab Synced",
  synced: "FontLab Synced",
  error: "FontLab Sync Failed",
};

const FONT_LAB_SYNC_TONE: Record<FontLabSyncState, string> = {
  idle: "text-slate-400",
  synced: "text-slate-400",
  error: "text-amber-600",
};

function HeaderActionsWithOpenPage({
  children,
  onOpenPublicPage,
}: {
  children: ReactNode;
  onOpenPublicPage: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {children}
      <MotionButton
        type="button"
        onClick={onOpenPublicPage}
        interactionPreset="lightButton"
        className="rounded-sm border border-slate-200 bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-950"
      >
        OPEN PAGE
      </MotionButton>
    </div>
  );
}

type TreeNode = {
  path: string;
  name: string;
  children: TreeNode[];
  isExactMatch: boolean;
};

function buildTree(paths: string[]) {
  const root: TreeNode = { path: "/", name: "Root (/)", children: [], isExactMatch: paths.includes("/") };
  const nodesByPath = new Map<string, TreeNode>([["/", root]]);
  const sorted = [...paths].filter(p => p !== "/").sort((a, b) => a.localeCompare(b));

  for (const p of sorted) {
    const segments = splitPublicPathSegments(p);
    if (segments === null) {
      continue;
    }

    let current = root;
    let currentPath = "";

    for (const segment of segments) {
      currentPath += "/" + segment;
      let child = nodesByPath.get(currentPath);
      if (!child) {
        child = { path: currentPath, name: segment, children: [], isExactMatch: false };
        current.children.push(child);
        nodesByPath.set(currentPath, child);
      }
      current = child;
    }
    current.isExactMatch = true;
  }
  return root;
}

const TreeRender = memo(function TreeRender({ node, level, selected, onSelect }: { node: TreeNode, level: number, selected: string, onSelect: (p: string) => void }) {
  return (
    <div className="flex flex-col">
      {node.isExactMatch && (
        <MotionButton
          type="button"
          onClick={() => onSelect(node.path)}
          interactionPreset="lightButton"
          style={{ paddingLeft: `${level === 0 ? 1 : level * 1.5 + 1}rem` }}
          className={`flex w-full items-center pr-4 py-2 text-xs font-mono tracking-[0.05em] text-left transition-colors hover:bg-slate-50 ${node.path === selected ? 'text-black font-semibold bg-slate-50 relative' : 'text-slate-600'}`}
        >
          {node.path === selected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800" />}
          {level > 0 && <span className="mr-2 text-slate-300">└─</span>}
          {node.name}
        </MotionButton>
      )}
      {!node.isExactMatch && level > 0 && (
        <div style={{ paddingLeft: `${level * 1.5 + 1}rem` }} className="flex w-full items-center pr-4 py-2 text-xs font-mono tracking-[0.05em] text-left text-slate-400">
          <span className="mr-2 text-slate-200">└─</span> {node.name}
        </div>
      )}
      {node.children.map(child => (
        <TreeRender key={child.path} node={child} level={level + 1} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
});

function CustomPageSelector({
  paths,
  selected,
  onSelect,
  disabled
}: {
  paths: string[];
  selected: string;
  onSelect: (path: string) => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tree = useMemo(() => buildTree(paths), [paths]);
  const handleSelect = useCallback((path: string) => {
    onSelect(path);
    setIsOpen(false);
  }, [onSelect]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative min-w-[260px]" ref={containerRef}>
      <MotionButton
        type="button"
        disabled={disabled}
        interactionPreset="lightButton"
        className={`flex w-full items-center justify-between bg-transparent px-3 py-2 text-xs font-mono tracking-[0.14em] outline-none transition-colors ${disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:text-slate-900'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch page"
      >
        <span>{selected}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </MotionButton>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 flex w-full min-w-[320px] max-h-[60vh] flex-col overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl py-2">
          <TreeRender node={tree} level={0} selected={selected} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}

function EditorHeaderChrome({
  children,
  selectedPagePath,
  availablePublicPaths,
  isSwitchingPage,
  fontLabSyncState,
  onSelectPagePath,
  onCreatePage,
}: {
  children: ReactNode;
  selectedPagePath: string;
  availablePublicPaths: string[];
  isSwitchingPage: boolean;
  fontLabSyncState: FontLabSyncState;
  onSelectPagePath: (nextPath: string) => void;
  onCreatePage: (rawValue: string) => void;
}) {
  const [newPageInputState, setNewPageInputState] = useState(() => ({
    selectedPagePath,
    value: "",
  }));
  const newPageInputValue = newPageInputState.selectedPagePath === selectedPagePath
    ? newPageInputState.value
    : "";
  const setNewPageInputValue = (value: string) => {
    setNewPageInputState({ selectedPagePath, value });
  };

  return (
    <div className="editor-header-shell">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-[#fbfcfe] px-4 py-3 text-xs text-slate-600 md:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-sm border border-slate-200 bg-white transition-colors focus-within:border-slate-400">
            <div className="border-r border-slate-200 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
              当前页面
            </div>
            <CustomPageSelector
              paths={availablePublicPaths}
              selected={selectedPagePath}
              onSelect={onSelectPagePath}
              disabled={isSwitchingPage}
            />
          </div>

          <div className="flex items-center rounded-sm border border-slate-200 bg-white focus-within:border-slate-400 transition-colors">
            <input
              value={newPageInputValue}
              onChange={(event) => setNewPageInputValue(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onCreatePage(newPageInputValue);
                }
              }}
              disabled={isSwitchingPage}
              className="min-w-[220px] bg-transparent px-3 py-2 text-xs font-mono tracking-[0.14em] text-slate-700 outline-none placeholder-slate-300"
              placeholder="/new-page"
              aria-label="Create page"
            />
            <MotionButton
              type="button"
              disabled={isSwitchingPage}
              interactionPreset="lightButton"
              className="border-l border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.24em] text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              onClick={() => onCreatePage(newPageInputValue)}
            >
              CREATE
            </MotionButton>
          </div>
        </div>
        <div className="flex items-center">
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.2em] ${FONT_LAB_SYNC_TONE[fontLabSyncState]}`}
          >
            {FONT_LAB_SYNC_LABEL[fontLabSyncState]}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}


export { EditorHeaderChrome, HeaderActionsWithOpenPage };
