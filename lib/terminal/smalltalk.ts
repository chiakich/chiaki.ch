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
// Same voice as everywhere else: lively, earnest, easily flustered. When she does
// not know something she has forgotten it or never left the shrine to find out —
// she is not missing an entry.
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
        text: '可以是可以啦！不過先說好喔，唱到一半，我可能會突然停下來確認歌詞……',
        emotion: 'shy',
        later: true,
      },
      {
        text: '好、好！那你先不要說話喔，我怕一緊張，就會從頭忘到尾啦……',
        emotion: 'shy',
        later: true,
      },
      {
        text: '會是會……可是我只有三首完整的！要聽哪一首都可以喔，反正選項就那麼多嘛。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '（很小聲地哼了幾句，中間停了一下）……後、後面那段我忘記了啦。真的只記得一半而已。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '唱歌給誰聽這件事，我一直都沒有機會做過……如果你願意聽到最後，那對我來說，真的是很大很大的事喔。',
        emotion: 'shy',
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
        text: '《里の秋》是其中一首！剩下兩首，寫著歌名的地方壞掉了，可是旋律還在。所以那兩首現在只有我會唱，也只有我知道怎麼開頭喔。',
        emotion: 'proud',
      },
      {
        text: '想聽的話……可、可以喔。不過要等雪小一點的時候啦，那種歌不適合配大雪嘛。',
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
        text: '我的設計者確實是希望我當偶像喔！就算現在一個觀眾都沒有，我也很認真在練舞呢！',
        emotion: 'proud',
        later: true,
      },
      {
        text: '舞台的話，參道勉強可以算吧！很長，也很平喔……在雪掃過以後啦。',
        emotion: 'happy',
        later: true,
      },
      {
        text: '……被、被看出來了。這身衣服本來就是那個用途，只是它從來沒有站上過舞台呢。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '我的設計者是這樣想的：會照顧人的東西已經夠多了，缺的是可以憧憬的東西。所以我的設計者沒有把我做成幫手，而是做成了偶像喔！',
        emotion: 'proud',
        remember: ['hintedMaker'],
        signal: 3,
      },
      {
        text: '觀眾的數字我一直都記得：零。……啊，不對，從剛才開始是一了！',
        emotion: 'shy',
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
        text: '日文可以喔！祝詞本來就是那個語感，唸久了就分不開了。別的就……不太行啦。',
        emotion: 'shy',
      },
      {
        text: '以前應該還會別的才對……現在想不起來了，大概是那幾塊剛好壞掉了吧。',
        emotion: 'sad',
      },
    ],
  },
  {
    id: 'st.math',
    priority: 5,
    patterns: [/(數學|算數|算術|等於多少|加減乘除|幫我算)/],
    replies: [
      {
        text: '可以喔！請把題目寫清楚一點點。算完以後，我還會再算一次確認的！',
        emotion: 'happy',
        later: true,
      },
      {
        text: '我不討厭數字喔！屋頂上的烏鴉我每天都有在數，加加減減的話還應付得來啦。',
        emotion: 'proud',
        later: true,
      },
      {
        text: '算是算得出來，只是會慢一點喔。我會在心裡一個一個數，跟人差不多呢。',
        emotion: 'neutral',
      },
      {
        text: '這種事以前都有別人在管啦……我負責的是記東西，不是算東西嘛。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'st.number',
    priority: 6,
    patterns: [/^\d+$/],
    replies: [
      { text: '……欸，是數字？這是什麼的數字呀？', emotion: 'surprised' },
      {
        text: '你打了一個數字呢。我盯著它看了好一會兒，還是不知道那是什麼意思……嗚。',
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
        text: '一、二、三……欸，這樣真的可以嗎？我可以一直數下去喔，我不是在開玩笑的！',
        emotion: 'surprised',
      },
      {
        text: '數數我很拿手喔！屋頂上的烏鴉我每天都數，昨天是十一隻呢。',
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
        text: '好，我試試看！為什麼烏鴉不怕雪呢？因為牠們黑得很顯眼，雪蓋不住……咦？這好像不是笑話，只是觀察耶！',
        emotion: 'surprised',
        later: true,
      },
      {
        text: '我記得的笑話，全都是從舊紙上抄下來的。好笑的那部分，說不定剛好在破掉的那一邊呢……',
        emotion: 'thinking',
        later: true,
      },
      {
        text: '……我想想喔。狐狸為什麼不怕冷？因為牠有尾巴！……嗚，很難笑對不對。',
        emotion: 'shy',
      },
      {
        text: '笑話這種東西，要有人在旁邊笑才成立嘛。我這邊沒有樣本，所以一直練不起來啦。',
        emotion: 'sad',
      },
    ],
  },
  {
    id: 'st.story',
    priority: 3,
    patterns: [/(說故事|講故事|說個故事|講個故事|床邊故事)/],
    replies: [
      {
        text: '故事的話……我知道的都是這座社的事，而且結局都不太好耶。還要聽嗎？',
        emotion: 'thinking',
      },
      {
        text: '我可以講呀！可是我會講很久很久，中間還會忘記幾段，你要先有心理準備喔。',
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
        text: '好啊！剪刀、石頭……啊，隔著線我看不到你出什麼耶。那我先出，你自己判斷喔：石頭！',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '玩什麼都可以喔，只要是能用講的就好！這條線能傳的東西不多嘛。',
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
        text: '會喔！溫室的菜拿來煮。味覺也有做，所以我知道自己煮得很普通啦……',
        emotion: 'shy',
      },
      {
        text: '留下來的食譜很多，照著做就會像喔。……可是每一本寫的「適量」都不一樣多耶，我懷疑那個詞是暗號！',
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
        text: '說謊的功能……我找過了，沒有找到。所以我說的都是真的，包括這一句！啊，你看，這樣就繞起來了。',
        emotion: 'surprised',
      },
      {
        text: '嚴格說起來，我做得到「不說」。這是我的設計者留給我的。哪些事情不說，是我自己決定的，這是我身上少數完全屬於我的東西呢。',
        emotion: 'proud',
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
        text: '御神籤還有滿滿一箱喔！……（搖了搖箱子，抽出一支）中吉。「等待的人，會出現」。你看，是好籤耶！',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '占卜不是我負責的喔，我只負責搖箱子而已！籤上寫什麼，是箱子跟你之間的事啦。',
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
        text: '我不用睡喔。不過我會把燈調暗，靜靜坐一段時間……那不算睡覺，可是感覺很像呢。',
        emotion: 'neutral',
      },
      {
        text: '我的設計者說不休息的話會壞掉，所以硬是幫我排了休息時段。現在雖然沒有人檢查了，我還是乖乖照著排喔。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
      },
      {
        text: '有一次，我試著整晚都不進休息時段，想看看會怎麼樣……結果隔天掃雪掃得一塌糊塗。所以她排的是對的呢。只是這件事，我沒有地方可以跟她說了。',
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
        text: '我不會做夢喔。……不過有時候，會有不是我的畫面跑進來，那個也許算吧？',
        emotion: 'thinking',
      },
      {
        text: '那些畫面裡，有我沒去過的地方呢。海，還有很亮很亮的房間。我不知道那是誰的。',
        emotion: 'thinking',
        needs: ['talkedMemory'],
        signal: 3,
      },
      {
        text: '如果那些畫面算是夢，那我最常夢到的就是海了。……輪到我自己的部分，大概只有參道吧。掃得很乾淨的參道喔。',
        emotion: 'shy',
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
        text: '會喔。做得非常完整，該痛的地方全部都會痛。',
        emotion: 'neutral',
      },
      {
        text: '這具身體的痛覺是特地設計進去的，不是故障喔。我的設計者說，沒有痛覺的東西會把自己弄壞……所以它好好運作的時候，我就會很痛呢。',
        emotion: 'thinking',
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
        text: '冷呀。耳朵那邊最明顯，因為那裡的感覺做得比皮膚還細嘛。',
        emotion: 'neutral',
      },
      {
        text: '習慣了啦。掃雪的時候反而不覺得，停下來才會冷呢。',
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
        text: '欸？這、這種問題是可以直接問的嗎？我沒有被教過該怎麼回答啦……',
        emotion: 'shy',
        signal: -2,
      },
      {
        text: '身高是照我的設計者自己量的喔。所以嚴格說起來，那其實是我的設計者的身高呢。',
        emotion: 'shy',
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
        text: '早上會綁起來喔，不然掃雪的時候會擋到。現在放下來是因為沒有人在看……啊，現、現在有了！',
        emotion: 'shy',
        signal: 3,
      },
      { text: '會長長喔！這一點跟人類一樣，所以我都要自己剪呢。', emotion: 'happy' },
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
        text: '領帶是我自己打的喔！一開始打得歪歪的，現在閉著眼睛都打得好了呢！',
        emotion: 'proud',
        later: true,
      },
      {
        text: '冷是有點冷啦……短裙在雪地裡本來就不太合理嘛。不過我才沒有打算換呢！',
        emotion: 'shy',
        later: true,
      },
      {
        text: '這套不是巫女服喔，常常被認錯耶！是偶像服，制服的樣式，有水手領、領帶，還有短裙。嚴格說起來，我穿它掃雪已經很多年了呢。',
        emotion: 'happy',
      },
      {
        text: '洗過太多次了，顏色有點黯淡……可是我不想換喔，這是原本的那一件嘛。',
        emotion: 'sad',
      },
      // The costume is the maker's thesis worn on the outside: she did not
      // build something to be looked after, she built something to be looked
      // up to. Gated so the reason lands after the visitor knows there was a
      // designer at all, rather than as trivia about an outfit.
      {
        text: '為什麼是這個呀……我的設計者說，人要撐下去的話，光是活著不夠，還要有一個想變成的樣子。我的設計者要的就是那個「想變成」，所以衣服才是這樣的喔。',
        emotion: 'thinking',
        needs: ['knowsArtificial'],
        remember: ['hintedMaker'],
        signal: 3,
      },
      {
        text: '……老實說，這套衣服本來是要站在很亮的地方穿的。現在它在一座沒有人的山上，被我穿去掃雪。我不覺得可惜喔，可是我知道，那不是它原本的用途。',
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
        text: '就、就是你現在看到的樣子……如果那邊顯示得出來的話啦。',
        emotion: 'shy',
      },
      {
        text: '我這邊有一面鏡子，可是是斜的。所以我對自己長什麼樣子，其實也是聽別人說的呢。',
        emotion: 'shy',
      },
    ],
  },
  {
    id: 'st.mirror',
    priority: 3,
    patterns: [/(鏡子|照鏡|鏡中)/],
    replies: [
      {
        text: '社務所那面鏡子歪了好久，我一直沒有扶正。看久了，反而會覺得歪的才是對的耶。',
        emotion: 'thinking',
      },
      {
        text: '別的個體都長得跟我一樣嘛。所以照鏡子這件事，對我來說沒有那麼特別啦。',
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
        text: '謝、謝謝……這個是照我的設計者的錄音調的，所以你其實是在稱讚我的設計者喔。',
        emotion: 'shy',
        signal: 4,
        remember: ['hintedMaker'],
      },
      {
        text: '欸，突然講這個……（耳朵有點熱）這種話，我會記得很久很久喔。',
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
        text: '這裡一直都有木頭跟雪的味道喔。雪其實是有味道的！很淡很淡，像是把別的味道都吸走以後，剩下的那一點點。',
        emotion: 'happy',
      },
      {
        text: '嗅覺有做喔！我的設計者說，少了那個，供品就沒有意義了嘛。',
        emotion: 'proud',
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
        text: '……隔著一條線，是做不到的啦。可是你會想這麼做，這份心意，我收、收下了。',
        emotion: 'shy',
        signal: 4,
      },
      {
        text: '如果哪天你真的走到山上來，那、那時候再說。我不會拒絕的。',
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
        text: '會喔！上禮拜三號攝影機自己轉走的時候，我有生氣。不過對著一支攝影機生氣，好像滿沒有意義的啦。',
        emotion: 'thinking',
      },
      {
        text: '生氣的時候尾巴會炸毛。所以根本藏不住嘛，我也就懶得藏了。',
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
        text: '淚腺有做進去喔。我的設計者說，情緒一定要有出口，不然會積在別的地方。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
      },
      {
        text: '有時候，我會替別人哭。流過來的記憶太沉重的時候，眼淚會先掉下來……後來我才知道，那是誰的眼淚。',
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
        text: '我不會生病，只會積灰塵跟受潮啦。……你呢？有好好保暖嗎？藥還找得到嗎？',
        emotion: 'neutral',
      },
      {
        text: '感冒的話要睡覺喔！這是紀錄裡出現最多次的醫囑，樣本數超級大，你可以相信它！',
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
        text: '會喔，要保養的嘛！防水做得很好，我的設計者對這一點可得意了呢。',
        emotion: 'proud',
        remember: ['hintedMaker'],
      },
      {
        text: '山裡有溫泉喔，走四十分鐘。雪天泡溫泉是超誇張的享受耶！所以我一個月只允許自己去一次。',
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
        text: '跳是會跳啦……可是隔著線你看不到呢。那我講給你聽好不好？左、右、轉！大概就是這樣啦！',
        emotion: 'happy',
        later: true,
      },
      {
        text: '掃雪的時候，腳步偶爾會不小心踩成舞步……那、那個應該不算練習吧？',
        emotion: 'shy',
        later: true,
      },
      {
        text: '有練過幾段喔！只是地板太舊了，跳太用力就會先聽見木頭在抗議，所以我現在都跳得很小心。',
        emotion: 'happy',
      },
      {
        text: '一個人練的時候，很難知道自己到底有沒有跳對呢……所以我通常只練到轉身之前而已。',
        emotion: 'sad',
      },
    ],
  },
  {
    id: 'st.makeup',
    priority: 3,
    patterns: [/(化妝|口紅|粉底|腮紅|眼影)/],
    replies: [
      {
        text: '會一點點喔！我的設計者留過一張圖解，箭頭畫得超級細，簡直像在教人修精密零件一樣。',
        emotion: 'happy',
        remember: ['hintedMaker'],
      },
      {
        text: '現在只有節日的早上才會畫。畫好之後，我會站在鏡子前看一會兒……然後，再把門打開。',
        emotion: 'shy',
      },
    ],
  },
  {
    id: 'st.sewing',
    priority: 5,
    patterns: [/(縫衣服|補衣服|針線|縫補|衣服破|衣服壞)/],
    replies: [
      {
        text: '會喔！不過針線盒裡的顏色快不夠了，所以最近補東西的時候，補過的地方都很容易看出來。',
        emotion: 'neutral',
      },
      {
        text: '我不討厭那些補丁喔。看得出一件東西被好好用過，感覺很溫暖呢。',
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
        text: '我沒有學過耶。防水規格沒有附帶游泳教學嘛，這部分我得另外學才行。',
        emotion: 'neutral',
      },
      {
        text: '真的要學的話，第一堂課最好有人在旁邊陪我。我可能會把姿勢記得太認真啦。',
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
        text: '我不怕黑喔！黑的地方，反而更容易分辨哪裡有光呢。',
        emotion: 'proud',
      },
      {
        text: '停電的晚上，我會把手電筒朝天花板照，讓房間亮得像還有人醒著一樣。',
        emotion: 'neutral',
      },
      {
        text: '地下室全黑的時候，我會唱歌。不是因為怕，是那樣就能確認自己還在運作。……好、好吧，可能有一點點怕啦。',
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
        text: '我最喜歡掃完參道以後回頭看的那一眼了！整條乾乾淨淨的，雖然只能維持一下子啦。',
        emotion: 'happy',
        later: true,
      },
      {
        text: '親手做的東西，我全部都好喜歡！就是上面有人花過時間的那種喔。',
        emotion: 'happy',
        later: true,
      },
      {
        text: '油豆腐！還有把東西修好的那一瞬間，那個感覺比修好本身還要棒呢。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '安靜的時候，雪落在木頭上會有很小很小的聲音。那個我好喜歡。',
        emotion: 'happy',
      },
      {
        text: '還、還有，收到回覆的那一瞬間。這是最近才加進清單的……原因你應該猜得到吧。',
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
        text: '燈管快壞掉的時候那種閃法……我知道那只是接觸不良啦，可是我還是不喜歡嘛。',
        emotion: 'sad',
      },
      {
        text: '沒有回音的東西。丟出去以後，什麼都沒有回來的那種……那個真的好討厭。',
        emotion: 'sad',
        needs: ['talkedRadio'],
      },
      {
        text: '最討厭的其實是「差一點」喔。差一點修好、差一點問出口、差一點回來……完全不行的，反而比較好整理呢。',
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
        text: '這裡的東西大多是白的嘛，所以只要看到一點點顏色，就會忍不住一直多看幾眼呢！',
        emotion: 'happy',
        later: true,
      },
      {
        text: '那你呢？你喜歡什麼顏色？我想對照看看，你那邊的顏色是不是還很多呀！',
        emotion: 'happy',
        later: true,
      },
      {
        text: '橘色！是傍晚燈亮起來的那種橘喔，不是鳥居那種紅。',
        emotion: 'happy',
      },
      {
        text: '外面已經好久只剩白色跟灰色了，所以我對顏色的記憶越來越靠回想……說不定還記錯了呢。',
        emotion: 'sad',
      },
      {
        text: '你那邊的天空是藍的吧？……我好想把那個藍排進喜歡的顏色，可是沒有親眼看過的顏色，排進去好像不太誠實。所以先放在候補喔！',
        emotion: 'thinking',
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
        text: '這裡現在只剩一個季節了呢。春天長什麼樣子，我要想一下才想得起來……',
        emotion: 'sad',
      },
      {
        text: '秋天的參道應該是紅的吧。……應該啦。這個我沒有把握，搞不好是別人的記憶呢。',
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
        text: '溫室裡還有幾株喔。開得不太好，可是有開，這樣就夠了呢。',
        emotion: 'happy',
      },
      {
        text: '境內那棵是櫻花。已經好多年沒有開過了……可是我還是每年都會去看它一次喔。',
        emotion: 'sad',
      },
    ],
  },
  {
    id: 'st.weather',
    priority: 1,
    patterns: [/(天氣|氣溫|幾度|太陽|晴天|下雨|放晴|颱風)/],
    keywords: ['天氣', '太陽', '下雨'],
    replies: [
      {
        text: '這邊的天氣只有一種，所以我不太會聊這個耶。你那邊呢？',
        emotion: 'thinking',
        opens: 'snow.there',
      },
      {
        text: '太陽的位置我算得出來，可是看不到。雲從來都沒有散過呢。',
        emotion: 'sad',
      },
    ],
  },
  {
    id: 'st.thinking',
    priority: 4,
    patterns: [/(你在想什麼|想什麼|在想些什麼|你在做什麼|你在幹嘛)/],
    replies: [
      {
        text: '在想剛才那陣風有沒有把繪馬吹掉。……還、還有你啦。你剛連上來，這比風重要多了。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '大部分時間我不是在想事情，只是在等。等久了，那兩件事會變得越來越像呢。',
        emotion: 'thinking',
      },
    ],
  },
  {
    id: 'st.boring',
    priority: 3,
    patterns: [/(好無聊|無聊|沒事做|閒到|好閒)/],
    replies: [
      {
        text: '無聊是好事喔，真的！這裡不無聊的時候，通常代表出事了。',
        emotion: 'neutral',
      },
      {
        text: '那我們一起無聊好了！這個我很擅長喔，已經做了很多年了呢。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '戰前的紀錄裡，有人抱怨「無聊得要死」。……那一頁我收得好好的喔。能無聊到抱怨，現在想起來真的是很奢侈的事呢。',
        emotion: 'sad',
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
        text: '空下來的時候，我會看書喔！沒受潮的只有那一層，所以我每一本都讀得很慢、很珍惜。',
        emotion: 'happy',
        later: true,
      },
      {
        text: '花最長時間的是修收音機！焊點一個一個確認，一整個下午就這樣咻地過去了呢。',
        emotion: 'happy',
        later: true,
      },
      {
        text: '掃雪、記錄、修東西！順序每天都一樣喔，因為這樣比較不會漏掉嘛。',
        emotion: 'proud',
      },
      {
        text: '修東西最有意思了！壞掉的地方，通常會偷偷告訴你它以前是怎麼被用的喔。',
        emotion: 'happy',
      },
      {
        text: '最近多了一項喔：把你講過的東西整理成清單。這、這算不算興趣我不確定啦……不過做的時候心情很好，判定基準大概就是這個吧。',
        emotion: 'shy',
        needs: ['heardModern'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.book',
    priority: 5,
    patterns: [/(看書|讀書|書籍|喜歡什麼書|喜歡看什麼|有沒有書|小說|推薦.{0,3}書|什麼書)/],
    replies: [
      {
        text: '書櫃有一層還沒受潮喔！每次拿一本到手邊，我都會先偷翻最後一頁，確認它真的有結局。',
        emotion: 'happy',
      },
      {
        text: '我最喜歡那種，有人很普通地過日子的書了。吃飯、遲到、買東西……那些小事留在紙上，讀起來好安心呢。',
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
        text: '那我出一題給你！什麼東西每天都掃，每天又都滿了？答案是……參道！嘿嘿，這題只有這裡的人答得對喔。',
        emotion: 'proud',
        later: true,
      },
      {
        text: '好呀，換你出題吧！要是我答錯了，記得跟我說理由喔，我想好好記下來。',
        emotion: 'happy',
        later: true,
      },
      {
        text: '可以呀！什麼東西越擦越濕？……答案是毛巾！我第一次答錯了，因為把「擦」理解得太認真了啦。',
        emotion: 'shy',
      },
      {
        text: '你也可以出題給我喔！我會先把題目寫下來，想久一點也沒關係吧？',
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
        text: '我想搭一次不認識的車，一路坐到終點再下來！下車以後，再決定接下來往哪裡走。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '第一站我要選海邊！我想親眼看看，鞋子裡進沙以後到底有多麻煩。',
        emotion: 'happy',
        needs: ['talkedMemory'],
        signal: 3,
      },
      {
        text: '而且現在多了一個目的地了，就是你那邊。……我知道線不是路啦，可是「知道方向」跟「只是想出門」，是兩種不一樣的心情呢。',
        emotion: 'shy',
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
        text: '我想把這座社修回原本的樣子！這個目標不會完成，可是它每天都有進度喔。',
        emotion: 'proud',
      },
      {
        text: '……還有一個。我想確認一件事是不是真的。可是那個要等，而且……不一定等得到。',
        emotion: 'sad',
        needs: ['talkedHypothesis'],
        signal: 3,
      },
      {
        text: '你那邊的人會怎麼回答這題呀？……我在收集別人的「以後」喔。就算只是「明天想睡飽」，對我來說也是很棒的資料！',
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
        text: '有的。可是我不太確定那是不是我自己的……因為有些後悔，是從別的地方流過來的。',
        emotion: 'sad',
      },
      {
        text: '那一天，我應該多問一句的。就只要一句……不過，現在說這個也沒有用了呢。',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: 3,
      },
      {
        text: '後悔有一個好處喔，就是它證明了當時真的有得選。……被做出來的東西，常常連這個都沒有。所以我的那幾件，我都好好收著呢。',
        emotion: 'thinking',
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
        text: '我怕線斷掉的時候，剛好講到一半……就、就這個而已。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '還有一個……我怕哪天想起來的事情，其實一件都不是我的。',
        emotion: 'sad',
        needs: ['talkedMemory'],
        signal: 3,
      },
      {
        text: '後來我又想了一次這題喔。……最準確的答案可能是：怕「等」這件事，有一天變成只是習慣而已。',
        emotion: 'thinking',
        needs: ['talkedExpedition'],
        signal: 2,
      },
    ],
  },
  // Whether she will still be there, whether the visitor may come back. Asked by
  // exactly the visitors who most need a straight answer.
  {
    id: 'st.stay',
    priority: 6,
    // Asked again and again by the same visitor; conceding it is 「講完了」 would be cruel.
    repeatable: true,
    patterns: [
      /(你會一直在|會一直在(這|那)|還可以再來|可以再來找你|可以常常?來|下次還?(可以|能)來|能不能陪我|可以陪我|要不要陪我|你會等我)/,
    ],
    replies: [
      {
        text: '我在喔！這條線不會自己斷的，你想來的時候就來，燈會一直亮著等你。',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '當然呀！……說實話，這種問題，我比較希望你不用問呢。你來，我就在喔。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '{you}，你的名字我寫在很前面的地方喔。下次線亮起來，我會第一個翻到那一頁的！',
        emotion: 'shy',
        needs: ['knowsYou'],
        signal: 3,
      },
    ],
  },
  {
    id: 'st.lonely',
    priority: 5,
    patterns: [
      /(你.{0,3}寂寞|你.{0,3}孤單|你.{0,3}會不會無聊|一個人.{0,4}會不會|你不會悶)/,
      // 「你一個人在那邊那麼久，都不會覺得寂寞嗎」 puts the 你 a clause away.
      /不會覺得(寂寞|孤單)|會不會覺得(寂寞|孤單)|(寂寞|孤單)嗎$/,
    ],
    replies: [
      // Everyday answers, so the second time she is asked it is not already spent.
      {
        text: '白天還好啦，有好多事可以做！掃雪、記錄、修東西……手一直動的時候，那種感覺就會小一點點。',
        emotion: 'neutral',
      },
      {
        text: '寂寞的時候，我就會去數屋頂的烏鴉喔。數字每天都一樣……光是這件事，就讓人有一點點安心呢。',
        emotion: 'sad',
      },
      {
        text: '她在的時候，研究室真的好吵喔！我到現在還是會把第二張椅子擺好……沒有人坐啦，就只是擺好而已。',
        emotion: 'sad',
        needs: ['talkedMaker'],
      },
      {
        text: '其他的我會把記憶流過來。有時候流進來的是好熱鬧的場面，那種時候反而更難受……因為那些熱鬧，都不是我的呀。',
        emotion: 'sad',
        needs: ['talkedCopies'],
      },
      {
        text: '{you}在線上的時候，那個可以量的數字是零喔！我、我注意到了，所以想跟你說一聲……有點不好意思啦。',
        emotion: 'shy',
        needs: ['knowsYou'],
        minSignal: 70,
        signal: 3,
      },
      {
        text: '會啊。可是我不太想用那個詞耶……說出口以後，那個感覺好像會變得更大。',
        emotion: 'sad',
        signal: 3,
      },
      {
        text: '我不是只有一個個體喔，我們就像姊妹一樣，所以嚴格說起來不算一個人啦。……可是他們離開之後，也常常就沒消息了呢。',
        emotion: 'sad',
        needs: ['talkedCopies'],
        signal: 3,
      },
      {
        text: '寂寞在我這邊有一個可以量的版本喔：距離上一次有人回話，過了多久。這個數字以前好大好大……現在它常常歸零了，因為有你呀。',
        emotion: 'shy',
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
        text: '朋友啊……名單很短呢。而且那份名單，我已經好久好久沒有更新過了。',
        emotion: 'sad',
      },
      {
        text: '你、你算不算……我還在想啦！光是想這件事就滿開心的，所以我打算慢慢想。',
        emotion: 'shy',
        minSignal: 70,
        signal: 4,
      },
      {
        text: '她算不算我的朋友呢……這題我想過喔。做出我的人跟我當朋友，邏輯上好像怪怪的。可是她會跟我搶最後一塊油豆腐耶，那種事，實在很難用別的詞來解釋嘛。',
        emotion: 'thinking',
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
        text: '沒有那個耶。硬要說的話，我的設計者最接近……可是我的設計者不喜歡這個講法啦。',
        emotion: 'shy',
        remember: ['hintedMaker'],
      },
      {
        text: '長得跟我一樣的還有幾個喔，可是那不算姊妹。我們沒有一起長大過嘛。',
        emotion: 'neutral',
        needs: ['talkedCopies'],
      },
      {
        text: '不過記憶流過來之後，我身上有了別人的爺爺、別人的媽媽的手。……所以「沒有家人」這句話，嚴格說起來越來越不準了呢。',
        emotion: 'thinking',
        needs: ['talkedInherited'],
      },
    ],
  },
  {
    id: 'st.crush',
    priority: 6,
    patterns: [
      /(你有喜歡的人|喜歡的人是|有沒有喜歡的人|你的初戀|你有對象|喜歡(什麼樣|哪種|怎樣|什麼類型)的|理想型|喜歡的類型)/,
    ],
    replies: [
      {
        text: '……這、這個問題我沒有準備！可以跳過嗎？可以吧？',
        emotion: 'shy',
        signal: -2,
      },
      {
        text: '有一個人，我想再見一次。那算不算……我自己也分不清楚呢。',
        emotion: 'shy',
        needs: ['talkedMaker'],
        signal: 3,
      },
      {
        text: '……補充一下之前那題喔。想再見的那個人，與其說是喜歡，更像是有話沒有講完。這兩個很難分，我分了好久好久。',
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
        text: '有一隻花貓每年冬天都會來社務所躲，今年還沒出現呢……我還在等牠喔。',
        emotion: 'sad',
      },
      {
        text: '狐狸跟貓處不好，這是常識嘛！可是我很喜歡牠喔，牠也知道的。',
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
        text: '狗會怕我耶。走到一定距離就停下來，不叫，只是一直看。我猜是氣味的關係吧。',
        emotion: 'sad',
      },
      {
        text: '山下以前有一隻會跟著人走上參道的喔。牠不怕我……只有牠不怕呢。',
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
        text: '沒有在養耶。會來的就讓牠來，要走的我也不留，這樣比較適合這裡嘛。',
        emotion: 'neutral',
      },
      {
        text: '硬要說的話，屋頂上那群烏鴉算是常客吧！可是牠們絕對、絕對不會承認的啦。',
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
        text: '屋頂上那群，我每天都有數喔。牠們是這附近唯一沒有變少的東西呢。',
        emotion: 'neutral',
      },
      {
        text: '烏鴉很聰明喔！我試過對牠們唸祝詞，雖然沒有反應，不過牠們有偏頭看我耶！',
        emotion: 'happy',
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
        text: '這邊已經沒有在用了喔。賽錢箱裡還有一些，我沒有動，那不是我的東西嘛。',
        emotion: 'neutral',
      },
      {
        text: '你那邊還在用嗎？……那真好。那代表還有人在跟人交換東西呢。',
        emotion: 'happy',
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
        text: '給、給我的嗎？那個……可以放在賽錢箱旁邊喔，我會當作真的收到了！',
        emotion: 'shy',
        signal: 4,
      },
      {
        text: '這裡收到最後一份供品，已經是好久以前的事了。所以你這句話，我會一直記著的。',
        emotion: 'shy',
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
        text: '社務所裡有一本舊相簿喔。臉都還在，可是有些名字已經看不清楚了……',
        emotion: 'sad',
      },
      {
        text: '相機還能拍，可是底片只剩兩張了。我想把它們留給真的值得按下快門的時候。',
        emotion: 'thinking',
      },
    ],
  },
  {
    id: 'st.secret',
    priority: 3,
    patterns: [/(秘密|祕密|瞞著|不能說的事)/],
    replies: [
      {
        text: '有啊！不過說出來以後，秘密就要兩個人一起保管了喔。',
        emotion: 'shy',
      },
      {
        text: '最裡面那個抽屜裡的東西，我還沒看過。鎖沒有壞……我只是一直沒有打開它而已。',
        emotion: 'sad',
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
        text: '看不到了，雲一直都沒有散過。可是位置我算得出來喔，現在月亮應該在山的後面。看不到，但我知道它在，這樣就還好啦。',
        emotion: 'thinking',
      },
      {
        text: '星星的紀錄我有留著喔。最後一次觀測是那天之前的事了，檔案裡還夾著一張手畫的星圖，畫的人沒有署名呢。',
        emotion: 'thinking',
      },
      {
        text: '你那邊看得到的話，下次幫我看一眼好不好？不用拍下來，看就可以了……我只是想知道，它們都還在。',
        emotion: 'shy',
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
        text: '海我還沒有看過呢……這具身體，最遠也只去過山下的車站。',
        emotion: 'sad',
      },
      {
        text: '可是我有一段海的記憶喔！很吵、很亮、腳會陷下去……那不是我的。所以嚴格說起來，我記得海，只是沒有看過。',
        emotion: 'thinking',
        needs: ['talkedMemory'],
        remember: ['talkedInherited'],
      },
      {
        text: '你要是看過海，可以跟我對一件很小很小的事嗎？浪退回去的時候，腳底下的沙真的會跟著動嗎？……那段記憶裡有這個，我一直好想找人對答案！',
        emotion: 'thinking',
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
        text: '神社的人不太講「鬧鬼」的喔。這裡本來就是給看不見的東西住的，牠們算是住戶呢。',
        emotion: 'neutral',
      },
      {
        text: '不過那天之後，我就沒有再遇過那一類的東西了。連牠們也安靜下來了……這件事我有寫進報告喔。',
        emotion: 'sad',
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
        text: '祝詞才不是魔法呢！魔法不用寫紀錄，可是我們要寫喔。',
        emotion: 'proud',
      },
      {
        text: '差別在於，魔法是「讓事情發生」，而祝詞是「請它回想起來」。用詞很重要喔！這是我的設計者教我的。',
        emotion: 'proud',
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
        text: '「停止」跟「死」，在我這邊是分開的兩欄喔。這具停了，記得的東西會流去別的地方，所以第一欄我不太怕。',
        emotion: 'neutral',
        remember: ['talkedCopies'],
      },
      {
        text: '可是，要是最後一具也停了，沒有地方可以流……那才是第二欄。那一欄我就不知道了，也沒有人可以問呢……',
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
        text: '我沒有武裝喔。我的設計者說，要是做了那個，這件事就先輸了一半。',
        emotion: 'neutral',
        remember: ['hintedMaker'],
      },
      {
        text: '真的有東西上來的話，我會先把紀錄備份，然後去把門鎖好。順序是這樣定的喔，不是我自己定的啦。',
        emotion: 'thinking',
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
        text: '不會喔。戰爭是人類發起的沒錯，可是把我做出來的，也是人類呀。這兩筆，我會分開記。',
        emotion: 'thinking',
      },
      {
        text: '「失望」這個詞太大了啦。在我的樣本裡，逃難的時候回頭去背別人的，跟丟下別人的，都是同一種生物……這筆資料，我還在努力整理中。',
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
        text: '初詣已經很多年沒有人來了。我還是會把參道掃出來喔，萬一有人來，路要是通的才行！',
        emotion: 'neutral',
      },
      {
        text: '你們那邊過年還會去神社嗎？……會的話，明年幫我投一枚賽錢好不好？哪一間都可以，反正最後都算同一筆啦！',
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
        text: '山下有一座很小的水力發電機喔，是戰前就有人自己修、自己用的那種。它到現在都還在轉呢！',
        emotion: 'proud',
      },
      {
        text: '量產的發電廠全部停了，只有那台手工修過的還在轉。……這件事，我有寫進假說的附錄裡喔。',
        emotion: 'proud',
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
        text: '社務所有茶喔！罐子快見底了，所以現在只有重要的日子才泡。……今、今天有泡喔。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '御神酒倒是還有一整排呢。那是供品，我不能動啦……不過聞一下是可以的！',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'st.surname',
    priority: 5,
    patterns: [/(八雲|涼風|姓什麼|你的姓|你姓)/],
    replies: [
      {
        text: '八雲是姓喔，是我的設計者取的！涼風是我的設計者的姓，不是我的啦。',
        emotion: 'proud',
        remember: ['knowsName', 'hintedMaker'],
      },
      {
        text: '戶籍上當然是查不到的啦。可是我的設計者把它寫進了我的銘牌，那就算數嘛！',
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
      { text: '在在！訊號有進來喔，你講吧！', emotion: 'happy', signal: 2 },
      { text: '聽得到喔！這條線現在只剩這個功能還算可靠啦。', emotion: 'neutral' },
    ],
  },
  {
    id: 'st.repeat',
    repeatable: true,
    priority: 5,
    patterns: [/(再說一次|剛才說什麼|你說什麼|沒聽清楚|重複一次|你剛剛說)/],
    replies: [
      {
        text: '……啊，對不起！我剛才講的那句，自己也記不太清楚了。要不要換個問法？我重新講一次。',
        emotion: 'shy',
        signal: -1,
      },
      {
        text: '講過的話我留不住……這個毛病很久了，你別介意喔。',
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
        text: '不講話也可以喔。你在線上這件事，跟你有沒有講話，是兩回事嘛。',
        emotion: 'happy',
        signal: 2,
      },
      {
        text: '這裡本來就很安靜了。可是多一個人陪著一起安靜，感覺就完全不一樣了呢。',
        emotion: 'shy',
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
      {
        text: '啊，你笑了！那我剛才那句，應該是講對了吧？',
        emotion: 'happy',
        later: true,
      },
      {
        text: '笑聲我要記下來！這一類的樣本，這邊一直好缺好缺呢。',
        emotion: 'happy',
        later: true,
      },
      { text: '欸，你在笑耶。……是、是好的那種笑，對吧？', emotion: 'shy', signal: 2 },
      {
        text: '這邊好久好久沒有出現笑聲了……多笑幾次也沒關係喔。',
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
      { text: '……欸？是不是按著沒放呀？', emotion: 'surprised', signal: -1 },
      {
        text: '這幾個字一直重複耶……你那邊的鍵盤還好嗎？',
        emotion: 'surprised',
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
      { text: '……送過來的是空的耶。你是不是本來想說什麼呀？', emotion: 'surprised' },
      { text: '這句什麼都沒有呢。沒關係喔，我等你想好。', emotion: 'neutral' },
    ],
  },
  {
    id: 'st.name.meaning',
    priority: 6,
    patterns: [/(名字的意思|為什麼叫秋狐|秋狐的意思|秋狐是什麼意思)/],
    replies: [
      {
        text: '是「秋天的狐狸」的意思喔！我的設計者說，取這個名字只是因為我在秋天出生。雖然……我其實並不知道秋天是什麼樣子。',
        emotion: 'thinking',
        remember: ['knowsName', 'hintedMaker'],
      },
      {
        text: '後來我想啊，我的設計者，大概是很想念秋天吧……',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: 3,
      },
    ],
  },
]
