---
title: "Plurk UI Redesign — Tokyono Sora"
date: 2020-11-03
lang: zh
excerpt: "隨著現代螢幕越來越大，像素密度越來越高，舊時代的網頁設計方法漸漸開始不符合現代需求，最近一直在嘗試製作更加適合大螢幕使用的噗浪CSS。"
tags: ["website-design", "redesign", "social-media", "design", "plurk"]
cover: /assets/blog/plurk-ui-redesign-tokyono-sora/01.jpeg
readingTime: 2
canonical: https://akiakira02.medium.com/plurk-ui-redesign-tokyono-sora-6938040c7880
---
## 重新設計橫式捲動社交平台 Plurk UI Redesign — Tokyono Sora

![](/assets/blog/plurk-ui-redesign-tokyono-sora/01.jpeg)

隨著現代螢幕越來越大，像素密度越來越高，舊時代的網頁設計方法漸漸開始不符合現代需求，最近一直在嘗試製作更加適合大螢幕使用的噗浪CSS。

噗浪預設布景在27吋的螢幕呈現起來大概是這樣：

![](/assets/blog/plurk-ui-redesign-tokyono-sora/02.png)

主要的問題如下：

-   河道比例稍扁，不會隨螢幕變高而調整
-   行距過窄、文字過於密集
-   資訊層級不夠清楚
-   呈現過多零碎資訊
-   設計風格不統一 (如圓角大小、色彩等)

明明螢幕變大了，主要的噗文仍擠在最上面小小的範圍裡，而且如果暱稱很長的話，內文的寬度也會變得很窄不好閱讀。

## 修改提案

## 色彩

透過不同色彩跟透明度區分資訊層級，並且統一醒目提示色為噗浪標準色。比起原本的未讀留言通知紅色更為緩和，半透明模糊的背景也讓噗文的背景更有變化與美觀。

![](/assets/blog/plurk-ui-redesign-tokyono-sora/03.png)

## 調整河道高度

拉高和到寬度，放寬噗之間的距離，並讓噗文行高可以調高。  
另外也調整了發文面板並降低配色層級，讓他的視覺空間不會太過壓迫，並且統一了噗浪的圓角按鈕風格。

![](/assets/blog/plurk-ui-redesign-tokyono-sora/04.jpeg)

## RWD設計

因為噗浪不允許 @ media 語法，無法做到完美的RWD。但盡可能用其他方法做到RWD，可以讓噗浪頁面適用各種不同的螢幕寬高與比例，即使直向螢幕也能看起來很美觀！另外捲軸的部份也重新設計過，降低了干擾程度。

![](/assets/blog/plurk-ui-redesign-tokyono-sora/05.png)

## 隱藏零碎資訊

自介與統計資料等，平常自己在滑噗的時候不會常用到的資訊就先暫時隱藏收合起來，只要滑鼠移動上去就會自動展開。載入頁面的時候也會有收合到右邊的動畫，可以引導瀏覽你噗浪頁面的旅人點開查看。

![](/assets/blog/plurk-ui-redesign-tokyono-sora/06.gif)

另外如果覺得官方預設的性別選項太少，在附加自定CSS的檔案裡，也提供修改性別選項文字的語法，當然你也可以在這寫上任何你想寫的文字～

## 調整文字排版

調整了暱稱與大頭貼位置、配色，以及字體、噗浪的寬度，讓噗浪使用起來更簡潔舒適。另外也稍微調整了顯示的上下層級，看噗的時候不會再像左圖噗文被通知器卡到囉。

![](/assets/blog/plurk-ui-redesign-tokyono-sora/07.jpeg)

## One more thing…

原本因為噗浪對自訂CSS有設定可以套用的範圍，感謝[欸個](https://www.plurk.com/egg820)發現神祕的黑魔法，可以有限的調整範圍外的元素，這樣就能實現調整彈出預覽圖的背景與字體等了。

![](/assets/blog/plurk-ui-redesign-tokyono-sora/08.png)

## 使用

可以到[本專案的github頁面](https://github.com/akira02/Tokyono-Sora)，複製CSS貼到噗浪的自訂佈景 -> 自訂佈景風格 欄位。

[本體 CSS](https://github.com/akira02/Tokyono-Sora/blob/main/TokynoSora.css)

另外有其他可供選擇的額外語法可以使用：  
[附加自訂 CSS](https://github.com/akira02/Tokyono-Sora/blob/main/custom.css)

## 衍生作品

在製作的過程中，也順便製作了一些其他可以獨立的有趣小東西，都歡迎自由使用喔！

## 數字管字體

靈感來自Steins;Gate裡的世界線變動率探測儀。數字管的感覺很適合呈現重要的數字，在這裡順便作為顯示卡馬值的字體做出來了。

![](/assets/blog/plurk-ui-redesign-tokyono-sora/09.jpeg)

![](/assets/blog/plurk-ui-redesign-tokyono-sora/10.png)

可以到[我的網站下載](https://chiaki.uk/nixie)，目前還只有數字。英文跟中文做到一半還在難產中，有空會繼續製作。如果喜歡的話可以留言鼓勵我QQ

## loading-fox svg

靈感來自Domaso設計的[loading cat](https://dribbble.com/shots/3197970-Loading-cat)，真的很可愛！

重新製作了狐狸版本的svg動畫，CC-BY授權釋出，可自由運用作為loading動畫，如果有用到的話歡迎跟我說，我會很開心的ww。

![](/assets/blog/plurk-ui-redesign-tokyono-sora/11.gif)

可以到專案的github頁面下載或點此[下載](https://raw.githubusercontent.com/akira02/Tokyono-Sora/main/loading.svg)。
