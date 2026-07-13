import { isPlainRecord } from "../lib/json-utils.ts";
import {
  isKnownPuckComponentType,
  type PuckComponentType,
} from "./component-manifest.ts";

export function collectPuckComponentTypes(value: unknown, types = new Set<PuckComponentType>()) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectPuckComponentTypes(entry, types));
    return types;
  }

  if (!isPlainRecord(value)) return types;
  if (isKnownPuckComponentType(value.type)) types.add(value.type);
  Object.values(value).forEach((entry) => collectPuckComponentTypes(entry, types));
  return types;
}
