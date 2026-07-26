"use client";

import type { Data } from "@puckeditor/core";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import Typography from "@/components/common/Typography";
import {
  COMPONENT_DESIGN_UPDATED_EVENT,
  dispatchComponentDesignUpdated,
  useComponentDesignDocument,
} from "@/components/layout/ComponentDesignProvider";
import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  COMPONENT_DESIGN_MANIFEST_BY_COMPONENT,
  getComponentDesignVariantDescriptor,
  type ComponentDesignAuthorComponent,
  type ComponentDesignNodeDescriptor,
} from "@/lib/component-design-manifest";
import {
  COMPONENT_DESIGN_OPTICAL_PULL_TOKENS,
  COMPONENT_DESIGN_RHYTHM_TOKENS,
  COMPONENT_DESIGN_SECTION_PROFILES,
  cloneComponentDesignDocument,
  normalizeComponentDesignDocument,
  resolveComponentDesignVariant,
  type ComponentDesignBreakpoint,
  type ComponentDesignDocument,
  type ComponentGridPlacement,
  type ComponentVariantLayout,
} from "@/lib/component-design-v2";
import type { TypographyAlignment } from "@/lib/typography-alignment";
import {
  areComponentDesignDocumentsEqual,
  COMPONENT_DESIGN_COMMIT_CHANNEL,
  isCommittedComponentDesignMessage,
  reconcileComponentDesignDraftAfterSave,
} from "@/lib/component-design-commit";
import type {
  ComponentLabCatalogEntry,
  ComponentLabCatalogInstance,
  ComponentLabInstanceCatalog,
} from "@/lib/component-lab-presets";
import {
  COMPONENT_LAB_PREVIEW_READY_MESSAGE,
  COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
  isComponentLabPreviewHeightMessage,
  isComponentLabPreviewPlacementMessage,
  isComponentLabPreviewSelectNodeMessage,
  type ComponentLabPreviewRenderMessage,
} from "@/lib/component-lab-preview-messages";
import type { FontLabDocument } from "@/lib/font-lab-config-schema";
import { getLocalEditorAccessHeaders } from "@/lib/local-editor-access";
import {
  DEFAULT_PREVIEW_VIEWPORT,
  PREVIEW_VIEWPORTS,
} from "@/lib/preview-viewports";
import {
  toAdminPathFromSlugKey,
  toPublicPathFromSlugKey,
} from "@/lib/public-paths";
import {
  TYPOGRAPHY_PRESETS,
  TYPOGRAPHY_SIZES,
  TYPOGRAPHY_WRAP_POLICIES,
  getTypographyFontLabSizes,
  type TypographyPreset,
  type TypographySize,
  type TypographyWrapPolicy,
} from "@/lib/typography-tokens";

type ComponentDesignApiPayload = {
  config?: ComponentDesignDocument;
  error?: { code: string; message: string };
  hasSaved?: boolean;
  path?: string;
  revision?: string;
};

type FontLabApiPayload = {
  config?: FontLabDocument;
};

const BREAKPOINT_LABELS: Record<ComponentDesignBreakpoint, string> = {
  desktop: "桌面",
  mobile: "手机",
  tablet: "平板",
};

const SECTION_PROFILE_LABELS = {
  compact: "紧凑",
  hero: "Hero",
  normal: "标准",
  spacious: "宽松",
} as const;

const ALIGNMENT_OPTIONS = [
  { label: "左对齐", value: "left" },
  { label: "居中", value: "center" },
  { label: "右对齐", value: "right" },
  { label: "两端对齐", value: "justify" },
];

function SmallText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Typography
      as="span"
      preset="sans-body"
      size="caption"
      weight="medium"
      wrapPolicy="prose"
      className={className}
    >
      {children}
    </Typography>
  );
}

function SelectField({
  disabled = false,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <SmallText className="text-textMuted">{label}</SmallText>
      <select
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="min-h-10 w-full border border-white/12 bg-black px-3 text-sm text-textPrimary outline-none transition-colors focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function IntegerInput({
  disabled = false,
  label,
  maximum,
  minimum = 1,
  onCommit,
  value,
}: {
  disabled?: boolean;
  label: string;
  maximum: number;
  minimum?: number;
  onCommit: (value: number) => void;
  value: number;
}) {
  const [draft, setDraft] = useState<{
    sourceValue: number;
    value: string;
  } | null>(null);
  const input = draft?.sourceValue === value ? draft.value : String(value);

  const parsed = Number(input);
  const valid = Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum;

  function commit() {
    if (valid) {
      onCommit(parsed);
    }
    setDraft(null);
  }

  return (
    <label className="grid gap-2">
      <SmallText className="text-textMuted">{label}</SmallText>
      <input
        disabled={disabled}
        type="number"
        inputMode="numeric"
        min={minimum}
        max={maximum}
        step={1}
        value={input}
        aria-invalid={!valid}
        onBlur={commit}
        onChange={(event) => setDraft({
          sourceValue: value,
          value: event.currentTarget.value,
        })}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
            event.currentTarget.blur();
          }
        }}
        className={`min-h-10 w-full border bg-black px-3 text-sm text-textPrimary outline-none disabled:cursor-not-allowed disabled:opacity-45 ${
          valid ? "border-white/12 focus:border-white/40" : "border-red-400/70"
        }`}
      />
    </label>
  );
}

