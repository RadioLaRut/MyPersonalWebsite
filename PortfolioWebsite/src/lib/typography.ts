import {
  TYPOGRAPHY_AUTOSPACE,
  TYPOGRAPHY_NUMERIC_STYLES,
  TYPOGRAPHY_PRESETS,
  TYPOGRAPHY_SIZES,
  TYPOGRAPHY_WEIGHTS,
  TYPOGRAPHY_WRAP_POLICIES,
  type TypographyAutospace,
  type TypographyNumericStyle,
  type TypographyPreset,
  type TypographyScript,
  type TypographySize,
  type TypographyWeight,
  type TypographyWrapPolicy,
} from "./typography-tokens.ts";

export type TypographyTextRun =
  | { type: "break"; value: "\n" }
  | { script: TypographyScript; type: "text"; value: string };

export type TypographyEdgeScripts = {
  leading: TypographyScript | null;
  trailing: TypographyScript | null;
};

const HAN_REGEX = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const LATIN_REGEX = /[\p{Script=Latin}\p{Nd}]/u;
const CJK_PUNCTUATION_REGEX = /[\u3000-\u303F\uFF00-\uFFEF]/u;

function isNewline(char: string) {
  return char === "\n";
}

function isWhitespace(char: string) {
  return /\s/u.test(char) && !isNewline(char);
}

function getRawScript(char: string): TypographyScript | "space" | "neutral" | "break" {
  if (isNewline(char)) return "break";
  if (isWhitespace(char)) return "space";
  if (HAN_REGEX.test(char) || CJK_PUNCTUATION_REGEX.test(char)) return "cjk";
  if (LATIN_REGEX.test(char)) return "latin";
  return "neutral";
}

function resolveNeutralScript(chars: string[], index: number): TypographyScript {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const prev = getRawScript(chars[cursor]);
    if (prev === "latin" || prev === "cjk") {
      return prev;
    }
    if (prev === "break") {
      break;
    }
  }

  for (let cursor = index + 1; cursor < chars.length; cursor += 1) {
    const next = getRawScript(chars[cursor]);
    if (next === "latin" || next === "cjk") {
      return next;
    }
    if (next === "break") {
      break;
    }
  }

  return "latin";
}

export function segmentTypographyText(text: string): TypographyTextRun[] {
  const chars = Array.from(text);
  const runs: TypographyTextRun[] = [];
  let buffer = "";
  let activeScript: TypographyScript | null = null;

  const pushBufferedRun = () => {
    if (!buffer || !activeScript) {
      buffer = "";
      activeScript = null;
      return;
    }

    runs.push({
      script: activeScript,
      type: "text",
      value: buffer,
    });
    buffer = "";
    activeScript = null;
  };

  chars.forEach((char, index) => {
    const rawScript = getRawScript(char);

    if (rawScript === "break") {
      pushBufferedRun();
      runs.push({ type: "break", value: "\n" });
      return;
    }

    if (rawScript === "space") {
      buffer += char;
      return;
    }

    const resolvedScript =
      rawScript === "neutral" ? resolveNeutralScript(chars, index) : rawScript;

    if (activeScript === resolvedScript || activeScript === null) {
      activeScript = resolvedScript;
      buffer += char;
      return;
    }

    pushBufferedRun();
    activeScript = resolvedScript;
    buffer = char;
  });

  pushBufferedRun();
  return runs;
}

export function getTypographyEdgeScripts(text: string): TypographyEdgeScripts {
  const textRuns = segmentTypographyText(text).filter(
    (run): run is Extract<TypographyTextRun, { type: "text" }> =>
      run.type === "text" && run.value.trim().length > 0,
  );

  return {
    leading: textRuns[0]?.script ?? null,
    trailing: textRuns[textRuns.length - 1]?.script ?? null,
  };
}

export function isTypographyPreset(value: string): value is TypographyPreset {
  return TYPOGRAPHY_PRESETS.includes(value as TypographyPreset);
}

export function isTypographySize(value: string): value is TypographySize {
  return TYPOGRAPHY_SIZES.includes(value as TypographySize);
}

export function isTypographyWeight(value: string): value is TypographyWeight {
  return TYPOGRAPHY_WEIGHTS.includes(value as TypographyWeight);
}

export function isTypographyWrapPolicy(
  value: string,
): value is TypographyWrapPolicy {
  return TYPOGRAPHY_WRAP_POLICIES.includes(value as TypographyWrapPolicy);
}

export function isTypographyAutospace(
  value: string,
): value is TypographyAutospace {
  return TYPOGRAPHY_AUTOSPACE.includes(value as TypographyAutospace);
}

export function isTypographyNumericStyle(
  value: string,
): value is TypographyNumericStyle {
  return TYPOGRAPHY_NUMERIC_STYLES.includes(value as TypographyNumericStyle);
}
