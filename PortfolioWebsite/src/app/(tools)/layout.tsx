import type { CSSProperties } from "react";
import { connection } from "next/server";

import ComponentDesignProvider from "@/components/layout/ComponentDesignProvider";
import FontLabGlobalVars from "@/components/layout/FontLabGlobalVars";
import { readComponentDesignConfig } from "@/lib/component-design-config";
import { buildFontLabDocumentCssVars } from "@/lib/font-lab-css-vars";
import { readFontLabConfig } from "@/lib/font-lab-config";
import { assertLocalEditorAccess } from "@/lib/security";

type StyleWithVars = CSSProperties & Record<string, string>;

export default async function ToolsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  assertLocalEditorAccess("page");
  await connection();

  const [componentDesignDocument, fontLabDocument] = await Promise.all([
    readComponentDesignConfig(),
    readFontLabConfig(),
  ]);
  const fontLabCssVars = buildFontLabDocumentCssVars(fontLabDocument) as StyleWithVars;

  return (
    <ComponentDesignProvider initialDocument={componentDesignDocument}>
      <FontLabGlobalVars initialVars={fontLabCssVars} />
      {children}
    </ComponentDesignProvider>
  );
}
