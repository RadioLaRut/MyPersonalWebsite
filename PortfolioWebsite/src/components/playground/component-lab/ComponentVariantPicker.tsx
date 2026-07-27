"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  COMPONENT_DESIGN_MANIFEST,
  type ComponentDesignAuthorComponent,
} from "@/lib/component-design-manifest";

export type ComponentVariantSelection = {
  component: ComponentDesignAuthorComponent;
  variant: string;
};

export default function ComponentVariantPicker({
  onSelect,
  selection,
}: {
  onSelect: (selection: ComponentVariantSelection) => void;
  selection: ComponentVariantSelection;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredEntries = useMemo(
    () => COMPONENT_DESIGN_MANIFEST.flatMap((entry) => {
      const componentMatches = `${entry.label} ${entry.component}`
        .toLocaleLowerCase()
        .includes(normalizedQuery);
      const variants = entry.variants.filter((variant) =>
        componentMatches ||
        `${variant.label} ${variant.id}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      );
      return variants.length > 0 ? [{ entry, variants }] : [];
    }),
    [normalizedQuery],
  );

  return (
    <section className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] border-b border-white/10">
      <div className="px-4 pb-2 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
          组件与版式
        </p>
        <p className="mt-1 text-sm text-white">
          {COMPONENT_DESIGN_MANIFEST.find(
            (entry) => entry.component === selection.component,
          )?.label ?? selection.component}
          <span className="px-1.5 text-white/35">/</span>
          {COMPONENT_DESIGN_MANIFEST.find(
            (entry) => entry.component === selection.component,
          )?.variants.find((variant) => variant.id === selection.variant)
            ?.label ?? selection.variant}
        </p>
      </div>

      <label className="mx-4 mb-3 flex min-h-9 items-center gap-2 border border-white/12 bg-white/[0.025] px-2.5 focus-within:border-white/35">
        <Search aria-hidden="true" className="size-3.5 text-white/40" />
        <span className="sr-only">搜索组件或版式</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="搜索组件或版式"
          className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
        />
      </label>

      <div className="component-lab-scroll min-h-0 overflow-y-auto px-2 pb-3">
        {filteredEntries.map(({ entry, variants }) => (
          <div key={entry.component} className="mb-3 last:mb-0">
            <p className="px-2 pb-1 pt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">
              {entry.label}
            </p>
            <div className="grid gap-0.5">
              {variants.map((variant) => {
                const selected = entry.component === selection.component &&
                  variant.id === selection.variant;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    data-component-lab-component={entry.component}
                    data-component-lab-variant={variant.id}
                    aria-pressed={selected}
                    onClick={() =>
                      onSelect({
                        component: entry.component,
                        variant: variant.id,
                      })}
                    className={`min-h-9 border-l-2 px-2.5 text-left text-xs transition-colors ${
                      selected
                        ? "border-cyan-200 bg-cyan-200/10 text-cyan-50"
                        : "border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {filteredEntries.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-white/40">
            没有匹配的组件或版式
          </p>
        ) : null}
      </div>
    </section>
  );
}
