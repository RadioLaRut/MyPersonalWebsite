import { notFound } from "next/navigation";

import ComponentLabClient from "@/components/playground/ComponentLabClient";
import { isTestingMode } from "@/lib/site-mode";

export default function ComponentLabPage() {
  if (!isTestingMode()) {
    notFound();
  }

  return <ComponentLabClient />;
}