function PlacementControl({
  disabled = false,
  onChange,
  placement,
}: {
  disabled?: boolean;
  onChange: (placement: ComponentGridPlacement) => void;
  placement: ComponentGridPlacement;
}) {
  const end = placement.start + placement.span - 1;
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <SmallText className="text-textMuted">页面 12 格</SmallText>
        <SmallText className="text-textPrimary">
          第 {placement.start}–{end} 格
        </SmallText>
      </div>
      <div
        className="grid grid-cols-12 gap-1"
        aria-label={`第 ${placement.start} 至 ${end} 格`}
      >
        {Array.from({ length: 12 }, (_, index) => {
          const column = index + 1;
          const active = column >= placement.start && column <= end;
          return (
            <span
              key={column}
              className={`h-3 ${active ? "bg-cyan-200/80" : "bg-white/10"}`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <IntegerInput
          disabled={disabled}
          label="起始格"
          value={placement.start}
          maximum={13 - placement.span}
          onCommit={(start) => onChange({ ...placement, start })}
        />
        <IntegerInput
          disabled={disabled}
          label="占据格"
          value={placement.span}
          maximum={13 - placement.start}
          onCommit={(span) => onChange({ ...placement, span })}
        />
      </div>
    </div>
  );
}

function getInitialInstance(entry: ComponentLabCatalogEntry) {
  const instanceId = entry.preferredInstanceId ?? entry.stressSample.id;
  return entry.instances.find((candidate) => candidate.id === instanceId) ??
    entry.stressSample;
}

function getInstance(
  entry: ComponentLabCatalogEntry,
  instanceId: string,
): ComponentLabCatalogInstance {
  return entry.instances.find((candidate) => candidate.id === instanceId) ??
    entry.stressSample;
}

function forceVariantProps(
  component: ComponentDesignAuthorComponent,
  variant: string,
  props: Record<string, unknown>,
) {
  switch (component) {
    case "HeroSection":
    case "EditorialHeader":
    case "ThreeColumnSection":
    case "ImagePanel":
    case "BreakdownHeadline":
      return { ...props, variant };
    case "EditorialSplit":
      return { ...props, layout: variant };
    case "StatementBlock":
      return { ...props, minHeight: variant };
    case "ProjectCoverLink":
      return { ...props, variant };
    default:
      return props;
  }
}

function createPreviewData(
  instance: ComponentLabCatalogInstance,
  component: ComponentDesignAuthorComponent,
  variant: string,
): Data {
  return {
    content: [
      {
        ...instance.node,
        props: forceVariantProps(component, variant, instance.node.props),
      },
    ],
    root: {
      props: {
        description: "",
        image: "",
        noIndex: true,
        title: "ComponentLab",
      },
    },
    zones: {},
  } as Data;
}

function LabPreviewFrame({
  activeBreakpoint,
  component,
  data,
  designDocument,
  height,
  onContentHeight,
  onPlacementChange,
  onSelectNode,
  selectedNodeId,
  showGrid,
  variant,
  viewportHeight,
  viewportWidth,
}: {
  activeBreakpoint: ComponentDesignBreakpoint;
  component: ComponentDesignAuthorComponent;
  data: Data;
  designDocument: ComponentDesignDocument;
  height: number;
  onContentHeight: (height: number) => void;
  onPlacementChange: (
    nodeId: string,
    breakpoint: ComponentDesignBreakpoint,
    placement: ComponentGridPlacement,
  ) => void;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string;
  showGrid: boolean;
  variant: string;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const renderMessage = useMemo<ComponentLabPreviewRenderMessage>(() => ({
    activeBreakpoint,
    component,
    data,
    designDocument,
    layoutMode: true,
    selectedNodeId,
    showGrid,
    type: COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
    variant,
    viewportHeight,
  }), [
    activeBreakpoint,
    component,
    data,
    designDocument,
    selectedNodeId,
    showGrid,
    variant,
    viewportHeight,
  ]);
  const postRenderMessage = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      renderMessage,
      window.location.origin,
    );
  }, [renderMessage]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow
      ) {
        return;
      }
      if (
        event.data &&
        typeof event.data === "object" &&
        "type" in event.data &&
        event.data.type === COMPONENT_LAB_PREVIEW_READY_MESSAGE
      ) {
        postRenderMessage();
      } else if (isComponentLabPreviewHeightMessage(event.data)) {
        onContentHeight(Math.max(viewportHeight, event.data.height));
      } else if (isComponentLabPreviewSelectNodeMessage(event.data)) {
        onSelectNode(event.data.nodeId);
      } else if (isComponentLabPreviewPlacementMessage(event.data)) {
        onPlacementChange(
          event.data.nodeId,
          event.data.breakpoint,
          event.data.placement,
        );
      }
    };
    window.addEventListener("message", handleMessage);
    postRenderMessage();
    return () => window.removeEventListener("message", handleMessage);
  }, [
    onContentHeight,
    onPlacementChange,
    onSelectNode,
    postRenderMessage,
    viewportHeight,
  ]);

  return (
    <div
      className="relative"
      style={{ height: `${height}px`, width: `${viewportWidth}px` }}
    >
      <iframe
        ref={iframeRef}
        title="ComponentLab 真实组件排版画布"
        src="/component-lab-preview"
        onLoad={postRenderMessage}
        className="relative z-10 block border-0 bg-black"
        style={{ height: `${height}px`, width: `${viewportWidth}px` }}
      />
    </div>
  );
}

