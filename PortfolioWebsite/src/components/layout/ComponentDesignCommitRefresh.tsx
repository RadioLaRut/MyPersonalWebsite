"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  COMPONENT_DESIGN_COMMIT_CHANNEL,
  isCommittedComponentDesignMessage,
} from "@/lib/component-design-commit";

export default function ComponentDesignCommitRefresh() {
  const router = useRouter();

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(COMPONENT_DESIGN_COMMIT_CHANNEL);
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (isCommittedComponentDesignMessage(event.data)) {
        router.refresh();
      }
    };
    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [router]);

  return null;
}
