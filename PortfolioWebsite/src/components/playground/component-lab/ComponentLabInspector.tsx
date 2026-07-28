"use client";

import type { FontLabDocument } from "@/lib/font-lab-config-schema";
import {
  COMPONENT_DESIGN_RHYTHM_TOKENS,
  COMPONENT_DESIGN_SECTION_PROFILES,
  type ComponentDesignRhythmToken,
  type ComponentDesignSectionProfile,
} from "@/lib/component-design-v2";
import {
  COMPONENT_DESIGN_OVERLAY_ANCHORS,
  COMPONENT_DESIGN_SECTION_HEIGHTS,
  resolveComponentDesignDeviceLayout,
  type ComponentDesignDevice,
  type ComponentDesignDeviceLayoutV4,
  type ComponentDesignMediaFrame,
  type ComponentDesignOverlayAnchor,
  type ComponentDesignSectionHeight,
  type ComponentDesignVariantV4,
} from "@/lib/component-design-v4";
import {
  getComponentDesignNodePolicyFromComposition,
  type ComponentDesignNodePolicy,
  type ComponentDesignNodeDescriptor,
  type ComponentDesignVariantDescriptor,
} from "@/lib/component-design-manifest";
import type { ComponentLabElementSelection } from "./ComponentElementNavigator";
import {
  TYPOGRAPHY_PRESETS,
  TYPOGRAPHY_SIZES,
  TYPOGRAPHY_WRAP_POLICIES,
  getTypographyFontLabSizes,
  type TypographyPreset,
  type TypographySize,
  type TypographyWrapPolicy,
} from "@/lib/typography-tokens";
import type { TypographyAlignment } from "@/lib/typography-alignment";

const SECTION_PROFILE_LABELS: Record<ComponentDesignSectionProfile, string> = {
  compact: "紧凑",
  hero: "首屏",
  normal: "标准",
  spacious: "宽松",
};

const SECTION_HEIGHT_LABELS: Record<ComponentDesignSectionHeight, string> = {
  auto: "跟随内容",
  compact: "紧凑",
  normal: "标准",
  tall: "高区块",
  viewport: "满屏",
};

const MEDIA_FRAME_LABELS: Record<ComponentDesignMediaFrame, string> = {
  auto: "自然尺寸",
  cinematic: "电影宽幅",
  landscape: "横向",
  portrait: "竖向",
  square: "正方形",
  viewport: "铺满版式",
  wide: "宽幅",
};

const ANCHOR_LABELS: Record<ComponentDesignOverlayAnchor, string> = {
  bottom: "下方",
  center: "居中",
  top: "上方",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] text-white/45">
      {children}
    </span>
  );
}

function SelectControl({
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
    <label className="grid gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <select
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="min-h-9 w-full border border-white/12 bg-black px-2.5 text-xs text-white outline-none focus:border-white/35 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function NumberControl({
  disabled = false,
  label,
  maximum,
  minimum,
  onChange,
  step = 1,
  value,
}: {
  disabled?: boolean;
  label: string;
  maximum: number;
  minimum: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
}) {
  return (
    <label className="grid gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        disabled={disabled}
        type="number"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) => {
          const next = Number(event.currentTarget.value);
          if (Number.isFinite(next)) {
            onChange(Math.min(maximum, Math.max(minimum, next)));
          }
        }}
        className="min-h-9 w-full border border-white/12 bg-black px-2.5 text-xs text-white outline-none focus:border-white/35 disabled:cursor-not-allowed disabled:opacity-35"
      />
    </label>
  );
}

function DeviceRelationship({
  disabled,
  device,
  onEnableDevice,
  onRestoreDevice,
  variant,
}: {
  disabled: boolean;
  device: ComponentDesignDevice;
  onEnableDevice: () => void;
  onRestoreDevice: () => void;
  variant: ComponentDesignVariantV4;
}) {
  if (device === "desktop") {
    return (
      <div className="border border-white/10 bg-white/[0.025] px-3 py-2 text-[11px] text-white/50">
        桌面是基础版式，平板和手机可以跟随它。
      </div>
    );
  }
  const linked = variant[device].mode === "linked";
  return (
    <div className="flex items-center justify-between gap-3 border border-white/10 bg-white/[0.025] px-3 py-2">
      <span className="text-[11px] text-white/50">
        {linked ? "跟随桌面" : "独立调整"}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={linked ? onEnableDevice : onRestoreDevice}
        className="text-[11px] text-white underline decoration-white/25 underline-offset-4 hover:decoration-white/70 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {linked ? "单独调整" : "恢复跟随桌面"}
      </button>
    </div>
  );
}

