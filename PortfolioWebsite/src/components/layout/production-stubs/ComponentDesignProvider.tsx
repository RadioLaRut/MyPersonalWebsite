import type { ReactNode } from "react";

export const COMPONENT_DESIGN_UPDATED_EVENT = "component-design-updated";

export default function ComponentDesignProvider({
  children,
}: {
  children: ReactNode;
  initialDocument: unknown;
  listenToGlobalUpdates?: boolean;
}) {
  return children;
}

function unavailable(): never {
  throw new Error("组件设计工具仅在本地测试模式可用");
}

export function useComponentDesignDocument(): never {
  return unavailable();
}

export function useComponentDesign(): never {
  return unavailable();
}

export function dispatchComponentDesignUpdated(): never {
  return unavailable();
}
