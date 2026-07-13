import {
  createDefaultComponentDesignDocument,
  type ComponentDesignComponentKey,
  type ComponentDesignDocument,
} from "./component-design-schema.ts";

const DEFAULT_COMPONENT_DESIGN_DOCUMENT = createDefaultComponentDesignDocument();

export type ComponentDesignOverride<
  ComponentKey extends ComponentDesignComponentKey,
> = {
  design?: ComponentDesignDocument["components"][ComponentKey];
};

export function resolveComponentDesign<
  ComponentKey extends ComponentDesignComponentKey,
>(
  componentKey: ComponentKey,
  design?: ComponentDesignDocument["components"][ComponentKey],
) {
  return design ?? DEFAULT_COMPONENT_DESIGN_DOCUMENT.components[componentKey];
}
