"use client";

import {
  Puck,
  createUsePuck,
  type Overrides,
} from "@puckeditor/core";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  Layers3,
  Monitor,
  PanelLeftClose,
  PanelRightClose,
  Pencil,
  Plus,
  Redo2,
  Save,
  Search,
  Settings2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import type { ComponentDesignDocument } from "@/lib/component-design-v2";
import type { ComponentLabNode } from "@/lib/component-lab-presets";
import type { PageSummary } from "@/lib/editor-page-contract";
import {
  PUCK_PREVIEW_VIEWPORTS,
  PREVIEW_VIEWPORTS,
  resolvePreviewViewportByWidth,
} from "@/lib/preview-viewports";
import {
  getEditorComponentMeta,
  searchEditorComponents,
} from "@/puck/editor/component-metadata";
import {
  buildEditorOutline,
  buildPageSummaryTree,
  explainZoneCompatibility,
  flattenPageSummaryTree,
  formatEditorTechnicalName,
  getAllowedComponentsForZone,
  getEditorFieldGroup,
  normalizeEditorDisplayName,
  renameEditorNode,
  ROOT_INSERTION_ZONE,
  searchPageSummaries,
  type EditorOutlineNode,
  type EditorOutlineZone,
  type EditorPageTreeNode,
  type InsertionTarget,
} from "@/puck/editor/editor-data";
import {
  ComponentPreviewFrame,
  type ComponentPreviewRequest,
} from "@/puck/editor/component-preview-frame";
import {
  CANVAS_HORIZONTAL_INSET,
  getPreviewCanvasHeight,
  getPreviewCanvasScale,
  parsePreviewContentHeight,
  PREVIEW_CONTENT_HEIGHT_EVENT,
} from "@/puck/editor/preview-canvas-layout";
import {
  PUCK_COMPONENT_CATEGORIES,
  PUCK_COMPONENT_TYPES,
  type PuckComponentType,
} from "@/puck/component-manifest";
import type { FontLabSyncState, PageListState } from "@/puck/editor/types";
import type { SaveState } from "@/puck/editor/save-status";

import styles from "../editor-shell.module.css";

const useEditorPuck = createUsePuck();

export type EditorLeftTab = "outline" | "components";

type InteractionContextValue = {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  openInsertionTarget: (target: InsertionTarget) => void;
};

const InteractionContext = createContext<InteractionContextValue>({
  hoveredId: null,
  setHoveredId: () => undefined,
  openInsertionTarget: () => undefined,
});

type ComponentBrowserContextValue = {
  addComponent: (type: PuckComponentType) => void;
  openPreview: (request: ComponentPreviewRequest) => void;
};

const ComponentBrowserContext = createContext<ComponentBrowserContextValue>({
  addComponent: () => undefined,
  openPreview: () => undefined,
});

