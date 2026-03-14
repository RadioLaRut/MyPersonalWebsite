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

test("buildFontLabDocumentCssVars keeps clamp-based sizes anchored to the configured base size", () => {
  const document = createDefaultFontLabDocument();
  document.presets["sans-body"].sizes["body-lg"] = {
    ...document.presets["sans-body"].sizes["body-lg"]!,
    fontSize: "1.13rem",
  };

  const vars = buildFontLabDocumentCssVars(document);

  assert.equal(vars["--typography-sans-body-body-font-size"], "1rem");
  assert.equal(
    vars["--typography-sans-body-body-lg-font-size"],
    "clamp(1.13rem,1.1551vw,1.3811rem)",
  );
});

test("buildFontLabDocumentCssVars preserves heading-scale clamp behavior at the reference viewport", () => {
  const document = createDefaultFontLabDocument();
  document.presets["sans-body"].sizes.title = {
    ...document.presets["sans-body"].sizes.title!,
    fontSize: "2.06rem",
  };

  const vars = buildFontLabDocumentCssVars(document);

  assert.equal(
    vars["--typography-sans-body-title-font-size"],
    "clamp(0.9156rem,2.6704vw,2.06rem)",
  );
});