function NodeInspector({
  breakpoint,
  descriptor,
  fontLabDocument,
  layout,
  nodeId,
  onUpdateLayout,
}: {
  breakpoint: ComponentDesignBreakpoint;
  descriptor: ComponentDesignNodeDescriptor;
  fontLabDocument: FontLabDocument | null;
  layout: ComponentVariantLayout;
  nodeId: string;
  onUpdateLayout: (updater: (layout: ComponentVariantLayout) => void) => void;
}) {
  const node = layout.nodes[nodeId];
  const placement = node.placement[breakpoint];
  const presetOptions = TYPOGRAPHY_PRESETS
    .filter((preset) => {
      const sizes = fontLabDocument?.presets[preset]?.sizes;
      return sizes ? Object.keys(sizes).length > 0 : getTypographyFontLabSizes(preset).length > 0;
    })
    .map((preset) => ({
      label: fontLabDocument?.presets[preset]?.labelZh ?? preset,
      value: preset,
    }));
  const sizeOptions = node.typography
    ? (
      fontLabDocument
        ? Object.keys(fontLabDocument.presets[node.typography.preset].sizes)
        : [...getTypographyFontLabSizes(node.typography.preset)]
    )
      .filter((size): size is TypographySize =>
        (TYPOGRAPHY_SIZES as readonly string[]).includes(size)
      )
      .map((size) => ({ label: size, value: size }))
    : [];

  return (
    <div className="grid gap-6">
      <PlacementControl
        disabled={node.bleed === "viewport"}
        placement={placement}
        onChange={(nextPlacement) => onUpdateLayout((nextLayout) => {
          nextLayout.nodes[nodeId].placement[breakpoint] = nextPlacement;
        })}
      />
      {node.bleed === "viewport" ? (
        <SmallText className="text-textMuted">
          视口出血媒体固定以页面第 1–12 格为锚点，边界延伸至视口；切回页面网格内后可调整格位。
        </SmallText>
      ) : null}

      {node.alignment ? (
        <SelectField
          label={`${BREAKPOINT_LABELS[breakpoint]}文字对齐`}
          value={node.alignment[breakpoint]}
          options={ALIGNMENT_OPTIONS}
          onChange={(alignment) => onUpdateLayout((nextLayout) => {
            nextLayout.nodes[nodeId].alignment![breakpoint] =
              alignment as TypographyAlignment;
          })}
        />
      ) : null}

      {node.typography ? (
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="FontLab 字体预设"
            value={node.typography.preset}
            options={presetOptions}
            onChange={(rawPreset) => onUpdateLayout((nextLayout) => {
              const preset = rawPreset as TypographyPreset;
              const nextSizes = fontLabDocument
                ? Object.keys(fontLabDocument.presets[preset].sizes)
                : [...getTypographyFontLabSizes(preset)];
              const currentSize = nextLayout.nodes[nodeId].typography!.size;
              nextLayout.nodes[nodeId].typography!.preset = preset;
              if (!nextSizes.includes(currentSize)) {
                nextLayout.nodes[nodeId].typography!.size =
                  nextSizes[0] as TypographySize;
              }
            })}
          />
          <SelectField
            label="FontLab 字号档位"
            value={node.typography.size}
            options={sizeOptions}
            onChange={(size) => onUpdateLayout((nextLayout) => {
              nextLayout.nodes[nodeId].typography!.size = size as TypographySize;
            })}
          />
          <div className="col-span-2">
            <SelectField
              label="换行策略"
              value={node.typography.wrap}
              options={TYPOGRAPHY_WRAP_POLICIES.map((policy) => ({
                label: policy,
                value: policy,
              }))}
              onChange={(wrap) => onUpdateLayout((nextLayout) => {
                nextLayout.nodes[nodeId].typography!.wrap =
                  wrap as TypographyWrapPolicy;
              })}
            />
          </div>
        </div>
      ) : null}

      {node.opticalPull !== undefined ? (
        <SelectField
          label="光学上提"
          value={String(node.opticalPull)}
          options={COMPONENT_DESIGN_OPTICAL_PULL_TOKENS.map((value) => ({
            label: `${value}px`,
            value: String(value),
          }))}
          onChange={(value) => onUpdateLayout((nextLayout) => {
            nextLayout.nodes[nodeId].opticalPull =
              Number(value) as typeof nextLayout.nodes[typeof nodeId]["opticalPull"];
          })}
        />
      ) : null}

      {node.bleed ? (
        <SelectField
          label="媒体边界"
          value={node.bleed}
          options={[
            { label: "页面网格内", value: "none" },
            { label: "延伸至视口", value: "viewport" },
          ]}
          onChange={(bleed) => onUpdateLayout((nextLayout) => {
            nextLayout.nodes[nodeId].bleed = bleed as "none" | "viewport";
            if (bleed === "viewport") {
              nextLayout.nodes[nodeId].placement = {
                desktop: { span: 12, start: 1 },
                mobile: { span: 12, start: 1 },
                tablet: { span: 12, start: 1 },
              };
            }
          })}
        />
      ) : null}

      <div className="border-t border-white/10 pt-4">
        <SmallText className="text-textMuted">
          {descriptor.repeated
            ? "共享模板节点：画布中同角色条目会一起高亮并使用同一规则。"
            : descriptor.optional
              ? "可选节点：Puck 内容为空时隐藏，周边间距自动收拢。"
              : "该节点由 ComponentLab 统一控制排版。"}
        </SmallText>
      </div>
    </div>
  );
}

