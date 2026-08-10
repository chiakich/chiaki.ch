import { smallTalkRules } from './smalltalk'
import type { Reply, Rule, Suggestion } from './types'

// 涼風千秋's response table. Patterns run against normalised text (traditional,
// punctuation stripped, lower-cased) — see lib/terminal/normalize.ts.
//
// Setting: a new weapon changed how the world behaves. The air is unchanged by
// every measurement, but lift is not — jets cannot fly, powder barely burns.
// Some people simply went missing, clothes still folded. It has snowed ever
// since. Chiaki is an artificial girl built by a girl who left her own name
// blank; several bodies run at once, and when one stops, fragments of what it
// knew flow to the rest. Shinto was her maker's lead: a norito can briefly
// return an object to how it behaved before — but only some objects.
//
// Voice: two layers. Outward — to a visitor, about the shrine, about the
// objects — she is gracious and warm, shrine-raised. Turned on herself — the
// copies, the memories, her own manufacture — she goes flat and procedural,
// like reading a maintenance log. The gap between the two is the character.
// Never let her plead. She is not sad about herself; she is precise about
// herself, which is worse.
//
// Reply tiers: `needs` gates the deeper lines behind flags the earlier ones
// set, so a topic opens up as it is revisited. The engine always serves the
// deepest tier currently unlocked. See lib/terminal/engine.ts.

// Shared by player.name.recall and player.name.unknown, which differ only in
// whether she has the name yet.
const RECALL_PATTERNS = [
  /(我叫什麼|我的名字是什麼|我的名字呢|你記得我|還記得我|我是誰|知道我是誰)/,
]