function scrollCanvasToComponent(id: string) {
  const frame = document.querySelector<HTMLIFrameElement>("#preview-frame");
  const component = frame?.contentDocument?.querySelector<HTMLElement>(
    `[data-puck-component="${CSS.escape(id)}"]`,
  );
  component?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function IconButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={styles.iconButton}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function PageTreeNodes({
  activeIndex,
  depth,
  indexByPath,
  nodes,
  onActivate,
  onSelect,
  selectedPath,
  treeId,
}: {
  activeIndex: number;
  depth: number;
  indexByPath: Map<string, number>;
  nodes: EditorPageTreeNode[];
  onActivate: (index: number) => void;
  onSelect: (page: PageSummary) => void;
  selectedPath: string;
  treeId: string;
}) {
  return nodes.map((node) => {
    const page = node.page;
    const selectableIndex = page
      ? indexByPath.get(page.publicPath)
      : undefined;
    const hasChildren = node.children.length > 0;

    return (
      <div className={styles.pageTreeNode} key={node.publicPath}>
        {page && selectableIndex !== undefined ? (
          <button
            aria-expanded={hasChildren ? true : undefined}
            aria-level={depth}
            aria-selected={page.publicPath === selectedPath}
            className={styles.pageResult}
            data-active={selectableIndex === activeIndex}
            data-branch={hasChildren}
            id={`${treeId}-item-${selectableIndex}`}
            onClick={() => onSelect(page)}
            onMouseEnter={() => onActivate(selectableIndex)}
            role="treeitem"
            type="button"
          >
            <span aria-hidden="true" className={styles.pageTreeMarker} />
            <span className={styles.pageResultCopy}>
              <strong>{node.title}</strong>
              <span>{node.publicPath}</span>
            </span>
          </button>
        ) : (
          <div
            aria-expanded={hasChildren ? true : undefined}
            aria-level={depth}
            aria-selected={false}
            className={styles.pageTreeGroupLabel}
            role="treeitem"
          >
            <span aria-hidden="true" className={styles.pageTreeMarker} />
            <span className={styles.pageResultCopy}>
              <strong>{node.title}</strong>
              <span>{node.publicPath}</span>
            </span>
          </div>
        )}
        {hasChildren ? (
          <div className={styles.pageTreeGroup} role="group">
            <PageTreeNodes
              activeIndex={activeIndex}
              depth={depth + 1}
              indexByPath={indexByPath}
              nodes={node.children}
              onActivate={onActivate}
              onSelect={onSelect}
              selectedPath={selectedPath}
              treeId={treeId}
            />
          </div>
        ) : null}
      </div>
    );
  });
}

function PageCombobox({
  disabled,
  onSelect,
  pages,
  selectedPath,
}: {
  disabled: boolean;
  onSelect: (publicPath: string) => void;
  pages: PageSummary[];
  selectedPath: string;
}) {
  const treeId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const fullPageTree = useMemo(
    () => buildPageSummaryTree(pages),
    [pages],
  );
  const fullResults = useMemo(
    () => flattenPageSummaryTree(fullPageTree),
    [fullPageTree],
  );
  const pageTree = useMemo(
    () => query.trim() ? buildPageSummaryTree(pages, query) : fullPageTree,
    [fullPageTree, pages, query],
  );
  const results = useMemo(
    () => flattenPageSummaryTree(pageTree),
    [pageTree],
  );
  const indexByPath = useMemo(
    () => new Map(
      results.map((page, index) => [page.publicPath, index]),
    ),
    [results],
  );
  const safeActiveIndex = results.length === 0
    ? 0
    : Math.min(activeIndex, results.length - 1);
  const selected = pages.find((page) => page.publicPath === selectedPath);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const selectResult = (page: PageSummary | undefined) => {
    if (!page) return;
    onSelect(page.publicPath);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((current) => Math.min(current + 1, results.length - 1));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((current) => Math.max(current - 1, 0));
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectResult(results[safeActiveIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.pageCombobox} ref={containerRef}>
      <button
        aria-controls={isOpen ? treeId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="tree"
        className={styles.pageComboboxTrigger}
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }

          setQuery("");
          setActiveIndex(Math.max(
            0,
            fullResults.findIndex((page) => page.publicPath === selectedPath),
          ));
          setIsOpen(true);
        }}
        type="button"
      >
        <span>
          <strong>{selected?.title || "未命名页面"}</strong>
          {selectedPath !== "/" && <small>{selectedPath}</small>}
        </span>
        <ChevronDown aria-hidden="true" size={14} />
      </button>
      {isOpen && (
        <div className={styles.pageComboboxMenu}>
          <label className={styles.pageSearch}>
            <Search aria-hidden="true" size={14} />
            <input
              aria-activedescendant={
                results.length > 0
                  ? `${treeId}-item-${safeActiveIndex}`
                  : undefined
              }
              aria-controls={treeId}
              aria-label="搜索页面"
              autoFocus
              onChange={(event) => {
                const nextQuery = event.currentTarget.value;
                const nextTree = nextQuery.trim()
                  ? buildPageSummaryTree(pages, nextQuery)
                  : fullPageTree;
                const nextResults = flattenPageSummaryTree(nextTree);
                const preferredPath = nextQuery.trim()
                  ? searchPageSummaries(pages, nextQuery)[0]?.publicPath
                  : selectedPath;
                const preferredIndex = nextResults.findIndex(
                  (page) => page.publicPath === preferredPath,
                );

                setQuery(nextQuery);
                setActiveIndex(Math.max(0, preferredIndex));
              }}
              onKeyDown={handleKeyDown}
              placeholder="搜索标题或路径"
              value={query}
            />
          </label>
          <div
            aria-label="页面层级"
            className={styles.pageResults}
            id={treeId}
            role="tree"
          >
            <PageTreeNodes
              activeIndex={safeActiveIndex}
              depth={1}
              indexByPath={indexByPath}
              nodes={pageTree}
              onActivate={setActiveIndex}
              onSelect={selectResult}
              selectedPath={selectedPath}
              treeId={treeId}
            />
            {results.length === 0 && (
              <p className={styles.emptyMessage}>没有匹配页面</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SaveStateLabel({
  errorMessage,
  lastSavedAt,
  saveState,
}: {
  errorMessage: string | null;
  lastSavedAt: Date | null;
  saveState: SaveState;
}) {
  const labels: Record<SaveState, string> = {
    dirty: "有未保存修改",
    error: "保存失败",
    saved: "已保存",
    saving: "保存中",
  };
  const time = lastSavedAt?.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <span
      className={styles.saveState}
      data-state={saveState}
      title={errorMessage ?? (time ? `最后保存于 ${time}` : labels[saveState])}
    >
      <span aria-hidden="true" />
      {labels[saveState]}
      {saveState === "saved" && time ? <small>{time}</small> : null}
    </span>
  );
}

function ViewportControls() {
  const dispatch = useEditorPuck((state) => state.dispatch);
  const currentWidth = useEditorPuck(
    (state) => state.appState.ui.viewports.current.width,
  );
  const current = typeof currentWidth === "number"
    ? resolvePreviewViewportByWidth(currentWidth)
    : PREVIEW_VIEWPORTS[2];
  const icons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor,
  } as const;

  return (
    <div aria-label="画布视口" className={styles.segmentedControl}>
      {PREVIEW_VIEWPORTS.map((viewport) => {
        const ViewportIcon = icons[viewport.key];
        return (
          <button
            aria-label={`${viewport.label} 视口`}
            aria-pressed={current.key === viewport.key}
            key={viewport.key}
            onClick={() => {
              dispatch({
                type: "setUi",
                ui: {
                  viewports: {
                    current: {
                      height: viewport.height,
                      width: viewport.width,
                    },
                    controlsVisible: true,
                    options: PUCK_PREVIEW_VIEWPORTS,
                  },
                },
                recordHistory: false,
              });
            }}
            type="button"
          >
            <ViewportIcon aria-hidden="true" size={14} />
          </button>
        );
      })}
    </div>
  );
}

function WorkspaceHeader({
  errorMessage,
  fontLabSyncState,
  isSwitchingPage,
  lastSavedAt,
  onCreatePage,
  onOpenPublicPage,
  onOpenPageSettings,
  onRetryPageList,
  onSave,
  onSelectPage,
  pageListState,
  pages,
  saveState,
  selectedPath,
}: {
  errorMessage: string | null;
  fontLabSyncState: FontLabSyncState;
  isSwitchingPage: boolean;
  lastSavedAt: Date | null;
  onCreatePage: () => void;
  onOpenPublicPage: () => void;
  onOpenPageSettings: () => void;
  onRetryPageList: () => void;
  onSave: () => void;
  onSelectPage: (path: string) => void;
  pageListState: PageListState;
  pages: PageSummary[];
  saveState: SaveState;
  selectedPath: string;
}) {
  const history = useEditorPuck((state) => state.history);

  return (
    <header className={styles.workspaceHeader}>
      <div className={styles.headerPrimary}>
        <PageCombobox
          disabled={isSwitchingPage || pageListState.status !== "ready"}
          onSelect={onSelectPage}
          pages={pages}
          selectedPath={selectedPath}
        />
        <IconButton label="新建页面" onClick={onCreatePage}>
          <FilePlus2 aria-hidden="true" size={16} />
        </IconButton>
        {pageListState.status === "error" && (
          <button
            className={styles.inlineErrorButton}
            onClick={onRetryPageList}
            type="button"
          >
            页面清单失败，重试
          </button>
        )}
      </div>

      <div className={styles.headerMiddle}>
        <ViewportControls />
        <span className={styles.headerDivider} />
        <IconButton
          disabled={!history.hasPast}
          label="撤销"
          onClick={history.back}
        >
          <Undo2 aria-hidden="true" size={15} />
        </IconButton>
        <IconButton
          disabled={!history.hasFuture}
          label="重做"
          onClick={history.forward}
        >
          <Redo2 aria-hidden="true" size={15} />
        </IconButton>
      </div>

      <div className={styles.headerActions}>
        <span
          className={styles.fontLabState}
          data-error={fontLabSyncState === "error"}
          title={fontLabSyncState === "error" ? "FontLab 同步失败" : "FontLab 已同步"}
        >
          FontLab {fontLabSyncState === "error" ? "失败" : "已同步"}
        </span>
        <SaveStateLabel
          errorMessage={errorMessage}
          lastSavedAt={lastSavedAt}
          saveState={saveState}
        />
        <button
          className={styles.saveButton}
          disabled={saveState === "saving"}
          onClick={onSave}
          type="button"
        >
          <Save aria-hidden="true" size={14} />
          保存
        </button>
        <button
          className={styles.secondaryButton}
          onClick={onOpenPublicPage}
          type="button"
        >
          <ExternalLink aria-hidden="true" size={14} />
          查看页面
        </button>
        <IconButton label="页面设置" onClick={onOpenPageSettings}>
          <Settings2 aria-hidden="true" size={16} />
        </IconButton>
      </div>
    </header>
  );
}

function OutlineRow({
  depth,
  node,
  onOpenInsertionTarget,
}: {
  depth: number;
  node: EditorOutlineNode;
  onOpenInsertionTarget: (target: InsertionTarget) => void;
}) {
  const dispatch = useEditorPuck((state) => state.dispatch);
  const selectedId = useEditorPuck(
    (state) => state.selectedItem?.props.id as string | undefined,
  );
  const getSelectorForId = useEditorPuck((state) => state.getSelectorForId);
  const { hoveredId, setHoveredId } = useContext(InteractionContext);
  const rowRef = useRef<HTMLDivElement>(null);
  const cancelRenameRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(node.displayName);
  const selected = selectedId === node.id;

  useEffect(() => {
    if (selected) rowRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const selectNode = () => {
    const selector = getSelectorForId(node.id);
    if (!selector) return;
    dispatch({ type: "setUi", ui: { itemSelector: selector }, recordHistory: false });
    scrollCanvasToComponent(node.id);
  };

  const commitRename = () => {
    if (cancelRenameRef.current) {
      cancelRenameRef.current = false;
      return;
    }
    if (normalizeEditorDisplayName(draftName) === node.displayName) {
      setIsEditing(false);
      return;
    }
    dispatch({
      type: "setData",
      data: (current) => renameEditorNode(current, node.id, draftName),
      recordHistory: true,
    });
    setIsEditing(false);
  };

  const startRename = () => {
    setDraftName(node.displayName);
    setIsEditing(true);
  };

  return (
    <li>
      <div
        className={styles.outlineRow}
        data-hovered={hoveredId === node.id}
        data-selected={selected}
        onMouseEnter={() => setHoveredId(node.id)}
        onMouseLeave={() => setHoveredId(null)}
        ref={rowRef}
        style={{ paddingLeft: 10 + depth * 16 }}
      >
        {isEditing ? (
          <input
            aria-label="组件显示名称"
            autoFocus
            className={styles.outlineRenameInput}
            maxLength={80}
            onBlur={commitRename}
            onChange={(event) => setDraftName(event.currentTarget.value)}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                cancelRenameRef.current = true;
                setDraftName(node.displayName);
                setIsEditing(false);
              }
            }}
            value={draftName}
          />
        ) : (
          <>
            <button
              aria-label={`选择${node.displayName}`}
              className={styles.outlineSelect}
              onClick={selectNode}
              onDoubleClick={startRename}
              type="button"
            >
            <span>
              <strong>{node.displayName}</strong>
              <small title={node.type}>
                {formatEditorTechnicalName(node.type)}
              </small>
            </span>
            </button>
            <button
              aria-label={`重命名${node.displayName}`}
              className={styles.outlineRenameButton}
              onClick={startRename}
              title="修改显示名称"
              type="button"
            >
              <Pencil aria-hidden="true" size={12} />
            </button>
          </>
        )}
      </div>
      {node.children.length > 0 && (
        <ol>
          {node.children.map((zone) => (
            <OutlineZone
              depth={depth + 1}
              key={zone.zone}
              onOpenInsertionTarget={onOpenInsertionTarget}
              zone={zone}
            />
          ))}
        </ol>
      )}
    </li>
  );
}

function OutlineZone({
  depth,
  onOpenInsertionTarget,
  zone,
}: {
  depth: number;
  onOpenInsertionTarget: (target: InsertionTarget) => void;
  zone: EditorOutlineZone;
}) {
  return (
    <li className={styles.outlineZone}>
      <div className={styles.outlineZoneHeader} style={{ paddingLeft: 10 + depth * 16 }}>
        <span>{zone.label}</span>
        <button
          aria-label={`添加到${zone.label}`}
          onClick={() => onOpenInsertionTarget({ zone: zone.zone, index: zone.nodes.length })}
          type="button"
        >
          <Plus aria-hidden="true" size={13} />
        </button>
      </div>
      <ol>
        {zone.nodes.map((node) => (
          <OutlineRow
            depth={depth}
            key={node.id}
            node={node}
            onOpenInsertionTarget={onOpenInsertionTarget}
          />
        ))}
      </ol>
    </li>
  );
}

function EditorOutline({
  onOpenInsertionTarget,
}: {
  onOpenInsertionTarget: (target: InsertionTarget) => void;
}) {
  const data = useEditorPuck((state) => state.appState.data);
  const zones = useMemo(() => buildEditorOutline(data), [data]);

  return (
    <div className={styles.outlineTree}>
      {zones.map((zone) => (
        <ol key={zone.zone}>
          <OutlineZone
            depth={0}
            onOpenInsertionTarget={onOpenInsertionTarget}
            zone={zone}
          />
        </ol>
      ))}
    </div>
  );
}

export function EditorDrawerItem({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) {
  const { addComponent, openPreview } = useContext(ComponentBrowserContext);
  const timerRef = useRef<number | null>(null);
  const meta = getEditorComponentMeta(name);
  if (!meta) return <>{children}</>;

  const cancelPreview = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    openPreview(null);
  };
  const schedulePreview = (anchor: HTMLElement) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const anchorTop = anchor.getBoundingClientRect().top;
    timerRef.current = window.setTimeout(() => {
      openPreview({ anchorTop, type: meta.type });
    }, 300);
  };

  return (
    <div
      aria-label={`预览${meta.label}`}
      className={styles.componentItem}
      onKeyDown={(event) => {
        if (event.key === "Escape") cancelPreview();
      }}
      onMouseEnter={(event) => schedulePreview(event.currentTarget)}
      onMouseLeave={cancelPreview}
      onPointerDownCapture={cancelPreview}
    >
      <div className={styles.componentItemCopy}>
        <strong>{meta.label}</strong>
        <code title={meta.type}>{formatEditorTechnicalName(meta.type)}</code>
        <span>{meta.description}</span>
      </div>
      <div aria-label="拖拽组件" className={styles.componentDragHandle}>
        {children}
      </div>
      <button
        className={styles.componentAddButton}
        onClick={(event) => {
          event.stopPropagation();
          addComponent(meta.type);
        }}
        onMouseDown={(event) => event.stopPropagation()}
        type="button"
      >
        添加
      </button>
    </div>
  );
}

function ComponentBrowser({
  insertionTarget,
  onInserted,
  onPreview,
}: {
  insertionTarget: InsertionTarget | null;
  onInserted: () => void;
  onPreview: (request: ComponentPreviewRequest) => void;
}) {
  const data = useEditorPuck((state) => state.appState.data);
  const dispatch = useEditorPuck((state) => state.dispatch);
  const focusedPreviewTypeRef = useRef<PuckComponentType | null>(null);
  const [query, setQuery] = useState("");
  const target = insertionTarget ?? {
    zone: ROOT_INSERTION_ZONE,
    index: data.content.length,
  };
  const allowed = useMemo(
    () => getAllowedComponentsForZone(target.zone, data),
    [data, target.zone],
  );
  const matched = useMemo(() => searchEditorComponents(query), [query]);
  const compatible = useMemo(
    () => matched.filter((entry) => allowed.has(entry.type)),
    [allowed, matched],
  );
  const incompatible = useMemo(
    () => query.trim()
      ? matched.filter((entry) => !allowed.has(entry.type))
      : [],
    [allowed, matched, query],
  );

  useEffect(() => {
    const compatibleTypes = new Set(compatible.map((entry) => entry.type));
    dispatch({
      type: "setUi",
      ui: (ui) => ({
        componentList: {
          ...Object.fromEntries(
            Object.entries(PUCK_COMPONENT_CATEGORIES).map(([category, definition]) => {
              const visibleComponents = definition.components.filter((type) => (
                compatibleTypes.has(type)
              ));
              return [
                category,
                {
                  ...ui.componentList[category],
                  components: visibleComponents,
                  expanded: true,
                  title: definition.title,
                  visible: visibleComponents.length > 0,
                },
              ];
            }),
          ),
          // Puck 会把未出现在任何分类里的组件自动放入 “Other”。
          // 用一个不可见分类登记当前不兼容项，避免它们在普通浏览中泄漏出来。
          editorExcluded: {
            components: PUCK_COMPONENT_TYPES.filter(
              (type) => !compatibleTypes.has(type),
            ),
            expanded: false,
            title: "当前不可用",
            visible: false,
          },
          other: {
            components: [],
            expanded: false,
            title: "其他",
            visible: false,
          },
        },
      }),
      recordHistory: false,
    });
  }, [compatible, dispatch]);

  const addComponent = useCallback((type: PuckComponentType) => {
    if (!allowed.has(type)) return;
    dispatch({
      type: "insert",
      componentType: type,
      destinationIndex: target.index,
      destinationZone: target.zone,
      recordHistory: true,
    });
    onInserted();
  }, [allowed, dispatch, onInserted, target.index, target.zone]);

  const contextValue = useMemo(() => ({
    addComponent,
    openPreview: onPreview,
  }), [addComponent, onPreview]);

  const openFocusedPreview = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return;
    const drawerItem = target.closest<HTMLElement>("[data-puck-drawer-item]");
    const testId = drawerItem?.getAttribute("data-testid");
    if (!drawerItem || !testId?.startsWith("drawer-item:")) return;
    const meta = getEditorComponentMeta(testId.slice("drawer-item:".length));
    if (!meta) return;
    focusedPreviewTypeRef.current = meta.type;
    onPreview({
      anchorTop: drawerItem.getBoundingClientRect().top,
      type: meta.type,
    });
  };

  const closeFocusedPreview = () => {
    focusedPreviewTypeRef.current = null;
    onPreview(null);
  };

  return (
    <ComponentBrowserContext.Provider value={contextValue}>
      <div
        className={styles.componentBrowser}
        onBlurCapture={(event) => {
          const currentItem = (event.target as HTMLElement).closest?.(
            "[data-puck-drawer-item]",
          );
          const nextItem = event.relatedTarget instanceof HTMLElement
            ? event.relatedTarget.closest("[data-puck-drawer-item]")
            : null;
          if (currentItem && currentItem !== nextItem) closeFocusedPreview();
        }}
        onFocusCapture={(event) => openFocusedPreview(event.target)}
        onKeyDownCapture={(event) => {
          const drawerItem = (event.target as HTMLElement).closest?.(
            "[data-puck-drawer-item]",
          );
          if ((event.key === " " || event.key === "Enter") && drawerItem) {
            closeFocusedPreview();
            return;
          }
          if (event.key === "Escape" && focusedPreviewTypeRef.current) {
            event.stopPropagation();
            closeFocusedPreview();
          }
        }}
      >
        <label className={styles.componentSearch}>
          <Search aria-hidden="true" size={14} />
          <input
            aria-label="搜索组件"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="搜索中文名、类型、用途"
            value={query}
          />
        </label>
        <div className={styles.insertionTarget}>
          <span>插入位置</span>
          <strong>
            {target.zone === ROOT_INSERTION_ZONE
              ? `页面末尾 · 第 ${target.index + 1} 项`
              : `${target.zone.split(":").slice(1).join(":")} · 第 ${target.index + 1} 项`}
          </strong>
        </div>
        <div className={styles.componentDrawer}>
          <Puck.Components />
        </div>
        {compatible.length === 0 && (
          <p className={styles.emptyMessage}>当前插入位置没有匹配组件</p>
        )}
        {incompatible.length > 0 && (
          <section className={styles.incompatibleSection}>
            <h3>其他搜索结果</h3>
            {incompatible.map((entry) => (
              <div className={styles.incompatibleItem} key={entry.type}>
                <span>
                  <strong>{entry.label}</strong>
                  <code title={entry.type}>
                    {formatEditorTechnicalName(entry.type)}
                  </code>
                </span>
                <small>{explainZoneCompatibility(target.zone)}</small>
              </div>
            ))}
          </section>
        )}
      </div>
    </ComponentBrowserContext.Provider>
  );
}

function LeftSidebar({
  collapsed,
  insertionTarget,
  onCollapse,
  onInserted,
  onOpenInsertionTarget,
  onPreview,
  onTabChange,
  tab,
}: {
  collapsed: boolean;
  insertionTarget: InsertionTarget | null;
  onCollapse: () => void;
  onInserted: () => void;
  onOpenInsertionTarget: (target: InsertionTarget) => void;
  onPreview: (request: ComponentPreviewRequest) => void;
  onTabChange: (tab: EditorLeftTab) => void;
  tab: EditorLeftTab;
}) {
  return (
    <aside
      className={`${styles.leftSidebar} ${
        collapsed ? styles.sidebarCollapsed : styles.leftSidebarExpanded
      }`}
      data-collapsed={collapsed}
      key={collapsed ? "left-collapsed" : "left-expanded"}
    >
      {collapsed ? (
        <div className={styles.collapsedRail}>
          <IconButton label="展开左栏" onClick={onCollapse}>
            <ChevronRight aria-hidden="true" size={16} />
          </IconButton>
          <IconButton label="大纲" onClick={() => onTabChange("outline")}>
            <Layers3 aria-hidden="true" size={16} />
          </IconButton>
          <IconButton label="添加组件" onClick={() => onTabChange("components")}>
            <Plus aria-hidden="true" size={17} />
          </IconButton>
        </div>
      ) : (
        <>
          <div className={styles.sidebarTabs}>
            <button
              aria-selected={tab === "outline"}
              onClick={() => onTabChange("outline")}
              role="tab"
              type="button"
            >
              大纲
            </button>
            <button
              aria-selected={tab === "components"}
              onClick={() => onTabChange("components")}
              role="tab"
              type="button"
            >
              添加组件
            </button>
            <IconButton label="折叠左栏" onClick={onCollapse}>
              <PanelLeftClose aria-hidden="true" size={15} />
            </IconButton>
          </div>
          <div className={styles.sidebarBody}>
            {tab === "outline" ? (
              <EditorOutline onOpenInsertionTarget={onOpenInsertionTarget} />
            ) : (
              <ComponentBrowser
                insertionTarget={insertionTarget}
                onInserted={onInserted}
                onPreview={onPreview}
              />
            )}
          </div>
        </>
      )}
    </aside>
  );
}

function CanvasSurface() {
  const currentViewport = useEditorPuck(
    (state) => state.appState.ui.viewports.current,
  );
  const viewportWidth = typeof currentViewport.width === "number"
    ? currentViewport.width
    : PREVIEW_VIEWPORTS[2].width;
  const viewportHeight = typeof currentViewport.height === "number"
    ? currentViewport.height
    : PREVIEW_VIEWPORTS[2].height;
  const containerRef = useRef<HTMLElement>(null);
  const [containerSize, setContainerSize] = useState({
    height: viewportHeight,
    width: viewportWidth + CANVAS_HORIZONTAL_INSET,
  });
  const [previewContentHeight, setPreviewContentHeight] = useState(
    viewportHeight,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const { height, width } = entry.contentRect;
      setContainerSize((current) => (
        Math.abs(current.height - height) < 0.5 &&
        Math.abs(current.width - width) < 0.5
          ? current
          : { height, width }
      ));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handlePreviewContentHeight = (event: Event) => {
      const nextHeight = parsePreviewContentHeight(
        (event as CustomEvent<unknown>).detail,
      );
      if (nextHeight === null) {
        return;
      }

      setPreviewContentHeight((current) => (
        Math.abs(current - nextHeight) < 1 ? current : nextHeight
      ));
    };

    window.addEventListener(
      PREVIEW_CONTENT_HEIGHT_EVENT,
      handlePreviewContentHeight,
    );
    return () => window.removeEventListener(
      PREVIEW_CONTENT_HEIGHT_EVENT,
      handlePreviewContentHeight,
    );
  }, []);

  const availableWidth = Math.max(
    0,
    containerSize.width - CANVAS_HORIZONTAL_INSET,
  );
  const scale = getPreviewCanvasScale(containerSize.width, viewportWidth);
  const previewHeight = getPreviewCanvasHeight({
    containerHeight: containerSize.height,
    contentHeight: previewContentHeight,
    scale,
  });

  return (
    <section
      aria-label={`页面画布，当前可用宽度 ${Math.round(availableWidth)} 像素`}
      className={styles.canvasSurface}
      ref={containerRef}
    >
      <div className={styles.canvasScroll}>
        <div
          className={styles.canvasScaledBounds}
          style={{
            height: previewHeight * scale,
            width: viewportWidth * scale,
          }}
        >
          <div
            className={styles.canvasViewport}
            style={{
              height: previewHeight,
              transform: `scale(${scale})`,
              width: viewportWidth,
            }}
          >
            <Puck.Preview id="puck-editor-preview" />
          </div>
        </div>
      </div>
      <span className={styles.canvasScale}>{Math.round(scale * 100)}%</span>
    </section>
  );
}