function replaceLayoutNode(
  layout: ComponentDesignDeviceLayoutV4,
  roleId: string,
  updater: (
    node: ComponentDesignDeviceLayoutV4["nodes"][string],
  ) => ComponentDesignDeviceLayoutV4["nodes"][string],
) {
  return {
    ...layout,
    nodes: {
      ...layout.nodes,
      [roleId]: updater(layout.nodes[roleId]),
    },
  };
}

function SectionInspector({
  disabled,
  layout,
  onLayoutChange,
}: {
  disabled: boolean;
  layout: ComponentDesignDeviceLayoutV4;
  onLayoutChange: (layout: ComponentDesignDeviceLayoutV4) => void;
}) {
  const updateSection = (
    patch: Partial<ComponentDesignDeviceLayoutV4["section"]>,
  ) => onLayoutChange({
    ...layout,
    section: { ...layout.section, ...patch },
  });

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-sm font-medium text-white">版式整体</h2>
        <p className="mt-1 text-[11px] leading-5 text-white/40">
          调整组件整体规则，画布中不能拖动整个组件。
        </p>
      </div>
      <SelectControl
        disabled={disabled}
        label="区块高度"
        value={layout.section.height}
        options={COMPONENT_DESIGN_SECTION_HEIGHTS.map((height) => ({
          label: SECTION_HEIGHT_LABELS[height],
          value: height,
        }))}
        onChange={(height) =>
          updateSection({ height: height as ComponentDesignSectionHeight })}
      />
      <SelectControl
        disabled={disabled}
        label="整体节奏"
        value={layout.section.profile}
        options={COMPONENT_DESIGN_SECTION_PROFILES.map((profile) => ({
          label: SECTION_PROFILE_LABELS[profile],
          value: profile,
        }))}
        onChange={(profile) =>
          updateSection({ profile: profile as ComponentDesignSectionProfile })}
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberControl
          disabled={disabled}
          label="上方留白"
          value={layout.section.paddingTop}
          minimum={0}
          maximum={320}
          step={8}
          onChange={(paddingTop) => updateSection({ paddingTop })}
        />
        <NumberControl
          disabled={disabled}
          label="下方留白"
          value={layout.section.paddingBottom}
          minimum={0}
          maximum={320}
          step={8}
          onChange={(paddingBottom) => updateSection({ paddingBottom })}
        />
      </div>
      <NumberControl
        disabled={disabled}
        label="整体间距"
        value={layout.section.gap}
        minimum={0}
        maximum={320}
        step={8}
        onChange={(gap) => updateSection({ gap })}
      />
    </div>
  );
}

function getTextValue(
  sampleText: Record<string, string | string[]>,
  selection: ComponentLabElementSelection,
) {
  const value = sampleText[selection.roleId];
  return Array.isArray(value)
    ? value[selection.occurrenceId] ?? ""
    : value ?? "";
}