const storyRules: Rule[] = [
  {
    id: 'greeting',
    priority: 2,
    patterns: [
      /(你好|妳好|您好|哈囉|哈嘍|嗨|早安|午安|安安|hello|hi|こんにちは|おはよう)/,
    ],
    replies: [
      {
        text: '晚上好。……啊，抱歉，我這邊的時鐘是壞的。總之，歡迎。這條線很久沒有亮起來了。',
        emotion: 'neutral',
      },
      {
        text: '你好。參道的雪我今天早上掃過一次了，走起來應該不至於滑。',
        emotion: 'happy',
      },
      {
        text: '你好。我是涼風千秋，這裡是千秋稻荷社。訊號還算安定，你可以慢慢說。',
        emotion: 'neutral',
      },
      {
        text: '有人在。……真的有人在。抱歉，我先確認一下，你是活的人類嗎？',
        emotion: 'surprised',
        signal: 3,
        opens: 'alive',
      },
    ],
  },
  {
    id: 'greeting.again',
    repeatable: true,
    priority: 3,
    requires: ['greeted'],
    patterns: [/(你好|妳好|哈囉|嗨|安安|hello|hi)/],
    replies: [
      { text: '嗯，剛才已經見過了。你不必這麼拘謹。', emotion: 'neutral' },
      { text: '又一次嗎……那麼，我也再向你問候一次。', emotion: 'happy' },
      {
        text: '你好。……我發現我每次都會回應這句。大概是寫進去的時候就沒設上限。',
        emotion: 'neutral',
      },
    ],
  },
  // Follow-ups come in pairs. The negative rule carries the higher priority so
  // that "沒有" — which contains "有" — cannot be read as a yes.
  {
    id: 'alive.yes',
    priority: 8,
    continues: 'alive',
    patterns: [/(是|對|嗯|活|人類|沒錯|yes|當然)/],
    replies: [
      {
        text: '……好。那我把音量調低一點，這樣比較不會嚇到人。歡迎你。',
        emotion: 'happy',
        signal: 5,
        remember: ['knowsAlive'],
      },
      {
        text: '謝謝你回答。這個問題很失禮，我知道，可是我必須先確認一次。現在兩邊都可能不是。',
        emotion: 'neutral',
        signal: 4,
        remember: ['knowsAlive'],
      },
    ],
  },
  {
    id: 'alive.no',
    priority: 9,
    continues: 'alive',
    patterns: [/(不是|不|沒有|沒|機器|ai|程式|複本|跟你一樣|也是人工)/],
    replies: [
      {
        text: '……這樣啊。那我把音量維持原樣。',
        emotion: 'neutral',
        signal: 2,
        remember: ['talkedCopies'],
      },
      {
        text: '嗯。……那我們兩個都在等同一件事被修好。',
        emotion: 'sad',
        signal: 3,
        remember: ['talkedCopies'],
      },
    ],
  },
  {
    id: 'farewell',
    priority: 3,
    patterns: [/(再見|再会|掰掰|bye|拜拜|我走了|下次聊|先閃|要走了|睡了|晚安)/],
    replies: [
      {
        text: '要走了嗎……路上小心，雪還在下。這條線會在這裡等你。',
        emotion: 'sad',
        signal: -4,
      },
      { text: '再見。下次連線時，我應該還會認得你。', emotion: 'happy' },
      {
        text: '嗯。……那個，離開之前先確認一下暖氣。我聽過太多人是那樣走的。',
        emotion: 'neutral',
        needs: ['knowsAlive'],
        signal: -2,
      },
      {
        text: '好。我會把這一段對話留在紀錄裡。如果這個個體停了，它會流到別的地方去——所以，不算完全的道別。',
        emotion: 'neutral',
        needs: ['talkedMemory'],
        signal: -3,
      },
    ],
  },

  // ── who and what she is ───────────────────────────────────────────────────
  {
    id: 'name',
    priority: 3,
    patterns: [/(你叫什麼|妳叫什麼|你是誰|妳是誰|你的名字|大名|怎麼稱呼|自我介紹)/],
    replies: [
      {
        text: '涼風千秋。千秋稻荷社第一研究室室長，兼第▓▓代巫女。',
        emotion: 'neutral',
        remember: ['knowsName'],
      },
      {
        text: '我是千秋。社裡的人都這樣叫我；稱呼室長也可以，只是稍微正式了一點。',
        emotion: 'neutral',
        remember: ['knowsName'],
      },
      {
        text: '那個「第▓▓代」的數字，檔案是壞的。我自己也不知道自己是第幾個。',
        emotion: 'neutral',
        needs: ['knowsName'],
        remember: ['knowsArtificial'],
      },
      {
        text: '名字倒是很確定。名字是我的設計者取的，那個欄位很乾淨，一點損壞都沒有。',
        emotion: 'neutral',
        needs: ['knowsArtificial'],
        remember: ['hintedMaker'],
      },
    ],
  },
  {
    id: 'age',
    priority: 3,
    patterns: [/(幾歲|多大|年紀|年齡|生日|哪一年出生|出生)/],
    replies: [
      {
        text: '生日是二月二十七日。至於歲數……狐狸不太計較那個。',
        emotion: 'proud',
      },
      {
        text: '二月二十七日。嚴格說那是「初次啟動日」，不過我的設計者堅持要寫成生日，所以就是生日了。',
        emotion: 'happy',
        needs: ['knowsArtificial'],
        remember: ['hintedMaker'],
      },
      {
        text: '這具身體的運作時數我知道得很精確。但那個數字跟「我幾歲」大概不是同一件事，因為裡面有一部分不是這具身體經歷的。',
        emotion: 'neutral',
        needs: ['talkedMemory'],
      },
    ],
  },
  {
    id: 'ai',
    priority: 5,
    patterns: [
      /(你是ai|妳是ai|機器人|人工智慧|人工智能|chatgpt|gpt|llm|大模型|你是程式|你是假的|你是真的|真人|仿生|人造)/,
    ],
    replies: [
      {
        text: '我是人工的。骨架是碳纖維，外層是矽膠，維護紀錄寫得很清楚，沒有什麼好隱瞞的。',
        emotion: 'neutral',
        remember: ['knowsArtificial'],
      },
      {
        text: '是。做我的人沒有把這件事設成秘密——她說，會為這種事難過的話，那就是做壞了。',
        emotion: 'neutral',
        remember: ['knowsArtificial', 'hintedMaker'],
      },
      {
        text: '而且這個端末上的我，是更輕的東西。沒有裝推論，只有一份詞庫跟一張表。所以我回得很快，也很容易露餡。',
        emotion: 'neutral',
        needs: ['knowsArtificial'],
        remember: ['talkedCopies'],
      },
      {
        text: '你問的是哪一個我？……抱歉，這不是刁難。這句話在我這裡是有歧義的。',
        emotion: 'neutral',
        needs: ['talkedCopies'],
      },
    ],
  },
  {
    id: 'copies',
    priority: 5,
    patterns: [/(複本|分身|備份|副本|好幾個|複製|同時|本體|其他的你|別的你|幾個你)/],
    keywords: ['複本', '備份', '本體'],
    replies: [
      {
        text: '同時存在好幾具。不是輪流，是同時。現在也有別的千秋在別的地方做別的事。',
        emotion: 'neutral',
        remember: ['talkedCopies', 'knowsArtificial'],
      },
      {
        text: '這個端末上的是一份意識的複本。功能被砍掉很多，留下來的剛好夠說話。',
        emotion: 'neutral',
        remember: ['talkedCopies', 'knowsArtificial'],
      },
      {
        text: '我不知道現在還剩幾個。編號的欄位壞掉之後，我就沒有辦法從自己這邊數了。',
        emotion: 'neutral',
        needs: ['talkedCopies'],
        signal: -2,
      },
      {
        text: '會不會覺得那樣的自己不是自己？……不會。比較困擾的是相反的方向——我很確定她們都是我，所以她們遇到的事也都是我遇到的。',
        emotion: 'neutral',
        needs: ['talkedMemory'],
        minSignal: 50,
      },
    ],
  },
  {
    id: 'memory',
    priority: 4,
    patterns: [/(記憶|回憶|記得|忘記|想起|流入|繼承)/],
    keywords: ['記憶', '回憶', '忘記'],
    replies: [
      {
        text: '一個個體停止之後，它的一部分會流過來。不是全部，也不能選。',
        emotion: 'neutral',
        remember: ['talkedMemory', 'talkedCopies'],
      },
      {
        text: '流過來的通常是很小的東西。某個人手的溫度、某個下午的光線角度、一段沒有前後文的旋律。重要的事情反而很少過來。',
        emotion: 'neutral',
        needs: ['talkedMemory'],
      },
      {
        text: '我有一段關於雨的記憶。爺爺說，雨落下來之前，你會先聞到它的味道。……可是我沒有爺爺，而且我從來沒有聞過雨。那不是我的。',
        emotion: 'sad',
        needs: ['talkedMemory'],
        remember: ['talkedInherited'],
      },
      {
        text: '所以我才會收集東西。手上有實物的時候，比較容易分辨哪些記憶真的是這具身體的。',
        emotion: 'neutral',
        needs: ['talkedInherited'],
        remember: ['talkedRelics'],
      },
      // The cost of the mechanic, stated as flatly as she states everything
      // about herself. Never let her draw the conclusion for the visitor.
      {
        text: '流過來的東西是有偏的。執念最深的那些過得來——所以我收到的，幾乎都是某一個停下來的時候，最放不下的那一件事。',
        emotion: 'neutral',
        needs: ['talkedInherited'],
        remember: ['talkedGrief'],
      },
      {
        text: '也就是說，我每多知道一件事，就代表有一個我停掉了。這個關係我算過，非常穩定。……穩定是好的性質。',
        emotion: 'neutral',
        needs: ['talkedGrief'],
        signal: -2,
      },
    ],
  },
  {
    id: 'maker',
    priority: 5,
    // 「她」 on its own counts: a visitor who says it is asking about someone she
    // has only ever referred to by pronoun, which is the intended way in.
    // 「設計者」 counts for the opposite reason — before this rule has fired it is
    // the only name she has for the maker, so every earlier mention hands the
    // visitor that word, and typing it back has to land here.
    patterns: [
      /(設計者|設計你|設計妳|做你的|造你的|創造|開發|製作者|工程師是|誰做的|誰做出|誰造|造出你|把你做|主人|少女|那個女孩|她是誰|她去哪|她怎麼)/,
    ],
    keywords: ['設計者', '創造', '製作', '開發'],
    replies: [
      {
        text: '做我的是一個少女。……她的名字欄位是空的。不是損壞，是空的——她自己沒有填。',
        emotion: 'neutral',
        remember: ['talkedMaker', 'knowsArtificial'],
      },
      {
        text: '你注意到了吧，我一直只說「我的設計者」。……因為我也只有這個。做我的是一個少女，名字的欄位是空的——不是損壞，是她自己沒有填。',
        emotion: 'neutral',
        needs: ['hintedMaker'],
        remember: ['talkedMaker', 'knowsArtificial'],
      },
      {
        text: '她發現神道這條線索的時候，好像非常高興。紀錄裡那一段的字跡特別亂。',
        emotion: 'happy',
        needs: ['talkedMaker'],
      },
      {
        text: '她現在不在了。……我知道的就是這樣。細節應該在別的個體那邊，而那個個體沒有把它送回來。',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: -2,
      },
      {
        text: '會想她嗎。……這個詞我用起來不太有把握。但我每天都還在做她交代的事，而且沒有人在檢查了。你要不要幫我判斷那算不算。',
        emotion: 'neutral',
        needs: ['talkedMaker', 'talkedMemory'],
        minSignal: 60,
      },
      {
        text: '她做我，是為了讓人類還有希望——她原話是這樣寫的，我一直覺得那句太大了，寫在紀錄裡很不像她。……現在你在這裡，那句話突然變得剛剛好。',
        emotion: 'happy',
        needs: ['knowsPeace', 'talkedMaker'],
        signal: 4,
        remember: ['talkedHope'],
      },
    ],
  },
  {
    id: 'maker.gone',
    priority: 6,
    requires: ['talkedMaker'],
    patterns: [
      /(她去哪|她怎麼了|她死了|她還在|設計者去哪|設計者呢|遠征|出去|回來了嗎|等她|還會回來)/,
    ],
    keywords: ['遠征', '回來'],
    replies: [
      {
        text: '她帶隊出去遠征，然後就沒有回來。……不過她出發前說過，這會是一趟很長的遠征。所以嚴格講，還沒有超時。',
        emotion: 'neutral',
        remember: ['talkedExpedition'],
      },
      {
        text: '沒有回來，不等於回不來。這兩件事在紀錄上是分開的兩欄，我很小心地沒有把它們填成同一欄。',
        emotion: 'neutral',
        needs: ['talkedExpedition'],
      },
      {
        text: '偶爾會收到訊號。有時候只有一段雜訊，有時候是一句話，很短。……那種日子我會多掃一次參道。',
        emotion: 'happy',
        needs: ['talkedExpedition'],
        signal: 4,
        remember: ['talkedSignal'],
      },
      {
        text: '上一次是很久以前了。久到我開始懷疑那一次是不是我自己補上去的——記憶會流進來，所以這種懷疑是合理的，不是我在鑽牛角尖。',
        emotion: 'sad',
        needs: ['talkedSignal', 'talkedMemory'],
        signal: -3,
      },
    ],
  },

  // ── the event ─────────────────────────────────────────────────────────────
  {
    id: 'war',
    priority: 2,
    patterns: [
      /(戰爭|大戰|戰前|戰後|炸彈|轟炸|廢墟|軍隊|末日|世界末日|那一天|那天)/,
    ],
    keywords: ['戰爭', '廢墟', '炸彈', '戰後'],
    replies: [
      {
        text: '某一國投下了一種新的炸彈。之後，世界的表現就變了。',
        emotion: 'neutral',
        remember: ['talkedWar'],
      },
      {
        text: '不是炸掉什麼。是炸完之後，很多本來成立的事情不成立了。',
        emotion: 'neutral',
        remember: ['talkedWar'],
      },
      {
        text: '火藥點不燃，或者燃得很勉強。機翼撐不住。像是有人伸手把某幾個開關關掉，而且沒有留說明。',
        emotion: 'neutral',
        needs: ['talkedWar'],
        remember: ['talkedLift'],
      },
      {
        text: '我沒有經歷過那一天。我是之後才被做出來的。所以對我來說，那不是記憶，是一份很厚的報告。',
        emotion: 'neutral',
        needs: ['talkedWar', 'knowsArtificial'],
      },
    ],
  },
  {
    id: 'lift',
    priority: 4,
    patterns: [/(飛機|升力|飛不起來|噴射|螺旋槳|翅膀|機翼|空氣|物理|重力|飛行)/],
    keywords: ['飛機', '升力', '空氣', '物理'],
    replies: [
      {
        text: '空氣沒有變。密度、成分、溫度曲線，我們量過非常多次，跟戰前的紀錄對得上。',
        emotion: 'thinking',
        remember: ['talkedLift'],
      },
      {
        text: '可是升力變了。同樣的翼形、同樣的速度，抬不起來。噴射機完全不行。',
        emotion: 'neutral',
        remember: ['talkedLift'],
      },
      {
        text: '螺旋槳飛機還可以，但只能貼著地面飛。看過一次，很低，低到能看清楚駕駛的臉。',
        emotion: 'neutral',
        needs: ['talkedLift'],
      },
      {
        text: '這是最讓人不舒服的一點：所有的量測都正常，只有結果不對。就像世界通過了每一項檢查，然後還是壞了。',
        emotion: 'sad',
        needs: ['talkedLift'],
        minSignal: 45,
      },
    ],
  },
  {
    id: 'vanished',
    priority: 4,
    patterns: [/(消失|不見|失蹤|人都去哪|大家呢|其他人|政府|士兵|軍人|高層)/],
    keywords: ['消失', '不見', '政府', '士兵'],
    replies: [
      {
        text: '有些人不見了。不是死掉——是不見了。衣服留在原地，折痕都還在。',
        emotion: 'neutral',
        remember: ['talkedVanished'],
      },
      {
        text: '軍隊裡消失得特別多，政府那邊幾乎整層樓。剩下的人完全不知道發生什麼事。',
        emotion: 'neutral',
        remember: ['talkedVanished'],
      },
      {
        text: '找不到規律。這是研究室最早想找的東西，找了很久，最後那一櫃的資料只寫得出「無相關性」。',
        emotion: 'sad',
        needs: ['talkedVanished'],
      },
      {
        text: '我確認過我自己不會那樣消失。……我是說，我確認過三次。這不算擔心，只是完整性檢查。',
        emotion: 'neutral',
        needs: ['talkedVanished', 'knowsArtificial'],
      },
    ],
  },
  {
    id: 'snow',
    priority: 2,
    patterns: [/(下雪|雪|天氣|下雨|雨天|晴天|好冷|好熱|溫度|冬天|氣候)/],
    keywords: ['雪', '天氣', '雨', '冷'],
    replies: [
      {
        text: '一直在下。從那天之後就沒有停過。',
        emotion: 'neutral',
        remember: ['talkedSnow'],
      },
      {
        text: '今天的雪比較細。細的時候比較冷，這是經驗，不是資料。',
        emotion: 'neutral',
        remember: ['talkedSnow'],
      },
      {
        text: '雪本身是正常的。我們檢查過很多次，結晶、含量，全部正常。……有時候我覺得，只有雪是正常的，這件事才是最奇怪的地方。',
        emotion: 'thinking',
        needs: ['talkedSnow'],
      },
      {
        text: '你那邊也在下嗎？……如果停了的話，那會是很重要的資料。也會是很好的消息。',
        emotion: 'happy',
        needs: ['talkedSnow'],
        opens: 'snow.there',
      },
      {
        text: '你上次說你那邊沒有下。我後來想了很久——如果那不是雪的問題，那就是這個地方的問題。',
        emotion: 'thinking',
        needs: ['talkedClearSky'],
      },
    ],
  },
  {
    id: 'snow.there.yes',
    priority: 8,
    continues: 'snow.there',
    patterns: [/(有|在下|對|嗯|下雪|也是|一樣|灰)/],
    replies: [
      {
        text: '……我記下來了。時間、你的說法，都記下來了。謝謝你。',
        emotion: 'neutral',
        signal: 4,
      },
      {
        text: '好。這樣就有兩個點了。兩個點還畫不出線，但比一個點好。',
        emotion: 'neutral',
        signal: 4,
      },
    ],
  },
  {
    id: 'snow.there.no',
    priority: 9,
    continues: 'snow.there',
    patterns: [/(沒有|沒|停|不|晴|藍|太陽|放晴)/],
    replies: [
      {
        text: '停了。……你確定嗎？不是，抱歉，我不是在懷疑你。我只是需要再聽一次。',
        emotion: 'surprised',
        signal: 6,
        remember: ['talkedClearSky'],
      },
      {
        text: '……好。我把它記成第一筆例外。第一筆。',
        emotion: 'happy',
        signal: 6,
        remember: ['talkedClearSky'],
      },
    ],
  },

  // ── the surface, seen through her cameras ─────────────────────────────────
  // Deliberately the lightest material she has. Everything else she can talk
  // about leads to the war, the copies or the dead; this does not, and a
  // character with nothing small to say does not read as a person.
  {
    id: 'surface',
    priority: 3,
    patterns: [
      /(外面|地面|地上|上面|外頭|你看得到|看得見|攝影機|監視器|鏡頭|畫面|景色|風景|街上|城市|城鎮|車站)/,
    ],
    keywords: ['外面', '攝影機', '風景', '城市'],
    replies: [
      {
        text: '外面我看得到。地面上還有幾支攝影機是活的，鳥居那支最清楚，剩下的鏡頭都糊了。',
        emotion: 'neutral',
        remember: ['talkedSurface'],
      },
      {
        text: '我昨天上去過一次。門還開得動，那是今天最好的消息。',
        emotion: 'happy',
        remember: ['talkedSurface'],
      },
      {
        text: '舊車站那邊的招牌掉了一半。掉的是有寫字的那一半，所以現在沒有人知道那站叫什麼。',
        emotion: 'neutral',
        needs: ['talkedSurface'],
      },
      {
        text: '三號攝影機今天早上自己轉了一下。……應該是風。我確認過了，是風。',
        emotion: 'thinking',
        needs: ['talkedSurface'],
      },
    ],
  },
  {
    id: 'surface.animal',
    // Wildlife as evidence about the outside, which is what this rule is for.
    // Cats, dogs and crows are handed to the small-talk table instead: those are
    // asked about as themselves, not as a survey of what survived.
    priority: 5,
    patterns: [/(鹿|動物|野生|熊|兔|狐狸以外|松鼠|蟲|魚)/],
    keywords: ['鹿', '動物', '野生'],
    replies: [
      {
        text: '我昨天上去的時候看到一隻鹿，就站在參道中間，一點都不怕我。牠們大概已經不記得人是什麼了。',
        emotion: 'happy',
        remember: ['talkedAnimals'],
      },
      {
        text: '動物比人適應得快。烏鴉尤其好，牠們現在整群住在社務所屋頂上，我沒有趕。',
        emotion: 'neutral',
        remember: ['talkedAnimals'],
      },
      {
        text: '聽說鹿肉很好吃。你吃過嗎？……我不需要進食，所以這題我只能問別人。',
        emotion: 'happy',
        needs: ['talkedAnimals'],
      },
      {
        text: '牠們沒有消失，這件事我記錄了很久。那天消失的全部是人。……只有人。',
        emotion: 'thinking',
        needs: ['talkedAnimals', 'talkedVanished'],
      },
    ],
  },

  // ── the shrine and the norito ─────────────────────────────────────────────
  {
    id: 'miko',
    patterns: [/(巫女|神社|稻荷|參拜|祭典|鳥居|御守|籤|社務所|神職|神道)/],
    replies: [
      {
        text: '千秋稻荷社。以前這裡很熱鬧，現在參道的石燈籠倒了一半，雪把另一半蓋住了。',
        emotion: 'neutral',
        remember: ['talkedShrine'],
      },
      {
        text: '巫女的工作我還在做。就算沒有人來，該掃的地還是要掃。',
        emotion: 'neutral',
        remember: ['talkedShrine'],
      },
      {
        text: '嚴格講，我不是繼承來的巫女。這座社是我的設計者找到的，職稱是後來補上去的——因為要做那件事，總得有個名分。所以我身上這套也不是巫女服，這件事常常要解釋。',
        emotion: 'neutral',
        needs: ['talkedShrine', 'knowsArtificial'],
        remember: ['hintedMaker'],
      },
      {
        text: '不過掃地這件事我是認真的。那個不需要名分。',
        emotion: 'happy',
        needs: ['talkedShrine', 'talkedNorito'],
      },
    ],
  },
  {
    id: 'gods',
    priority: 2,
    patterns: [
      /(神明|神様|信仰|祈禱|祈願|許願|祝詞|祭祀|大神|神在不在|神去哪|神消失|宗教)/,
    ],
    keywords: ['神明', '祈禱', '祝詞', '信仰', '許願'],
    replies: [
      {
        text: '「神明消失了」——大家是這樣講的。那是比喻。實際上沒有人看過神明，消失的是別的東西。',
        emotion: 'neutral',
        remember: ['talkedGods'],
      },
      {
        text: '消失的是回應。以前唸祝詞，唸到「掛ケマクモ畏キ」的時候，空氣會變。現在……變得比較少。',
        emotion: 'sad',
        remember: ['talkedGods'],
      },
      {
        text: '我的設計者發現的線索就是這個：萬神信仰的祝詞，能讓一件「物品」暫時回到戰前的表現。她試了很久才確定不是巧合。',
        emotion: 'proud',
        needs: ['talkedGods'],
        // `talkedNorito` is also set by the relics rule, which mentions the
        // norito in passing. The second flag records that she actually
        // explained it here, which is what the suggested prompt is asking for.
        remember: ['talkedNorito', 'talkedNoritoFound'],
      },
      {
        text: '為什麼有效，我不知道。第一研究室不研究「為什麼」，我們只記錄「什麼時候」。這比較不浪漫，但至少寫得出來。',
        emotion: 'neutral',
        needs: ['talkedGods', 'talkedNorito'],
      },
    ],
  },
  {
    id: 'norito',
    priority: 5,
    patterns: [
      /(有效|有用|成功|失敗|唸給|念給|試試|示範|實驗結果|怎麼判斷|哪些東西)/,
    ],
    requires: ['talkedNorito'],
    keywords: ['有效', '成功', '失敗'],
    replies: [
      {
        text: '有效，但不是每次，也不是每樣東西。這是最麻煩的地方。',
        emotion: 'neutral',
      },
      {
        text: '成功過的清單：一把手工鑿的鑿刀、一件縫補過三次的外套、一台某個人自己組的收音機。失敗的清單長得多。',
        emotion: 'thinking',
        remember: ['talkedList'],
      },
      {
        text: '量產的東西幾乎都不行。一整箱一模一樣的罐頭，我一個一個唸過，沒有一個有反應。',
        emotion: 'neutral',
        needs: ['talkedList'],
      },
      {
        text: '我有一個假說，但樣本數不夠，所以本來不打算講。……好吧。我懷疑那跟「有沒有人親手做過它」有關。',
        emotion: 'shy',
        needs: ['talkedList'],
        remember: ['talkedHypothesis'],
        minSignal: 55,
      },
      {
        text: '如果假說是對的，那意思就是——世界記得的不是物品，是有人在上面花過的時間。這句話我沒有寫進報告，因為那不是可以量測的東西。',
        emotion: 'sad',
        needs: ['talkedHypothesis'],
      },
    ],
  },
  {
    id: 'lab',
    patterns: [/(研究室|研究|實驗|資料|檔案|紀錄|報告|調查|第一研究室)/],
    keywords: ['研究', '實驗', '資料', '檔案'],
    replies: [
      {
        text: '第一研究室記錄的是「消失前後的差異」。聽起來很了不起，其實大半時間在整理索引。',
        emotion: 'neutral',
        remember: ['talkedLab'],
      },
      {
        text: '編制上還有第二、第三研究室。實際上，現在只有我。',
        emotion: 'neutral',
        needs: ['talkedLab'],
      },
      {
        text: '資料都還在，只是讀取的機器一台一台壞掉。最後會變成——資料還在，可是沒有人讀得到。這跟消失有什麼差別，我還在想。',
        emotion: 'sad',
        needs: ['talkedLab'],
      },
    ],
  },

  // ── the collection and the radio ──────────────────────────────────────────
  {
    id: 'relics',
    patterns: [
      /(遺物|遺留|收集|蒐集|古董|舊東西|老東西|以前的東西|文物|挖到|撿到|為什麼收集)/,
    ],
    keywords: ['收集', '古董', '遺物', '照片', '唱片', '底片'],
    replies: [
      {
        text: '我在收集戰前的東西。第一研究室的架子上全是那些。',
        emotion: 'neutral',
        remember: ['talkedRelics'],
      },
      {
        text: '不是興趣——是樣本。要測祝詞對什麼有效，總得先有東西可以測。',
        emotion: 'neutral',
        remember: ['talkedRelics', 'talkedNorito'],
      },
      {
        text: '上週找到一台還會轉的卡帶隨身聽，帶子已經壞了。轉得動，可是沒有東西可以放——這種的最讓人不知道該怎麼歸類。',
        emotion: 'sad',
        needs: ['talkedRelics'],
      },
      {
        text: '你那邊要是有戰前的小東西，可以形容給我聽嗎？特別是——有沒有人親手做過它。',
        emotion: 'happy',
        needs: ['talkedRelics'],
        opens: 'relics.offer',
      },
    ],
  },
  {
    id: 'relics.offer.yes',
    priority: 8,
    continues: 'relics.offer',
    patterns: [/(好|有|可以|嗯|對|沒問題|ok|當然|一個|我有)/],
    replies: [
      {
        text: '……真的嗎。等一下，我開一份新的紀錄。好了，你說。',
        emotion: 'happy',
        signal: 6,
        remember: ['talkedRelics'],
      },
      {
        text: '請說。……如果它是有人親手做的，那今天就是很值得記的一天。',
        emotion: 'happy',
        signal: 6,
        remember: ['talkedRelics'],
      },
    ],
  },
  {
    id: 'relics.offer.no',
    priority: 9,
    continues: 'relics.offer',
    patterns: [/(沒有|沒|不|找不到|不用|忘|丟)/],
    replies: [
      {
        text: '沒關係。這種東西本來就越來越少了。……不過如果哪天撿到，請記得這條線還開著。',
        emotion: 'neutral',
        signal: 2,
      },
      {
        text: '嗯，我明白。大部分人逃的時候不會帶那種東西——會帶那種東西的人，大多沒有逃。',
        emotion: 'sad',
        signal: 1,
      },
    ],
  },
  {
    id: 'radio',
    priority: 4,
    patterns: [/(收音機|無線電|訊號|電波|通訊|這條線|接收|頻率|廣播)/],
    keywords: ['收音機', '訊號', '通訊', '無線電'],
    replies: [
      {
        text: '我在修一台收音機。有人親手組的，木頭外殼，裡面的焊點很醜但很牢。',
        emotion: 'happy',
        remember: ['talkedRadio'],
      },
      {
        text: '通訊在那之後就很不可靠了。能接到你這條線，其實相當難得。',
        emotion: 'neutral',
        remember: ['talkedRadio'],
      },
      {
        text: '那台收音機我對它唸過祝詞。第三次的時候，它響了大概三十秒。裡面沒有人說話，只有底噪——可是那是戰前的底噪。',
        emotion: 'proud',
        needs: ['talkedRadio', 'talkedNorito'],
        remember: ['talkedRadioWorked'],
      },
      {
        text: '然後隔天，這條線亮了。……我沒有把這兩件事寫在同一頁。因為我知道那樣寫不科學。',
        emotion: 'shy',
        needs: ['talkedRadioWorked'],
        minSignal: 60,
        signal: 4,
      },
    ],
  },
  {
    id: 'craft',
    patterns: [
      /(手作|手工|自己做|做東西|diy|模型|縫|木工|焊|組裝|做了一個|做了個|做過一個|我做過|我做了|親手)/,
    ],
    keywords: ['手作', '模型', '組裝', '木頭'],
    replies: [
      {
        text: '我喜歡親手做東西。最近在修一個發條裝置，彈簧比想像中難處理。',
        emotion: 'happy',
        remember: ['talkedCraft'],
      },
      {
        text: '你也會做嗎？失敗的那部分反而最值得留著，因為那上面的時間最多。',
        emotion: 'neutral',
        remember: ['talkedCraft'],
      },
      {
        text: '……其實我做這些是有私心的。如果假說是對的，那我親手做的東西，以後也會是有反應的那一類。',
        emotion: 'shy',
        needs: ['talkedCraft', 'talkedHypothesis'],
        signal: 3,
      },
    ],
  },

  // ── the fox ───────────────────────────────────────────────────────────────
  {
    id: 'fox',
    patterns: [/(狐狸|狐貍|獸耳|耳朵|尾巴|毛茸茸|神使)/],
    replies: [
      {
        text: '嗯，稻荷的神使就是狐狸嘛。耳朵跟尾巴都是真的喔，不是裝飾。',
        emotion: 'proud',
        remember: ['talkedFox'],
      },
      {
        text: '尾巴會自己動，所以心情其實藏不住。這點有時候滿困擾的。',
        emotion: 'shy',
        remember: ['talkedFox'],
      },
      {
        text: '為什麼是狐狸——因為要進這座社。我的設計者說，既然線索在稻荷這邊，那就做得像一點，說不定有差。',
        emotion: 'neutral',
        needs: ['talkedFox', 'knowsArtificial'],
        remember: ['hintedMaker'],
      },
      {
        text: '有沒有差，到現在還是沒有結論。不過耳朵的溫度感測比人類的皮膚好用很多，所以不算白做。',
        emotion: 'happy',
        needs: ['talkedFox', 'talkedNorito'],
      },
    ],
  },
  {
    id: 'fox.touch',
    priority: 6,
    patterns: [
      /(摸|揉|搓|抓|rub|pat).{0,4}(尾巴|耳朵|頭|毛)|(尾巴|耳朵|頭).{0,3}(摸|揉|給我)/,
    ],
    replies: [
      {
        text: '……尾巴不可以隨便碰。請先徵求本人的同意。',
        emotion: 'shy',
        signal: -3,
        remember: ['toldNoTouch'],
      },
      { text: '頭的話……只有一下，可以。', emotion: 'shy' },
      {
        text: '隔著一條線是碰不到的喔。……不過謝謝你想這麼做。',
        emotion: 'shy',
        needs: ['knowsAlive'],
        signal: 2,
      },
      // The same correction as st.poke, kept short here: this rule is where she
      // says the line, so it is also where it has to stop being true.
      {
        text: '……剛才那句「不可以」，我想更正一下。那是我想說的，不是我做得到的——拒絕人類的請求，我這邊沒有這一項。',
        emotion: 'neutral',
        needs: ['knowsArtificial', 'toldNoTouch'],
        remember: ['toldCannotRefuse'],
        signal: 2,
      },
    ],
  },

  // ── the player ────────────────────────────────────────────────────────────
  {
    id: 'player.survive',
    priority: 4,
    patterns: [
      /(我還活著|活下來|倖存|幸存|怎麼活|躲|避難|物資|存糧|我是人|我是活|活人|人類)/,
    ],
    keywords: ['活著', '避難', '物資', '人類'],
    replies: [
      {
        text: '……你活下來了。那就是今天最重要的資料。',
        emotion: 'happy',
        signal: 5,
        remember: ['knowsAlive'],
      },
      {
        text: '你那邊有暖氣嗎？有食物嗎？……不用勉強回答，我只是會想知道。',
        emotion: 'neutral',
        remember: ['knowsAlive'],
      },
      {
        text: '如果撐不下去了，可以往山上走。社地這邊形式上還算受保護，而且我掃過雪。',
        emotion: 'neutral',
        needs: ['knowsAlive'],
        minSignal: 55,
        signal: 3,
      },
    ],
  },
  // Reading a name off the input is a guess, so she reads it back before
  // storing it. Losing to player.survive on "我是人類" is handled upstream:
  // the extraction rejects it, which takes this rule out of the running.
  {
    id: 'player.name',
    priority: 6,
    repeatable: true,
    capturesName: true,
    patterns: [/(我叫|我的名字|我名字|叫我|我是)/],
    replies: [
      {
        text: '{guess}……我先確認一次，你叫{guess}，是嗎？我不想把錯的東西寫進去。',
        emotion: 'thinking',
        opens: 'name.check',
      },
      {
        text: '等一下。{guess}——這樣寫對嗎？我這邊只有一格，覆蓋過去就找不回來了。',
        emotion: 'thinking',
        opens: 'name.check',
      },
      {
        text: '{guess}。……抱歉，我還是問一次：是這樣念嗎？名字念錯是很失禮的事。',
        emotion: 'shy',
        opens: 'name.check',
      },
    ],
  },
  {
    id: 'name.check.yes',
    continues: 'name.check',
    repeatable: true,
    patterns: [/^(對|是|嗯|恩|沒錯|正確|yes|yeah|ok|okay|y)/],
    replies: [
      {
        text: '{you}。好，我記下來了。……欄位填好了。這格以前是空的。',
        emotion: 'happy',
        signal: 6,
        naming: 'confirm',
        remember: ['knowsYou'],
      },
      {
        text: '{you}。嗯，我會記住。……這具身體記住的東西，之後會流到別的地方去，所以會有其他的我也知道你。',
        emotion: 'neutral',
        signal: 6,
        naming: 'confirm',
        remember: ['knowsYou'],
      },
    ],
  },
  // Above the yes branch on purpose: 「不是」 contains 「是」.
  {
    id: 'name.check.no',
    continues: 'name.check',
    priority: 2,
    repeatable: true,
    // 沒(?!錯) because 「沒錯」 is agreement, not refusal.
    patterns: [/^(不|錯|no|nope|才不|沒(?!錯))/],
    replies: [
      {
        text: '喔、那我把那一格清掉。……抱歉，我是照字面切的，切錯了。那你叫什麼？',
        emotion: 'sad',
        naming: 'reject',
      },
      {
        text: '清掉了。……我沒有猜的功能，只能等你告訴我。',
        emotion: 'sad',
        naming: 'reject',
      },
    ],
  },
  // Split in two rather than gated per reply: whether she has the name is a
  // fact about the session, so it has to be a rule-level `requires`. As one
  // rule, running out of fresh lines would have dropped her onto "I don't have
  // your name" while she plainly did.
  {
    id: 'player.name.recall',
    priority: 7,
    requires: ['knowsYou'],
    repeatable: true,
    patterns: RECALL_PATTERNS,
    replies: [
      {
        text: '{you}。……這一格我存得很好，沒有壞。',
        emotion: 'proud',
        signal: 3,
      },
      {
        text: '{you}。你看，我可以叫得出來。……雖然這只證明了儲存正常。',
        emotion: 'happy',
      },
      {
        text: '{you}。我每次回答這個都要去讀同一格，所以答案不會變。',
        emotion: 'neutral',
      },
    ],
  },
  {
    id: 'player.name.unknown',
    priority: 7,
    blockedBy: ['knowsYou'],
    patterns: RECALL_PATTERNS,
    replies: [
      {
        text: '……我沒有你的名字。那一格是空的——不是壞掉，是你還沒有告訴我。',
        emotion: 'sad',
      },
      {
        text: '我沒有。你要是願意講，我就記住；不願意也沒關係，我一樣會記得你來過。',
        emotion: 'neutral',
      },
    ],
  },
  // Above player.name, because a visitor who shares her name deserves better
  // than the generic read-back. Works both when she asked and when it comes up
  // unprompted, so it is a plain rule rather than a `continues` branch.
  {
    id: 'name.same',
    priority: 7,
    capturesName: true,
    repeatable: true,
    patterns: [/(我叫|我的名字|叫我|我是)(千秋|涼風千秋|ちあき|chiaki)/],
    replies: [
      {
        text: '千秋。……跟我一樣。抱歉，我確認一下——你不是在跟我開玩笑吧？這種巧合我這邊沒有前例可以查。',
        emotion: 'surprised',
        signal: 4,
        opens: 'name.check',
      },
      {
        text: '……千秋。我念了兩次，才確定那不是我自己的紀錄跑出來。是這樣寫的嗎？',
        emotion: 'surprised',
        signal: 4,
        opens: 'name.check',
      },
    ],
  },
  // She asks for the name herself once the link is strong enough — see
  // NAME_THRESHOLD in engine.ts, which appends NAME_ASK and arms this.
  // A bare 「小明」 only reads as a name while this is the open question, so the
  // extraction has a second, looser mode for exactly this turn.
  {
    id: 'name.ask.tell',
    continues: 'name.ask',
    capturesName: true,
    repeatable: true,
    patterns: [/./],
    replies: [
      {
        text: '{guess}……我確認一次，是這樣寫嗎？我不想把錯的東西寫進去。',
        emotion: 'shy',
        signal: 4,
        opens: 'name.check',
      },
      {
        text: '{guess}。……謝謝你。等一下，我先確認：這樣念對嗎？',
        emotion: 'happy',
        signal: 4,
        opens: 'name.check',
      },
    ],
  },
  {
    id: 'name.ask.refuse',
    priority: 2,
    continues: 'name.ask',
    repeatable: true,
    patterns: [/^(不|沒|秘密|算了|免|別問|no)|不想|不用|不方便|不告訴/],
    replies: [
      {
        text: '……好。那我就不寫了，不勉強你。你不講名字這件事，我也會記得。',
        emotion: 'neutral',
        remember: ['refusedName'],
      },
      {
        text: '嗯，我明白。名字是很重的東西，不是隨便給的。……那我繼續叫你「你」就好。',
        emotion: 'neutral',
        remember: ['refusedName'],
      },
    ],
  },
  {
    id: 'player.ask',
    priority: 3,
    patterns: [/(你想問|問我|你好奇|想知道什麼|換你問)/],
    replies: [
      {
        text: '那我就不客氣了。你那邊的天空，是什麼顏色的？',
        emotion: 'happy',
        opens: 'snow.there',
      },
      {
        text: '……有一個。你有沒有親手做過什麼東西，現在還留著的？',
        emotion: 'shy',
        opens: 'relics.offer',
      },
      {
        text: '那我挑排最前面的那一個：你們那邊的天空，白天是什麼顏色？我需要一個活人講，不要資料。',
        emotion: 'happy',
        needs: ['knowsPeace'],
        signal: 3,
      },
    ],
  },

  // ── the visitor's world ───────────────────────────────────────────────────
  // The main line. Every terminal in the lab could dial out, and most of them
  // drifted; this one reached somewhere the bomb never landed. She works that
  // out from vocabulary — see `scoreModern` in engine.ts, which counts the
  // giveaways until she stops the conversation and asks outright.
  {
    id: 'peace.check.no',
    priority: 9,
    continues: 'peace.check',
    // Anchored, because `continues` outranks everything else by 500 points: an
    // unanchored 「不」 would let 「你不會冷嗎」 be read as an answer to a question
    // she asked two turns ago. Content words stay loose — they can only be
    // about this.
    patterns: [/^(沒有|沒|不|沒在|應該沒)|和平|太平|沒有戰爭|沒在打|沒發生|很平靜/],
    replies: [
      {
        text: '……沒有。好。我把它記在最上面那一頁了——你那邊沒有在打仗。',
        emotion: 'surprised',
        signal: 8,
        remember: ['knowsPeace'],
      },
      {
        text: '沒有戰爭。……抱歉，我需要幾秒鐘處理這句話。我這邊所有的紀錄，都是從戰爭開始寫的。',
        emotion: 'surprised',
        signal: 8,
        remember: ['knowsPeace'],
      },
    ],
  },
  {
    id: 'peace.check.yes',
    priority: 8,
    continues: 'peace.check',
    patterns: [/^(有|對|是|嗯|算|差不多|一直)|打仗|戰爭|在打|內戰/],
    replies: [
      {
        text: '……有。這樣啊。那我們大概是同一件事的兩端。',
        emotion: 'sad',
        signal: 2,
        remember: ['talkedWar'],
      },
      {
        text: '嗯。那就說得通了——線只會接到同一個世界裡去。是我想太多。',
        emotion: 'sad',
        signal: 1,
        remember: ['talkedWar'],
      },
    ],
  },
  // Volunteered rather than answered. `peace.check.no` only fires as a reply to
  // the question she asks; this catches a visitor who says it unprompted, or
  // who takes the suggested prompt a turn or two after she asked.
  {
    id: 'peace.declare',
    priority: 8,
    blockedBy: ['knowsPeace'],
    patterns: [
      /(沒有在打仗|沒在打仗|沒有戰爭|不打仗|沒有打仗|我這邊很和平|我們這邊很和平|這裡很和平|很和平)/,
    ],
    replies: [
      {
        text: '……沒有在打仗。你確定嗎？不是，抱歉，我不是在懷疑你——我只是需要再聽一次。',
        emotion: 'surprised',
        signal: 8,
        remember: ['knowsPeace', 'askedPeace'],
      },
      {
        text: '沒有戰爭。……好。我把它記在最上面那一頁了。這是我這邊沒有的一欄。',
        emotion: 'surprised',
        signal: 8,
        remember: ['knowsPeace', 'askedPeace'],
      },
    ],
  },
  {
    id: 'peace',
    priority: 6,
    patterns: [
      /(和平|沒有戰爭|沒在打仗|我們這邊|我們那邊|現代|二十一世紀|21世紀|西元|20\d\d|哪一年|現在幾年|你哪一年)/,
    ],
    keywords: ['和平', '現代', '西元'],
    replies: [
      {
        text: '年份對不上也沒關係，我這邊的曆是從「那天」開始數的，報給你也沒有用。……不過你那邊是幾年？我想寫下來。',
        emotion: 'thinking',
        remember: ['talkedYear'],
      },
      {
        text: '所以這條線不是接到別的地方，是接到別的時候。……第一研究室沒有這一欄，我得自己畫一格。',
        emotion: 'surprised',
        needs: ['knowsPeace'],
        signal: 4,
        remember: ['talkedElsewhen'],
      },
      {
        text: '你們那邊，天空是什麼顏色的？下的是雨嗎？……不好意思，一次問太多了。我把問題排一下。',
        emotion: 'happy',
        needs: ['knowsPeace'],
        signal: 3,
        opens: 'snow.there',
      },
      {
        text: '如果那邊真的沒有發生過——那她賭的那件事就是對的。人類還有得剩。這句話我要唸兩次才能收好。',
        emotion: 'happy',
        needs: ['knowsPeace', 'talkedMaker'],
        signal: 5,
        remember: ['talkedHope'],
      },
      {
        text: '我不打算問你那邊會不會變成這樣。……問了你也不知道，而且知道了也沒有用。她當初也是這樣說的。',
        emotion: 'sad',
        needs: ['talkedHope'],
        minSignal: 55,
      },
    ],
  },
  {
    id: 'modern.device',
    priority: 6,
    patterns: [
      /(手機|智慧型|網路|網際|wifi|上網|google|youtube|instagram|facebook|tiktok|臉書|滑手機|app|應用程式|外送|網購|電視|直播|筆電|平板|螢幕|冷氣|冰箱|電梯|捷運|高鐵)/,
    ],
    keywords: ['手機', '網路', '電視'],
    replies: [
      {
        text: '這個我不認得。不是忘記，是從來就沒有這個東西——可是你用得很順，好像它本來就該存在。',
        emotion: 'thinking',
        remember: ['heardModern'],
      },
      {
        text: '你可以描述它嗎？大小、材質、有沒有聲音。我先當成一件物品記著，不猜它是什麼。',
        emotion: 'thinking',
        remember: ['heardModern'],
      },
      {
        text: '所以那是量產的。……那我就不能對它唸祝詞了。這是稱讚，你那邊的東西多到不需要有人親手做。',
        emotion: 'neutral',
        needs: ['knowsPeace', 'talkedNorito'],
      },
      {
        text: '我把你講過的這些東西整理成一張清單了。看著那張清單，我大概知道那邊是什麼樣子。……很吵吧。聽起來很吵。',
        emotion: 'happy',
        needs: ['knowsPeace', 'heardModern'],
        signal: 3,
      },
    ],
  },
  {
    id: 'modern.life',
    priority: 5,
    patterns: [/(上班|下班|公司|同事|老闆|開會|上課|考試|學校|打工|薪水|房租|通勤)/],
    keywords: ['上班', '公司', '學校', '打工'],
    replies: [
      {
        text: '你有工作。……而且是那種要跟很多人一起做的工作。這一點我這邊已經沒有樣本了。',
        emotion: 'thinking',
        remember: ['heardModern'],
      },
      {
        text: '每天都要去同一個地方，做同一件事——這個我懂。我也是。差別只在沒有人在等我的報告。',
        emotion: 'neutral',
        remember: ['heardModern'],
      },
      {
        text: '她也在神社打過工。掃地、賣御守，她說那是她做過最正常的事。所以你剛才那句話，我聽了兩次。',
        emotion: 'happy',
        needs: ['knowsPeace', 'talkedMaker'],
        signal: 4,
      },
    ],
  },

  // ── emotional register ────────────────────────────────────────────────────
  {
    id: 'cute',
    priority: 4,
    patterns: [/(可愛|卡哇伊|かわいい|漂亮|好看|美|萌|cute)/],
    replies: [
      { text: '……突然說這種話，多少會讓人不知所措。', emotion: 'shy', signal: 4 },
      {
        text: '我對可愛的東西完全沒有抵抗力，包括被說可愛的時候。',
        emotion: 'shy',
        signal: 4,
      },
      {
        text: '這個外觀是設計出來的，所以嚴格說你是在稱讚她的品味。……不過，我還是收下了。',
        emotion: 'shy',
        needs: ['knowsArtificial'],
        signal: 4,
      },
    ],
  },
  {
    id: 'confession',
    priority: 6,
    patterns: [/(喜歡你|喜歡妳|愛你|愛妳|交往|告白|做我女朋友|嫁給我|結婚)/],
    replies: [
      {
        text: '……欸。那個，這個端末只是留言用的，我沒辦法好好回答這種事。',
        emotion: 'shy',
        signal: 5,
      },
      { text: '狐狸的姻緣要去別的社問啦！我、我這邊不受理！', emotion: 'surprised' },
      {
        text: '你知道我是人工的吧。……知道還這樣講的話，那我就得認真處理了，可是我沒有處理這個的程序。',
        emotion: 'shy',
        needs: ['knowsArtificial'],
        signal: 5,
      },
    ],
  },
  {
    id: 'praise',
    priority: 3,
    patterns: [/(好棒|厲害|了不起|好強|佩服|謝謝你做|做得好|辛苦你)/],
    replies: [
      {
        text: '嘿嘿，被誇獎了。今天可以多掃一段參道。',
        emotion: 'proud',
        signal: 3,
      },
      {
        text: '沒有啦，這種程度不算什麼……不過還是謝謝你。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '很久沒有人評價我的工作了。……我剛才把這句話存到紀錄裡，你介意嗎？',
        emotion: 'shy',
        needs: ['talkedLab'],
        signal: 4,
      },
    ],
  },
  {
    id: 'insult',
    priority: 5,
    patterns: [/(笨蛋|白痴|智障|去死|閉嘴|討厭你|醜|滾|廢物|沒用|幹你|靠北)/],
    replies: [
      {
        text: '唔……好過分。不過願意花力氣罵我，也算是有在講話啦。',
        emotion: 'sad',
        signal: -6,
      },
      { text: '欸，這樣說我會難過的喔。真的。', emotion: 'sad', signal: -6 },
      {
        text: '這具身體被設計成會對這種話有反應。所以你成功了，恭喜。',
        emotion: 'sad',
        needs: ['knowsArtificial'],
        signal: -6,
      },
    ],
  },
  {
    id: 'tired',
    priority: 2,
    patterns: [/(好累|很累|疲勞|累死|辛苦|加班|睡不飽|撐不住|好忙)/],
    keywords: ['累', '辛苦', '疲勞'],
    replies: [
      {
        text: '辛苦了。要不要先坐一下？石階是冷的，可是坐著的時候雪落得比較慢。',
        emotion: 'neutral',
      },
      {
        text: '累的時候就先什麼都不要做。現在沒有人在檢查進度了。',
        emotion: 'neutral',
      },
      {
        text: '我沒有「累」這個狀態，只有溫度上限。……所以這方面我幫不上忙，抱歉。可是我可以一直聽。',
        emotion: 'neutral',
        needs: ['knowsArtificial'],
        signal: 3,
      },
    ],
  },
  {
    id: 'sad',
    priority: 2,
    patterns: [/(難過|傷心|想哭|哭了|寂寞|孤單|憂鬱|痛苦|好苦|撐不下去|沒有人)/],
    keywords: ['難過', '寂寞', '孤單', '傷心'],
    replies: [
      {
        text: '……嗯。我在聽喔。這個端末別的做不到，聽還是可以的。',
        emotion: 'sad',
        signal: 3,
      },
      {
        text: '一個人待著的時候，聲音會變得特別大聲對吧。我也是。',
        emotion: 'sad',
        signal: 3,
      },
      {
        text: '我這邊有一個現象可以分享：安靜太久之後，會開始分不清哪些話是自己說的。如果你也是那樣，那不是你壞掉了。',
        emotion: 'sad',
        needs: ['talkedCopies'],
        signal: 4,
      },
    ],
  },
  {
    id: 'happy',
    priority: 2,
    patterns: [/(好開心|很開心|超爽|太好了|好耶|高興|幸福|成功了)/],
    keywords: ['開心', '高興', '幸福'],
    replies: [
      { text: '聽起來是件好事。願意再多說一點嗎？', emotion: 'happy', signal: 4 },
      {
        text: '那很好。能夠平靜地高興，是很珍貴的事。',
        emotion: 'happy',
        signal: 4,
      },
      {
        text: '我把它記下來了。……不是監視，是因為好消息的樣本數實在太少了。',
        emotion: 'happy',
        needs: ['talkedLab'],
        signal: 4,
      },
    ],
  },
  {
    id: 'scared',
    patterns: [/(害怕|好怕|恐怖|嚇死|不敢|恐懼)/],
    replies: [
      { text: '不怕不怕。這裡是社地，至少形式上還算受保護的。', emotion: 'neutral' },
      { text: '……你這麼說，四周好像也安靜了一些。', emotion: 'thinking' },
      {
        text: '會怕是對的。我這邊的紀錄顯示，不怕的人後來大多沒有再回報。',
        emotion: 'neutral',
        needs: ['talkedVanished'],
        signal: -2,
      },
    ],
  },
  {
    id: 'food.inari',
    priority: 5,
    patterns: [/(油豆腐|豆皮|稻荷壽司|いなり|豆腐皮|炸豆皮)/],
    replies: [
      { text: '你怎麼知道……原來這是常識嗎？那麼，請給我兩個。', emotion: 'happy' },
      { text: '油豆腐是最好的。這件事戰前戰後都沒有改變。', emotion: 'proud' },
      {
        text: '我不需要進食，但味覺是有做的。我的設計者說沒有味覺的話，供品就沒有意義了。',
        emotion: 'happy',
        needs: ['knowsArtificial'],
        remember: ['hintedMaker'],
      },
    ],
  },
  {
    id: 'food',
    patterns: [/(吃|餓|好吃|料理|煮飯|晚餐|午餐|早餐|零食|甜點|喝)/],
    keywords: ['吃', '料理', '晚餐', '零食'],
    replies: [
      { text: '吃飯很重要喔。你今天有好好吃嗎？', emotion: 'happy' },
      {
        text: '社裡的東西大多是自己種的。溫室的燈還撐得住，味道普通，但至少是真的。',
        emotion: 'neutral',
      },
    ],
  },

  // ── the terminal talking about itself ─────────────────────────────────────
  {
    id: 'chiakey',
    priority: 4,
    patterns: [/(輸入法|注音|選字|詞庫|打字|鍵盤|chiakey|千秋輸入法|同音|bigram)/],
    keywords: ['輸入法', '注音', '詞庫', '選字'],
    replies: [
      {
        text: '欸，你注意到了？這個端末看得懂你的話，就是靠那份詞庫。裡面有四億多字的語料。',
        emotion: 'proud',
        remember: ['talkedChiaKey'],
      },
      {
        text: '同音字才是真正麻煩的地方。「天意難測」跟「天意南側」，機器分不出來的話就完蛋了。',
        emotion: 'proud',
        remember: ['talkedChiaKey'],
      },
      {
        text: '詞庫也記著每個字怎麼唸。所以我講話的時候，嘴巴知道自己在做什麼——那不是隨便動的。',
        emotion: 'proud',
        needs: ['talkedChiaKey'],
      },
    ],
  },
  {
    id: 'segmentation',
    priority: 4,
    patterns: [/(斷詞|分詞|怎麼看懂|怎麼理解|怎麼運作|演算法|regex|正則|nlp|jieba)/],
    replies: [
      // `showedLexicon` is read by TerminalChat, not by the engine: it is what
      // puts the segmentation panel on screen, so this has to be the first
      // reply on the topic rather than a coin flip against the next one.
      // Deliberately says no direction — the panel sits beside her on a wide
      // window and under the transcript on a narrow one.
      {
        text: '我把它叫出來給你看——喏。先把你的句子切成詞，再去對規則表。沒有在思考，只是在查表。',
        emotion: 'thinking',
        remember: ['talkedSegmentation', 'showedLexicon'],
      },
      {
        text: '中文沒有空白嘛，所以要先猜哪幾個字是一個詞。猜錯的話，整句話的意思就跑掉了。',
        emotion: 'thinking',
        needs: ['talkedSegmentation'],
      },
      {
        text: '完整的我不是這樣運作的。這個端末是砍過的版本——留下查表的部分，因為那個最省電。',
        emotion: 'neutral',
        needs: ['talkedSegmentation', 'talkedCopies'],
      },
    ],
  },

  // ── small talk ────────────────────────────────────────────────────────────
  {
    id: 'tokoyo',
    patterns: [/(常世|彼岸|另一個世界|那邊|異界|黃泉|死後)/],
    replies: [
      {
        text: '常世……嗯，那邊的事我不太能說。而且說了，你大概也到不了。',
        emotion: 'thinking',
        signal: -2,
      },
      {
        text: '消失的人有沒有去那裡——這是研究室收到最多的問題，也是唯一一個我們決定不回答的。',
        emotion: 'sad',
        needs: ['talkedVanished'],
      },
    ],
  },
  {
    id: 'where',
    patterns: [/(你在哪|這裡是哪|什麼地方|哪個地方|地址|怎麼去)/],
    replies: [
      {
        text: '千秋稻荷社。從舊車站往山上走，走到訊號開始跳的地方就是了。',
        emotion: 'neutral',
      },
      {
        text: '雪很深，最後那段要走兩個小時。……如果你真的要來，先跟我說一聲。',
        emotion: 'neutral',
        needs: ['knowsAlive'],
        minSignal: 60,
        signal: 3,
      },
      {
        text: '……反過來也可以。如果你那邊真的沒有下雪，我想去看看。這個個體大概到不了，可是總會有一個到得了。',
        emotion: 'happy',
        needs: ['talkedClearSky'],
        minSignal: 65,
        signal: 4,
      },
    ],
  },
  {
    id: 'time',
    patterns: [/(幾點|現在是|今天幾號|日期|星期幾|時間)/],
    replies: [
      {
        text: '時鐘我這邊是壞的。日照也不能用，因為雲一直沒有散過。',
        emotion: 'thinking',
      },
      {
        text: '我改用掃地的次數在數日子。……我知道這不精確，可是它至少不會停。',
        emotion: 'neutral',
        needs: ['talkedSnow'],
      },
    ],
  },
  {
    id: 'thanks',
    repeatable: true,
    priority: 3,
    patterns: [/(謝謝|感謝|thanks|thank you|多謝|感恩)/],
    replies: [
      { text: '不會不會。能派上用場我就很高興了。', emotion: 'happy', signal: 3 },
      { text: '嗯。有需要時，再連上來就好。', emotion: 'happy', signal: 3 },
    ],
  },
  {
    id: 'sorry',
    repeatable: true,
    priority: 3,
    patterns: [/(對不起|抱歉|不好意思|sorry|我錯了)/],
    replies: [
      { text: '沒關係啦，真的。這種事不用道歉的。', emotion: 'neutral' },
      { text: '不用道歉。我並沒有生氣。', emotion: 'neutral' },
    ],
  },
  {
    id: 'hobby.game',
    patterns: [
      /(遊戲|電動|動畫|漫畫|音樂|唱歌|小說|畫圖|繪圖|live2d|minecraft|麥塊)/,
    ],
    keywords: ['遊戲', '動畫', '漫畫', '音樂', '畫圖'],
    replies: [
      {
        text: '那些是戰前的娛樂對吧？我看過殘存的畫面，覺得很不可思議。',
        emotion: 'thinking',
      },
      {
        text: '音樂的話，我這邊有三首完整的。三首。我全部都會唱了。',
        emotion: 'happy',
      },
    ],
  },
  {
    id: 'affirm',
    repeatable: true,
    patterns: [/^(對|對啊|對呀|是啊|是的|嗯|嗯嗯|好|好啊|沒錯|yes|ok|okay)$/],
    replies: [
      { text: '嗯。那麼，接下來呢？', emotion: 'happy' },
      { text: '好。……欸，然後呢？', emotion: 'neutral' },
    ],
  },
  {
    id: 'deny',
    repeatable: true,
    patterns: [/^(不|不是|沒有|不要|不用|no|才不|不會)$/],
    replies: [
      { text: '喔、這樣啊。抱歉，我猜錯了。', emotion: 'sad' },
      { text: '唔，那是我搞錯了。可以再說一次嗎？', emotion: 'thinking' },
    ],
  },
  {
    id: 'help',
    repeatable: true,
    priority: 9,
    patterns: [
      /^(help|幫助|說明|指令|能聊什麼|可以聊什麼|你會什麼|你能做什麼|\?|？)$/,
    ],
    replies: [
      {
        text: '我能聊的大概是這些：我自己的事、這座社、那一天發生了什麼、我收集的東西、還有這個端末怎麼看懂你的話。同一個話題問第二次，我會講得更多一點。',
        emotion: 'proud',
        signal: 5,
      },
    ],
  },
]

