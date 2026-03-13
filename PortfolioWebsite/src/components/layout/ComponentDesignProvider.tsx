"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createDefaultComponentDesignDocument,
  normalizeComponentDesignDocument,
  type ComponentDesignDocument,
  type ComponentDesignComponentKey,
} from "@/lib/component-design-schema";

const COMPONENT_DESIGN_UPDATED_EVENT = "component-design-updated";

const ComponentDesignContext = createContext<ComponentDesignDocument>(
  createDefaultComponentDesignDocument(),
);

export default function ComponentDesignProvider({
  children,
  initialDocument,
  listenToGlobalUpdates = true,
}: {
  children: ReactNode;
  initialDocument: ComponentDesignDocument;
  listenToGlobalUpdates?: boolean;
}) {
  const [documentState, setDocumentState] = useState<ComponentDesignDocument>(
    normalizeComponentDesignDocument(initialDocument),
  );

  useEffect(() => {
    setDocumentState(normalizeComponentDesignDocument(initialDocument));
  }, [initialDocument]);

  useEffect(() => {
    if (!listenToGlobalUpdates) {
      return;
    }

    const handleUpdate = (event: Event) => {
      const nextDocument = (event as CustomEvent<ComponentDesignDocument>).detail;

      if (!nextDocument || typeof nextDocument !== "object") {
        return;
      }

      setDocumentState(normalizeComponentDesignDocument(nextDocument));
    };

    window.addEventListener(
      COMPONENT_DESIGN_UPDATED_EVENT,
      handleUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        COMPONENT_DESIGN_UPDATED_EVENT,
        handleUpdate as EventListener,
      );
    };
  }, [listenToGlobalUpdates]);

  const value = useMemo(
    () => normalizeComponentDesignDocument(documentState),
    [documentState],
  );

  return (
    <ComponentDesignContext.Provider value={value}>
      {children}
    </ComponentDesignContext.Provider>
  );
}

export function useComponentDesignDocument() {
  return useContext(ComponentDesignContext);
}

export function useComponentDesign<ComponentKey extends ComponentDesignComponentKey>(
  componentKey: ComponentKey,
) {
  const document = useComponentDesignDocument();
  return document.components[componentKey];
}

export function dispatchComponentDesignUpdated(
  nextDocument: ComponentDesignDocument,
) {
  window.dispatchEvent(
    new CustomEvent<ComponentDesignDocument>(
      COMPONENT_DESIGN_UPDATED_EVENT,
      {
        detail: normalizeComponentDesignDocument(nextDocument),
      },
    ),
  );
}

export { COMPONENT_DESIGN_UPDATED_EVENT };