function Inspector({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: () => void;
}) {
  const selectedItem = useEditorPuck((state) => state.selectedItem);
  const meta = selectedItem ? getEditorComponentMeta(selectedItem.type) : null;
  return (
    <aside
      className={`${styles.rightSidebar} ${
        collapsed ? styles.sidebarCollapsed : styles.rightSidebarExpanded
      }`}
      data-collapsed={collapsed}
      key={collapsed ? "right-collapsed" : "right-expanded"}
    >
      {collapsed ? (
        <div className={styles.collapsedRail}>
          <IconButton label="展开属性栏" onClick={onCollapse}>
            <ChevronLeft aria-hidden="true" size={16} />
          </IconButton>
          <IconButton label="页面设置" onClick={onCollapse}>
            <Settings2 aria-hidden="true" size={16} />
          </IconButton>
        </div>
      ) : (
        <>
          <div className={styles.inspectorHeader}>
            <span>
              <strong>{meta?.label ?? "页面设置"}</strong>
              <small title={meta?.type}>
                {meta ? formatEditorTechnicalName(meta.type) : "Page"}
              </small>
            </span>
            <IconButton label="折叠属性栏" onClick={onCollapse}>
              <PanelRightClose aria-hidden="true" size={15} />
            </IconButton>
          </div>
          <div className={styles.inspectorBody}>
            <Puck.Fields />
          </div>
        </>
      )}
    </aside>
  );
}