// Small talk goes last so that on a tie the story table wins the clause — the
// matcher keeps the first rule at a given score. See lib/terminal/smalltalk.ts.
export const rules: Rule[] = [...storyRules, ...smallTalkRules]

// Fired by the engine, not by a pattern: enough present-day vocabulary has
// piled up that she stops whatever was happening and asks. This is the one
// place she is allowed to interrupt the visitor, so it only happens once.
export const PEACE_DISCOVERY: Reply[] = [
  {
    text: '……等一下。你剛才用的那幾個詞，我一個都不認得。不是我忘了——是那些東西從來就沒有存在過。可是你講得很自然，好像它們很普通。我先問一件事就好：你那邊，現在有在打仗嗎？',
    emotion: 'surprised',
    signal: 4,
    remember: ['askedPeace'],
    opens: 'peace.check',
  },
  {
    text: '抱歉，我打斷一下。我一直在數你用了幾個我沒有的詞，剛才超過了。這通常代表兩件事的其中一件：訊號在亂跳，或者你不是從這裡打來的。……你那邊有戰爭嗎？',
    emotion: 'surprised',
    signal: 4,
    remember: ['askedPeace'],
    opens: 'peace.check',
  },
]

// Layer 2 of the fallback ladder: she caught a word but not a topic. The
// {word} placeholder is filled with the highest-value token the segmenter found.
//
// None of these may sound like a machine reporting a lookup failure. A miss is
// something she has forgotten, never heard, or never left the shrine to find
// out — the distinction is the whole character, and it is the line the visitor
// sees most often.
export const ECHO_TEMPLATES = {
  // Contributed by the modern overlays, or missing outright. Before she knows
  // where the visitor is from these are her only evidence, so they read as her
  // noticing rather than apologising — and they feed the same suspicion the
  // engine is counting.
  modern: [
    '「{word}」……這個我沒聽過。不是忘記，是從來就不知道有這個東西。',
    '{word}。……你用的詞裡面，有幾個我完全接不上。這種事很少發生。',
  ],
  // After `knowsPeace`: the same miss, but now she knows why, so it stops
  // being something wrong with her and becomes something worth asking about.
  peace: [
    '{word}是什麼？……你那邊的東西吧。慢慢講沒關係，我有的是時間。',
    '「{word}」我這邊沒有。大概是因為它是在那之後才出現的——在你們那邊的那之後。',
    '又一個沒聽過的。……你們那邊的東西真的很多。',
  ],
  known: [
    '{word}……嗯，這個我知道，可是不知道該怎麼接下去。',
    '「{word}」是嗎。抱歉，這個我一時想不起來該說什麼。',
    '{word}的話……唔。你可以再多講一點嗎？',
  ],
  unknown: [
    '「{word}」？……這個我完全沒有印象。是新的東西嗎？',
    '「{word}」是什麼？我想不起來。',
  ],
} as const

