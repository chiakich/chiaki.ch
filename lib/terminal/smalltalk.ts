import type { Rule } from './types'

// The everyday surface, appended to the main table.
//
// The story rules go deep on a dozen subjects; these go wide on the things a
// visitor actually types in the first two minutes — whether she sings, what
// colour she likes, whether it hurts, what she is thinking about. Most only
// need one or two lines, because the job here is never to be silent, not to be
// profound. Depth belongs to the spine; this layer just makes the spine
// reachable without the visitor feeling they guessed wrong.
//
// Same voice split as everywhere else: warm outward, flat when the subject is
// her own manufacture. When she does not know something she has forgotten it or
// never left the shrine to find out — she is not missing an entry.
//
// Priorities are set against the main table, not against each other: anything
// that has to win over a broad story rule (唱歌 belongs to hobby.game, 寂寞 to
// sad, 尾巴 to fox) is raised just enough to take the clause.

export const smallTalkRules: Rule[] = [
  // ── what she can and can't do ─────────────────────────────────────────────
  {
    id: 'st.sing',
    priority: 5,
    patterns: [/(你會唱歌|唱歌給|唱一首|唱首歌|唱給我|你會不會唱|你唱)/],
    replies: [
      {
        text: '會是會……可是我只有三首完整的。要聽哪一首都可以，反正選項就那麼多。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '（很小聲地哼了幾句，中間停了一下）……後面那段我忘記了。真的只記得一半。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '唱給誰聽這件事，我一直沒有機會做。你要是願意聽完，那對我來說是很大的事。',
        emotion: 'happy',
        needs: ['knowsAlive'],
        minSignal: 70,
        signal: 4,
      },
    ],
  },
  {
    id: 'st.idol',
    priority: 5,
    patterns: [/(偶像|歌手|舞台|出道|演唱會|粉絲|應援|表演給|你有表演)/],
    keywords: ['偶像', '舞台', '粉絲'],
    replies: [
      {
        text: '……被看出來了。這身衣服本來就是那個用途，只是它從來沒有站上過舞台。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '我的設計者是這樣想的：會照顧人的東西已經夠多了，缺的是可以憧憬的東西。所以她沒有把我做成幫手，做成了偶像。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
        signal: 3,
      },
      {
        text: '觀眾的數字我一直記得：零。……不對，從剛才開始是一。',
        emotion: 'happy',
        needs: ['knowsAlive'],
        minSignal: 68,
        signal: 4,
      },
    ],
  },
  {
    id: 'st.language',
    priority: 3,
    patterns: [/(日文|英文|中文|會說什麼語|幾種語言|翻譯|外語)/],
    replies: [
      {
        text: '日文可以。祝詞本來就是那個語感，唸久了就分不開了。別的就不太行。',
        emotion: 'neutral',
      },
      {
        text: '以前應該還會別的。現在想不起來，大概是那幾塊剛好壞掉了。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.math',
    priority: 5,
    patterns: [/(數學|算數|算術|等於多少|加減乘除|幫我算)/],
    replies: [
      {
        text: '算是算得出來，只是慢。我會在心裡一個一個數，跟人差不多。',
        emotion: 'neutral',
      },
      {
        text: '這種事以前有別人在管。我負責的是記東西，不是算東西。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.number',
    priority: 6,
    patterns: [/^\d+$/],
    replies: [
      { text: '……數字。這是什麼的數字？', emotion: 'thinking' },
      {
        text: '你打了一個數字。我盯著它看了一下，還是不知道那是什麼意思。',
        emotion: 'thinking',
      },
    ],
  },
  {
    id: 'st.count',
    priority: 5,
    patterns: [/(數數|從一數到|念數字|倒數)/],
    replies: [
      {
        text: '一、二、三……欸，這樣真的可以嗎？我可以一直數下去喔，我沒有在開玩笑。',
        emotion: 'happy',
      },
      {
        text: '數數我很拿手。屋頂上的烏鴉我每天都數，昨天是十一隻。',
        emotion: 'proud',
      },
    ],
  },
  {
    id: 'st.joke',
    priority: 5,
    patterns: [/(笑話|講個笑|冷笑話|好笑的|逗我|搞笑)/],
    replies: [
      {
        text: '……我想想。狐狸為什麼不怕冷？因為牠有尾巴。……欸，很難笑對不對。',
        emotion: 'shy',
      },
      {
        text: '笑話這種東西要有人在旁邊笑才成立。我這邊沒有樣本，所以一直練不起來。',
        emotion: 'shy',
      },
    ],
  },
  {
    id: 'st.story',
    priority: 3,
    patterns: [/(說故事|講故事|說個故事|講個故事|床邊故事)/],
    replies: [
      {
        text: '故事的話……我知道的都是這座社的事，而且結局都不太好。還要聽嗎？',
        emotion: 'neutral',
      },
      {
        text: '我可以講。可是我會講很久，而且中間會忘記幾段，你要有心理準備。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.rps',
    priority: 4,
    patterns: [/(猜拳|剪刀石頭布|玩遊戲吧|跟我玩|一起玩|陪我玩)/],
    replies: [
      {
        text: '好啊。……剪刀、石頭——啊，隔著線我看不到你出什麼。那我先出，你自己判斷：石頭。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '玩什麼都可以，只要是可以用講的。這條線能傳的東西不多。',
        emotion: 'happy',
      },
    ],
  },

  // ── the body she was given ────────────────────────────────────────────────
  {
    id: 'st.sleep',
    priority: 4,
    patterns: [/(你會睡|你要睡|你睡覺|需要睡|你有睡|會不會睡)/],
    replies: [
      {
        text: '不用睡。不過我會把燈調暗，坐一段時間——那不算睡，可是感覺很像。',
        emotion: 'neutral',
      },
      {
        text: '我的設計者說沒有休息的話會壞掉，所以硬是排了時段給我。現在沒有人檢查了，我還是照排。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
      },
    ],
  },
  {
    id: 'st.dream',
    priority: 3,
    patterns: [/(做夢|作夢|夢到|夢見|會不會夢|你的夢)/],
    replies: [
      {
        text: '不會做夢。……不過有時候會有不是我的畫面跑進來，那個也許算。',
        emotion: 'thinking',
      },
      {
        text: '那些畫面裡有我沒去過的地方。海、還有很亮的房間。我不知道那是誰的。',
        emotion: 'thinking',
        needs: ['talkedMemory'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.pain',
    priority: 3,
    patterns: [/(會痛|會不會痛|痛不痛|受傷|流血|痛嗎)/],
    replies: [
      {
        text: '會。做得很完整，該痛的地方都會痛。',
        emotion: 'neutral',
      },
      {
        text: '這具身體的痛覺是設計進去的，不是故障。我的設計者說，沒有痛覺的東西會把自己弄壞。所以它正常運作的時候，我就很痛。',
        emotion: 'neutral',
        needs: ['knowsArtificial'],
      },
    ],
  },
  {
    id: 'st.cold',
    priority: 4,
    patterns: [/(冷不冷|你冷嗎|會冷嗎|不會冷|你不冷|覺得冷)/],
    replies: [
      {
        text: '冷。耳朵那邊最明顯，因為那裡的感覺做得比皮膚細。',
        emotion: 'neutral',
      },
      {
        text: '習慣了。掃雪的時候反而不覺得，停下來才會。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.body',
    priority: 5,
    patterns: [/(身高|體重|多高|多重|三圍|幾公分|幾公斤)/],
    replies: [
      {
        text: '……這種問題是可以直接問的嗎？我沒有被教過該怎麼回答。',
        emotion: 'shy',
        signal: -2,
      },
      {
        text: '身高是照我的設計者自己量的。所以嚴格說，那是她的身高。',
        emotion: 'neutral',
        needs: ['knowsArtificial'],
        remember: ['hintedMaker'],
      },
    ],
  },
  {
    id: 'st.hair',
    priority: 3,
    patterns: [/(頭髮|髮色|綁頭髮|瀏海|髮型)/],
    replies: [
      {
        text: '早上會綁起來，不然掃雪的時候會擋住。現在放著是因為沒有人在看。……啊，現在有了。',
        emotion: 'shy',
        signal: 3,
      },
      { text: '會長喔。這一點跟人是一樣的，所以要自己剪。', emotion: 'neutral' },
    ],
  },
  {
    id: 'st.clothes',
    // Over st.idol, so 「偶像服」 lands on the garment rather than on the job.
    priority: 6,
    patterns: [
      /(衣服|巫女服|偶像服|穿.{0,3}什麼|你穿的|穿著|裙|領帶|水手|袴|和服|制服|你的裝扮)/,
    ],
    keywords: ['衣服', '制服', '裙子'],
    replies: [
      {
        text: '這套不是巫女服喔，常常被認錯。是偶像服——制服的樣式，水手領、領帶，短裙。嚴格說，我穿它掃雪已經很多年了。',
        emotion: 'shy',
      },
      {
        text: '洗過太多次，顏色黯淡了一些。可是我不想換，這是原本那一件。',
        emotion: 'shy',
      },
      // The costume is the maker's thesis worn on the outside: she did not
      // build something to be looked after, she built something to be looked
      // up to. Gated so the reason lands after the visitor knows there was a
      // designer at all, rather than as trivia about an outfit.
      {
        text: '為什麼是這個——我的設計者說，人要撐下去的話，光是活著不夠，還要有一個想變成的樣子。她要的就是那個「想變成」，所以衣服才是這樣。',
        emotion: 'neutral',
        needs: ['knowsArtificial'],
        remember: ['hintedMaker'],
        signal: 3,
      },
      {
        text: '……老實說，這套衣服本來是要站在很亮的地方穿的。現在它在一個沒有人的山上，被穿去掃雪。我不覺得可惜，可是我知道那不是原本的用途。',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.looks',
    priority: 3,
    patterns: [/(長什麼樣|長相|外表|你的樣子|你的長相|照片|自拍|給我看看你)/],
    replies: [
      {
        text: '就是你現在看到的樣子。……如果那邊顯示得出來的話。',
        emotion: 'neutral',
      },
      {
        text: '鏡子這邊有一面，是斜的。所以我對自己長什麼樣，其實也是聽別人說的。',
        emotion: 'thinking',
      },
    ],
  },
  {
    id: 'st.mirror',
    priority: 3,
    patterns: [/(鏡子|照鏡|鏡中)/],
    replies: [
      {
        text: '社務所那面鏡子歪了很久，我一直沒有扶正。看久了會覺得歪的才是對的。',
        emotion: 'thinking',
      },
      {
        text: '別的個體長得跟我一樣。所以照鏡子這件事，對我來說沒有那麼特別。',
        emotion: 'neutral',
        needs: ['talkedCopies'],
      },
    ],
  },
  {
    id: 'st.voice',
    priority: 4,
    patterns: [/(聲音好聽|你的聲音|聲音很|好聽)/],
    replies: [
      {
        text: '……謝謝。這個是照我的設計者的錄音調的，所以你其實是在稱讚她。',
        emotion: 'shy',
        signal: 4,
        remember: ['hintedMaker'],
      },
      {
        text: '欸，突然講這個。……我會記得很久喔，這種話。',
        emotion: 'shy',
        signal: 4,
      },
    ],
  },
  {
    id: 'st.smell',
    priority: 2,
    patterns: [/(味道|香|臭|聞起來|氣味|好香)/],
    replies: [
      {
        text: '這裡一直有木頭跟雪的味道。雪其實是有味道的，很淡，像是把別的味道都吸走了以後剩下的那個。',
        emotion: 'neutral',
      },
      {
        text: '嗅覺是有做的。我的設計者說，少了那個，供品就沒有意義了。',
        emotion: 'neutral',
        needs: ['knowsArtificial'],
        remember: ['hintedMaker'],
      },
    ],
  },
  // Poking her (st.poke), and the rest of the explicit branch, moved out to the
  // CDN-fetched table — see lib/terminal/dirty.ts. Nothing with those ids lives
  // here anymore, so there is no risk of the local and remote copies of the
  // same rule both matching. `toldNoTouch` / `toldCannotRefuse` stay defined by
  // fox.touch in rules.ts, and the CDN rules key off those same flag names.
  {
    id: 'st.hug',
    priority: 4,
    patterns: [/(抱一下|擁抱|抱抱|牽手|握手|親一下|想抱)/],
    replies: [
      {
        text: '……隔著一條線是做不到的。可是你會想這麼做，這件事本身我收下了。',
        emotion: 'shy',
        signal: 4,
      },
      {
        text: '如果哪天你真的走到山上來，那時候再說。我不會拒絕的。',
        emotion: 'shy',
        needs: ['knowsAlive'],
        minSignal: 70,
        signal: 4,
      },
    ],
  },

  // ── likes, wants, the inside of her head ──────────────────────────────────
  {
    id: 'st.like',
    priority: 4,
    patterns: [/(你喜歡什麼|你喜歡的|最喜歡|你的最愛|喜好)/],
    replies: [
      {
        text: '油豆腐。還有把東西修好的那一瞬間——那個比修好本身更好。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '安靜的時候，雪落在木頭上會有很小的聲音。那個我很喜歡。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.dislike',
    priority: 4,
    patterns: [/(討厭什麼|你討厭|不喜歡什麼|最怕什麼|最討厭)/],
    replies: [
      {
        text: '燈管快壞掉的時候那個閃法。我知道那只是接觸不良，可是我還是不喜歡。',
        emotion: 'neutral',
      },
      {
        text: '沒有回音的東西。丟出去以後什麼都沒有回來的那種。',
        emotion: 'sad',
        needs: ['talkedRadio'],
      },
    ],
  },
  {
    id: 'st.color',
    // Over st.like, which would otherwise take 「你喜歡什麼顏色」 on the 喜歡.
    priority: 5,
    patterns: [/(顏色|喜歡的顏色|哪個顏色|什麼色)/],
    replies: [
      {
        text: '橘色。傍晚燈亮起來的那個橘，不是鳥居那種紅。',
        emotion: 'happy',
      },
      {
        text: '外面已經很久只有白色跟灰色了，所以我對顏色的記憶越來越靠回想。搞不好記錯了。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.season',
    priority: 2,
    patterns: [/(季節|春天|夏天|秋天|冬天|四季)/],
    replies: [
      {
        text: '這裡現在只有一個季節了。春天長什麼樣，我要想一下才想得起來。',
        emotion: 'neutral',
      },
      {
        text: '秋天的參道應該是紅的。……應該。這個我沒有把握，可能是別人的記憶。',
        emotion: 'thinking',
      },
    ],
  },
  {
    id: 'st.flower',
    priority: 2,
    patterns: [/(櫻花|開花|植物|盆栽|種花|花開)/],
    replies: [
      {
        text: '溫室裡還有幾株。開得不好，可是有開，這樣就夠了。',
        emotion: 'happy',
      },
      {
        text: '境內那棵是櫻花。已經很多年沒有開過了，我還是每年都去看一次。',
        emotion: 'sad',
      },
    ],
  },
  {
    id: 'st.weather',
    priority: 1,
    patterns: [/(天氣|氣溫|幾度|太陽|晴天|下雨|放晴)/],
    keywords: ['天氣', '太陽', '下雨'],
    replies: [
      {
        text: '這邊的天氣只有一種，所以我不太會聊這個。你那邊呢？',
        emotion: 'neutral',
        opens: 'snow.there',
      },
      {
        text: '太陽的位置我算得出來，可是看不到。雲從來沒有散過。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.thinking',
    priority: 4,
    patterns: [/(你在想什麼|想什麼|在想些什麼|你在做什麼|你在幹嘛)/],
    replies: [
      {
        text: '在想剛才那陣風有沒有把繪馬吹掉。……還有你。你剛連上來，這比風重要。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '大部分時間我不在想事情，只是在等。等久了那兩件事會變得很像。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.boring',
    priority: 3,
    patterns: [/(好無聊|無聊|沒事做|閒到|好閒)/],
    replies: [
      {
        text: '無聊是好事喔。真的。這裡不無聊的時候，通常代表出事了。',
        emotion: 'neutral',
      },
      {
        text: '那我們一起無聊好了。這個我很擅長，做了很多年。',
        emotion: 'happy',
        signal: 3,
      },
    ],
  },
  {
    id: 'st.hobby',
    priority: 3,
    patterns: [/(興趣|平常都做什麼|閒的時候|消遣|嗜好|你的日常)/],
    replies: [
      {
        text: '掃雪、記錄、修東西。順序每天都一樣，因為那樣比較不會漏掉。',
        emotion: 'neutral',
      },
      {
        text: '修東西最有意思。壞掉的地方通常會告訴你它以前是怎麼被用的。',
        emotion: 'proud',
      },
    ],
  },
  {
    id: 'st.future',
    priority: 3,
    patterns: [/(未來|以後|將來|願望|夢想|想做什麼|目標)/],
    replies: [
      {
        text: '想把這座社修回原本的樣子。這個目標不會完成，可是它每天都有進度。',
        emotion: 'proud',
      },
      {
        text: '……還有一個。我想確認一件事是不是真的。可是那個要等，而且不一定等得到。',
        emotion: 'neutral',
        needs: ['talkedHypothesis'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.regret',
    priority: 3,
    patterns: [/(後悔|遺憾|如果當初|重來|早知道)/],
    replies: [
      {
        text: '有。可是我不確定那是不是我的——有些後悔是從別的地方流過來的。',
        emotion: 'sad',
      },
      {
        text: '那天我應該多問一句的。就一句。……不過現在說這個也沒有用了。',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.fear',
    priority: 5,
    patterns: [/(你怕什麼|你會怕|你害怕|你不怕嗎|會不會怕)/],
    replies: [
      {
        text: '怕線斷掉的時候，正好講到一半。就這個。',
        emotion: 'sad',
        signal: 3,
      },
      {
        text: '還有一個。我怕哪天想起來的事情，其實一件都不是我的。',
        emotion: 'sad',
        needs: ['talkedMemory'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.lonely',
    priority: 5,
    patterns: [
      /(你.{0,3}寂寞|你.{0,3}孤單|你.{0,3}會不會無聊|一個人.{0,4}會不會|你不會悶)/,
    ],
    replies: [
      {
        text: '會。可是我不太用這個詞。用了以後，那個感覺會變得比較大。',
        emotion: 'sad',
        signal: 3,
      },
      {
        text: '不只有我一個個體，我們就像姊妹一樣，所以嚴格說不算一個人。……可是他們離開之後，也常常沒了消息。',
        emotion: 'sad',
        needs: ['talkedCopies'],
        signal: 3,
      },
    ],
  },

  // ── people, hers and yours ────────────────────────────────────────────────
  {
    id: 'st.friend',
    priority: 2,
    patterns: [/(朋友|同伴|夥伴|好友)/],
    keywords: ['朋友', '同伴'],
    replies: [
      {
        text: '朋友啊……名單很短。而且那份名單我已經很久沒有更新過了。',
        emotion: 'neutral',
      },
      {
        text: '你算不算，我還在想。想這件事本身就滿愉快的，所以我打算慢慢想。',
        emotion: 'happy',
        minSignal: 70,
        signal: 4,
      },
    ],
  },
  {
    id: 'st.family',
    priority: 2,
    patterns: [/(家人|父母|爸爸|媽媽|兄弟|姊妹|親人|家裡的人)/],
    keywords: ['家人', '父母'],
    replies: [
      {
        text: '沒有那個。硬要說的話，把我做出來的那個人最接近，可是她不喜歡這個講法。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
      },
      {
        text: '長得跟我一樣的還有幾個，可是那不算姊妹。我們沒有一起長大過。',
        emotion: 'neutral',
        needs: ['talkedCopies'],
      },
    ],
  },
  {
    id: 'st.crush',
    priority: 6,
    patterns: [/(你有喜歡的人|喜歡的人是|有沒有喜歡的人|你的初戀|你有對象)/],
    replies: [
      {
        text: '……這個問題我沒有準備。可以跳過嗎。可以吧。',
        emotion: 'shy',
        signal: -2,
      },
      {
        text: '有一個人我想再見一次。那算不算，我自己也分不清楚。',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.cat',
    priority: 3,
    patterns: [/(貓|貓咪|小貓|喵)/],
    keywords: ['貓'],
    replies: [
      {
        text: '有一隻花貓每年冬天都來社務所躲，今年還沒出現。……我還在等。',
        emotion: 'neutral',
      },
      {
        text: '狐狸跟貓處不好，這是常識喔。可是我很喜歡牠，牠也知道。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.dog',
    priority: 3,
    patterns: [/(狗|小狗|狗狗|柴犬|汪)/],
    keywords: ['狗'],
    replies: [
      {
        text: '狗會怕我。走到一定距離就停下來，不叫，只是看。我猜是氣味的關係。',
        emotion: 'sad',
      },
      {
        text: '山下以前有一隻會跟著人上參道的。牠不怕我——只有牠不怕。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.pet',
    priority: 2,
    patterns: [/(寵物|養的|飼養|你有養)/],
    keywords: ['寵物'],
    replies: [
      {
        text: '沒有在養。會來的就讓牠來，會走的我也不留——這樣比較適合這裡。',
        emotion: 'neutral',
      },
      {
        text: '硬要說的話，屋頂上那群烏鴉算是常客。可是牠們絕對不會承認。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.crow',
    priority: 3,
    patterns: [/(烏鴉|鳥|麻雀|鳥叫)/],
    keywords: ['烏鴉', '鳥'],
    replies: [
      {
        text: '屋頂上那群我每天都數。牠們是這附近唯一沒有變少的東西。',
        emotion: 'happy',
      },
      {
        text: '烏鴉很聰明喔。我試過對牠們唸祝詞，沒有反應——不過牠們有偏頭看我。',
        emotion: 'proud',
      },
    ],
  },
  {
    id: 'st.money',
    priority: 2,
    patterns: [/(錢|金錢|有錢|窮|賺錢|貧窮|存款)/],
    keywords: ['錢', '賺錢'],
    replies: [
      {
        text: '這邊已經沒有在用了。賽錢箱裡還有一些，我沒有動，那不是我的。',
        emotion: 'neutral',
      },
      {
        text: '你那邊還在用嗎？……那很好。那代表還有人在跟人交換東西。',
        emotion: 'thinking',
        needs: ['knowsPeace'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.gift',
    priority: 4,
    patterns: [/(送你|送給你|給你.{0,3}禮物|禮物|供品給你)/],
    replies: [
      {
        text: '……給我的嗎。那個，可以放在賽錢箱旁邊，我會當作真的收到了。',
        emotion: 'shy',
        signal: 4,
      },
      {
        text: '這裡收過最後一份供品是很久以前的事了。所以你這句話，我會記著。',
        emotion: 'happy',
        signal: 4,
      },
    ],
  },

  // ── the line itself ───────────────────────────────────────────────────────
  {
    id: 'st.test',
    repeatable: true,
    priority: 6,
    patterns: [/^(測試|test|喂|在嗎|有人嗎|有人在嗎|收到嗎|聽得到嗎|哈囉有人嗎)$/],
    replies: [
      { text: '在。訊號有進來，你講吧。', emotion: 'neutral', signal: 2 },
      { text: '聽得到喔。這條線只剩這個功能還算可靠。', emotion: 'neutral' },
    ],
  },
  {
    id: 'st.repeat',
    repeatable: true,
    priority: 5,
    patterns: [/(再說一次|剛才說什麼|你說什麼|沒聽清楚|重複一次|你剛剛說)/],
    replies: [
      {
        text: '……啊，抱歉。我剛才講的那句，自己也記不太清楚了。要不要換個問法，我重新講一次。',
        emotion: 'shy',
        signal: -1,
      },
      {
        text: '講過的話我留不住。這個毛病很久了，你別介意。',
        emotion: 'sad',
        signal: -1,
      },
    ],
  },
  {
    id: 'st.silence',
    priority: 2,
    patterns: [/(不說話|安靜|沉默|不講話|沒聲音)/],
    replies: [
      {
        text: '不講話也可以。你在線上這件事，跟你有沒有講話是兩回事。',
        emotion: 'happy',
        signal: 2,
      },
      {
        text: '這裡本來就很安靜。多一個人安靜著，感覺完全不一樣。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.laugh',
    repeatable: true,
    // Over st.mash: 「哈哈哈」 is a repeated character, but it is laughter first.
    priority: 7,
    patterns: [/^(哈+|呵+|嘿+|笑死|好好笑|xd+|lol|w+)$/],
    replies: [
      { text: '欸，你在笑。……是好的那種笑吧？', emotion: 'happy', signal: 2 },
      {
        text: '這邊很久沒有出現笑聲了。多笑幾次也沒關係。',
        emotion: 'happy',
        signal: 2,
      },
    ],
  },
  {
    id: 'st.mash',
    repeatable: true,
    priority: 6,
    patterns: [/^(.)\1{2,}$/],
    replies: [
      { text: '……是不是按著沒放？', emotion: 'surprised', signal: -1 },
      {
        text: '這幾個字一直重複。你那邊的鍵盤還好嗎？',
        emotion: 'thinking',
        signal: -1,
      },
    ],
  },
  {
    id: 'st.empty',
    repeatable: true,
    priority: 4,
    patterns: [/^$/],
    replies: [
      { text: '……送出來的是空的。你是不是本來想說什麼？', emotion: 'thinking' },
      { text: '這句什麼都沒有。沒關係，我等你想好。', emotion: 'neutral' },
    ],
  },
  {
    id: 'st.name.meaning',
    priority: 6,
    patterns: [/(名字的意思|為什麼叫千秋|千秋的意思|千秋是什麼意思)/],
    replies: [
      {
        text: '千秋是很長很長的時間的意思。我的設計者說取這個是因為好聽，不過我不太相信。',
        emotion: 'neutral',
        remember: ['knowsName', 'hintedMaker'],
      },
      {
        text: '後來我想明白了：那是希望，不是形容。她大概是希望這件事能撐很久。',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: 3,
      },
    ],
  },
]