export function EditorComponentOverlay({
  children,
  componentId,
  hover,
  isSelected,
}: Parameters<NonNullable<Overrides["componentOverlay"]>>[0]) {
  const { hoveredId, openInsertionTarget, setHoveredId } = useContext(InteractionContext);
  const getSelectorForId = useEditorPuck((state) => state.getSelectorForId);
  const selector = getSelectorForId(componentId);
  const visible = hover || isSelected || hoveredId === componentId;

  const openAtOffset = (offset: 0 | 1) => {
    if (!selector) return;
    openInsertionTarget({
      zone: selector.zone,
      index: selector.index + offset,
    });
  };

  return (
    <div
      className={styles.componentOverlay}
      data-outline-hovered={hoveredId === componentId}
      onMouseEnter={() => setHoveredId(componentId)}
      onMouseLeave={() => setHoveredId(null)}
    >
      {children}
      {visible && selector && (
        <>
          <button
            aria-label="在此组件前添加"
            className={styles.addBeforeButton}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openAtOffset(0);
            }}
            type="button"
          >
            <Plus aria-hidden="true" size={12} />
            在此添加
          </button>
          <button
            aria-label="在此组件后添加"
            className={styles.addAfterButton}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openAtOffset(1);
            }}
            type="button"
          >
            <Plus aria-hidden="true" size={12} />
            在此添加
          </button>
        </>
      )}
    </div>
  );
}

