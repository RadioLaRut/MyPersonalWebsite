import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  getComponentDesignVariantDescriptor,
  type ComponentDesignAuthorComponent,
  type ComponentDesignCompositionDescriptor,
} from "./component-design-manifest.ts";
import type {
  ComponentDesignDocumentV2,
} from "./component-design-v2.ts";
import {
  createDefaultComponentDesignDocument as createDefaultComponentDesignDocumentV3,
  enableComponentDesignDeviceOverride as enableComponentDesignDeviceOverrideV3,
  isComponentDesignAuthorComponent as isComponentDesignAuthorComponentV3,
  mergeComponentDesignVariantPatch as mergeComponentDesignVariantPatchV3,
  migrateComponentDesignDocumentV2ToV3,
  normalizeComponentDesignDocument as normalizeComponentDesignDocumentV3,
  parseComponentDesignDocument as parseComponentDesignDocumentV3,
  resolveComponentDesignDeviceLayout as resolveComponentDesignDeviceLayoutV3,
  resolveComponentDesignRuntimeDocument as resolveComponentDesignRuntimeDocumentV3,
  type ComponentDesignDeepPartial,
  type ComponentDesignDevice,
  type ComponentDesignDeviceLayoutV3,
  type ComponentDesignDeviceNodeLayoutV3,
  type ComponentDesignDeviceOverrideV3,
  type ComponentDesignDocumentV3,
  type ComponentDesignFlowPositioning,
  type ComponentDesignMediaFrame,
  type ComponentDesignNodePositioning,
  type ComponentDesignOverlayAnchor,
  type ComponentDesignOverlayPositioning,
  type ComponentDesignSampleText,
  type ComponentDesignSectionHeight,
  type ComponentDesignSectionLayoutV3,
  type ComponentDesignVariantV3,
} from "./component-design-v3.ts";
import {
  areJsonStructuresEqual,
  isPlainRecord,
} from "./json-utils.ts";

export {
  COMPONENT_DESIGN_DEVICE_OVERRIDE_MODES,
  COMPONENT_DESIGN_DEVICES,
  COMPONENT_DESIGN_MEDIA_FRAMES,
  COMPONENT_DESIGN_OVERLAY_ANCHORS,
  COMPONENT_DESIGN_SECTION_HEIGHTS,
} from "./component-design-v3.ts";

export const COMPONENT_DESIGN_SCHEMA_VERSION = 4 as const;

export type {
  ComponentDesignDeepPartial,
  ComponentDesignDevice,
  ComponentDesignFlowPositioning,
  ComponentDesignMediaFrame,
  ComponentDesignNodePositioning,
  ComponentDesignOverlayAnchor,
  ComponentDesignOverlayPositioning,
  ComponentDesignSampleText,
  ComponentDesignSectionHeight,
};

export type ComponentDesignCompositionV4 =
  ComponentDesignCompositionDescriptor;

export type ComponentDesignDeviceNodeLayoutV4 =
  ComponentDesignDeviceNodeLayoutV3;

export type ComponentDesignSectionLayoutV4 =
  ComponentDesignSectionLayoutV3;

export type ComponentDesignDeviceLayoutV4 =
  ComponentDesignDeviceLayoutV3;

export type ComponentDesignDeviceOverrideV4 =
  ComponentDesignDeviceOverrideV3;

export type ComponentDesignVariantV4 = ComponentDesignVariantV3 & {
  composition: ComponentDesignCompositionV4[];
};

export type ComponentDesignEntryV4 = {
  variants: Record<string, ComponentDesignVariantV4>;
};

export type ComponentDesignDocumentV4 = {
  components: Record<ComponentDesignAuthorComponent, ComponentDesignEntryV4>;
  version: typeof COMPONENT_DESIGN_SCHEMA_VERSION;
};

export type ComponentDesignDocument = ComponentDesignDocumentV4;

export type ComponentDesignVariantPatchV4 =
  ComponentDesignDeepPartial<Omit<ComponentDesignVariantV4, "composition">>;

function clone<Value>(value: Value): Value {
  return structuredClone(value);
}

function getCanonicalComposition(
  component: ComponentDesignAuthorComponent,
  variant: string,
): ComponentDesignCompositionV4[] {
  return clone([
    ...(getComponentDesignVariantDescriptor(component, variant).composition ??
      []),
  ]);
}

function stripComposition(
  variant: ComponentDesignVariantV4,
): ComponentDesignVariantV3 {
  const layout = clone(variant) as ComponentDesignVariantV3 & {
    composition?: ComponentDesignCompositionV4[];
  };
  delete layout.composition;
  return layout;
}

