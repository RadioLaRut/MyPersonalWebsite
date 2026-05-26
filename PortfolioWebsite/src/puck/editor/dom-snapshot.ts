const SNAPSHOT_STYLE_PROPERTIES = ["overflow", "height", "overscrollBehavior"] as const;

type SnapshotStyleProperty = (typeof SNAPSHOT_STYLE_PROPERTIES)[number];

type SnapshotTarget = {
  className: string;
  getAttribute(name: string): string | null;
  lang: string;
  removeAttribute(name: string): void;
  setAttribute(name: string, value: string): void;
  style: Partial<Record<SnapshotStyleProperty, string>>;
};

type SnapshotOptions = {
  attributes?: readonly string[];
  includeLang?: boolean;
};

type ElementSnapshot = {
  attributes: Record<string, string | null>;
  className: string;
  lang?: string;
  style: Record<string, string>;
};

export function snapshotElement(
  element: SnapshotTarget,
  { attributes = [], includeLang = false }: SnapshotOptions = {},
): ElementSnapshot {
  const style: Record<string, string> = {};
  for (const property of SNAPSHOT_STYLE_PROPERTIES) {
    style[property] = element.style[property] ?? "";
  }

  const attributeSnapshot: Record<string, string | null> = {};
  for (const attribute of attributes) {
    attributeSnapshot[attribute] = element.getAttribute(attribute);
  }

  return {
    attributes: attributeSnapshot,
    className: element.className,
    lang: includeLang ? element.lang : undefined,
    style,
  };
}

export function restoreElement(element: SnapshotTarget, snapshot: ElementSnapshot) {
  element.className = snapshot.className;

  for (const property of SNAPSHOT_STYLE_PROPERTIES) {
    element.style[property] = snapshot.style[property] ?? "";
  }

  for (const [attribute, value] of Object.entries(snapshot.attributes)) {
    if (value === null) {
      element.removeAttribute(attribute);
    } else {
      element.setAttribute(attribute, value);
    }
  }

  if (snapshot.lang !== undefined) {
    element.lang = snapshot.lang;
  }
}