export function EditorFieldLabel({
  children,
  className,
  el: Element = "label",
  icon,
  label,
  readOnly,
}: Parameters<NonNullable<Overrides["fieldLabel"]>>[0]) {
  const [primary, technical] = label.split("|");
  return (
    <Element className={`${styles.fieldLabel} ${className ?? ""}`}>
      <span>
        {icon}
        <strong>{primary}</strong>
        {technical ? (
          <code title={technical}>{formatEditorTechnicalName(technical)}</code>
        ) : null}
        {readOnly ? <small>只读</small> : null}
      </span>
      {children}
    </Element>
  );
}

const EDITOR_FIELD_GROUP_LABELS = {
  content: "内容",
  media: "媒体",
  link: "链接",
  layout: "布局",
  advanced: "高级",
} as const;

function getChildFieldName(child: ReactNode) {
  if (!isValidElement(child)) return "";
  const key = (child as ReactElement).key;
  if (key === null) return "";
  const keyText = String(key);
  const reactKeyMarker = keyText.lastIndexOf("$");
  return reactKeyMarker >= 0 ? keyText.slice(reactKeyMarker + 1) : keyText;
}

export function EditorFields({
  children,
  isLoading,
}: Parameters<NonNullable<Overrides["fields"]>>[0]) {
  const grouped = Children.toArray(children).reduce(
    (result, child) => {
      const fieldName = getChildFieldName(child);
      const group = getEditorFieldGroup(fieldName);
      if (group) result[group].push(child);
      return result;
    },
    {
      content: [] as ReactNode[],
      media: [] as ReactNode[],
      link: [] as ReactNode[],
      layout: [] as ReactNode[],
      advanced: [] as ReactNode[],
    },
  );

  return (
    <div aria-busy={isLoading} className={styles.fieldGroups}>
      {(Object.keys(EDITOR_FIELD_GROUP_LABELS) as Array<
        keyof typeof EDITOR_FIELD_GROUP_LABELS
      >).map((group) => {
        const fields = grouped[group];
        if (fields.length === 0) return null;
        if (group === "advanced") {
          return (
            <details className={styles.fieldGroup} key={group}>
              <summary>{EDITOR_FIELD_GROUP_LABELS[group]}</summary>
              <div>{fields}</div>
            </details>
          );
        }
        return (
          <section className={styles.fieldGroup} key={group}>
            <h3>{EDITOR_FIELD_GROUP_LABELS[group]}</h3>
            <div>{fields}</div>
          </section>
        );
      })}
    </div>
  );
}