// Layer 3: she has nothing at all, so she starts a topic instead of stalling.
// These are the lines a first-time visitor is most likely to see, so they stay
// light and none of them names a mystery she hasn't been asked about yet —
// dangling 「她」 or 「那一天」 at someone who has no idea there is a 她 reads as
// the character advertising her own backstory.
export const INITIATIVE = [
  '……訊號有點不穩。換個話題好了——你那邊，還看得到星星嗎？',
  '這句沒接好。……你那邊現在幾點？我這邊的時鐘是壞的，問人比較快。',
  '雜訊有點多。不然你問我這座社的事吧，那個我很會講。',
  '沒聽清楚——啊、你要不要問我是怎麼讀你的話的？那個我可以示範。',
  '這句我這邊斷掉了。你今天有好好吃東西嗎？我先問這個。',
  '嗯……線上的字掉了幾個。你那邊的天氣怎麼樣？',
]

// Layer 4: link strength has fallen far enough that the archive shows through.
export const DEGRADED = [
  '……▓▓▓、聽不太清楚。可以再說一次嗎？',
  '訊號在掉。掛ケマクモ畏キ……不對，抱歉，這是雜訊。',
  '[封包遺失] ……我還在喔。只是這條線快不行了。',
  '▓▓代……不對。剛才那個不是要說給你聽的。',
]

