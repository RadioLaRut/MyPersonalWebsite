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
} from "@/lib/component-design-v2";
import type { ComponentDesignAuthorComponent } from "@/lib/component-design-manifest";
import {
  COMPONENT_DESIGN_COMMIT_CHANNEL,
  COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE,
  isCommittedComponentDesignMessage,
  type CommittedComponentDesignMessage,
} from "@/lib/component-design-commit";

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

    const channel = typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(COMPONENT_DESIGN_COMMIT_CHANNEL);
    const handleCommittedMessage = (event: MessageEvent<unknown>) => {
      if (!isCommittedComponentDesignMessage(event.data)) return;
      setDocumentState(normalizeComponentDesignDocument(event.data.document));
    };
    channel?.addEventListener("message", handleCommittedMessage);

    return () => {
      window.removeEventListener(
        COMPONENT_DESIGN_UPDATED_EVENT,
        handleUpdate as EventListener,
      );
      channel?.removeEventListener("message", handleCommittedMessage);
      channel?.close();
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

export function useComponentDesign<ComponentKey extends ComponentDesignAuthorComponent>(
  componentKey: ComponentKey,
) {
  const document = useComponentDesignDocument();
  return document.components[componentKey];
}

export function dispatchComponentDesignUpdated(
  nextDocument: ComponentDesignDocument,
) {
  const normalizedDocument = normalizeComponentDesignDocument(nextDocument);
  window.dispatchEvent(
    new CustomEvent<ComponentDesignDocument>(
      COMPONENT_DESIGN_UPDATED_EVENT,
      {
        detail: normalizedDocument,
      },
    ),
  );

  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(COMPONENT_DESIGN_COMMIT_CHANNEL);
    const message: CommittedComponentDesignMessage = {
      document: normalizedDocument,
      type: COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE,
      version: 2,
    };
    channel.postMessage(message);
    channel.close();
  }
}

export { COMPONENT_DESIGN_UPDATED_EVENT };
