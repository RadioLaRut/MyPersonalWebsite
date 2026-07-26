import { Render } from "@puckeditor/core/rsc";

import PublicFontPreloads from "@/components/layout/PublicFontPreloads";
import { readComponentDesignConfig } from "./component-design-config.ts";
import { stripPageEditorMetadata } from "./page-document-contract.ts";
import { readPublicPage } from "./public-content-service.ts";
import { loadHomePublicRenderer } from "../puck/generated/home-public-renderer-loaders.ts";
import { createPublicRuntimeConfig } from "../puck/runtime-config-core.ts";

export async function renderHomePage() {
  const [storedData, designDocument] = await Promise.all([
    readPublicPage("index"),
    readComponentDesignConfig(),
  ]);
  const data = stripPageEditorMetadata(storedData);
  const runtimeConfig = await createPublicRuntimeConfig(data, {
    designDocument,
    loadRenderer: loadHomePublicRenderer,
  });

  return (
    <>
      <PublicFontPreloads document={storedData} />
      <main className="min-h-screen bg-black text-white">
        <Render config={runtimeConfig} data={data} />
      </main>
    </>
  );
}