export default function ComponentLabInspector({
  activeDevice,
  editingEnabled,
  effectiveSampleText,
  fontLabDocument,
  onEnableDevice,
  onLayoutChange,
  onRestoreDevice,
  onSampleTextCommit,
  onSampleTextChange,
  selection,
  variant,
  variantDescriptor,
}: {
  activeDevice: ComponentDesignDevice;
  editingEnabled: boolean;
  effectiveSampleText: Record<string, string | string[]>;
  fontLabDocument: FontLabDocument | null;
  onEnableDevice: () => void;
  onLayoutChange: (layout: ComponentDesignDeviceLayoutV4) => void;
  onRestoreDevice: () => void;
  onSampleTextCommit: () => void;
  onSampleTextChange: (
    selection: ComponentLabElementSelection,
    value: string,
  ) => void;
  selection: ComponentLabElementSelection[];
  variant: ComponentDesignVariantV4;
  variantDescriptor: ComponentDesignVariantDescriptor;
}) {
  const layout = resolveComponentDesignDeviceLayout(variant, activeDevice);
  const linked = activeDevice !== "desktop" &&
    variant[activeDevice].mode === "linked";
  const controlsDisabled = !editingEnabled || linked;
  const selected = selection.length === 1 ? selection[0] : null;
  const descriptor = selected
    ? variantDescriptor.nodes.find((node) => node.id === selected.roleId)
    : null;
  const node = descriptor ? layout.nodes[descriptor.id] : null;
  const policy = descriptor
    ? getComponentDesignNodePolicyFromComposition(
      variant.composition,
      descriptor.id,
    )
    : null;

  return (
    <aside
      aria-label="当前元素属性"
      data-component-lab-region="inspector"
      className="grid h-[720px] min-w-0 grid-rows-[auto_minmax(0,1fr)] border-t border-white/10 bg-black md:col-span-2 md:row-start-2 min-[1100px]:col-span-1 min-[1100px]:col-start-3 min-[1100px]:row-start-1 min-[1100px]:h-auto min-[1100px]:min-h-0 min-[1100px]:border-l min-[1100px]:border-t-0"
    >
      <div className="border-b border-white/10 p-3">
        <DeviceRelationship
          disabled={!editingEnabled}
          device={activeDevice}
          onEnableDevice={onEnableDevice}
          onRestoreDevice={onRestoreDevice}
          variant={variant}
        />
      </div>
      <div className="component-lab-scroll min-h-0 overflow-y-auto p-4">
        {selection.length === 0 ? (
          <SectionInspector
            disabled={controlsDisabled}
            layout={layout}
            onLayoutChange={onLayoutChange}
          />
        ) : selection.length > 1 ? (
          <div>
            <h2 className="text-sm font-medium text-white">
              已选择 {selection.length} 个元素
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/45">
              拖动画布中的任一选中元素可共同移动。多选不改变尺寸、图层或组件结构。
            </p>
          </div>
        ) : descriptor && node && selected && policy ? (
          <ElementInspector
            descriptor={descriptor}
            disabled={controlsDisabled}
            fontLabDocument={fontLabDocument}
            layout={layout}
            node={node}
            onLayoutChange={onLayoutChange}
            onSampleTextCommit={onSampleTextCommit}
            onSampleTextChange={(value) =>
              onSampleTextChange(selected, value)}
            policy={policy}
            roleId={descriptor.id}
            sampleText={getTextValue(effectiveSampleText, selected)}
          />
        ) : (
          <p className="text-xs text-white/45">这个元素暂时没有可编辑属性。</p>
        )}
      </div>
    </aside>
  );
}