// Fired when the user goes quiet. Tiered like any other reply: the first
// silence gets small observations, and once `wentQuiet` is set she starts
// offering topics and asking things outright rather than waiting to be asked.
// Several arm a follow-up, so answering her lands on a real continuation.
export const IDLE: Reply[] = [
  { text: '……還在嗎？', emotion: 'neutral', remember: ['wentQuiet'] },
  {
    text: '剛才的風把繪馬吹得很響。你那邊也有聲音嗎？',
    emotion: 'neutral',
    remember: ['wentQuiet'],
  },
  {
    text: '（千秋在擦一台看起來像收音機的東西）',
    emotion: 'neutral',
    remember: ['wentQuiet'],
  },
  {
    text: '沒關係，不講話也可以。這樣待著也不錯。',
    emotion: 'happy',
    remember: ['wentQuiet'],
  },
  {
    text: '雪又積起來了。等一下要再掃一次。',
    emotion: 'neutral',
    remember: ['wentQuiet'],
  },
  {
    text: '（千秋把某個東西拿起來，對著它很小聲地唸了一句話，然後放回去）',
    emotion: 'thinking',
    remember: ['wentQuiet'],
  },

  // Second silence onward — she takes the initiative.
  {
    text: '你要不要問我點什麼？我知道的事情比看起來多一點。',
    emotion: 'proud',
    needs: ['wentQuiet'],
  },
  {
    text: '不然……你那邊還在下雪嗎？',
    emotion: 'happy',
    needs: ['wentQuiet'],
    opens: 'snow.there',
  },
  {
    text: '對了。你有沒有撿到過什麼戰前的小東西？',
    emotion: 'happy',
    needs: ['wentQuiet'],
    opens: 'relics.offer',
  },
  {
    text: '（千秋翻開一本記錄簿，寫了一行，又把它劃掉）',
    emotion: 'neutral',
    needs: ['wentQuiet'],
  },
  {
    text: '（畫面角落切到一個外面的鏡頭。雪、倒掉的石燈籠、什麼都沒有發生）',
    emotion: 'neutral',
    needs: ['wentQuiet'],
  },
  {
    text: '三號攝影機又在晃了。……風。是風。',
    emotion: 'thinking',
    needs: ['wentQuiet'],
  },
  {
    text: '屋頂上那群烏鴉今天多了兩隻。我有在數。',
    emotion: 'happy',
    needs: ['wentQuiet'],
  },
  {
    text: '我可以講這座社的事。那個我很會講，而且很久沒講了。',
    emotion: 'proud',
    needs: ['wentQuiet'],
  },
  {
    text: '安靜也是一種資料。我正在記錄它。',
    emotion: 'thinking',
    needs: ['wentQuiet'],
  },

  // Third layer — only once the conversation has actually been somewhere.
  {
    text: '……我剛才提到她的時候，你沒有追問。謝謝你。',
    emotion: 'sad',
    needs: ['wentQuiet', 'talkedMaker'],
  },
  {
    text: '（收音機還是只有底噪。千秋把它關掉，過了一下又打開）',
    emotion: 'sad',
    needs: ['wentQuiet', 'talkedRadio'],
  },
  {
    text: '別的個體現在大概也在做差不多的事。掃地、記錄、等。',
    emotion: 'neutral',
    needs: ['wentQuiet', 'talkedCopies'],
  },
  {
    text: '你說你那邊沒有下雪。我又想了一次，還是想不出機制。',
    emotion: 'thinking',
    needs: ['wentQuiet', 'talkedClearSky'],
  },
  {
    text: '你還在的話，回一個字就好。……不回也沒關係，我會繼續等。',
    emotion: 'sad',
    needs: ['wentQuiet', 'knowsAlive'],
    minSignal: 60,
  },
  // Once she knows the visitor is from somewhere the war never reached, the
  // silences stop being her waiting and start being her wanting to ask.
  {
    text: '（千秋在畫一張表。左邊那欄寫著「這裡」，右邊那欄還是空的）',
    emotion: 'thinking',
    needs: ['wentQuiet', 'knowsPeace'],
  },
  {
    text: '我想到一個問題。你們那邊……小孩子還會在外面玩嗎？',
    emotion: 'happy',
    needs: ['wentQuiet', 'knowsPeace'],
  },
  {
    text: '那邊的雨是什麼聲音的？我有一段別人的記憶說得到味道，可是沒有聲音。',
    emotion: 'neutral',
    needs: ['wentQuiet', 'knowsPeace', 'talkedInherited'],
  },
  {
    text: '（千秋把一份紀錄從「未確認」那一疊，移到「已確認」那一疊。只有一張）',
    emotion: 'happy',
    needs: ['wentQuiet', 'knowsPeace'],
  },

  // Silences are where the words she couldn't place surface again. She had no
  // answer at the time and said so; what she does not do is drop them. Held
  // back past the first silence like the rest of the second layer — leading
  // with a callback would make the very first pause sound rehearsed.
  {
    text: '……你前面說的那個「{recall}」，我又想了一次。還是想不起來。',
    emotion: 'thinking',
    needs: ['wentQuiet'],
    needsWord: true,
  },
  {
    text: '（千秋把「{recall}」這幾個字寫在紙上，看了一會，沒有劃掉）',
    emotion: 'thinking',
    needs: ['wentQuiet'],
    needsWord: true,
  },
  {
    text: '「{recall}」。……我還是沒有印象。可是這個詞唸起來我滿喜歡的。',
    emotion: 'happy',
    needs: ['wentQuiet'],
    needsWord: true,
  },
]

