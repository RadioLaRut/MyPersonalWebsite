export type ImageLoadState = "error" | "loaded" | "loading";

type ImageLoadSnapshot = Pick<HTMLImageElement, "complete" | "naturalWidth">;

export function resolveImageLoadState(image: ImageLoadSnapshot): ImageLoadState {
  if (!image.complete) return "loading";
  return image.naturalWidth > 0 ? "loaded" : "error";
}

function isElementNode(value: EventTarget | Node | null): value is Element {
  if (!value) return false;

  const candidate = value as Partial<Element>;
  return candidate.nodeType === 1 && typeof candidate.localName === "string";
}

function isImageElement(value: EventTarget | Node | null): value is HTMLImageElement {
  return isElementNode(value) && value.localName === "img";
}

function updateImageState(image: HTMLImageElement) {
  const frame = image.closest<HTMLElement>(".preset-image-frame");
  if (!frame) return;

  frame.dataset.imageState = resolveImageLoadState(image);
}

function updateImagesWithin(node: Node) {
  if (isImageElement(node)) {
    updateImageState(node);
    return;
  }

  if (!isElementNode(node)) return;

  node
    .querySelectorAll<HTMLImageElement>(".preset-image-frame img")
    .forEach(updateImageState);
}

export function coordinateImageLoading(targetDocument: Document) {
  const handleLoad = (event: Event) => {
    if (isImageElement(event.target)) {
      updateImageState(event.target);
    }
  };
  const handleError = (event: Event) => {
    if (!isImageElement(event.target)) return;

    const frame = event.target.closest<HTMLElement>(".preset-image-frame");
    if (frame) frame.dataset.imageState = "error";
  };
  const MutationObserverImpl =
    targetDocument.defaultView?.MutationObserver ?? MutationObserver;
  const observer = new MutationObserverImpl((records) => {
    for (const record of records) {
      record.addedNodes.forEach(updateImagesWithin);
    }
  });

  targetDocument
    .querySelectorAll<HTMLImageElement>(".preset-image-frame img")
    .forEach(updateImageState);
  targetDocument.addEventListener("load", handleLoad, true);
  targetDocument.addEventListener("error", handleError, true);

  if (targetDocument.body) {
    observer.observe(targetDocument.body, { childList: true, subtree: true });
  }

  return () => {
    targetDocument.removeEventListener("load", handleLoad, true);
    targetDocument.removeEventListener("error", handleError, true);
    observer.disconnect();
  };
}
