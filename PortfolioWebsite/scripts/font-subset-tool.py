#!/usr/bin/env python3

import argparse
import json
from pathlib import Path

from fontTools import __version__ as fonttools_version
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


def read_codepoints(path: Path) -> list[int]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    codepoints = payload.get("codepoints")
    if not isinstance(codepoints, list) or any(
        not isinstance(codepoint, int) or codepoint < 0 for codepoint in codepoints
    ):
        raise ValueError("Character set file must contain non-negative integer codepoints")
    return sorted(set(codepoints))


def subset_font(
    source: Path,
    output: Path,
    charset: Path,
    instance_weight: int | None,
) -> dict[str, object]:
    codepoints = read_codepoints(charset)
    font = TTFont(
        source,
        lazy=False,
        recalcBBoxes=False,
        recalcTimestamp=False,
    )

    if instance_weight is not None:
        if "fvar" not in font:
            raise ValueError(f"{source} is not a variable font")
        font = instantiateVariableFont(
            font,
            {"wght": instance_weight},
            inplace=False,
            optimize=True,
        )

    source_cmap = font.getBestCmap() or {}
    expected_codepoints = sorted(set(codepoints).intersection(source_cmap))

    options = Options()
    options.flavor = "woff2"
    options.hinting = True
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.notdef_glyph = True
    options.notdef_outline = True
    options.recommended_glyphs = True
    options.glyph_names = True
    options.symbol_cmap = True
    options.legacy_cmap = True
    options.recalc_timestamp = False

    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=expected_codepoints)
    subsetter.subset(font)

    output.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(output, reorderTables=True)

    verification_font = TTFont(output, lazy=False, recalcTimestamp=False)
    output_codepoints = sorted((verification_font.getBestCmap() or {}).keys())
    missing = sorted(set(expected_codepoints).difference(output_codepoints))
    if missing:
        preview = ", ".join(f"U+{codepoint:04X}" for codepoint in missing[:12])
        raise RuntimeError(f"Subset output is missing expected codepoints: {preview}")

    return {
        "fontToolsVersion": fonttools_version,
        "sourceSupportedCodepoints": expected_codepoints,
        "supportedCodepoints": output_codepoints,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--charset", type=Path, required=True)
    parser.add_argument("--instance-weight", type=int)
    args = parser.parse_args()

    result = subset_font(
        source=args.source,
        output=args.output,
        charset=args.charset,
        instance_weight=args.instance_weight,
    )
    print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    main()
