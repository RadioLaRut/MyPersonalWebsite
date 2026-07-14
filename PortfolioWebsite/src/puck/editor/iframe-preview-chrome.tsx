import { type ReactNode, useEffect, useRef } from "react";

import {
  FONT_LAB_UPDATED_EVENT,
  getLatestFontLabPreviewVarsSnapshot,
  type FontLabCssVars,
} from "./font-lab-preview-sync";
import { restoreElement, snapshotElement } from "./dom-snapshot";
import {
  ADMIN_MODE_ATTRIBUTE,
  ADMIN_ROOT_ATTRIBUTE,
  PREVIEW_HTML_ATTRIBUTES,
  SITE_MODE_ATTRIBUTE,
} from "@/lib/admin-attributes";
import { applyFontLabCssVars } from "@/lib/font-lab-css-vars";
import { FONT_VARIABLE_NAMES } from "@/lib/typography-tokens";
import {
  getLogicalViewportUnit,
  resolvePreviewViewportByWidth,
  SITE_VIEWPORT_UNIT_CSS_VAR,
} from "@/lib/preview-viewports";

const PREVIEW_CLONED_HEAD_ATTR = "data-puck-preview-font-clone";

function isRelevantPreviewHeadNode(node: Element) {
  if (node instanceof HTMLLinkElement) {
    return (
      node.rel === "stylesheet" &&
      node.href.includes("/_next/static/css/")
    );
  }

  if (!(node instanceof HTMLStyleElement)) {
    return false;
  }

  const content = node.textContent ?? "";

  return (
    content.includes("@font-face") ||
    content.includes("--font-") ||
    content.includes(".__variable_")
  );
}

function syncPreviewHeadNodes(
  frameDocument: Document,
  lastClonedHeadSignatureRef: { current: string | null },
) {
  const parentHeadNodes = Array.from(document.head.children).filter(isRelevantPreviewHeadNode);
  const nextSignature = parentHeadNodes.map((node) => node.outerHTML).join("\n");
  if (lastClonedHeadSignatureRef.current === nextSignature) {
    return;
  }

  const frameHead = frameDocument.head;

  frameHead.querySelectorAll(`[${PREVIEW_CLONED_HEAD_ATTR}]`).forEach((node) => node.remove());

  parentHeadNodes.forEach((node) => {
    const clone = node.cloneNode(true);

    if (!(clone instanceof Element)) {
      return;
    }

    clone.setAttribute(PREVIEW_CLONED_HEAD_ATTR, "true");
    frameHead.appendChild(clone);
  });

  lastClonedHeadSignatureRef.current = nextSignature;
}

function collectParentPreviewVars() {
  const nextVars: FontLabCssVars = {};
  const rootStyle = document.documentElement.style;
  const bodyComputedStyle = window.getComputedStyle(document.body);

  for (let index = 0; index < rootStyle.length; index += 1) {
    const propertyName = rootStyle.item(index);

    if (!propertyName.startsWith("--typography-")) {
      continue;
    }

    const propertyValue = rootStyle.getPropertyValue(propertyName).trim();
    if (propertyValue) {
      nextVars[propertyName] = propertyValue;
    }
  }

  FONT_VARIABLE_NAMES.forEach((propertyName) => {
    const propertyValue = bodyComputedStyle.getPropertyValue(propertyName).trim();
    if (propertyValue) {
      nextVars[propertyName] = propertyValue;
    }
  });

  return nextVars;
}

function setupIframePreviewChrome(
  frameDocument: Document,
  lastClonedHeadSignatureRef: { current: string | null },
) {
    lastClonedHeadSignatureRef.current = null;
    const appliedVarKeys = new Set<string>();
    const htmlElement = frameDocument.documentElement;
    const bodyElement = frameDocument.body;
    const frameWindow = frameDocument.defaultView;
    const previousViewportUnit = htmlElement.style.getPropertyValue(
      SITE_VIEWPORT_UNIT_CSS_VAR,
    );
    const previousHtml = snapshotElement(htmlElement, {
      attributes: PREVIEW_HTML_ATTRIBUTES,
      includeLang: true,
    });
    const previousBody = snapshotElement(bodyElement);

    const syncPreviewEnvironment = (overrideVars?: FontLabCssVars | null) => {
      syncPreviewHeadNodes(frameDocument, lastClonedHeadSignatureRef);

      const nextVars = overrideVars ?? collectParentPreviewVars();
      applyFontLabCssVars(htmlElement, nextVars, appliedVarKeys);
      htmlElement.className = document.documentElement.className;
      bodyElement.className = document.body.className;

      const parentSiteMode = document.documentElement.getAttribute(SITE_MODE_ATTRIBUTE);
      if (parentSiteMode === null) {
        htmlElement.removeAttribute(SITE_MODE_ATTRIBUTE);
      } else {
        htmlElement.setAttribute(SITE_MODE_ATTRIBUTE, parentSiteMode);
      }

      htmlElement.lang = document.documentElement.lang || "zh-CN";

      const viewportWidth = frameWindow?.innerWidth || htmlElement.clientWidth;
      const viewport = resolvePreviewViewportByWidth(viewportWidth);
      htmlElement.style.setProperty(
        SITE_VIEWPORT_UNIT_CSS_VAR,
        getLogicalViewportUnit(viewport),
      );
    };

    const handleFontLabUpdate = (event: Event) => {
      const detail = (event as CustomEvent<FontLabCssVars | null>).detail;
      syncPreviewEnvironment(
        detail && typeof detail === "object" ? detail : null,
      );
    };
    const handleViewportResize = () => syncPreviewEnvironment();

    htmlElement.setAttribute(ADMIN_MODE_ATTRIBUTE, "true");
    htmlElement.removeAttribute(ADMIN_ROOT_ATTRIBUTE);
    htmlElement.style.overflow = "";
    htmlElement.style.height = "";
    htmlElement.style.overscrollBehavior = "";
    bodyElement.style.overflow = "";
    bodyElement.style.height = "";
    bodyElement.style.overscrollBehavior = "";
    syncPreviewEnvironment(getLatestFontLabPreviewVarsSnapshot());
    window.addEventListener(FONT_LAB_UPDATED_EVENT, handleFontLabUpdate as EventListener);
    frameWindow?.addEventListener("resize", handleViewportResize);

    return () => {
      window.removeEventListener(FONT_LAB_UPDATED_EVENT, handleFontLabUpdate as EventListener);
      frameWindow?.removeEventListener("resize", handleViewportResize);

      restoreElement(htmlElement, previousHtml);
      restoreElement(bodyElement, previousBody);
      frameDocument.head.querySelectorAll(`[${PREVIEW_CLONED_HEAD_ATTR}]`).forEach((node) => node.remove());
      lastClonedHeadSignatureRef.current = null;
      applyFontLabCssVars(htmlElement, {}, appliedVarKeys);
      if (previousViewportUnit) {
        htmlElement.style.setProperty(
          SITE_VIEWPORT_UNIT_CSS_VAR,
          previousViewportUnit,
        );
      } else {
        htmlElement.style.removeProperty(SITE_VIEWPORT_UNIT_CSS_VAR);
      }
    };
}

function IframePreviewChrome({
  children,
  document: frameDocument,
}: {
  children: ReactNode;
  document?: Document;
}) {
  const lastClonedHeadSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!frameDocument) {
      return;
    }

    return setupIframePreviewChrome(frameDocument, lastClonedHeadSignatureRef);
  }, [frameDocument]);

  return <>{children}</>;
}

export default IframePreviewChrome;
