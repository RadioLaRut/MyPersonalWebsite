import type { ComponentConfig } from "@puckeditor/core";

export type ComponentDefinition = Omit<ComponentConfig, "render">;
export type ComponentDefinitionRegistry = Record<string, ComponentDefinition>;
