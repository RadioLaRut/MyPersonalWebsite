import assert from "node:assert/strict";
import test from "node:test";

import {
  syncFontLabPreviewVars,
  type FontLabCssVars,
} from "./font-lab-preview-sync.ts";
import type { FontLabSyncState } from "./types.ts";

function serializeFontLabCssVars(vars: FontLabCssVars) {
  return JSON.stringify(Object.entries(vars).sort(([left], [right]) => left.localeCompare(right)));
}

test("syncFontLabPreviewVars restores synced state when fetched vars are unchanged", async () => {
  const latestVars = {
    "--typography-sans-body-font-size": "1rem",
  };
  const lastSerializedVarsRef = {
    current: serializeFontLabCssVars(latestVars),
  };
  const dispatchedUpdates: FontLabCssVars[] = [];
  const observedStates: FontLabSyncState[] = [];
  let currentState: FontLabSyncState = "error";

  await syncFontLabPreviewVars({
    dispatchFontLabUpdatedEvent: (vars) => {
      dispatchedUpdates.push(vars);
    },
    isActive: () => true,
    lastSerializedVarsRef,
    readLatestVars: async () => latestVars,
    setFontLabSyncState: (action) => {
      currentState = typeof action === "function" ? action(currentState) : action;
      observedStates.push(currentState);
    },
  });

  assert.deepEqual(observedStates, ["synced"]);
  assert.deepEqual(dispatchedUpdates, []);
  assert.equal(lastSerializedVarsRef.current, serializeFontLabCssVars(latestVars));
});
