"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { EditorLeftTab } from "@/puck/editor/editor-workspace";

type EditorUiStateContextValue = {
  leftCollapsed: boolean;
  leftTab: EditorLeftTab;
  rightCollapsed: boolean;
  setLeftCollapsed: (collapsed: boolean) => void;
  setLeftTab: (tab: EditorLeftTab) => void;
  setRightCollapsed: (collapsed: boolean) => void;
};

const EditorUiStateContext = createContext<EditorUiStateContextValue | null>(
  null,
);

export function EditorUiStateProvider({ children }: { children: ReactNode }) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftTab, setLeftTab] = useState<EditorLeftTab>("outline");
  const value = useMemo(
    () => ({
      leftCollapsed,
      leftTab,
      rightCollapsed,
      setLeftCollapsed,
      setLeftTab,
      setRightCollapsed,
    }),
    [leftCollapsed, leftTab, rightCollapsed],
  );

  return (
    <EditorUiStateContext.Provider value={value}>
      {children}
    </EditorUiStateContext.Provider>
  );
}

export function useEditorUiState() {
  const value = useContext(EditorUiStateContext);
  if (!value) {
    throw new Error("useEditorUiState must be used within EditorUiStateProvider");
  }
  return value;
}
