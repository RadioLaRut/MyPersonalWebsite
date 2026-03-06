import { notFound } from "next/navigation";

import PlaygroundClient from "@/components/playground/PlaygroundClient";
import { isTestingMode } from "@/lib/site-mode";

export default function PlaygroundPage() {
  if (!isTestingMode()) {
    notFound();
  }

  return <PlaygroundClient />;
}
