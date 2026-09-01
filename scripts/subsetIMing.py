#!/usr/bin/env python3
"""從一點明體 I.Ming 切出 /works/letterpress 見本帖需要的字，輸出 woff2。

一點明體是開源的（IPA Font License 1.0，https://github.com/ichitenfont/I.Ming），
但原檔是 24.7MB 的 TTF，整份丟上網不可行，所以照本頁實際用到的字集切一份。
字集直接從原始碼與語系檔掃出來，改了文案重跑一次就好。
試打區走的是 emfont 的動態子集服務，不吃這份。

IPA 授權把子集視為「派生程式」，第 3 條要求派生程式不得沿用原字型名稱，
並且要附上授權全文。所以這裡會改寫 name table，輸出的字型叫 DERIVED_NAME，
授權全文放在 public/fonts/IMing-IPA-LICENSE.md。

用法：
    pip install fonttools brotli
    python3 scripts/subsetIMing.py path/to/I.Ming-8.10.ttf
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'fonts' / 'iming-subset.woff2'

# IPA 授權要求派生程式改名，不得沿用「I.Ming／一點明體」。
DERIVED_NAME = 'Chiaki IMing Subset'
DERIVED_PS_NAME = 'ChiakiIMingSubset'

# 文案來源：見本帖的樣張常數、部落格 widget 的樣字，加上三個語系裡這一頁會印出來的字串。
# 漏掉任何一處都不會報錯 —— 缺的字會安靜地掉到 Noto Serif TC，只有盯著看才發現
# 某幾個字的基線不一樣。新增會印在 .lp 底下的固定文案時記得加進來。
SOURCES = [
    ROOT / 'components' / 'works' / 'letterpress' / 'specimenText.ts',
    ROOT / 'components' / 'blog' / 'widgets' / 'LetterpressPress.tsx',
]
LOCALE_KEYS = ['letterpressPage']

# 介面上還會用到的固定字元。
EXTRA = (
    '0123456789'
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    'abcdefghijklmnopqrstuvwxyz'
    ' .,;:!?·—–-…‧、。，；：！？「」『』（）()[]{}<>《》〈〉'
    '“”‘’"\'/\\|@#$%^&*_+=~`'
    '■□█→←↑↓'
)


def collect() -> set:
    chars = set(EXTRA)
    for path in SOURCES:
        # 只取字串字面值，避免把識別字與註解裡的符號也拉進來會比較乾淨，
        # 但多切幾個字沒有壞處，所以直接整份吃下。
        chars.update(path.read_text(encoding='utf-8'))
    for locale in ('tw', 'ja', 'en'):
        data = json.loads((ROOT / 'locales' / f'{locale}.json').read_text(encoding='utf-8'))
        for key in LOCALE_KEYS:
            chars.update(json.dumps(data.get(key, {}), ensure_ascii=False))
        # 作品集索引那張卡上的字。
        chars.update(json.dumps(data['worksPage']['specimens'], ensure_ascii=False))
    # 控制字元與代理對不進字集。
    return {c for c in chars if c.isprintable() and not re.match(r'[\ud800-\udfff]', c)}


def rename(font) -> None:
    """改寫 name table。IPA 授權第 3 條：派生程式必須用不同於原程式的名稱。"""
    name = font['name']
    for record in list(name.names):
        # 1/16 家族名、4 完整名、6 PostScript 名、17 typographic subfamily 之外的家族欄位
        if record.nameID in (1, 16):
            record.string = DERIVED_NAME
        elif record.nameID == 4:
            record.string = DERIVED_NAME
        elif record.nameID == 6:
            record.string = DERIVED_PS_NAME
        elif record.nameID == 3:
            record.string = f'{DERIVED_PS_NAME};derived from I.Ming'


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    source = pathlib.Path(sys.argv[1])
    if not source.exists():
        print(f'找不到字體檔：{source}')
        return 1

    from fontTools import subset

    OUT.parent.mkdir(parents=True, exist_ok=True)
    for chars, out in ((collect(), OUT),):
        options = subset.Options()
        options.flavor = 'woff2'
        options.desubroutinize = True
        options.layout_features = ['*']
        options.notdef_outline = True
        font = subset.load_font(str(source), options)
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(text=''.join(sorted(chars)))
        subsetter.subset(font)
        rename(font)
        subset.save_font(font, str(out), options)
        print(f'{len(chars)} 字 → {out.relative_to(ROOT)} ({out.stat().st_size / 1024:.1f} KB)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
