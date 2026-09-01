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
{ "name": "letterpress-press", "only": "paper" }
```

## 二、墨

（墨會滲進纖維 → 邊緣暈開；壓力又把字面沾的墨往外擠 → 整個字胖一圈。）

```widget
{ "name": "letterpress-press", "only": "ink" }
```

## 三、壓

（壓力輕了印不滿，重了墨被擠出邊緣。有趣的是壓力大反而讓紙被壓平，筆畫推歪變少。）

```widget
{ "name": "letterpress-press", "only": "pressure", "text": "活版印刷" }
```

## 四、字

（鉛字會磨損。新字的缺陷是表面細斑點，舊字是真的崩掉一角 —— 不只變多，尺度也變大。）

```widget
{ "name": "letterpress-press", "only": "wear" }
```

## 五、一支濾鏡不夠

（轉折：上面四個成因都調好了，換個字級卻整個垮掉。因為缺角與缺塊的尺度是絕對長度，
不會跟著字級放大 —— 小字上的斑駁，放到 60px 就變成整塊筆畫被剪掉。
所以大字要改走「調密度」而不是「挖」。）

```widget
{ "name": "letterpress-press", "only": "size", "text": "見本" }
```

## 六、排字

（一顆一顆排上去的，位置和沾墨都不一樣。逐字歪斜、逐字濃淡。
　週期是 11／13／17／23 這些互質的大數，整段看下去才不會露出循環 ——
　所以這裡的樣字非得是一整句不可，四個字是看不出來的。）

```widget
{ "name": "letterpress-press", "only": "set" }
```

## 附：自己玩玩看

（四個成因加上字級，全部湊在一起。幾組預設是常見的印壞情況。）

```widget
{ "name": "letterpress-press" }
```

## 七、然後 Safari 給了一腳

（簡單提：次像素的 feGaussianBlur 兩個引擎實作不同。單看 blur 沒事，
blur 之後再把 alpha 拉硬才會爆 —— 這是唯一反直覺、值得記住的一句。
換成固定係數的卷積核就兩邊一致了。）

## 收尾

（連到見本帖、連到 package。）
