import "server-only";

import { contentRepository } from "./content-repository.ts";

// 该服务只允许本地编辑器 API 引用；公开路由必须使用 public-content-service。
export const localEditorContentService = contentRepository;
