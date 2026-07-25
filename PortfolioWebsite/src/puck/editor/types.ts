export type FontLabSyncState = "idle" | "synced" | "error";

export type PageListState =
  | {
    status: "loading" | "ready";
    message: null;
  }
  | {
    status: "error";
    message: string;
  };