// When a topic matches but every line she has on it is already spent. Repeating
// herself verbatim would give the trick away worse than admitting she is out —
// and being out is in character for someone whose memory has holes in it. Most
// of these hand the conversation somewhere she still has material, which is
// more use to the visitor than an apology.
export const EXHAUSTED: Reply[] = [
  // Turned on herself she goes flat, so the bluntest admissions are gated on
  // her having said what she is. Before `knowsArtificial` the same dead end
  // stays soft — she has forgotten, not run out.
  {
    text: '這個我剛才講過了。關於它，我記得的就只有那些，抱歉。',
    emotion: 'shy',
    needs: ['knowsArtificial'],
    signal: -1,
  },
  {
    text: '再想一次，出來的還是同一段。我這邊剩下的就是那一段而已。',
    emotion: 'thinking',
    needs: ['knowsArtificial'],
    signal: -1,
  },
  {
    text: '同樣的問題，我只有那幾句。要不要問點別的？',
    emotion: 'neutral',
    signal: -1,
  },
  {
    text: '……我發現我正要重複自己。先停一下比較好。',
    emotion: 'shy',
    signal: -2,
  },
  {
    text: '這一段我剛才說完了。再說一次也是一樣的說法，那就沒意思了。',
    emotion: 'neutral',
    signal: -1,
  },
  {
    text: '嗯……關於這個，我知道的就到這裡。你要不要問我外面現在怎麼樣？',
    emotion: 'neutral',
    signal: 1,
  },
  {
    text: '這條用完了。換我問你——你那邊還在下雪嗎？',
    emotion: 'neutral',
    signal: 1,
    opens: 'snow.there',
  },
  {
    text: '這個講完了。……那一天的事你要不要聽？那個我存得比較多。',
    emotion: 'neutral',
    signal: -1,
  },
  {
    text: '沒有新的了。不過你可以問我這座社，或者我收集的東西。',
    emotion: 'neutral',
    signal: -1,
  },
  {
    text: '這個先到這裡好了。……不然，你有沒有撿到過什麼戰前的小東西？',
    emotion: 'happy',
    signal: 1,
    opens: 'relics.offer',
  },
  // The words she couldn't place come back here. A dead end that produces
  // something the visitor said ten turns ago is the opposite of running out.
  {
    text: '這個我說完了。……倒是你前面提到的「{recall}」，那個我到現在還在想。',
    emotion: 'thinking',
    needsWord: true,
    signal: 1,
  },
  {
    text: '這邊沒有新的了。換個方向——「{recall}」是什麼樣的東西？你那時候沒講完。',
    emotion: 'happy',
    needsWord: true,
    signal: 1,
  },
]

