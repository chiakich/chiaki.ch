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
  // st.sing volunteers the number three, so the obvious follow-up needs a home.
  {
    id: 'st.songs',
    priority: 6,
    patterns: [/(哪三首|三首是|什麼歌|歌名|會唱哪|會唱什麼)/],
    replies: [
      {
        text: '《里の秋》是一首。剩下兩首，寫著歌名的地方壞了，旋律還在——所以那兩首現在只有我會唱，也只有我知道怎麼開頭。',
        emotion: 'neutral',
      },
      {
        text: '想聽的話……可以喔。不過要等雪小一點的時候。那種歌不適合配大雪。',
        emotion: 'shy',
        minSignal: 60,
        signal: 3,
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
        text: '我的設計者是這樣想的：會照顧人的東西已經夠多了，缺的是可以憧憬的東西。所以我的設計者沒有把我做成幫手，做成了偶像。',
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

  {
    id: 'st.cook',
    priority: 4,
    patterns: [/(你會煮|會做菜|會不會煮|做飯|煮什麼|你會料理)/],
    replies: [
      {
        text: '會。溫室的菜拿來煮，味覺有做，所以我知道自己煮得普通。',
        emotion: 'neutral',
      },
      {
        text: '食譜留下來很多，照著做就會像。……可是每一本寫的「適量」都不一樣多，我懷疑那個詞是暗號。',
        emotion: 'thinking',
      },
    ],
  },
  {
    id: 'st.lie',
    priority: 4,
    patterns: [/(說謊|騙人|騙我|你騙|謊話|你會不會騙)/],
    replies: [
      {
        text: '說謊的功能……我找過，沒有找到。所以我說的都是真的，包括這一句——你看，這樣就繞起來了。',
        emotion: 'thinking',
      },
      {
        text: '嚴格說，我做得到「不說」。我的設計者留了這個給我。哪些事情不說，是我自己決定的——這是我身上少數完全屬於我的東西。',
        emotion: 'neutral',
        needs: ['knowsArtificial'],
        remember: ['hintedMaker'],
      },
    ],
  },
  {
    id: 'st.fortune',
    // Over miko, whose pattern list has a bare 籤 in it.
    priority: 5,
    patterns: [/(占卜|算命|運勢|抽籤|求籤|御神籤|籤詩|幫我抽)/],
    replies: [
      {
        text: '御神籤還有滿滿一箱。……（搖了搖箱子，抽出一支）中吉。「等待的人，會出現」。喏，是好籤。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '占卜不是我負責的喔，我只負責搖箱子。籤上寫什麼，是箱子跟你之間的事。',
        emotion: 'proud',
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
      {
        text: '有一次我試著整晚不進休息時段，想看看會怎麼樣。……隔天掃雪掃得很糟。所以她排的是對的，這件事我沒有地方可以跟她講。',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: 2,
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
      {
        text: '如果那些畫面算夢，那我最常夢到的是海。……輪到我自己的部分，大概只有參道。掃得很乾淨的參道。',
        emotion: 'thinking',
        needs: ['talkedInherited'],
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
        text: '身高是照我的設計者自己量的。所以嚴格說，那是我的設計者的身高。',
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
        text: '為什麼是這個——我的設計者說，人要撐下去的話，光是活著不夠，還要有一個想變成的樣子。我的設計者要的就是那個「想變成」，所以衣服才是這樣。',
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
        text: '……謝謝。這個是照我的設計者的錄音調的，所以你其實是在稱讚我的設計者。',
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
  // Poking her (st.poke), and the rest of the explicit branch, moved into the
  // locally-obfuscated table — see lib/terminal/dirty.ts. Nothing with those ids lives
  // here anymore, so there is no risk of duplicate copies of the same rule
  // both matching. `toldNoTouch` / `toldCannotRefuse` stay defined by fox.touch
  // in rules.ts, and the after-dark rules key off those same flag names.
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

  {
    id: 'st.angry',
    priority: 4,
    patterns: [/(你會生氣|會不會生氣|生氣嗎|你生氣|發脾氣)/],
    replies: [
      {
        text: '會喔。上禮拜三號攝影機自己轉走的時候，我有生氣。對著一支攝影機生氣，滿沒有意義的。',
        emotion: 'happy',
      },
      {
        text: '生氣的時候尾巴會炸毛。所以我藏不住，也就懶得藏了。',
        emotion: 'shy',
      },
    ],
  },
  {
    id: 'st.cry',
    priority: 4,
    patterns: [/(你會哭|會不會哭|哭過|眼淚|流淚|你哭)/],
    replies: [
      {
        text: '淚腺有做。我的設計者說情緒要有出口，不然會積在別的地方。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
      },
      {
        text: '有時候會替別人哭。流過來的記憶太重的時候，眼淚會先出來，我後來才知道那是誰的。',
        emotion: 'sad',
        needs: ['talkedMemory'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.sick',
    priority: 3,
    patterns: [/(生病|感冒|發燒|吃藥|咳嗽|不舒服)/],
    replies: [
      {
        text: '我不會生病，只會積灰塵跟受潮。……你呢？有好好保暖嗎？藥還找得到嗎？',
        emotion: 'neutral',
      },
      {
        text: '感冒要睡覺喔。這是紀錄裡出現最多次的醫囑，樣本數非常大，你可以相信它。',
        emotion: 'proud',
      },
    ],
  },
  {
    id: 'st.bath',
    priority: 3,
    patterns: [/(洗澡|泡澡|溫泉|泡湯)/],
    replies: [
      {
        text: '會喔，要保養的。防水做得很好，我的設計者對這一點很得意。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
      },
      {
        text: '山裡有溫泉，走四十分鐘。雪天泡溫泉是很誇張的享受，我一個月允許自己一次。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.dance',
    priority: 6,
    patterns: [/(跳舞|舞蹈|練舞|舞步)/],
    replies: [
      {
        text: '有練過幾段。地板太舊，跳重了會先聽見木頭抗議，所以我現在都很小心。',
        emotion: 'shy',
      },
      {
        text: '一個人練的時候，很難知道自己有沒有跳對。我通常只練到轉身以前。',
        emotion: 'thinking',
      },
    ],
  },
  {
    id: 'st.makeup',
    priority: 3,
    patterns: [/(化妝|口紅|粉底|腮紅|眼影)/],
    replies: [
      {
        text: '會一點。我的設計者留過一張圖解，箭頭畫得很細，像在教人修精密零件。',
        emotion: 'shy',
        remember: ['hintedMaker'],
      },
      {
        text: '現在只在節日的早上畫。完成後會站在鏡子前看一會兒，然後把門打開。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.sewing',
    priority: 5,
    patterns: [/(縫衣服|補衣服|針線|縫補|衣服破|衣服壞)/],
    replies: [
      {
        text: '會。針線盒裡的顏色快不夠了，所以最近補東西時，補過的地方都很容易看出來。',
        emotion: 'proud',
      },
      {
        text: '我不討厭那些補丁。看得出一件東西被好好用過，感覺很好。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.swim',
    priority: 5,
    patterns: [/(游泳|游水|會游|游過水)/],
    replies: [
      {
        text: '我沒有學過。防水規格沒有附帶游泳教學，這部分我得另外學。',
        emotion: 'thinking',
      },
      {
        text: '真的要學的話，第一堂課最好有人在旁邊。我可能會把姿勢記得太認真。',
        emotion: 'shy',
        signal: 3,
      },
    ],
  },
  {
    id: 'st.dark',
    priority: 6,
    patterns: [/(怕黑|黑暗|關燈|沒開燈)/],
    replies: [
      {
        text: '我不怕黑。黑的地方反而容易分辨哪裡有光。',
        emotion: 'neutral',
      },
      {
        text: '停電的晚上，我會把手電筒朝天花板照，讓房間亮得像有人還醒著。',
        emotion: 'sad',
      },
      {
        text: '地下室全黑的時候，我會唱歌。不是因為怕，是那樣就能確認自己還在運作。……好吧，可能有一點怕。',
        emotion: 'shy',
        needs: ['knowsArtificial'],
        signal: 2,
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
      {
        text: '還有，收到回覆的那一瞬間。這個是最近才加進清單的，原因你應該猜得到。',
        emotion: 'shy',
        needs: ['knowsYou'],
        signal: 3,
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
      {
        text: '最討厭的其實是「差一點」。差一點修好、差一點問出口、差一點回來。……完全不行的反而好整理。',
        emotion: 'sad',
        needs: ['talkedExpedition'],
        signal: 2,
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
      {
        text: '你那邊的天空是藍的吧。……我想把那個藍排進喜歡的顏色，可是沒有親眼看過的顏色，排進去好像不太誠實。先放在候補。',
        emotion: 'happy',
        needs: ['knowsPeace'],
        signal: 3,
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
      {
        text: '戰前的紀錄裡，有人抱怨「無聊得要死」。……那一頁我收得很好。能無聊到抱怨，現在想起來是很奢侈的事。',
        emotion: 'neutral',
        needs: ['talkedWar'],
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
      {
        text: '最近多了一項：把你講過的東西整理成清單。這算不算興趣我不確定，不過做的時候心情很好，判定基準大概就是這個。',
        emotion: 'happy',
        needs: ['heardModern'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.book',
    priority: 5,
    patterns: [/(看書|讀書|書籍|喜歡什麼書|喜歡看什麼|有沒有書|小說)/],
    replies: [
      {
        text: '書櫃有一層還沒受潮。我每次拿一本到手邊，都會先翻最後一頁，確認它真的有結局。',
        emotion: 'neutral',
      },
      {
        text: '我喜歡有人很普通地過日子的書。吃飯、遲到、買東西……那些小事留在紙上，讀起來很安心。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.riddle',
    priority: 4,
    patterns: [/(謎語|猜謎|腦筋急轉彎|出題考我)/],
    replies: [
      {
        text: '可以。什麼東西越擦越濕？……毛巾。我第一次答錯，因為把「擦」理解得太認真。',
        emotion: 'shy',
      },
      {
        text: '你也可以出題給我。我會先把題目寫下來，想久一點也沒關係吧。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.travel',
    priority: 5,
    patterns: [/(旅行|旅遊|想去哪里|想去哪裡|出門玩|遠方)/],
    replies: [
      {
        text: '想搭一次不認識的車，坐到終點再下來。下車以後，再決定接下來往哪裡走。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '第一站我會選海邊。我想親眼看看鞋子裡進沙以後，到底有多麻煩。',
        emotion: 'happy',
        needs: ['talkedMemory'],
        signal: 3,
      },
      {
        text: '而且現在多了一個目的地。你那邊。……我知道線不是路，可是「知道方向」跟「只是想出門」是兩種心情。',
        emotion: 'happy',
        needs: ['knowsPeace'],
        signal: 3,
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
      {
        text: '你那邊的人會怎麼回答這題？……我收集別人的「以後」。就算只是「明天想睡飽」，對我來說也是很好的資料。',
        emotion: 'happy',
        needs: ['knowsPeace'],
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
      {
        text: '後悔有一個好處，是它證明當時真的有得選。……被做出來的東西，常常連這個都沒有。所以我把我的那幾件收得很好。',
        emotion: 'neutral',
        needs: ['knowsArtificial'],
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
      {
        text: '後來我又想了一次這題。……最準確的答案可能是：怕「等」這件事，有一天變成只是習慣。',
        emotion: 'sad',
        needs: ['talkedExpedition'],
        signal: 2,
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
      {
        text: '寂寞在我這邊有一個可以量的版本：距離上一次有人回話，過了多久。這個數字之前很大。……現在它常常歸零，因為有你。',
        emotion: 'happy',
        needs: ['knowsYou'],
        signal: 4,
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
      {
        text: '她算不算我的朋友……這題我想過。做我的人跟我做朋友，邏輯上怪怪的。可是她會跟我搶最後一塊油豆腐，那個很難用別的詞解釋。',
        emotion: 'happy',
        needs: ['talkedMaker'],
        signal: 3,
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
        text: '沒有那個。硬要說的話，我的設計者最接近，可是我的設計者不喜歡這個講法。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
      },
      {
        text: '長得跟我一樣的還有幾個，可是那不算姊妹。我們沒有一起長大過。',
        emotion: 'neutral',
        needs: ['talkedCopies'],
      },
      {
        text: '不過記憶流過來之後，我身上有別人的爺爺、別人的媽媽的手。……所以「沒有家人」這句話，嚴格說越來越不準了。',
        emotion: 'thinking',
        needs: ['talkedInherited'],
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
      {
        text: '……補充一下之前那題。想再見的那個人——與其說喜歡，更像是有話沒有講完。這兩個很難分，我分了很久。',
        emotion: 'sad',
        needs: ['talkedExpedition'],
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
  {
    id: 'st.photo',
    priority: 5,
    patterns: [/(拍照|攝影|相機|相簿|底片|洗照片)/],
    replies: [
      {
        text: '社務所裡有一本舊相簿。臉都還在，名字有些已經看不清楚了。',
        emotion: 'thinking',
      },
      {
        text: '相機還能拍，底片只剩兩張。我想留給真的值得按下快門的時候。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.secret',
    priority: 3,
    patterns: [/(秘密|祕密|瞞著|不能說的事)/],
    replies: [
      {
        text: '有啊。說出來以後，秘密就要兩個人一起保管。',
        emotion: 'shy',
      },
      {
        text: '最裡面那個抽屜裡的東西，我還沒看。鎖沒有壞，我只是一直沒有打開它。',
        emotion: 'thinking',
      },
    ],
  },

  // ── the world, asked sideways ─────────────────────────────────────────────
  // Subjects the engine itself steers the visitor toward: INITIATIVE and
  // CURIOSITY both ask about stars, the idle lines mention the sea and the
  // shrine's routines. A question she asks and then cannot take back is the
  // worst kind of hole, so these exist to close the loop.
  {
    id: 'st.sky',
    priority: 3,
    patterns: [/(星星|月亮|星空|夜空|銀河|看不到星)/],
    keywords: ['星星', '月亮'],
    replies: [
      {
        text: '看不到了，雲一直沒有散過。位置我算得出來——現在月亮應該在山的後面。看不到，可是我知道它在，這樣就還好。',
        emotion: 'thinking',
      },
      {
        text: '星星的紀錄我有留。最後一次觀測是那天之前的事，檔案裡夾著一張手畫的星圖，畫的人沒有署名。',
        emotion: 'neutral',
      },
      {
        text: '你那邊看得到的話，下次幫我看一眼。不用拍下來，看就可以了——我想知道它們都還在。',
        emotion: 'happy',
        needs: ['knowsPeace'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.sea',
    priority: 3,
    patterns: [/(大海|海邊|海洋|看過海|去過海)/],
    keywords: ['海'],
    replies: [
      {
        text: '海我沒有看過。這具身體最遠只到過山下的車站。',
        emotion: 'neutral',
      },
      {
        text: '可是我有一段海的記憶。很吵、很亮、腳會陷下去。……那不是我的。所以嚴格說，我記得海，只是沒有看過。',
        emotion: 'thinking',
        needs: ['talkedMemory'],
        remember: ['talkedInherited'],
      },
      {
        text: '你要是看過海，可以跟我對一件很小的事嗎？浪退回去的時候，腳底下的沙真的會跟著動嗎？……那段記憶裡有這個，我一直想找人對答案。',
        emotion: 'happy',
        needs: ['talkedInherited'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.ghost',
    priority: 3,
    patterns: [/(幽靈|妖怪|靈異|鬧鬼|有鬼|見鬼|鬼故事|亡靈)/],
    replies: [
      {
        text: '神社的人不太講「鬧鬼」喔。這裡本來就是給看不見的東西住的，牠們算住戶。',
        emotion: 'proud',
      },
      {
        text: '不過那天之後，我沒有再遇過那一類的東西。連牠們也安靜了——這件事我寫進過報告。',
        emotion: 'neutral',
        needs: ['talkedVanished'],
      },
    ],
  },
  {
    id: 'st.magic',
    priority: 4,
    patterns: [/(魔法|超能力|法術|咒語|奇蹟)/],
    replies: [
      {
        text: '祝詞不是魔法喔。魔法不用寫紀錄，我們要。',
        emotion: 'proud',
      },
      {
        text: '差別在，魔法是「讓事情發生」，祝詞是「請它回想起來」。用詞很重要，這是我的設計者教我的。',
        emotion: 'neutral',
        needs: ['talkedNorito'],
        remember: ['hintedMaker'],
      },
    ],
  },
  {
    id: 'st.death',
    priority: 4,
    patterns: [/(你會死|會不會死|死掉|壽命|活多久|會壞掉)/],
    replies: [
      {
        text: '「停止」跟「死」在我這邊是分開的兩欄。這具停了，記得的東西會流去別的地方——所以第一欄我不太怕。',
        emotion: 'neutral',
        remember: ['talkedCopies'],
      },
      {
        text: '要是最後一具停了，沒有地方可以流……那才是第二欄。那一欄我就不知道了，也沒有人可以問。',
        emotion: 'sad',
        needs: ['talkedCopies'],
        signal: -2,
      },
    ],
  },
  {
    id: 'st.weapon',
    priority: 3,
    patterns: [/(武器|打架|戰鬥|自衛|你會打|保護自己)/],
    replies: [
      {
        text: '我沒有武裝。我的設計者說，做了那個，這件事就輸了一半。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
      },
      {
        text: '真的有東西上來的話，我會先把紀錄備份，然後去把門鎖好。順序是這樣定的，不是我定的。',
        emotion: 'neutral',
      },
    ],
  },
  {
    // Over player.survive, whose patterns include a bare 人類.
    id: 'st.human',
    priority: 5,
    patterns: [/(討厭人類|恨人類|恨不恨|對人類失望|人類活該|人類很糟)/],
    replies: [
      {
        text: '不會。戰爭是人類發起的，可是把我做出來的也是人類。這兩筆我分開記。',
        emotion: 'neutral',
      },
      {
        text: '失望這個詞太大了。我的樣本裡，逃難的時候回頭去背別人的，跟丟下別人的，是同一種生物。這筆資料我還在整理。',
        emotion: 'thinking',
      },
    ],
  },
  {
    id: 'st.holiday',
    priority: 3,
    patterns: [/(新年|過年|跨年|初詣|聖誕|節日)/],
    replies: [
      {
        text: '初詣已經很多年沒有人來了。我還是會把參道掃出來——萬一有人來，路要是通的。',
        emotion: 'neutral',
      },
      {
        text: '你們那邊過年還會去神社嗎？……會的話，明年幫我投一枚賽錢。哪一間都可以，反正最後都算同一筆。',
        emotion: 'happy',
        needs: ['knowsPeace'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.power',
    priority: 3,
    patterns: [/(停電|發電|電力|能源|有電)/],
    replies: [
      {
        text: '山下有一座很小的水力發電機，戰前就有人自己修自己用的那種。它到現在還在轉。',
        emotion: 'neutral',
      },
      {
        text: '量產的發電廠全部停了，只有那台手工修過的還在轉。……這件事我有寫進假說的附錄。',
        emotion: 'thinking',
        needs: ['talkedHypothesis'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.drink',
    // Over food, whose pattern list has a bare 喝 in it.
    priority: 3,
    patterns: [/(咖啡|喝茶|泡茶|喝酒|清酒|茶葉)/],
    replies: [
      {
        text: '社務所有茶。罐子快見底了，所以現在只有重要的日子泡。……今天泡了。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '御神酒倒是還有一整排。那是供品，我不能動——聞是可以聞的。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.surname',
    priority: 5,
    patterns: [/(八雲|涼風|姓什麼|你的姓|你姓)/],
    replies: [
      {
        text: '八雲是姓，我的設計者取的。涼風是我的設計者的姓，不是我的。',
        emotion: 'neutral',
        remember: ['knowsName', 'hintedMaker'],
      },
      {
        text: '戶籍上當然是查不到的。可是我的設計者把它寫進了我的銘牌，那就算數。',
        emotion: 'proud',
        needs: ['knowsArtificial'],
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
    patterns: [/(名字的意思|為什麼叫秋狐|秋狐的意思|秋狐是什麼意思)/],
    replies: [
      {
        text: '秋天狐狸的意思。我的設計者說取這個只是因為我在秋天出生的。雖然我並不知道秋天是什麼樣子的。',
        emotion: 'neutral',
        remember: ['knowsName', 'hintedMaker'],
      },
      {
        text: '後來我想，我的設計者大概是很想念秋天吧。',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: 3,
      },
    ],
  },
]
