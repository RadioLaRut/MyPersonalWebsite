"use client";

import {
  createUsePuck,
  FieldLabel,
  registerOverlayPortal,
  type Config,
  type CustomField,
  type CustomFieldRender,
} from "@puckeditor/core";
import {
  ChevronRight,
  Film,
  Folder,
  ImageIcon,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { getLocalEditorAccessHeaders } from "@/lib/local-editor-access";
import {
  getImageLibraryDirectoryForAsset,
  getImageLibraryRelativeSegments,
  getMediaAssetKind,
  IMAGE_LIBRARY_PUBLIC_ROOT,
  isSupportedPublicMediaPath,
  SUPPORTED_IMAGE_EXTENSIONS,
  tryNormalizeImageLibraryDirectory,
  type ImageLibraryEntry,
  type ImageLibraryResponse,
  type MediaAssetKind,
} from "@/lib/media-library-paths";
import {
  buildImageFieldTriple,
  type ImageFieldTripleOptions,
} from "@/puck/fields/image-fields";

import styles from "./image-source-field.module.css";

type AssetFieldMode = "image" | "media";

type ImageSourceInputProps = {
  fieldLabel: string;
  id: string;
  mode: AssetFieldMode;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value: string;
};

type ImageLibraryApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type UploadApiResponse = ImageLibraryApiError & {
  url?: string;
};

type LibraryLoadState = "error" | "idle" | "loading" | "ready";

const usePuckSelector = createUsePuck<Config>();
const ACCEPTED_IMAGE_TYPES = SUPPORTED_IMAGE_EXTENSIONS.join(",");

function getApiErrorMessage(
  payload: ImageLibraryApiError,
  fallback: string,
) {
  switch (payload.error?.code) {
    case "EDITOR_TOKEN_REQUIRED":
      return "上传需要本地编辑 Token，请按配置指南完成浏览器授权。";
    case "PAYLOAD_TOO_LARGE":
      return "图片文件过大，请选择不超过当前上传限制的文件。";
    case "UNSUPPORTED_MEDIA_TYPE":
      return "图片格式或图片内容不受支持。";
    case "CONTENT_QUOTA_EXCEEDED":
      return "图片库已达到文件数量或存储空间上限。";
    case "NOT_FOUND":
      return "目标图片文件夹不存在或大小写不匹配。";
    case "BAD_REQUEST":
      return "图片路径或请求内容不合法。";
    case "UNAUTHORIZED":
      return "当前页面无权访问本地图片库。";
    default:
      return fallback;
  }
}

function isDirectLibraryEntry(
  entry: unknown,
  directory: string,
): entry is ImageLibraryEntry {
  if (
    !entry ||
    typeof entry !== "object" ||
    !("kind" in entry) ||
    !("name" in entry) ||
    !("path" in entry)
  ) {
    return false;
  }

  const candidate = entry as Record<string, unknown>;
  if (
    typeof candidate.name !== "string" ||
    typeof candidate.path !== "string"
  ) {
    return false;
  }

  if (candidate.kind === "directory") {
    const normalized = tryNormalizeImageLibraryDirectory(candidate.path);
    if (!normalized) return false;
    const segments = getImageLibraryRelativeSegments(normalized);
    const parentSegments = getImageLibraryRelativeSegments(directory);
    return (
      segments !== null &&
      parentSegments !== null &&
      segments.length === parentSegments.length + 1 &&
      normalized.startsWith(`${directory}/`)
    );
  }

  if (candidate.kind !== "image" && candidate.kind !== "video") return false;
  return (
    getMediaAssetKind(candidate.path) === candidate.kind &&
    getImageLibraryDirectoryForAsset(candidate.path) === directory
  );
}

function parseImageLibraryResponse(
  value: unknown,
  requestedDirectory: string,
): ImageLibraryResponse | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.directory !== requestedDirectory ||
    !Array.isArray(candidate.entries) ||
    (candidate.parent !== null &&
      tryNormalizeImageLibraryDirectory(candidate.parent) === null)
  ) {
    return null;
  }

  if (
    !candidate.entries.every((entry) =>
      isDirectLibraryEntry(entry, requestedDirectory),
    )
  ) {
    return null;
  }

  return candidate as ImageLibraryResponse;
}