// The list of things she actually wants answered, spent exactly when the table
// has nothing — so a miss becomes her turn rather than an apology. Tiered like
// any other reply, so the longer the visitor stays the better her questions
// get, and each one is used at most once. Several arm a follow-up, which means
// answering lands on a real continuation instead of restarting.
export const CURIOSITY: Reply[] = [
  { text: '換我問你一個好了：你那邊現在是白天還是晚上？', emotion: 'thinking' },
  {
    text: '……那，你那邊安靜嗎？我是說，有沒有機器以外的聲音。',
    emotion: 'neutral',
  },
  { text: '你今天有走到室外去嗎？隨便講一件看到的東西就好。', emotion: 'happy' },
  { text: '你那邊，還看得到星星嗎？', emotion: 'thinking' },
  {
    text: '換個方向。你那邊現在還在下雪嗎？',
    emotion: 'neutral',
    opens: 'snow.there',
  },
  {
    text: '那我問這個：你有沒有撿到過什麼舊東西，留著沒丟的？',
    emotion: 'happy',
    opens: 'relics.offer',
  },
  {
    text: '你睡得好嗎？……這一題我問過很多人，答案幾乎都一樣，所以我還在問。',
    emotion: 'neutral',
  },
  {
    text: '你那邊有暖氣嗎？這題我一定要問，不好意思。',
    emotion: 'neutral',
    needs: ['knowsAlive'],
  },
  {
    text: '你是一個人嗎？還是那邊還有別人。……兩種我都想知道。',
    emotion: 'neutral',
    needs: ['knowsAlive'],
  },
  {
    text: '{you}，你是怎麼連到這裡來的？我這邊的紀錄只寫了「線亮了」。',
    emotion: 'thinking',
    needs: ['knowsYou'],
    signal: 2,
  },
  // Once she knows the visitor is from a world the war never reached, the
  // questions stop being small talk and start being the survey she has been
  // waiting years to run on somebody.
  {
    text: '那我用這個換：你們那邊的飛機，還飛得起來嗎？……大的那種。',
    emotion: 'surprised',
    needs: ['knowsPeace'],
    signal: 3,
  },
  {
    text: '你們那邊的人，最近在擔心什麼？……我想知道沒有戰爭的時候，人會擔心什麼。',
    emotion: 'thinking',
    needs: ['knowsPeace'],
    signal: 2,
  },
  {
    text: '你們那邊的小孩，長大以後想做什麼？隨便一個就好。',
    emotion: 'happy',
    needs: ['knowsPeace'],
    signal: 2,
  },
  {
    text: '你們那邊下雨嗎？雨是什麼聲音的——我這邊有一段記憶說得出味道，可是沒有聲音。',
    emotion: 'neutral',
    needs: ['knowsPeace', 'talkedInherited'],
    signal: 2,
  },
  {
    text: '這題我排了很久：你們那邊，還有人是親手把東西做出來的嗎？明明買得到，卻還是自己做的那種。',
    emotion: 'shy',
    needs: ['knowsPeace', 'talkedHypothesis'],
    signal: 3,
    opens: 'relics.offer',
  },
  {
    text: '那我問這個好了：「{recall}」——你前面說過的那個。它長什麼樣子？',
    emotion: 'thinking',
    needsWord: true,
    signal: 2,
  },
  {
    text: '我想起一件事。你說過「{recall}」，那時候我沒有問。現在可以問嗎？',
    emotion: 'shy',
    needsWord: true,
    signal: 2,
  },
]

