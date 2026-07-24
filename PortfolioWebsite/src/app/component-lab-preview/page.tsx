import ComponentLabPreviewClient from "@/components/playground/ComponentLabPreviewClient";
import { assertLocalEditorPageAccess } from "@/lib/security";

export default async function ComponentLabPreviewPage() {
  await assertLocalEditorPageAccess();
  return <ComponentLabPreviewClient />;
}
