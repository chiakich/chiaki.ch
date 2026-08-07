import type { Reply, Rule } from './types'

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

export const rules: Rule[] = [
  {
    id: 'greeting',
    priority: 2,
    patterns: [/(你好|妳好|您好|哈囉|哈嘍|嗨|早安|午安|安安|hello|hi|こんにちは|おはよう)/],
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
        text: '名字倒是很確定。名字是她取的，那個欄位很乾淨，一點損壞都沒有。',
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
        text: '二月二十七日。嚴格說那是「初次啟動日」，不過她堅持要寫成生日，所以就是生日了。',
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
    ],
  },
  {
    id: 'maker',
    priority: 5,
    patterns: [/(做你的|造你的|創造|開發|製作者|工程師是|誰做的|誰造|主人|少女|那個女孩)/],
    keywords: ['創造', '製作', '開發'],
    replies: [
      {
        text: '做我的是一個少女。……她的名字欄位是空的。不是損壞，是空的——她自己沒有填。',
        emotion: 'neutral',
        remember: ['talkedMaker', 'knowsArtificial'],
      },
      {
        text: '你注意到我一直在說「她」了吧。……嗯。做我的是一個少女。名字的欄位是空的——不是損壞，是她自己沒有填。',
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
    ],
  },

  // ── the event ─────────────────────────────────────────────────────────────
  {
    id: 'war',
    priority: 2,
    patterns: [/(戰爭|大戰|戰前|戰後|炸彈|轟炸|廢墟|軍隊|末日|世界末日|那一天|那天)/],
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
        text: '嚴格講，我不是繼承來的巫女。這座社是她找到的，職稱是後來補上去的——因為要做那件事，總得有個名分。',
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
        text: '她發現的線索就是這個：萬神信仰的祝詞，能讓一件「物品」暫時回到戰前的表現。她試了很久才確定不是巧合。',
        emotion: 'proud',
        needs: ['talkedGods'],
        remember: ['talkedNorito'],
      },
      {
        text: '為什麼有效，我不知道。第一研究室不研究「為什麼」，我們只記錄「什麼時候」。這比較不浪漫，但至少寫得出來。',
        emotion: 'neutral',
        needs: ['talkedNorito'],
      },
    ],
  },
  {
    id: 'norito',
    priority: 5,
    patterns: [/(有效|有用|成功|失敗|唸給|念給|試試|示範|實驗結果|怎麼判斷|哪些東西)/],
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
    patterns: [/(手作|自己做|做東西|diy|模型|縫|木工|焊|組裝|做了一個|親手)/],
    keywords: ['手作', '模型', '組裝'],
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
        text: '為什麼是狐狸——因為要進這座社。她說，既然線索在稻荷這邊，那就做得像一點，說不定有差。',
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
    patterns: [/(摸|揉|搓|抓|rub|pat).{0,4}(尾巴|耳朵|頭|毛)|(尾巴|耳朵|頭).{0,3}(摸|揉|給我)/],
    replies: [
      { text: '……尾巴不可以隨便碰。請先徵求本人的同意。', emotion: 'shy', signal: -3 },
      { text: '頭的話……只有一下，可以。', emotion: 'shy' },
      {
        text: '隔著一條線是碰不到的喔。……不過謝謝你想這麼做。',
        emotion: 'shy',
        needs: ['knowsAlive'],
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
        text: '查不到。你要是願意講，我就寫進去；不願意也沒關係，我一樣會記得你來過。',
        emotion: 'neutral',
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
      { text: '嘿嘿，被誇獎了。今天可以多掃一段參道。', emotion: 'proud', signal: 3 },
      { text: '沒有啦，這種程度不算什麼……不過還是謝謝你。', emotion: 'shy', signal: 3 },
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
      { text: '累的時候就先什麼都不要做。現在沒有人在檢查進度了。', emotion: 'neutral' },
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
      { text: '那很好。能夠平靜地高興，是很珍貴的事。', emotion: 'happy', signal: 4 },
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
        text: '我不需要進食，但味覺是有做的。她說沒有味覺的話，供品就沒有意義了。',
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
    patterns: [/(遊戲|電動|動畫|漫畫|音樂|唱歌|小說|畫圖|繪圖|live2d|minecraft|麥塊)/],
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

// Layer 2 of the fallback ladder: she caught a word but not a topic. The
// {word} placeholder is filled with the highest-value token the segmenter found.
export const ECHO_TEMPLATES = {
  // Words the modern overlays contributed — post-war vocabulary, in-world.
  modern: [
    '「{word}」……這個詞是戰後才有的吧？詞庫裡標著新的記號。',
    '{word}啊。這種說法我是後來才學會的，戰前的資料裡查不到。',
  ],
  known: [
    '{word}……嗯，這個詞我知道，可是不知道該怎麼接。',
    '「{word}」是嗎。抱歉，關於這個我這邊沒有存對應的回答。',
    '{word}的話……唔。你可以再多講一點嗎？',
  ],
  unknown: [
    '「{word}」？這個詞連詞庫裡都沒有。是新的東西嗎？',
    '「{word}」是什麼？我在這裡查不到。',
  ],
} as const

// Layer 3: she has nothing at all, so she starts a topic instead of stalling.
export const INITIATIVE = [
  '……訊號有點不穩。換個話題好了——你那邊，還看得到星星嗎？',
  '這句我接不上。你曾經撿到過什麼戰前的東西嗎？',
  '對不起，這條規則沒有寫到。不然你問我這座社的事吧，那個我很會講。',
  '沒有對應的回答……啊、你要不要問我是怎麼讀你的話的？那個我可以示範。',
  '這句超出我這份表了。……問我那一天的事也可以，我不介意講。',
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
    text: '你要不要問我點什麼？這張表比看起來大一點。',
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
]

// When a topic matches but every line she has on it is already spent. Repeating
// herself verbatim would give the trick away worse than admitting the table ran
// out — and admitting it is in character for a terminal that *is* a lookup
// table. Most of these hand the conversation somewhere she still has material,
// which is more use to the visitor than an apology.
export const EXHAUSTED: Reply[] = [
  {
    text: '這個我剛才講過了。……我這張表就這麼大，抱歉。',
    emotion: 'shy',
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
    text: '我查到的是同一格。重複唸出來也不會變成新的東西。',
    emotion: 'thinking',
    signal: -1,
  },
  {
    text: '這格空了。……不然，你有沒有撿到過什麼戰前的小東西？',
    emotion: 'happy',
    signal: 1,
    opens: 'relics.offer',
  },
]

export const OPENING = [
  '[千秋稻荷社 · 社務所應答端末]',
  '[本機模式：詞庫比對 · 未連接外部推論]',
]
