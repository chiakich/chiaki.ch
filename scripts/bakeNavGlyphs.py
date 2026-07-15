#!/usr/bin/env python3
"""把 nav flyout 用到的字體字符烤成 SVG 外框路徑，輸出 components/nav/fontGlyphPaths.ts。

為什麼要烤：見產出檔開頭的說明（font-display 閃爍、為三個圖示載入 ~91KB 字體、
這幾套字只有 Regular 一個字重）。

需要 fonttools 與 brotli（brotli 用來解 woff2）。系統 Python 通常是
externally-managed，所以走 venv：

    python3 -m venv /tmp/bakeglyphs && /tmp/bakeglyphs/bin/pip install fonttools brotli
    /tmp/bakeglyphs/bin/python scripts/bakeNavGlyphs.py

改字符或改字體檔之後重跑即可；不要手改 fontGlyphPaths.ts。
"""

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

# icon 以 viewBox 0 0 48 48 繪製、實際輸出 44px（對齊 navIcons.tsx 的 svgProps）
VIEWBOX = 48
DISPLAY = 44

OUT = "components/nav/fontGlyphPaths.ts"

# (常數名, 字體檔, 字符, 原本的 font-size, 註解)
SPECS = [
    ("AKITRA_CHE", "public/assets/fonts/AkiTRA-Regular.woff2", "車", 30,
     "AkiTRA-Regular.woff2 · 車"),
    ("NIXIE_EIGHT", "public/assets/fonts/AkiNixieNumber-Regular.woff2", "8", 32,
     "AkiNixieNumber-Regular.woff2 · 8"),
    ("HUNINN_FEN", "public/assets/fonts/huninn-subset.woff2", "粉", 30,
     "huninn-subset.woff2 · 粉"),
]

HEADER = """// 由字體檔烤出來的字符外框路徑 —— 不是手寫的，要改請重跑 scripts/bakeNavGlyphs.py。
//
// 為什麼烤成路徑而不是即時用字體 render：
//   1. 這三套字設 font-display: swap，第一次展開 flyout 會先閃一下 fallback 字體才換過來。
//   2. 只為了三個 44px 圖示，就得下載 akitra(74KB) + huninn subset(15KB) + nixie(2KB)。
//   3. 這幾套字都只有 Regular 一個字重，加粗只能靠 -webkit-text-stroke 這種 hack。
//
// 產生方式：fontTools 取字符外框 → 縮放到原本的 font-size → Y 軸翻轉 →
// 把「墨水」外框置中於 48x48 的 viewBox（icon 實際以 44px 繪製）。
"""


def bake(font_path: str, char: str, font_px: float) -> str:
    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()
    glyph_name = font.getBestCmap().get(ord(char))
    if glyph_name is None:
        raise SystemExit(f"{font_path} 沒有字符 {char!r}")
    glyph = glyph_set[glyph_name]

    # 字體單位 → viewBox 單位，換算後等同原本的 font-size
    scale = (font_px * VIEWBOX / DISPLAY) / font["head"].unitsPerEm

    bounds = BoundsPen(glyph_set)
    glyph.draw(bounds)
    x_min, y_min, x_max, y_max = bounds.bounds
    width = (x_max - x_min) * scale
    height = (y_max - y_min) * scale

    # 縮放 + Y 軸翻轉（字體 Y 向上、SVG Y 向下），再把墨水外框置中
    transform = Transform(
        scale, 0, 0, -scale,
        (VIEWBOX - width) / 2 - x_min * scale,
        (VIEWBOX - height) / 2 + y_max * scale,
    )

    pen = SVGPathPen(glyph_set, ntos=lambda v: str(round(v, 2)))
    glyph.draw(TransformPen(pen, transform))
    return pen.getCommands()


def main() -> None:
    lines = [HEADER]
    for name, path, char, px, label in SPECS:
        d = bake(path, char, px)
        lines.append(f"// {label}（原 font-size {px}px）")
        lines.append(f"export const {name} =\n  '{d}'")
        lines.append("")

    with open(OUT, "w") as fh:
        fh.write("\n".join(lines))
    print(f"wrote {OUT} ({len(SPECS)} glyphs)")


if __name__ == "__main__":
    main()