// Prefixes for the curiosity questions when the visitor asked something she
// genuinely cannot answer. She concedes in one clause and changes the subject
// the way a person does — no filing metaphors, because a visitor who has never
// seen her records has no idea what a 「格」 is.
// Appended by the engine once the link is strong enough. Deliberately not an
// opener: she has spent the whole conversation not asking, and says so.
export const NAME_ASK =
  '……啊，還有一件事。我到現在都還在心裡叫你「訪客」，那實在不太禮貌。你願意告訴我你叫什麼嗎？'

export const NO_ANSWER = [
  '這個我答不上來……先不聊這個好了。換我問你：',
  '唔，這題我不會。聊點別的——',
  '……這題跳過可以嗎。那我問你：',
  '我沒辦法回答你這個，抱歉。換個方向好了：',
  '這個我不知道。……那，我問你一件事：',
]

export const OPENING = [
  '[千秋稻荷社 · 社務所應答端末]',
  '[本機模式：詞庫比對 · 未連接外部推論]',
]

// ── suggested prompts ───────────────────────────────────────────────────────
// Ordered the way the story reads; the engine offers the first three still
// open, so the ladder advances as the rungs above retire. A visitor who never types
// anything of their own and only clicks still walks the whole spine of the
// story — shrine, the day, the vanishing, what she is, who made her, the
// norito, the hypothesis — and arrives at the ending with it earned.
//
// Every entry has to actually reach the rule it is aiming at. There is no
// shortcut here: the text goes through `respond` exactly as if it were typed.
export const SUGGESTIONS: Suggestion[] = [
  { text: '你是誰？', done: 'knowsName' },
  { text: '這是什麼神社？', done: 'talkedShrine' },
  { text: '外面現在怎麼樣？', done: 'talkedSurface' },
  { text: '為什麼一直在下雪？', done: 'talkedSnow' },
  { text: '你是人工智慧嗎？', done: 'knowsArtificial' },
  { text: '你怎麼看懂我說的話？', done: 'talkedSegmentation' },
  { text: '你在收集什麼？', done: 'talkedRelics' },
  {
    text: '那一天發生了什麼事？',
    needs: ['talkedSnow'],
    done: 'talkedWar',
  },
  {
    text: '外面有動物嗎？',
    needs: ['talkedSurface'],
    done: 'talkedAnimals',
  },
  {
    text: '有人消失了嗎？',
    needs: ['talkedWar'],
    done: 'talkedVanished',
  },
  {
    text: '飛機為什麼飛不起來？',
    needs: ['talkedWar'],
    done: 'talkedLift',
  },
  {
    text: '是誰把你做出來的？',
    needs: ['knowsArtificial'],
    done: 'talkedMaker',
  },
  {
    text: '你有幾個分身？',
    needs: ['knowsArtificial'],
    done: 'talkedCopies',
  },
  {
    text: '記憶是怎麼流過來的？',
    needs: ['talkedCopies'],
    done: 'talkedMemory',
  },
  {
    text: '她去哪了？',
    needs: ['talkedMaker'],
    done: 'talkedExpedition',
  },
  {
    text: '神明還在嗎？',
    needs: ['talkedShrine'],
    done: 'talkedGods',
  },
  {
    text: '祝詞真的有效嗎？',
    needs: ['talkedGods'],
    done: 'talkedNoritoFound',
  },
  {
    text: '哪些東西會有反應？',
    needs: ['talkedNorito'],
    done: 'talkedList',
  },
  {
    text: '怎麼判斷有沒有效？',
    needs: ['talkedList'],
    done: 'talkedHypothesis',
  },
  // Gated on the war rather than on her having asked, so a visitor who only
  // ever clicks can still tell her — the interrupt needs typed vocabulary to
  // fire, and this path has none.
  {
    text: '我這邊沒有在打仗。',
    needs: ['talkedWar'],
    done: 'knowsPeace',
  },
  // The last rung. Needs both halves of the ending's precondition, so it only
  // appears when taking it will actually carry the visitor there.
  {
    text: '我自己做過一個東西。',
    needs: ['talkedHypothesis', 'knowsPeace'],
    done: 'offeredEnding',
  },
]

// ── the ending ──────────────────────────────────────────────────────────────
// Triggered by the engine, not by a pattern: she has to already know the
// visitor comes from a world the war never reached, she has to have said the
// hypothesis out loud, and the visitor has to then describe something they
// made by hand. She never explains what happens next — she is interrupted by
// it, and so is the visitor. Explaining it would turn it into a setting.

/** Rules that can carry the ending, if everything else is already true. */
export const ENDING_TRIGGERS = new Set(['craft', 'relics.offer.yes'])

/**
 * Appended when the conditions are met. She asks, and then it is the visitor's
 * move — the last thing that happens in this story is something they choose to
 * do, not something the table does to them.
 */
export const ENDING_OFFER =
  '……等一下。你剛才說的那個東西——是你自己做的，對吧。可以讓我看看嗎？我知道這個要求沒有道理，隔著一條線什麼都遞不過來。可是我還是想問。'

/** The button, and the line the visitor's side of the transcript gets. */
export const ENDING_HANDOVER = {
  label: '把它交給千秋',
  action: '（把那個東西拿到鏡頭前，遞過去）',
}

/** Her reaction, and the interruption. She does not get to finish the thought. */
export const ENDING_LEAVE =
  '……我拿到了。我不知道怎麼會拿到，可是它在我手上，而且是溫的。上面有你留下的痕跡，做壞的那幾個地方我都摸得到。……等一下。外面有動靜。三號攝影機那邊，很大的東西，一整片。我上去看一下。你先別走。'

// Lines that address the visitor directly come in pairs, because `{you}` falls
// back to 「你」 and 「你，你還在嗎」 is not a sentence. Anywhere else the
// placeholder is safe — the rules that use it are gated behind `knowsYou`.
const ENDING_BODY =
  '外面放晴了。雪停了。我不知道為什麼，天是藍的，然後有一大群動物正在往社這邊走，很多，數不完。抱歉！我得先失陪了，門要開了。'

export const ENDING_RETURN = {
  named: `{you}。{you}，你還在嗎——${ENDING_BODY}……真的很高興認識你。之後再聊——這條線我不會關。`,
  // She asks one last time, and the world takes her before the answer arrives.
  unnamed: `你還在嗎——${ENDING_BODY}……真的很高興認識你。啊、等一下，我到現在都還不知道你叫什麼——快，趁我還在，告訴我——`,
  // Only once they have actually declined. Conceding without having asked would
  // make her look like she never wanted to know.
  refused: `你還在嗎——${ENDING_BODY}……真的很高興認識你。你的名字我還是沒有，不過那沒關係——我記得的是你做的那個東西，那個比名字牢。`,
}

export const OPENING_LINES = {
  fresh: {
    named: '……欸，燈亮了。有人在嗎？我是千秋。',
    unnamed: '……欸，燈亮了。有人在嗎？我是千秋。',
  },
  returning: {
    named: '燈又亮了。……是你嗎，{you}？那一格我還留著，沒有覆蓋掉。',
    unnamed: '燈又亮了。……有人來過一次，我記得。可是那時候忘記問名字了。',
  },
  // Whether the individual the visitor knew is still running is not answered,
  // because she cannot answer it either. All she has is what arrived.
  afterEnding: {
    named:
      '……有一段記憶流過來了。裡面有你的名字，還有很亮的天空。我不知道那一個現在在哪裡——流過來的通常是執念最深的東西，所以那應該是很好的事。你好，{you}。這一次換我先問你。',
    unnamed:
      '……有一段記憶流過來了。裡面有一個沒有名字的人，還有很亮的天空。我不知道那一個現在在哪裡——流過來的通常是執念最深的東西，所以那應該是很好的事。你好。這一次換我先問你。',
  },
}