function buildBreadcrumbs(directory: string) {
  const relativeSegments = getImageLibraryRelativeSegments(directory) ?? [];
  const breadcrumbs = [
    { label: "images", path: IMAGE_LIBRARY_PUBLIC_ROOT },
  ];

  relativeSegments.forEach((segment, index) => {
    breadcrumbs.push({
      label: segment,
      path: `${IMAGE_LIBRARY_PUBLIC_ROOT}/${relativeSegments
        .slice(0, index + 1)
        .join("/")}`,
    });
  });

  return breadcrumbs;
}

function ImageSourceInput({
  fieldLabel,
  id,
  mode,
  onChange,
  readOnly,
  value,
}: ImageSourceInputProps) {
  const isSelectedComponentVideo = usePuckSelector(
    (state) =>
      (state.selectedItem?.props as Record<string, unknown> | undefined)
        ?.isVideo === true,
  );
  const expectedKind: MediaAssetKind =
    mode === "media" && isSelectedComponentVideo ? "video" : "image";
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [directory, setDirectory] = useState(IMAGE_LIBRARY_PUBLIC_ROOT);
  const [listing, setListing] = useState<ImageLibraryResponse | null>(null);
  const [loadState, setLoadState] = useState<LibraryLoadState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reloadRevision, setReloadRevision] = useState(0);
  const portalTarget =
    typeof document === "undefined" ? null : document.body;

  const closePicker = useCallback(() => {
    setIsOpen(false);
    setMessage(null);
    setIsUploading(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const openPicker = useCallback(() => {
    if (readOnly) return;
    setDirectory(getImageLibraryDirectoryForAsset(value));
    setListing(null);
    setMessage(null);
    setLoadState("loading");
    setIsOpen(true);
  }, [readOnly, value]);

  useEffect(() => {
    if (!isOpen || !portalTarget) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const unregister = registerOverlayPortal(dialog, {
      disableDrag: true,
      disableDragOnFocus: true,
    });
    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();

    return () => {
      unregister?.();
      if (dialog.open) dialog.close();
    };
  }, [isOpen, portalTarget]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closePicker();
    };

    document.addEventListener("keydown", handleEscape, true);
    return () => document.removeEventListener("keydown", handleEscape, true);
  }, [closePicker, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();

    async function loadDirectory() {
      setLoadState("loading");
      setMessage(null);

      try {
        const query = new URLSearchParams({ directory });
        const response = await fetch(`/api/image-library?${query.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as unknown;
        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(
              payload as ImageLibraryApiError,
              "读取图片库失败，请稍后重试。",
            ),
          );
        }

        const parsed = parseImageLibraryResponse(payload, directory);
        if (!parsed) {
          throw new Error("图片库返回了无法识别的数据。");
        }

        setListing(parsed);
        setLoadState("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setListing(null);
        setLoadState("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "读取图片库失败，请稍后重试。",
        );
      }
    }

    void loadDirectory();
    return () => controller.abort();
  }, [directory, isOpen, reloadRevision]);

  const visibleEntries = useMemo(
    () =>
      listing?.entries.filter(
        (entry) =>
          entry.kind === "directory" || entry.kind === expectedKind,
      ) ?? [],
    [expectedKind, listing],
  );
  const breadcrumbs = useMemo(() => buildBreadcrumbs(directory), [directory]);

  const selectAsset = useCallback(
    (assetPath: string) => {
      if (!isSupportedPublicMediaPath(assetPath, expectedKind)) {
        setMessage("选择的资源不是受支持的相对媒体路径。");
        return;
      }
      onChange(assetPath);
      closePicker();
    },
    [closePicker, expectedKind, onChange],
  );

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || expectedKind !== "image") return;

      setIsUploading(true);
      setMessage(null);

      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("directory", directory);

        const response = await fetch("/api/upload", {
          body: formData,
          headers: getLocalEditorAccessHeaders(),
          method: "POST",
        });
        const payload = (await response.json()) as UploadApiResponse;
        if (!response.ok || typeof payload.url !== "string") {
          throw new Error(
            getApiErrorMessage(
              payload,
              "上传图片失败，请检查文件后重试。",
            ),
          );
        }
        if (
          !isSupportedPublicMediaPath(payload.url, "image") ||
          getImageLibraryDirectoryForAsset(payload.url) !== directory
        ) {
          throw new Error("上传接口返回了不安全的图片路径。");
        }

        onChange(payload.url);
        closePicker();
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "上传图片失败，请检查文件后重试。",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [closePicker, directory, expectedKind, onChange],
  );

  const picker = isOpen && portalTarget
    ? createPortal(
        <dialog
          ref={dialogRef}
          aria-describedby={dialogDescriptionId}
          aria-labelledby={dialogTitleId}
          className={styles.dialog}
          onCancel={(event) => {
            event.preventDefault();
            closePicker();
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePicker();
          }}
        >
          <div className={styles.dialogLayout}>
            <header className={styles.dialogHeader}>
              <div>
                <span className={styles.dialogEyebrow}>PUBLIC / IMAGES</span>
                <h2 id={dialogTitleId} className={styles.dialogTitle}>
                  {expectedKind === "video" ? "选择视频资源" : "选择图片资源"}
                </h2>
                <p id={dialogDescriptionId} className={styles.dialogDescription}>
                  选择后仅保存站点根相对路径，不会写入本机绝对路径。
                </p>
              </div>
              <div className={styles.headerActions}>
                {expectedKind === "image" ? (
                  <button
                    className={styles.uploadButton}
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    {isUploading ? (
                      <RefreshCw aria-hidden="true" className={styles.spinIcon} />
                    ) : (
                      <Upload aria-hidden="true" />
                    )}
                    {isUploading ? "正在上传" : "上传到当前文件夹"}
                  </button>
                ) : null}
                <button
                  ref={closeButtonRef}
                  aria-label="关闭图片资源选择器"
                  className={styles.iconButton}
                  onClick={closePicker}
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            </header>

            <nav aria-label="图片文件夹路径" className={styles.breadcrumbs}>
              {breadcrumbs.map((breadcrumb, index) => (
                <span className={styles.breadcrumbItem} key={breadcrumb.path}>
                  {index > 0 ? <ChevronRight aria-hidden="true" /> : null}
                  <button
                    aria-current={
                      breadcrumb.path === directory ? "location" : undefined
                    }
                    onClick={() => setDirectory(breadcrumb.path)}
                    type="button"
                  >
                    {breadcrumb.label}
                  </button>
                </span>
              ))}
            </nav>

            <section className={styles.libraryViewport}>
              {loadState === "loading" ? (
                <div className={styles.centerState} role="status">
                  <RefreshCw aria-hidden="true" className={styles.spinIcon} />
                  正在读取图片库
                </div>
              ) : null}

              {loadState === "error" ? (
                <div className={styles.centerState} role="alert">
                  <p>{message}</p>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => {
                      setListing(null);
                      setMessage(null);
                      setLoadState("loading");
                      setReloadRevision((revision) => revision + 1);
                    }}
                    type="button"
                  >
                    重新读取
                  </button>
                </div>
              ) : null}

              {loadState === "ready" && visibleEntries.length === 0 ? (
                <div className={styles.centerState} role="status">
                  {expectedKind === "video"
                    ? "当前文件夹没有可用视频。"
                    : "当前文件夹没有可用图片，可直接上传一张。"}
                </div>
              ) : null}

              {loadState === "ready" && visibleEntries.length > 0 ? (
                <div className={styles.assetGrid}>
                  {visibleEntries.map((entry) =>
                    entry.kind === "directory" ? (
                      <button
                        className={styles.folderTile}
                        key={entry.path}
                        onClick={() => setDirectory(entry.path)}
                        type="button"
                      >
                        <Folder aria-hidden="true" />
                        <span>{entry.name}</span>
                      </button>
                    ) : (
                      <button
                        aria-current={
                          entry.path === value ? "true" : undefined
                        }
                        className={styles.assetTile}
                        key={entry.path}
                        onClick={() => selectAsset(entry.path)}
                        type="button"
                      >
                        <span className={styles.assetPreview}>
                          {entry.kind === "image" ? (
                            <Image
                              fill
                              alt={entry.name}
                              sizes="(max-width: 640px) 45vw, 180px"
                              src={entry.path}
                              unoptimized
                            />
                          ) : (
                            <Film aria-hidden="true" />
                          )}
                        </span>
                        <span className={styles.assetName}>{entry.name}</span>
                        {entry.path === value ? (
                          <span className={styles.selectedBadge}>当前使用</span>
                        ) : null}
                      </button>
                    ),
                  )}
                </div>
              ) : null}
            </section>

            <footer className={styles.dialogFooter}>
              <span>{directory}</span>
              <span aria-live="polite">
                {message && loadState !== "error" ? message : null}
              </span>
            </footer>

            <input
              ref={fileInputRef}
              accept={ACCEPTED_IMAGE_TYPES}
              aria-hidden="true"
              className={styles.hiddenInput}
              onChange={handleUpload}
              tabIndex={-1}
              type="file"
            />
          </div>
        </dialog>,
        portalTarget,
      )
    : null;

  return (
    <FieldLabel label={fieldLabel} readOnly={readOnly}>
      <div className={styles.fieldControl}>
        <input
          aria-label={`${fieldLabel} 当前相对路径`}
          className={styles.pathInput}
          id={id}
          placeholder="尚未选择资源"
          readOnly
          type="text"
          value={value}
        />
        <div className={styles.fieldActions}>
          <button
            ref={triggerRef}
            className={styles.primaryButton}
            disabled={readOnly}
            onClick={openPicker}
            type="button"
          >
            {expectedKind === "video" ? (
              <Film aria-hidden="true" />
            ) : (
              <ImageIcon aria-hidden="true" />
            )}
            {value ? "替换资源" : "选择资源"}
          </button>
          <button
            aria-label={`清空 ${fieldLabel}`}
            className={styles.clearButton}
            disabled={readOnly || value.length === 0}
            onClick={() => onChange("")}
            type="button"
          >
            <Trash2 aria-hidden="true" />
          </button>
        </div>
        {picker}
      </div>
    </FieldLabel>
  );
}

export function createImageSourceField(
  label: string,
  options: { mode?: AssetFieldMode } = {},
): CustomField<string> {
  const mode = options.mode ?? "image";
  const render: CustomFieldRender<string> = ({
    id,
    onChange,
    readOnly,
    value,
  }) => (
    <ImageSourceInput
      fieldLabel={label}
      id={id}
      mode={mode}
      onChange={onChange}
      readOnly={readOnly}
      value={typeof value === "string" ? value : ""}
    />
  );

  return {
    type: "custom",
    label,
    render,
  };
}

export type ImagePickerFieldTripleOptions = Omit<
  ImageFieldTripleOptions,
  "srcField"
> & {
  mode?: AssetFieldMode;
};

export function buildImagePickerFieldTriple(
  srcKey: string,
  options: ImagePickerFieldTripleOptions = {},
) {
  const {
    mode = "image",
    srcLabel = "Image Source",
    ...tripleOptions
  } = options;

  return buildImageFieldTriple(srcKey, {
    ...tripleOptions,
    srcField: createImageSourceField(srcLabel, { mode }),
    srcLabel,
  });
}
