import { type ReactNode, useEffect, useRef } from "react";

import {
  FONT_LAB_UPDATED_EVENT,
  getLatestFontLabPreviewVarsSnapshot,
  type FontLabCssVars,
} from "./font-lab-preview-sync";
import { applyFontLabCssVars } from "@/lib/font-lab-css-vars";
import { FONT_VARIABLE_NAMES } from "@/lib/typography-tokens";

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

    lastClonedHeadSignatureRef.current = null;
    const appliedVarKeys = new Set<string>();
    const htmlElement = frameDocument.documentElement;
    const bodyElement = frameDocument.body;
    const previousHtmlOverflow = htmlElement.style.overflow;
    const previousHtmlHeight = htmlElement.style.height;
    const previousHtmlOverscrollBehavior = htmlElement.style.overscrollBehavior;
    const previousBodyOverflow = bodyElement.style.overflow;
    const previousBodyHeight = bodyElement.style.height;
    const previousBodyOverscrollBehavior = bodyElement.style.overscrollBehavior;
    const previousBodyClassName = bodyElement.className;
    const previousHtmlClassName = htmlElement.className;
    const previousAdminMode = htmlElement.getAttribute("data-admin-mode");
    const previousAdminRoot = htmlElement.getAttribute("data-admin-root");
    const previousSiteMode = htmlElement.getAttribute("data-site-mode");
    const previousLang = htmlElement.lang;

    const syncPreviewEnvironment = (overrideVars?: FontLabCssVars | null) => {
      syncPreviewHeadNodes(frameDocument, lastClonedHeadSignatureRef);

      const nextVars = overrideVars ?? collectParentPreviewVars();
      applyFontLabCssVars(htmlElement, nextVars, appliedVarKeys);
      htmlElement.className = document.documentElement.className;
      bodyElement.className = document.body.className;

      const parentSiteMode = document.documentElement.getAttribute("data-site-mode");
      if (parentSiteMode === null) {
        htmlElement.removeAttribute("data-site-mode");
      } else {
        htmlElement.setAttribute("data-site-mode", parentSiteMode);
      }

      htmlElement.lang = document.documentElement.lang || "zh-CN";
    };

    const handleFontLabUpdate = (event: Event) => {
      const detail = (event as CustomEvent<FontLabCssVars | null>).detail;
      syncPreviewEnvironment(
        detail && typeof detail === "object" ? detail : null,
      );
    };

    htmlElement.setAttribute("data-admin-mode", "true");
    htmlElement.removeAttribute("data-admin-root");
    htmlElement.style.overflow = "";
    htmlElement.style.height = "";
    htmlElement.style.overscrollBehavior = "";
    bodyElement.style.overflow = "";
    bodyElement.style.height = "";
    bodyElement.style.overscrollBehavior = "";
    syncPreviewEnvironment(getLatestFontLabPreviewVarsSnapshot());
    window.addEventListener(FONT_LAB_UPDATED_EVENT, handleFontLabUpdate as EventListener);

    return () => {
      window.removeEventListener(FONT_LAB_UPDATED_EVENT, handleFontLabUpdate as EventListener);

      if (previousAdminMode === null) {
        htmlElement.removeAttribute("data-admin-mode");
      } else {
        htmlElement.setAttribute("data-admin-mode", previousAdminMode);
      }

      if (previousAdminRoot === null) {
        htmlElement.removeAttribute("data-admin-root");
      } else {
        htmlElement.setAttribute("data-admin-root", previousAdminRoot);
      }

      if (previousSiteMode === null) {
        htmlElement.removeAttribute("data-site-mode");
      } else {
        htmlElement.setAttribute("data-site-mode", previousSiteMode);
      }

      htmlElement.lang = previousLang;
      htmlElement.style.overflow = previousHtmlOverflow;
      htmlElement.style.height = previousHtmlHeight;
      htmlElement.style.overscrollBehavior = previousHtmlOverscrollBehavior;
      htmlElement.className = previousHtmlClassName;
      bodyElement.style.overflow = previousBodyOverflow;
      bodyElement.style.height = previousBodyHeight;
      bodyElement.style.overscrollBehavior = previousBodyOverscrollBehavior;
      bodyElement.className = previousBodyClassName;
      frameDocument.head.querySelectorAll(`[${PREVIEW_CLONED_HEAD_ATTR}]`).forEach((node) => node.remove());
      lastClonedHeadSignatureRef.current = null;
      applyFontLabCssVars(htmlElement, {}, appliedVarKeys);
    };
  }, [frameDocument]);

  return <>{children}</>;
}

export default IframePreviewChrome;
