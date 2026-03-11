import { notFound } from "next/navigation";

import FontLabClient from "@/components/playground/FontLabClient";
import { isTestingMode } from "@/lib/site-mode";

export default function FontLabPage() {
  if (!isTestingMode()) {
    notFound();
  }

  return <FontLabClient />;
}
