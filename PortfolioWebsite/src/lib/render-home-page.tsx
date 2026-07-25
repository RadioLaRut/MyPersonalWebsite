import { Render } from "@puckeditor/core/rsc";

import { readComponentDesignConfig } from "./component-design-config.ts";
import { contentRepository } from "./content-repository.ts";
import { stripPageEditorMetadata } from "./page-document-contract.ts";
import { loadHomePublicRenderer } from "../puck/generated/home-public-renderer-loaders.ts";
import { createPublicRuntimeConfig } from "../puck/runtime-config-core.ts";

export async function renderHomePage() {
  const [storedData, designDocument] = await Promise.all([
    contentRepository.readPage("index"),
    readComponentDesignConfig(),
  ]);
  const data = stripPageEditorMetadata(storedData);
  const runtimeConfig = await createPublicRuntimeConfig(data, {
    designDocument,
    loadRenderer: loadHomePublicRenderer,
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Render config={runtimeConfig} data={data} />
    </main>
  );
}
