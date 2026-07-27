"use client";

import {
  BoxSelect,
  Image as ImageIcon,
  Layers3,
  MousePointer2,
  TextCursorInput,
} from "lucide-react";

import type {
  ComponentDesignNodeDescriptor,
  ComponentDesignVariantDescriptor,
} from "@/lib/component-design-manifest";

export type ComponentLabElementSelection = {
  occurrenceId: number;
  roleId: string;
};

function ElementIcon({ descriptor }: { descriptor: ComponentDesignNodeDescriptor }) {
  if (descriptor.kind === "media") {
    return <ImageIcon aria-hidden="true" className="size-3.5" />;
  }
  if (descriptor.kind === "text") {
    return <TextCursorInput aria-hidden="true" className="size-3.5" />;
  }
  if (descriptor.kind === "action") {
    return <MousePointer2 aria-hidden="true" className="size-3.5" />;
  }
  return <Layers3 aria-hidden="true" className="size-3.5" />;
}

export default function ComponentElementNavigator({
  onSelectElement,
  onSelectGroup,
  onSelectSection,
  selection,
  variant,
}: {
  onSelectElement: (
    selection: ComponentLabElementSelection,
    additive: boolean,
  ) => void;
  onSelectGroup: (roleIds: string[]) => void;
  onSelectSection: () => void;
  selection: ComponentLabElementSelection[];
  variant: ComponentDesignVariantDescriptor;
}) {
  const groups = variant.nodes.reduce<Array<{
    id: string;
    label: string;
    nodes: ComponentDesignNodeDescriptor[];
  }>>((result, node) => {
    const group = result.find((candidate) => candidate.id === node.group);
    if (group) {
      group.nodes.push(node);
    } else {
      result.push({
        id: node.group,
        label: node.groupLabel,
        nodes: [node],
      });
    }
    return result;
  }, []);

  return (
    <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
          可编辑元素
        </p>
        <span className="text-[10px] text-white/30">
          {variant.nodes.length}
        </span>
      </div>
      <div className="component-lab-scroll min-h-0 overflow-y-auto px-2 py-2">
        <button
          type="button"
          onClick={onSelectSection}
          className={`mb-2 flex min-h-9 w-full items-center gap-2 border-l-2 px-2.5 text-left text-xs ${
            selection.length === 0
              ? "border-cyan-200 bg-cyan-200/10 text-cyan-50"
              : "border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <BoxSelect aria-hidden="true" className="size-3.5" />
          版式整体
        </button>

        {groups.map((group) => (
          <div key={group.id} className="mb-3 last:mb-0">
            <button
              type="button"
              onClick={() => onSelectGroup(group.nodes.map((node) => node.id))}
              className="flex min-h-7 w-full items-center justify-between px-2 text-left text-[10px] uppercase tracking-[0.12em] text-white/35 hover:text-white/65"
            >
              <span>{group.label}</span>
              {group.nodes.length > 1 ? <span>{group.nodes.length}</span> : null}
            </button>
            <div className="grid gap-0.5">
              {group.nodes.map((node) => {
                const selected = selection.some(
                  (candidate) => candidate.roleId === node.id,
                );
                return (
                  <button
                    key={node.id}
                    type="button"
                    data-component-lab-role={node.id}
                    aria-pressed={selected}
                    onClick={(event) =>
                      onSelectElement(
                        { occurrenceId: 0, roleId: node.id },
                        event.shiftKey,
                      )}
                    className={`flex min-h-9 items-center gap-2 border-l-2 px-2.5 text-left text-xs transition-colors ${
                      selected
                        ? "border-cyan-200 bg-cyan-200/10 text-cyan-50"
                        : "border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <ElementIcon descriptor={node} />
                    <span className="min-w-0 flex-1 truncate">{node.label}</span>
                    {node.optional ? (
                      <span className="text-[9px] text-white/30">可选</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
