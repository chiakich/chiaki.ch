---
title: "想在網頁上重現鉛字印刷的質感，該怎麼做呢？"
date: 2026-08-31
lang: zh
excerpt: "鉛字壓在紙上會發生很多事：墨滲進纖維、壓力把字擠胖、紙面不平把筆畫推歪、用久的字會崩角。一層一層把它疊回網頁上。"
tags: ["css", "svg", "typography", "letterpress"]
readingTime: 10
draft: true
---

（開場：為什麼想做這個。一句話帶到「真正的鉛字壓在紙上會發生什麼事」。）

## 一、紙

（沒有紙就沒有鉛字。纖維的方向性、曝光不均、噪點、髒污。）

```widget
{ "name": "letterpress-layers", "layer": "paper" }
```

## 二、墨

（墨會滲進纖維 → 邊緣暈開；壓力又把字面沾的墨往外擠 → 整個字胖一圈。）

```widget
{ "name": "letterpress-layers", "layer": "ink" }
```

## 三、壓

（紙面不平，字被推歪；鉛字用久了會磨損崩角。）

```widget
{ "name": "letterpress-layers", "layer": "press", "text": "活版印刷" }
```

## 四、一支濾鏡不夠

（轉折：同一組參數，小字好看、大字散掉。因為噪點週期是絕對長度，不會跟著字級放大。
所以大字要改走「調密度」而不是「挖」。）

```widget
{ "name": "letterpress-layers", "layer": "press", "text": "見本", "size": 72 }
```

## 五、排字

（一顆一顆排上去的，位置和沾墨都不一樣。逐字歪斜、逐字濃淡。）

```widget
{ "name": "letterpress-layers", "layer": "set", "text": "常世通信 第一號" }
```

## 六、然後 Safari 給了一腳

（簡單提：次像素的 feGaussianBlur 兩個引擎實作不同。單看 blur 沒事，
blur 之後再把 alpha 拉硬才會爆 —— 這是唯一反直覺、值得記住的一句。
換成固定係數的卷積核就兩邊一致了。）

## 收尾

（連到見本帖、連到 package。）
