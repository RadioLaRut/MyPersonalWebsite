import { notFound } from "next/navigation";

import ComponentLabPreviewClient from "@/components/playground/ComponentLabPreviewClient";
import { isTestingMode } from "@/lib/site-mode";

export default function ComponentLabPreviewPage() {
  if (!isTestingMode()) notFound();
  return <ComponentLabPreviewClient />;
}
