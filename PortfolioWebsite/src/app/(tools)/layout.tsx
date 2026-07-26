import type { CSSProperties } from "react";
import { connection } from "next/server";

import ComponentDesignProvider from "@/components/layout/ComponentDesignProvider";
import FontLabGlobalVars from "@/components/layout/FontLabGlobalVars";
import ImageLoadCoordinator from "@/components/layout/ImageLoadCoordinator";
import { FULL_FONT_VARIABLE_CLASS_NAME } from "@/app/fonts/full-fonts";
import { readComponentDesignConfig } from "@/lib/component-design-config";
import { buildFontLabDocumentCssVars } from "@/lib/font-lab-css-vars";
import { readFontLabConfig } from "@/lib/font-lab-config";
import { assertLocalEditorPageAccess } from "@/lib/security";

type StyleWithVars = CSSProperties & Record<string, string>;

export default async function ToolsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await assertLocalEditorPageAccess();
  await connection();

  const [componentDesignDocument, fontLabDocument] = await Promise.all([
    readComponentDesignConfig(),
    readFontLabConfig(),
  ]);
  const fontLabCssVars = buildFontLabDocumentCssVars(fontLabDocument) as StyleWithVars;

  return (
    <ComponentDesignProvider initialDocument={componentDesignDocument}>
      <FontLabGlobalVars initialVars={fontLabCssVars} />
      <ImageLoadCoordinator />
      <div
        className={FULL_FONT_VARIABLE_CLASS_NAME}
        data-font-scope="tools"
      >
        {children}
      </div>
    </ComponentDesignProvider>
  );
}
