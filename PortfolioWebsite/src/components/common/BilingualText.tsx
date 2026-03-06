"use client";

import React from "react";

interface BilingualTextProps {
  text: string;
}

const HAN_LIKE_REGEX = /[\p{Script=Han}\u3000-\u303F\uFF00-\uFFEF]/u;

function getTokenType(char: string): "han" | "latin" | "space" {
  if (/\s/u.test(char)) {
    return "space";
  }

  if (HAN_LIKE_REGEX.test(char)) {
    return "han";
  }

  return "latin";
}

function segmentText(text: string) {
  const segments: Array<{ type: "han" | "latin"; value: string }> = [];
  let buffer = "";
  let currentType: "han" | "latin" | null = null;

  for (const char of text) {
    if (char === "\n") {
      if (buffer && currentType) {
        segments.push({ type: currentType, value: buffer });
      }
      segments.push({ type: "latin", value: "\n" });
      buffer = "";
      currentType = null;
      continue;
    }

    const tokenType = getTokenType(char);

    if (tokenType === "space") {
      buffer += char;
      continue;
    }

    if (currentType === tokenType || currentType === null) {
      currentType = tokenType;
      buffer += char;
      continue;
    }

    segments.push({ type: currentType, value: buffer });
    buffer = char;
    currentType = tokenType;
  }

  if (buffer && currentType) {
    segments.push({ type: currentType, value: buffer });
  }

  return segments;
}

export default function BilingualText({ text }: BilingualTextProps) {
  const segments = segmentText(text);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.value === "\n") {
          return <br key={`br-${index}`} />;
        }

        if (segment.type === "han") {
          return (
            <span
              key={`han-${index}`}
              style={{
                fontFamily: "var(--font-han-yi-qi-hei), sans-serif",
                fontWeight: 600,
              }}
            >
              {segment.value}
            </span>
          );
        }

        return (
          <span
            key={`latin-${index}`}
            style={{
              fontFamily: "var(--font-futura), sans-serif",
              fontWeight: 500,
            }}
          >
            {segment.value}
          </span>
        );
      })}
    </>
  );
}