function toV3Document(
  document: ComponentDesignDocumentV4,
): ComponentDesignDocumentV3 {
  return {
    components: Object.fromEntries(
      COMPONENT_DESIGN_AUTHOR_COMPONENTS.map((component) => [
        component,
        {
          variants: Object.fromEntries(
            Object.entries(document.components[component].variants).map(
              ([variant, value]) => [variant, stripComposition(value)],
            ),
          ),
        },
      ]),
    ) as ComponentDesignDocumentV3["components"],
    version: 3,
  };
}

export function migrateComponentDesignDocumentV3ToV4(
  document: ComponentDesignDocumentV3,
): ComponentDesignDocumentV4 {
  const source = normalizeComponentDesignDocumentV3(document);
  return {
    components: Object.fromEntries(
      COMPONENT_DESIGN_AUTHOR_COMPONENTS.map((component) => [
        component,
        {
          variants: Object.fromEntries(
            Object.entries(source.components[component].variants).map(
              ([variant, value]) => [
                variant,
                {
                  ...clone(value),
                  composition: getCanonicalComposition(component, variant),
                },
              ],
            ),
          ),
        },
      ]),
    ) as ComponentDesignDocumentV4["components"],
    version: COMPONENT_DESIGN_SCHEMA_VERSION,
  };
}

export function migrateComponentDesignDocumentV2ToV4(
  document: ComponentDesignDocumentV2,
): ComponentDesignDocumentV4 {
  return migrateComponentDesignDocumentV3ToV4(
    migrateComponentDesignDocumentV2ToV3(document),
  );
}

export function createDefaultComponentDesignDocument():
  ComponentDesignDocumentV4 {
  return migrateComponentDesignDocumentV3ToV4(
    createDefaultComponentDesignDocumentV3(),
  );
}

export const createDefaultComponentDesignDocumentV4 =
  createDefaultComponentDesignDocument;

export function normalizeComponentDesignDocument(
  value: unknown,
): ComponentDesignDocumentV4 {
  if (!isPlainRecord(value)) {
    return createDefaultComponentDesignDocument();
  }
  return migrateComponentDesignDocumentV3ToV4(
    normalizeComponentDesignDocumentV3({
      ...value,
      version: 3,
    }),
  );
}

export const normalizeComponentDesignDocumentV4 =
  normalizeComponentDesignDocument;

export function parseCurrentComponentDesignDocument(
  value: unknown,
): ComponentDesignDocumentV4 | null {
  if (
    !isPlainRecord(value) ||
    value.version !== COMPONENT_DESIGN_SCHEMA_VERSION
  ) {
    return null;
  }
  const normalized = normalizeComponentDesignDocument(value);
  return areJsonStructuresEqual(value, normalized) ? normalized : null;
}

export const parseCurrentComponentDesignDocumentV4 =
  parseCurrentComponentDesignDocument;

export function parseComponentDesignDocument(
  value: unknown,
): ComponentDesignDocumentV4 | null {
  const current = parseCurrentComponentDesignDocument(value);
  if (current) return current;
  const previous = parseComponentDesignDocumentV3(value);
  return previous
    ? migrateComponentDesignDocumentV3ToV4(previous)
    : null;
}

export const parseComponentDesignDocumentV4 =
  parseComponentDesignDocument;

export function cloneComponentDesignDocument(
  document: ComponentDesignDocumentV4,
): ComponentDesignDocumentV4 {
  return clone(document);
}

export const cloneComponentDesignDocumentV4 =
  cloneComponentDesignDocument;

export function resolveComponentDesignDeviceLayout(
  variant: ComponentDesignVariantV4,
  device: ComponentDesignDevice,
): ComponentDesignDeviceLayoutV4 {
  return resolveComponentDesignDeviceLayoutV3(variant, device);
}

export function enableComponentDesignDeviceOverride(
  variant: ComponentDesignVariantV4,
  device: Exclude<ComponentDesignDevice, "desktop">,
): ComponentDesignVariantV4 {
  return {
    ...enableComponentDesignDeviceOverrideV3(
      stripComposition(variant),
      device,
    ),
    composition: clone(variant.composition),
  };
}

export function resolveComponentDesignRuntimeDocument(
  document: ComponentDesignDocumentV4,
): ComponentDesignDocumentV2 {
  return resolveComponentDesignRuntimeDocumentV3(toV3Document(document));
}

export function isComponentDesignAuthorComponent(
  value: unknown,
): value is ComponentDesignAuthorComponent {
  return isComponentDesignAuthorComponentV3(value);
}

export function mergeComponentDesignVariantPatch(
  document: ComponentDesignDocumentV4,
  component: ComponentDesignAuthorComponent,
  variant: string,
  patch: unknown,
): ComponentDesignDocumentV4 | null {
  if (!isPlainRecord(patch) || "composition" in patch) return null;
  const merged = mergeComponentDesignVariantPatchV3(
    toV3Document(document),
    component,
    variant,
    patch,
  );
  return merged
    ? migrateComponentDesignDocumentV3ToV4(merged)
    : null;
}