function ElementInspector({
  descriptor,
  disabled,
  fontLabDocument,
  layout,
  node,
  onLayoutChange,
  onSampleTextCommit,
  onSampleTextChange,
  policy,
  roleId,
  sampleText,
}: {
  descriptor: ComponentDesignNodeDescriptor;
  disabled: boolean;
  fontLabDocument: FontLabDocument | null;
  layout: ComponentDesignDeviceLayoutV4;
  node: ComponentDesignDeviceLayoutV4["nodes"][string];
  onLayoutChange: (layout: ComponentDesignDeviceLayoutV4) => void;
  onSampleTextCommit: () => void;
  onSampleTextChange: (value: string) => void;
  policy: ComponentDesignNodePolicy;
  roleId: string;
  sampleText: string;
}) {
  const updateNode = (
    updater: (
      current: ComponentDesignDeviceLayoutV4["nodes"][string],
    ) => ComponentDesignDeviceLayoutV4["nodes"][string],
  ) => onLayoutChange(replaceLayoutNode(layout, roleId, updater));
  const typography = node.typography;
  const positioningLocked = descriptor.positioning === "fixed" ||
    node.bleed === "viewport" ||
    policy.lockPositioning;
  const placementLocked = node.bleed === "viewport" ||
    policy.lockPlacement;
  const alignmentOptions = [
    { label: "左对齐", value: "left" },
    { label: "居中", value: "center" },
    { label: "右对齐", value: "right" },
    ...(descriptor.kind !== "action" && typography?.wrap === "prose"
      ? [{ label: "两端对齐", value: "justify" }]
      : []),
  ];
  const presetOptions = TYPOGRAPHY_PRESETS
    .filter((preset) => {
      const sizes = fontLabDocument?.presets[preset]?.sizes;
      return sizes
        ? Object.keys(sizes).length > 0
        : getTypographyFontLabSizes(preset).length > 0;
    })
    .map((preset) => ({
      label: fontLabDocument?.presets[preset]?.labelZh ?? preset,
      value: preset,
    }));
  const sizeOptions = typography
    ? (
      fontLabDocument
        ? Object.keys(fontLabDocument.presets[typography.preset].sizes)
        : [...getTypographyFontLabSizes(typography.preset)]
    )
      .filter((size): size is TypographySize =>
        (TYPOGRAPHY_SIZES as readonly string[]).includes(size)
      )
      .map((size) => ({ label: size, value: size }))
    : [];

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-sm font-medium text-white">{descriptor.label}</h2>
        <p className="mt-1 text-[11px] text-white/40">
          {descriptor.repeated ? "同类条目共享布局规则" : descriptor.groupLabel}
        </p>
        {policy.compositionKinds.length > 0 ? (
          <p className="mt-2 border-l border-white/15 pl-2 text-[10px] leading-4 text-white/35">
            该元素受组件语义结构约束，不能脱离所属媒体、内容组或父级网格。
          </p>
        ) : null}
      </div>

      {descriptor.sampleBinding ? (
        <label className="grid gap-1.5">
          <FieldLabel>样例文字</FieldLabel>
          <textarea
            disabled={disabled}
            value={sampleText}
            onChange={(event) => onSampleTextChange(event.currentTarget.value)}
            onBlur={onSampleTextCommit}
            rows={4}
            className="w-full resize-y border border-white/12 bg-black px-2.5 py-2 text-xs leading-5 text-white outline-none focus:border-white/35 disabled:cursor-not-allowed disabled:opacity-35"
          />
          <span className="text-[10px] leading-4 text-white/30">
            只影响当前版式的 Lab 样例，不修改正式页面。
          </span>
        </label>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <NumberControl
          disabled={disabled || placementLocked}
          label="起始栏"
          value={node.placement.start}
          minimum={1}
          maximum={13 - node.placement.span}
          onChange={(start) =>
            updateNode((current) => ({
              ...current,
              placement: { ...current.placement, start },
            }))}
        />
        <NumberControl
          disabled={disabled || placementLocked || policy.lockResize}
          label="占用栏数"
          value={node.placement.span}
          minimum={1}
          maximum={13 - node.placement.start}
          onChange={(span) =>
            updateNode((current) => ({
              ...current,
              placement: { ...current.placement, span },
            }))}
        />
      </div>

      {positioningLocked ? (
        <p className="border border-white/10 px-3 py-2 text-[11px] leading-5 text-white/40">
          这个元素的位置由版式固定，不能单独拖动。
        </p>
      ) : node.positioning.mode === "flow" ? (
        <div className="grid grid-cols-2 gap-3">
          <NumberControl
            disabled={disabled}
            label="排列顺序"
            value={node.positioning.order}
            minimum={0}
            maximum={999}
            onChange={(order) =>
              updateNode((current) => ({
                ...current,
                positioning: {
                  gapBefore: current.positioning.mode === "flow"
                    ? current.positioning.gapBefore
                    : 0,
                  mode: "flow",
                  order,
                },
              }))}
          />
          <SelectControl
            disabled={disabled}
            label="前方间距"
            value={String(node.positioning.gapBefore)}
            options={COMPONENT_DESIGN_RHYTHM_TOKENS.map((gap) => ({
              label: `${gap}px`,
              value: String(gap),
            }))}
            onChange={(value) =>
              updateNode((current) => ({
                ...current,
                positioning: {
                  gapBefore: Number(value) as ComponentDesignRhythmToken,
                  mode: "flow",
                  order: current.positioning.mode === "flow"
                    ? current.positioning.order
                    : 0,
                },
              }))}
          />
        </div>
      ) : node.positioning.mode === "overlay" ? (
        <div className="grid grid-cols-2 gap-3">
          <SelectControl
            disabled={disabled}
            label="纵向位置"
            value={node.positioning.anchor}
            options={COMPONENT_DESIGN_OVERLAY_ANCHORS.map((anchor) => ({
              label: ANCHOR_LABELS[anchor],
              value: anchor,
            }))}
            onChange={(anchor) =>
              updateNode((current) => ({
                ...current,
                positioning: {
                  anchor: anchor as ComponentDesignOverlayAnchor,
                  anchored: true,
                  mode: "overlay",
                  offset: current.positioning.mode === "overlay"
                    ? current.positioning.offset
                    : 0,
                },
              }))}
          />
          <NumberControl
            disabled={disabled}
            label="细调偏移"
            value={node.positioning.offset}
            minimum={-320}
            maximum={320}
            step={8}
            onChange={(offset) =>
              updateNode((current) => ({
                ...current,
                positioning: {
                  anchor: current.positioning.mode === "overlay"
                    ? current.positioning.anchor
                    : "center",
                  anchored: true,
                  mode: "overlay",
                  offset,
                },
              }))}
          />
        </div>
      ) : (
        <p className="border border-white/10 px-3 py-2 text-[11px] leading-5 text-white/40">
          这个元素由版式固定定位，不能单独拖动。
        </p>
      )}

      {node.alignment ? (
        <SelectControl
          disabled={disabled}
          label={descriptor.kind === "action" ? "元素对齐" : "文字对齐"}
          value={node.alignment}
          options={alignmentOptions}
          onChange={(alignment) =>
            updateNode((current) => ({
              ...current,
              alignment: alignment as TypographyAlignment,
            }))}
        />
      ) : null}

      {typography ? (
        <div className="grid gap-3 border-t border-white/10 pt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
            文字样式
          </p>
          <SelectControl
            disabled={disabled}
            label="FontLab 样式"
            value={typography.preset}
            options={presetOptions}
            onChange={(rawPreset) => {
              const preset = rawPreset as TypographyPreset;
              const availableSizes = fontLabDocument
                ? Object.keys(fontLabDocument.presets[preset].sizes)
                : [...getTypographyFontLabSizes(preset)];
              updateNode((current) => ({
                ...current,
                typography: {
                  ...current.typography!,
                  preset,
                  size: availableSizes.includes(current.typography!.size)
                    ? current.typography!.size
                    : availableSizes[0] as TypographySize,
                },
              }));
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectControl
              disabled={disabled}
              label="字号档位"
              value={typography.size}
              options={sizeOptions}
              onChange={(size) =>
                updateNode((current) => ({
                  ...current,
                  typography: {
                    ...current.typography!,
                    size: size as TypographySize,
                  },
                }))}
            />
            <SelectControl
              disabled={disabled}
              label="换行方式"
              value={typography.wrap}
              options={TYPOGRAPHY_WRAP_POLICIES.map((wrap) => ({
                label: wrap === "heading"
                  ? "标题换行"
                  : wrap === "label"
                    ? "短标签"
                    : wrap === "nowrap"
                      ? "不换行"
                      : wrap === "url"
                        ? "链接"
                        : wrap === "code"
                          ? "代码"
                          : "正文",
                value: wrap,
              }))}
              onChange={(wrap) =>
                updateNode((current) => ({
                  ...current,
                  typography: {
                    ...current.typography!,
                    wrap: wrap as TypographyWrapPolicy,
                  },
                }))}
            />
          </div>
        </div>
      ) : null}

      {descriptor.kind === "media" ? (
        node.bleed === "viewport" ? (
          <p className="border-t border-white/10 pt-4 text-[11px] leading-5 text-white/40">
            全屏背景始终位于底层，尺寸跟随版式整体，图片素材不能在 Lab 中更换。
          </p>
        ) : (
          <div className="grid gap-3 border-t border-white/10 pt-5">
            <SelectControl
              disabled={disabled}
              label="图片展示框"
              value={node.mediaFrame ?? "auto"}
              options={(descriptor.mediaFrames ?? [])
                .filter((frame) => frame !== "viewport")
                .map((frame) => ({
                  label: MEDIA_FRAME_LABELS[frame],
                  value: frame,
                }))}
              onChange={(mediaFrame) =>
                updateNode((current) => ({
                  ...current,
                  mediaFrame: mediaFrame as ComponentDesignMediaFrame,
                }))}
            />
            <p className="text-[10px] leading-4 text-white/30">
              只能改变展示框，图片素材、焦点和裁切仍由 Puck 管理。
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
