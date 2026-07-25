import type { ReactNode } from "react";

import { EditorUiStateProvider } from "@/puck/editor/editor-ui-state";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <EditorUiStateProvider>{children}</EditorUiStateProvider>;
}