export function EditorWorkspace({
  componentDesignDocument,
  errorMessage,
  fontLabSyncState,
  isSwitchingPage,
  lastSavedAt,
  leftCollapsed,
  leftTab,
  onCreatePage,
  onLeftCollapsedChange,
  onLeftTabChange,
  onOpenPublicPage,
  onRetryPageList,
  onRightCollapsedChange,
  onSave,
  onSelectPage,
  pageListState,
  pageSummaries,
  previewSamples,
  rightCollapsed,
  saveState,
  selectedPath,
}: {
  componentDesignDocument: ComponentDesignDocument;
  errorMessage: string | null;
  fontLabSyncState: FontLabSyncState;
  isSwitchingPage: boolean;
  lastSavedAt: Date | null;
  leftCollapsed: boolean;
  leftTab: EditorLeftTab;
  onCreatePage: () => void;
  onLeftCollapsedChange: (collapsed: boolean) => void;
  onLeftTabChange: (tab: EditorLeftTab) => void;
  onOpenPublicPage: () => void;
  onRetryPageList: () => void;
  onRightCollapsedChange: (collapsed: boolean) => void;
  onSave: () => void;
  onSelectPage: (path: string) => void;
  pageListState: PageListState;
  pageSummaries: PageSummary[];
  previewSamples: Record<PuckComponentType, ComponentLabNode>;
  rightCollapsed: boolean;
  saveState: SaveState;
  selectedPath: string;
}) {
  const dispatch = useEditorPuck((state) => state.dispatch);
  const isDragging = useEditorPuck((state) => state.appState.ui.isDragging);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [insertionTarget, setInsertionTarget] = useState<InsertionTarget | null>(null);
  const [preview, setPreview] = useState<ComponentPreviewRequest>(null);

  const openInsertionTarget = useCallback((target: InsertionTarget) => {
    setInsertionTarget(target);
    onLeftCollapsedChange(false);
    onLeftTabChange("components");
  }, [onLeftCollapsedChange, onLeftTabChange]);

  const interactionValue = useMemo(() => ({
    hoveredId,
    openInsertionTarget,
    setHoveredId,
  }), [hoveredId, openInsertionTarget]);

  const openPageSettings = () => {
    dispatch({ type: "setUi", ui: { itemSelector: null }, recordHistory: false });
    onRightCollapsedChange(false);
  };

  return (
    <InteractionContext.Provider value={interactionValue}>
      <div className={styles.workspace}>
        <WorkspaceHeader
          errorMessage={errorMessage}
          fontLabSyncState={fontLabSyncState}
          isSwitchingPage={isSwitchingPage}
          lastSavedAt={lastSavedAt}
          onCreatePage={onCreatePage}
          onOpenPageSettings={openPageSettings}
          onOpenPublicPage={onOpenPublicPage}
          onRetryPageList={onRetryPageList}
          onSave={onSave}
          onSelectPage={onSelectPage}
          pageListState={pageListState}
          pages={pageSummaries}
          saveState={saveState}
          selectedPath={selectedPath}
        />
        <div
          aria-label={`编辑工作区，左栏${
            leftCollapsed ? "已折叠" : "已展开"
          }，右栏${rightCollapsed ? "已折叠" : "已展开"}`}
          className={styles.workspaceBody}
          data-left-collapsed={leftCollapsed}
          data-right-collapsed={rightCollapsed}
        >
          <LeftSidebar
            collapsed={leftCollapsed}
            insertionTarget={insertionTarget}
            onCollapse={() => onLeftCollapsedChange(!leftCollapsed)}
            onInserted={() => setInsertionTarget(null)}
            onOpenInsertionTarget={openInsertionTarget}
            onPreview={setPreview}
            onTabChange={(nextTab) => {
              onLeftCollapsedChange(false);
              onLeftTabChange(nextTab);
              if (nextTab !== "components") setPreview(null);
            }}
            tab={leftTab}
          />
          <CanvasSurface />
          <Inspector
            collapsed={rightCollapsed}
            onCollapse={() => onRightCollapsedChange(!rightCollapsed)}
          />
        </div>
        {leftTab === "components" && !leftCollapsed && (
          <ComponentPreviewFrame
            designDocument={componentDesignDocument}
            preview={isDragging ? null : preview}
            samples={previewSamples}
          />
        )}
      </div>
    </InteractionContext.Provider>
  );
}
