import ComponentLabClient from "@/components/playground/ComponentLabClient";
import { readComponentLabInstanceCatalog } from "@/lib/component-lab-presets";

export default async function ComponentLabPage() {
  const catalog = await readComponentLabInstanceCatalog();

  return <ComponentLabClient catalog={catalog} />;
}
