import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import { FONT_LAB_UPDATED_EVENT } from "../../lib/font-lab-events.ts";
import { buildFontLabDocumentCssVars, type FontLabCssVars } from "../../lib/font-lab-css-vars.ts";
import { parseFontLabDocument, type FontLabApiPayload } from "../../lib/font-lab-config-schema.ts";
import type { FontLabSyncState } from "./types";

export { FONT_LAB_UPDATED_EVENT };
export type { FontLabCssVars };

const FONT_LAB_FETCH_DEDUPE_MS = 2000;
let latestFontLabPreviewVars: FontLabCssVars | null = null;

type MutableRefValue<T> = {
  current: T;
};

type SyncFontLabPreviewVarsOptions = {
  dispatchFontLabUpdatedEvent: (latestVars: FontLabCssVars) => void;
  isActive: () => boolean;
  lastSerializedVarsRef: MutableRefValue<string | null>;
  readLatestVars?: typeof readLatestFontLabPreviewVars;
  setFontLabSyncState: Dispatch<SetStateAction<FontLabSyncState>>;
  signal?: AbortSignal;
};

export function getLatestFontLabPreviewVarsSnapshot() {
  return latestFontLabPreviewVars;
}

export async function readLatestFontLabPreviewVars(signal?: AbortSignal) {
  const response = await fetch("/api/font-lab", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to load Font Lab config");
  }

  const payload = (await response.json()) as FontLabApiPayload;
  const fontLabDocument = parseFontLabDocument(payload.config);

  if (!fontLabDocument) {
    return null;
  }

  return buildFontLabDocumentCssVars(fontLabDocument);
}

function serializeFontLabCssVars(vars: FontLabCssVars) {
  return JSON.stringify(Object.entries(vars).sort(([left], [right]) => left.localeCompare(right)));
}

export async function syncFontLabPreviewVars({
  dispatchFontLabUpdatedEvent,
  isActive,
  lastSerializedVarsRef,
  readLatestVars = readLatestFontLabPreviewVars,
  setFontLabSyncState,
  signal,
}: SyncFontLabPreviewVarsOptions) {
  const latestVars = await readLatestVars(signal);

  if (!isActive() || !latestVars) {
    return;
  }

  latestFontLabPreviewVars = latestVars;
  setFontLabSyncState((current) => current === "synced" ? current : "synced");

  const serializedVars = serializeFontLabCssVars(latestVars);
  if (lastSerializedVarsRef.current === serializedVars) {
    return;
  }
  lastSerializedVarsRef.current = serializedVars;

  dispatchFontLabUpdatedEvent(latestVars);
}

export function useFontLabEditorSync(
  setFontLabSyncState: Dispatch<SetStateAction<FontLabSyncState>>,
) {
  const lastSerializedVarsRef = useRef<string | null>(null);
  const inFlightSyncRef = useRef<Promise<void> | null>(null);
  const lastFetchAtRef = useRef(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const syncFontLabToEditor = (options: { force?: boolean } = {}) => {
      const now = Date.now();
      if (
        !options.force &&
        now - lastFetchAtRef.current < FONT_LAB_FETCH_DEDUPE_MS
      ) {
        return inFlightSyncRef.current ?? Promise.resolve();
      }

      if (inFlightSyncRef.current) {
        return inFlightSyncRef.current;
      }

      lastFetchAtRef.current = now;

      const syncPromise = (async () => {
        await syncFontLabPreviewVars({
          dispatchFontLabUpdatedEvent: (latestVars) => {
            window.requestAnimationFrame(() => {
              if (!active) {
                return;
              }

              window.dispatchEvent(
                new CustomEvent(FONT_LAB_UPDATED_EVENT, {
                  detail: latestVars,
                }),
              );
            });
          },
          isActive: () => active,
          lastSerializedVarsRef,
          setFontLabSyncState,
          signal: controller.signal,
        });
      })();

      inFlightSyncRef.current = syncPromise;

      syncPromise.catch((error) => {
        if ((error as DOMException).name === "AbortError") {
          return;
        }

        if (active) {
          setFontLabSyncState("error");
        }
      }).finally(() => {
        if (inFlightSyncRef.current === syncPromise) {
          inFlightSyncRef.current = null;
        }
      });

      return syncPromise;
    };

    const handleWindowFocus = () => {
      void syncFontLabToEditor();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      void syncFontLabToEditor();
    };

    void syncFontLabToEditor({ force: true });
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      controller.abort();
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setFontLabSyncState]);
}
