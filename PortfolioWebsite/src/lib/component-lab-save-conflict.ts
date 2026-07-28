import type {
  ComponentDesignAuthorComponent,
} from "./component-design-manifest.ts";
import {
  cloneComponentDesignDocument,
  type ComponentDesignDocumentV4,
} from "./component-design-v4.ts";

export type ComponentLabSaveConflictResolution =
  | "already-committed"
  | "conflict"
  | "rebase";

export type ComponentLabSaveScope = {
  component: ComponentDesignAuthorComponent;
  variant: string;
};

export function classifyComponentLabSaveConflict<Value>({
  isEqual,
  localValue,
  serverValue,
  submittedAgainst,
}: {
  isEqual: (left: Value, right: Value) => boolean;
  localValue: Value;
  serverValue: Value;
  submittedAgainst: Value;
}): ComponentLabSaveConflictResolution {
  if (isEqual(localValue, serverValue)) return "already-committed";
  if (isEqual(submittedAgainst, serverValue)) return "rebase";
  return "conflict";
}

function saveScopeKey(scope: ComponentLabSaveScope) {
  return `${scope.component}/${scope.variant}`;
}

/**
 * 以服务端最新文档为底，只把仍由当前会话负责落盘的版式从本地覆盖回来。
 *
 * 调用方应先从 pendingScopes 中移除已经确认完成的保存任务。这样服务端对
 * 其他组件/版式的修改会立即进入本地，同时请求飞行期间产生的新本地结果
 * 不会被较旧响应覆盖。
 */
export function mergeComponentLabRemoteDocument({
  conflictScope = null,
  localDocument,
  pendingScopes,
  remoteDocument,
  textTransactionScope = null,
}: {
  conflictScope?: ComponentLabSaveScope | null;
  localDocument: ComponentDesignDocumentV4;
  pendingScopes: readonly ComponentLabSaveScope[];
  remoteDocument: ComponentDesignDocumentV4;
  textTransactionScope?: ComponentLabSaveScope | null;
}): ComponentDesignDocumentV4 {
  const merged = cloneComponentDesignDocument(remoteDocument);
  const localScopes = new Map<string, ComponentLabSaveScope>();

  for (const scope of pendingScopes) {
    localScopes.set(saveScopeKey(scope), scope);
  }
  if (textTransactionScope) {
    localScopes.set(saveScopeKey(textTransactionScope), textTransactionScope);
  }
  if (conflictScope) {
    localScopes.set(saveScopeKey(conflictScope), conflictScope);
  }

  for (const scope of localScopes.values()) {
    const localVariants = localDocument.components[scope.component]?.variants;
    const remoteVariants = merged.components[scope.component]?.variants;
    if (
      !localVariants ||
      !remoteVariants ||
      !Object.prototype.hasOwnProperty.call(localVariants, scope.variant) ||
      !Object.prototype.hasOwnProperty.call(remoteVariants, scope.variant)
    ) {
      continue;
    }
    remoteVariants[scope.variant] = structuredClone(
      localVariants[scope.variant],
    );
  }

  return merged;
}
