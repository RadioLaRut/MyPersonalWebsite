import { notFound } from "next/navigation";

import ComponentLabClient from "@/components/playground/ComponentLabClient";
import { readComponentLabInstanceCatalog } from "@/lib/component-lab-presets";
import { isTestingMode } from "@/lib/site-mode";

export default async function ComponentLabPage() {
  if (!isTestingMode()) {
    notFound();
  }

  const catalog = await readComponentLabInstanceCatalog();

  return <ComponentLabClient catalog={catalog} />;
}
