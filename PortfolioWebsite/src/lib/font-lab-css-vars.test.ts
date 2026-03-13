import assert from "node:assert/strict";
import test from "node:test";

import { buildFontLabDocumentCssVars } from "./font-lab-css-vars.ts";
import { createDefaultFontLabDocument } from "./font-lab-config-schema.ts";

test("buildFontLabDocumentCssVars exposes semantic weight vars per preset size", () => {
  const document = createDefaultFontLabDocument();
  document.presets["gothic-editorial"].latinWeightOffsetSteps = -1;
  document.presets["gothic-editorial"].sizes.label = {
    ...document.presets["gothic-editorial"].sizes.label!,
    cjkEdgeOffset: -0.08,
    latinEdgeOffset: -0.03,
    semanticWeight: "medium",
  };

  const vars = buildFontLabDocumentCssVars(document);

  assert.equal(
    vars["--typography-gothic-editorial-label-semantic-cjk-weight"],
    "500",
  );
  assert.equal(
    vars["--typography-gothic-editorial-label-semantic-latin-weight"],
    "300",
  );
  assert.equal(
    vars["--typography-gothic-editorial-label-cjk-edge-offset"],
    "-0.08em",
  );
  assert.equal(
    vars["--typography-gothic-editorial-label-latin-edge-offset"],
    "-0.03em",
  );
});