export default function ComponentLabClient({
  catalog,
}: {
  catalog: ComponentLabInstanceCatalog;
}) {
  const router = useRouter();
  const providerDocument = useComponentDesignDocument();
  const normalizedProviderDocument = useMemo(
    () => normalizeComponentDesignDocument(providerDocument),
    [providerDocument],
  );
  const [committedDocument, setCommittedDocument] = useState(
    normalizedProviderDocument,
  );
  const [draftDocument, setDraftDocument] = useState(normalizedProviderDocument);
  const [baseRevision, setBaseRevision] = useState<string | null>(null);
  const [fontLabDocument, setFontLabDocument] = useState<FontLabDocument | null>(
    null,
  );
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentDesignAuthorComponent>("HeroSection");
  const [selectedInstanceByComponent, setSelectedInstanceByComponent] = useState(
    () => Object.fromEntries(
      COMPONENT_DESIGN_AUTHOR_COMPONENTS.map((component) => [
        component,
        getInitialInstance(catalog.components[component]).id,
      ]),
    ) as Record<ComponentDesignAuthorComponent, string>,
  );
  const initialInstance = getInitialInstance(catalog.components.HeroSection);
  const [selectedVariant, setSelectedVariant] = useState(
    resolveComponentDesignVariant("HeroSection", initialInstance.node.props),
  );
  const [selectedNodeId, setSelectedNodeId] = useState(
    getComponentDesignVariantDescriptor("HeroSection", selectedVariant)
      .nodes[0].id,
  );
  const [activeBreakpoint, setActiveBreakpoint] =
    useState<ComponentDesignBreakpoint>("desktop");
  const [showGrid, setShowGrid] = useState(true);
  const [saveState, setSaveState] =
    useState<"error" | "idle" | "saving" | "success">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [configPath, setConfigPath] = useState(
    "content/component-design/component-design.json",
  );
  const [externalUpdatePending, setExternalUpdatePending] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewMeasurement, setPreviewMeasurement] = useState({
    height: 0,
    key: "",
  });
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const committedDocumentRef = useRef(committedDocument);
  const draftDocumentRef = useRef(draftDocument);
  const localCommitRef = useRef<ComponentDesignDocument | null>(null);

  const isDirty = !areComponentDesignDocumentsEqual(
    draftDocument,
    committedDocument,
  );
  const selectedEntry = catalog.components[selectedComponent];
  const selectedInstance = getInstance(
    selectedEntry,
    selectedInstanceByComponent[selectedComponent],
  );
  const manifestEntry = COMPONENT_DESIGN_MANIFEST_BY_COMPONENT[selectedComponent];
  const variantDescriptor = getComponentDesignVariantDescriptor(
    selectedComponent,
    selectedVariant,
  );
  const selectedNodeDescriptor = variantDescriptor.nodes.find(
    (node) => node.id === selectedNodeId,
  ) ?? variantDescriptor.nodes[0];
  const selectedLayout =
    draftDocument.components[selectedComponent].variants[selectedVariant] ??
    draftDocument.components[selectedComponent].variants[
      manifestEntry.defaultVariant
    ];
  const selectedGapEntries = Object.entries(selectedLayout.gaps).filter(
    ([pair]) => pair.split(">").includes(selectedNodeDescriptor.id),
  );
  const activeViewport = PREVIEW_VIEWPORTS.find(
    (viewport) => viewport.key === activeBreakpoint,
  ) ?? DEFAULT_PREVIEW_VIEWPORT;
  const previewData = useMemo(
    () => createPreviewData(
      selectedInstance,
      selectedComponent,
      selectedVariant,
    ),
    [selectedComponent, selectedInstance, selectedVariant],
  );
  const previewMeasurementKey =
    `${selectedComponent}:${selectedVariant}:${selectedInstance.id}:${activeBreakpoint}`;
  const previewContentHeight =
    previewMeasurement.key === previewMeasurementKey
      ? previewMeasurement.height
      : 0;
  const previewCanvasHeight = Math.max(
    activeViewport.height,
    previewContentHeight,
  );
  const scaledHeight = previewCanvasHeight * previewScale;
  const pageSlug = selectedInstance.pageSlug;
  const puckHref = pageSlug ? toAdminPathFromSlugKey(pageSlug) : "/admin";
  const publicHref = pageSlug ? toPublicPathFromSlugKey(pageSlug) : "/";

  const handlePreviewContentHeight = useCallback((height: number) => {
    setPreviewMeasurement((current) =>
      current.key === previewMeasurementKey && current.height === height
        ? current
        : { height, key: previewMeasurementKey }
    );
  }, [previewMeasurementKey]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    void router.prefetch("/playground");
    const headers = getLocalEditorAccessHeaders();
    void Promise.all([
      fetch("/api/component-design", {
        cache: "no-store",
        headers,
      }).then(async (response) =>
        response.ok
          ? response.json() as Promise<ComponentDesignApiPayload>
          : null
      ),
      fetch("/api/font-lab", {
        cache: "no-store",
        headers,
      }).then(async (response) =>
        response.ok ? response.json() as Promise<FontLabApiPayload> : null
      ),
    ]).then(([componentPayload, fontPayload]) => {
      if (componentPayload?.config && componentPayload.revision) {
        const document = normalizeComponentDesignDocument(componentPayload.config);
        committedDocumentRef.current = document;
        draftDocumentRef.current = document;
        setCommittedDocument(document);
        setDraftDocument(document);
        setBaseRevision(componentPayload.revision);
        if (componentPayload.path) setConfigPath(componentPayload.path);
      }
      if (fontPayload?.config) setFontLabDocument(fontPayload.config);
    }).catch(() => {
      setStatusMessage("初始配置读取失败，当前仍保留服务端渲染的配置。");
    });
  }, [router]);

  useEffect(() => {
    const applyExternalDocument = (incoming: ComponentDesignDocument) => {
      const nextDocument = normalizeComponentDesignDocument(incoming);
      if (
        localCommitRef.current &&
        areComponentDesignDocumentsEqual(localCommitRef.current, nextDocument)
      ) {
        localCommitRef.current = null;
        return;
      }
      if (
        areComponentDesignDocumentsEqual(
          committedDocumentRef.current,
          nextDocument,
        )
      ) {
        return;
      }
      if (
        !areComponentDesignDocumentsEqual(
          draftDocumentRef.current,
          committedDocumentRef.current,
        )
      ) {
        setExternalUpdatePending(true);
        setStatusMessage(
          "检测到外部配置变化；本地草稿已保留，保存前需解决 revision 冲突。",
        );
        return;
      }

      committedDocumentRef.current = nextDocument;
      draftDocumentRef.current = nextDocument;
      setCommittedDocument(nextDocument);
      setDraftDocument(nextDocument);
      void fetch("/api/component-design", {
        cache: "no-store",
        headers: getLocalEditorAccessHeaders(),
      }).then(async (response) => {
        if (!response.ok) return;
        const payload = await response.json() as ComponentDesignApiPayload;
        if (payload.revision) setBaseRevision(payload.revision);
      }).catch(() => undefined);
    };
    const handleLocalUpdate = (event: Event) => {
      const document = (event as CustomEvent<ComponentDesignDocument>).detail;
      if (document) applyExternalDocument(document);
    };
    const channel = typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(COMPONENT_DESIGN_COMMIT_CHANNEL);
    const handleCommittedMessage = (event: MessageEvent<unknown>) => {
      if (isCommittedComponentDesignMessage(event.data)) {
        applyExternalDocument(event.data.document);
      }
    };

    window.addEventListener(
      COMPONENT_DESIGN_UPDATED_EVENT,
      handleLocalUpdate as EventListener,
    );
    channel?.addEventListener("message", handleCommittedMessage);
    return () => {
      window.removeEventListener(
        COMPONENT_DESIGN_UPDATED_EVENT,
        handleLocalUpdate as EventListener,
      );
      channel?.removeEventListener("message", handleCommittedMessage);
      channel?.close();
    };
  }, []);

  useLayoutEffect(() => {
    const node = previewFrameRef.current;
    if (!node) return;
    const updateScale = () => {
      const availableWidth = Math.max(1, node.clientWidth - 2);
      setPreviewScale(Math.min(1, availableWidth / activeViewport.width));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeViewport.width]);

  function updateDraft(
    updater: (next: ComponentDesignDocument) => void,
  ) {
    setDraftDocument((current) => {
      const next = cloneComponentDesignDocument(current);
      updater(next);
      const normalized = normalizeComponentDesignDocument(next);
      draftDocumentRef.current = normalized;
      return normalized;
    });
    setSaveState("idle");
    setStatusMessage("");
  }

  function updateSelectedLayout(
    updater: (layout: ComponentVariantLayout) => void,
  ) {
    updateDraft((next) => {
      updater(next.components[selectedComponent].variants[selectedVariant]);
    });
  }

  function selectComponent(component: ComponentDesignAuthorComponent) {
    setSelectedComponent(component);
    const instance = getInstance(
      catalog.components[component],
      selectedInstanceByComponent[component],
    );
    const variant = resolveComponentDesignVariant(component, instance.node.props);
    setSelectedVariant(variant);
    setSelectedNodeId(
      getComponentDesignVariantDescriptor(component, variant).nodes[0].id,
    );
  }

  function selectInstance(instanceId: string) {
    const instance = getInstance(selectedEntry, instanceId);
    setSelectedInstanceByComponent((current) => ({
      ...current,
      [selectedComponent]: instanceId,
    }));
    const variant = resolveComponentDesignVariant(
      selectedComponent,
      instance.node.props,
    );
    setSelectedVariant(variant);
    setSelectedNodeId(
      getComponentDesignVariantDescriptor(selectedComponent, variant).nodes[0].id,
    );
  }

  function copyDesktopToCurrentBreakpoint() {
    if (activeBreakpoint === "desktop") return;
    updateSelectedLayout((layout) => {
      Object.values(layout.nodes).forEach((node) => {
        node.placement[activeBreakpoint] = { ...node.placement.desktop };
        if (node.alignment) {
          node.alignment[activeBreakpoint] = node.alignment.desktop;
        }
      });
      Object.values(layout.gaps).forEach((gap) => {
        gap[activeBreakpoint] = gap.desktop;
      });
    });
  }

  function resetSelectedVariant() {
    const defaults = normalizeComponentDesignDocument({});
    updateDraft((next) => {
      next.components[selectedComponent].variants[selectedVariant] =
        cloneComponentDesignDocument(defaults).components[selectedComponent]
          .variants[selectedVariant];
    });
  }

  async function saveDocument() {
    if (!baseRevision) {
      setSaveState("error");
      setStatusMessage("尚未取得服务端 revision，不能安全保存。");
      return;
    }
    const submittedDocument = cloneComponentDesignDocument(draftDocument);
    setSaveState("saving");
    setStatusMessage("正在保存全部更改…");
    try {
      const response = await fetch("/api/component-design", {
        body: JSON.stringify({
          baseRevision,
          config: submittedDocument,
        }),
        headers: {
          "Content-Type": "application/json",
          ...getLocalEditorAccessHeaders(),
        },
        method: "POST",
      });
      const payload = await response.json() as ComponentDesignApiPayload;
      if (response.status === 409) {
        setExternalUpdatePending(true);
        setSaveState("error");
        setStatusMessage(
          "保存被阻止：正式配置已被其他窗口修改。本地草稿仍完整保留。",
        );
        return;
      }
      if (!response.ok || !payload.config || !payload.revision) {
        throw new Error(payload.error?.message ?? "保存失败");
      }

      const nextDocument = normalizeComponentDesignDocument(payload.config);
      committedDocumentRef.current = nextDocument;
      setCommittedDocument(nextDocument);
      setDraftDocument((currentDraft) => {
        const nextDraft = reconcileComponentDesignDraftAfterSave({
          committedDocument: nextDocument,
          currentDraft,
          submittedDraft: submittedDocument,
        });
        draftDocumentRef.current = nextDraft;
        return nextDraft;
      });
      setBaseRevision(payload.revision);
      setExternalUpdatePending(false);
      if (payload.path) setConfigPath(payload.path);
      localCommitRef.current = nextDocument;
      dispatchComponentDesignUpdated(nextDocument);
      setSaveState("success");
      setStatusMessage("已保存；Puck 与公开页面已收到 V2 配置广播。");
    } catch (error) {
      setSaveState("error");
      setStatusMessage(
        error instanceof Error ? error.message : "保存失败，本地草稿已保留。",
      );
    }
  }

  const componentOptions = COMPONENT_DESIGN_AUTHOR_COMPONENTS.map((component) => ({
    label: `${COMPONENT_DESIGN_MANIFEST_BY_COMPONENT[component].label} · ${
      catalog.components[component].instances.length
    } 个实例`,
    value: component,
  }));
  const instanceOptions = [
    ...selectedEntry.instances.map((instance) => ({
      label: instance.label,
      value: instance.id,
    })),
    {
      label: selectedEntry.stressSample.label,
      value: selectedEntry.stressSample.id,
    },
  ];
  const variantOptions = manifestEntry.variants.map((variant) => ({
    label: variant.label,
    value: variant.id,
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid-container gap-y-5 py-6 lg:h-screen lg:grid-rows-[auto_minmax(0,1fr)] lg:overflow-hidden lg:py-8">
        <header className="col-span-12 flex items-start justify-between gap-6 border-b border-white/10 pb-5">
          <div>
            <SmallText className="text-textMuted">COMPONENTLAB V2 / LAYOUT ONLY</SmallText>
            <Typography
              as="h1"
              preset="sans-body"
              size="title-sm"
              weight="strong"
              wrapPolicy="heading"
              className="mt-1 text-white"
            >
              ComponentLab
            </Typography>
            <Typography
              as="p"
              preset="sans-body"
              size="body-sm"
              weight="regular"
              wrapPolicy="prose"
              className="mt-2 max-w-3xl text-textMuted"
            >
              Puck 管理内容与结构变体，FontLab 提供字体档位；这里仅编辑页面 12 格中的排版、对齐、节奏与媒体边界。
            </Typography>
          </div>
          <button
            type="button"
            onClick={() => router.push("/playground")}
            className="min-h-10 shrink-0 border border-white/12 px-3 text-sm text-textPrimary hover:border-white/30"
          >
            返回 Playground
          </button>
        </header>

        <aside
          aria-label="ComponentLab 排版检查器"
          className="col-span-12 flex min-h-0 flex-col lg:col-span-4 lg:h-full lg:border-r lg:border-white/10 lg:pr-6"
          data-component-lab-region="inspector"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
            <section className="grid gap-4 border-b border-white/10 pb-6">
              <SelectField
                label="作者组件"
                value={selectedComponent}
                options={componentOptions}
                onChange={(value) =>
                  selectComponent(value as ComponentDesignAuthorComponent)
                }
              />
              <SelectField
                label="真实内容实例"
                value={selectedInstance.id}
                options={instanceOptions}
                onChange={selectInstance}
              />
              <SelectField
                label="结构变体"
                value={selectedVariant}
                options={variantOptions}
                onChange={(variant) => {
                  setSelectedVariant(variant);
                  setSelectedNodeId(
                    getComponentDesignVariantDescriptor(
                      selectedComponent,
                      variant,
                    ).nodes[0].id,
                  );
                }}
              />
              <div className="flex flex-wrap gap-2">
                <a
                  href={puckHref}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-white/12 px-3 py-2 text-xs text-textPrimary hover:border-white/35"
                >
                  在 Puck 中打开实例
                </a>
                <a
                  href={publicHref}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-white/12 px-3 py-2 text-xs text-textPrimary hover:border-white/35"
                >
                  打开公开页
                </a>
              </div>
            </section>

            <section className="grid gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center justify-between gap-3">
                <SmallText className="text-textMuted">断点</SmallText>
                <button
                  type="button"
                  disabled={activeBreakpoint === "desktop"}
                  onClick={copyDesktopToCurrentBreakpoint}
                  className="text-xs text-textPrimary underline decoration-white/30 underline-offset-4 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  复制 Desktop 到当前断点
                </button>
              </div>
              <div className="grid grid-cols-3 border border-white/12">
                {(["desktop", "tablet", "mobile"] as const).map((breakpoint) => (
                  <button
                    key={breakpoint}
                    type="button"
                    aria-pressed={activeBreakpoint === breakpoint}
                    onClick={() => setActiveBreakpoint(breakpoint)}
                    className={`min-h-10 border-r border-white/12 px-2 text-xs last:border-r-0 ${
                      activeBreakpoint === breakpoint
                        ? "bg-white text-black"
                        : "text-textMuted hover:text-white"
                    }`}
                  >
                    {BREAKPOINT_LABELS[breakpoint]}
                  </button>
                ))}
              </div>
              <SelectField
                label="Section 档位"
                value={selectedLayout.sectionProfile}
                options={COMPONENT_DESIGN_SECTION_PROFILES.map((profile) => ({
                  label: SECTION_PROFILE_LABELS[profile],
                  value: profile,
                }))}
                onChange={(profile) => updateSelectedLayout((layout) => {
                  layout.sectionProfile =
                    profile as typeof layout.sectionProfile;
                })}
              />
            </section>

            <section className="grid gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <SmallText className="text-textMuted">节点</SmallText>
                  <Typography
                    as="h2"
                    preset="sans-body"
                    size="body-lg"
                    weight="medium"
                    wrapPolicy="heading"
                    className="mt-1 text-white"
                  >
                    {variantDescriptor.label}
                  </Typography>
                </div>
                <SmallText className="text-textMuted">
                  {variantDescriptor.nodes.length}
                </SmallText>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/10">
                {variantDescriptor.nodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    aria-pressed={selectedNodeId === node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`min-h-12 bg-black px-3 py-2 text-left ${
                      selectedNodeId === node.id
                        ? "text-cyan-100 outline outline-1 -outline-offset-1 outline-cyan-200/70"
                        : "text-textMuted hover:text-white"
                    }`}
                  >
                    <span className="block text-xs">{node.label}</span>
                    <span className="mt-1 block font-mono text-[10px] opacity-55">
                      {node.id}{node.repeated ? " · shared" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="border-b border-white/10 pb-6">
              <NodeInspector
                breakpoint={activeBreakpoint}
                descriptor={selectedNodeDescriptor}
                fontLabDocument={fontLabDocument}
                layout={selectedLayout}
                nodeId={selectedNodeDescriptor.id}
                onUpdateLayout={updateSelectedLayout}
              />
            </section>

            {selectedGapEntries.length > 0 ? (
              <section className="grid gap-4 border-b border-white/10 pb-6">
                <div>
                  <SmallText className="text-textMuted">固定节奏</SmallText>
                  <Typography
                    as="p"
                    preset="sans-body"
                    size="body-sm"
                    weight="regular"
                    wrapPolicy="prose"
                    className="mt-1 text-textPrimary"
                  >
                    仅允许 0 / 8 / 16 / 24 / 32 / 48 / 64。
                  </Typography>
                </div>
                {selectedGapEntries.map(([pair, gap]) => (
                  <SelectField
                    key={pair}
                    label={pair.replace(">", " → ")}
                    value={String(gap[activeBreakpoint])}
                    options={COMPONENT_DESIGN_RHYTHM_TOKENS.map((value) => ({
                      label: `${value}px`,
                      value: String(value),
                    }))}
                    onChange={(value) => updateSelectedLayout((layout) => {
                      layout.gaps[pair][activeBreakpoint] =
                        Number(value) as typeof layout.gaps[typeof pair][typeof activeBreakpoint];
                    })}
                  />
                ))}
              </section>
            ) : null}
          </div>

          <footer className="mt-5 border-t border-white/10 pt-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <SmallText className={isDirty ? "text-amber-200" : "text-textMuted"}>
                {isDirty ? "有未保存更改" : "草稿与正式配置一致"}
              </SmallText>
              <SmallText className="max-w-[15rem] truncate text-textMuted">
                {configPath}
              </SmallText>
            </div>
            {externalUpdatePending ? (
              <Typography
                as="p"
                preset="sans-body"
                size="caption"
                weight="regular"
                wrapPolicy="prose"
                className="mb-3 text-amber-200"
              >
                外部 revision 已变化，本地草稿未被覆盖。
              </Typography>
            ) : null}
            {statusMessage ? (
              <Typography
                as="p"
                preset="sans-body"
                size="caption"
                weight="regular"
                wrapPolicy="prose"
                className={`mb-3 ${
                  saveState === "error" ? "text-red-300" : "text-textMuted"
                }`}
              >
                {statusMessage}
              </Typography>
            ) : null}
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <button
                type="button"
                onClick={resetSelectedVariant}
                className="min-h-11 border border-white/12 px-3 text-sm text-textPrimary hover:border-white/35"
              >
                重置变体
              </button>
              <button
                type="button"
                disabled={!isDirty || saveState === "saving"}
                onClick={() => void saveDocument()}
                className="min-h-11 bg-white px-3 text-sm text-black disabled:cursor-not-allowed disabled:opacity-35"
              >
                {saveState === "saving" ? "保存中…" : "保存全部更改"}
              </button>
            </div>
          </footer>
        </aside>

        <section
          aria-label="ComponentLab 真实排版画布"
          className="col-span-12 min-h-0 lg:col-span-8 lg:h-full lg:pl-6"
          data-component-lab-region="canvas"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <SmallText className="text-textMuted">
                CANONICAL RENDERER / {activeViewport.width} × {activeViewport.height}
              </SmallText>
              <Typography
                as="p"
                preset="sans-body"
                size="caption"
                weight="regular"
                wrapPolicy="prose"
                className="mt-1 text-textPrimary"
              >
                点击节点选择；拖主体移动；拖左右边缘改变格位；方向键移动，Shift + 左右键改变跨度。
              </Typography>
            </div>
            <label className="flex items-center gap-2 text-xs text-textMuted">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(event) => setShowGrid(event.currentTarget.checked)}
                className="accent-white"
              />
              显示 12 格
            </label>
          </div>
          <div
            ref={previewFrameRef}
            className="h-[70vh] overflow-auto border border-white/10 bg-[#070707] lg:h-[calc(100%-3.5rem)]"
          >
            <div
              className="origin-top-left"
              style={{
                height: `${scaledHeight}px`,
                width: `${activeViewport.width * previewScale}px`,
              }}
            >
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                <LabPreviewFrame
                  activeBreakpoint={activeBreakpoint}
                  component={selectedComponent}
                  data={previewData}
                  designDocument={draftDocument}
                  height={previewCanvasHeight}
                  onContentHeight={handlePreviewContentHeight}
                  onPlacementChange={(nodeId, breakpoint, placement) => {
                    if (!selectedLayout.nodes[nodeId]) return;
                    setSelectedNodeId(nodeId);
                    updateSelectedLayout((layout) => {
                      layout.nodes[nodeId].placement[breakpoint] = placement;
                    });
                  }}
                  onSelectNode={(nodeId) => {
                    if (selectedLayout.nodes[nodeId]) setSelectedNodeId(nodeId);
                  }}
                  selectedNodeId={selectedNodeDescriptor.id}
                  showGrid={showGrid}
                  variant={selectedVariant}
                  viewportHeight={activeViewport.height}
                  viewportWidth={activeViewport.width}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
