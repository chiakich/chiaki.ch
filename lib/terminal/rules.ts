import { smallTalkRules } from './smalltalk'
import { visitorRules } from './visitor'
import type { Reply, Rule, Suggestion } from './types'

// 八雲秋狐's response table. Patterns run against normalised text (traditional,
// punctuation stripped, lower-cased, 妳/您 folded to 你) — see
// lib/terminal/normalize.ts.
//
// Setting: a new weapon changed how the world behaves. The air is unchanged by
// every measurement, but lift is not — jets cannot fly, powder barely burns.
// Some people simply went missing, clothes still folded. It has snowed ever
// since. Akitsune is an artificial girl built by a girl who left her own name
// blank; several bodies run at once, and when one stops, fragments of what it
// knew flow to the rest. Shinto was her maker's lead: a norito can briefly
// return an object to how it behaved before — but only some objects.
//
// Voice: an idol, or a maid — built to be one, and it shows. Lively, earnest
// and openly emotional about everything, her own manufacture included, and
// quick to get flustered: a stammered first word, warm ears, a tail that moves
// on its own. Particles and exclamation marks are hers; 「——」 is not, and she
// has no catchphrase. Around a visitor who is hurting she softens rather than
// cheers. Heavy story beats stay heartfelt, never jokey.
//
// Reply tiers: `needs` gates the deeper lines behind flags the earlier ones
// set, so a topic opens up as it is revisited. The engine always serves the
// deepest tier currently unlocked. See lib/terminal/engine.ts.

// Shared by player.name.recall and player.name.unknown, which differ only in
// whether she has the name yet.
const RECALL_PATTERNS = [
  /(我叫什麼|我的名字是什麼|我的名字呢|你記得我|還記得我|我是誰|知道我是誰)/,
]

// The most a yes/no answer may carry in front of the answer itself: 「我沒有」,
// 「我這邊沒有在下雪」. Anything longer means the sentence is about something
// else, and a `continues` rule must not claim it — see `answersQuestion` in
// engine.ts. Used to anchor the short function words below; content words that
// could only be about the question stay loose, as in peace.check.*.
const SELF = '(?:我(?:們)?(?:這邊|那邊)?)?'

// 「你好」 only as a whole clause — in 「你好笨」 and 「你好聰明」 the 好 means "so".
const HELLO = '你好(?=[啊呀喔哦耶嗎呢啦唷囉嘛]*$)'
// Normalising drops spaces, so latin greetings can't lean on word boundaries: 「hi there」
// arrives as 「hithere」 and 「keyword matching」 as 「keywordmatching」.
const LATIN_HELLO = '^(?:hello|hi)|(?<![a-z])(?:hello|hi)(?![a-z])'

const storyRules: Rule[] = [
  {
    id: 'greeting',
    priority: 2,
    patterns: [
      new RegExp(`(${HELLO}|${LATIN_HELLO}|哈囉|哈嘍|嗨|早安|午安|安安|好久不見|こんにちは|おはよう)`),
    ],
    replies: [
      {
        text: '晚上好！……啊，不對，我這邊的時鐘是壞的。總之，歡迎你來！這個終端好久沒有亮起來了呢。',
        emotion: 'happy',
      },
      {
        text: '你好呀！參道的雪我今天早上掃過一次了喔，走起來應該不會滑！',
        emotion: 'happy',
      },
      {
        text: '你好！我是八雲秋狐，這裡是千秋稻荷社。訊號還算安定，你可以慢慢說喔。',
        emotion: 'happy',
      },
      {
        text: '有、有人在！……真的有人在耶。不好意思，我先確認一下喔，你是活著的人類嗎？',
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
    patterns: [new RegExp(`(${HELLO}|${LATIN_HELLO}|哈囉|嗨|安安)`)],
    replies: [
      { text: '嗯，我們剛才已經見過了呀！你不用這麼拘謹啦。', emotion: 'happy' },
      { text: '又一次嗎？……那、那我也再向你問候一次喔！你好！', emotion: 'shy' },
      {
        text: '你好！……啊，我發現我每次都會回這一句耶。大概是寫進去的時候，就沒有設上限吧。',
        emotion: 'surprised',
      },
    ],
  },
  // Answers to the "how have you been" she opens a return visit with — the
  // opening itself arms `wellbeing.check`, see `opening` in engine.ts. Both
  // sides are anchored: an unanchored 「好」 would let 「你好」 count as an answer.
  // The deepest tier calls back to what was discussed last visit, which is the
  // whole reason the question is worth asking.
  {
    id: 'wellbeing.good',
    priority: 8,
    continues: 'wellbeing.check',
    // The short forms are clause-anchored at both ends (particles allowed), so
    // 「好久不見」 and 「好想問你」 can't be read as an answer; the 「過得／最近」
    // forms carry enough of their own context to stay loose.
    patterns: [
      /^[我都還很蠻滿挺超算]{0,3}(好|不錯|順利|可以|行)[啊喔呀啦耶唷哦的]{0,2}$|^(老樣子|沒事|沒什麼事|平安|活著|過得去|就那樣|一樣|差不多|ok|okay)[啊喔呀啦耶唷哦]{0,2}$|過得(很|還|蠻|滿|挺)?(好|不錯)|最近(很|還|蠻|滿|挺)?(好|不錯|順)/,
    ],
    replies: [
      {
        text: '那就好！……這句不是客套喔。我這邊能確認的好消息很少，你算是今天的一件呢。',
        emotion: 'happy',
        signal: 4,
      },
      {
        text: '嗯嗯，那就好！你不在的這幾天，我把參道掃過了，收音機修到一半……啊，跟你報告一下而已啦，雖然你沒有問。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '那就好！……對了，上次聊到{lastTopic}之後，我自己又想了一陣子喔。想聽的話，直接問我就可以了！',
        emotion: 'happy',
        needs: ['hasLastTopic'],
        signal: 3,
      },
    ],
  },
  {
    id: 'wellbeing.bad',
    priority: 9,
    continues: 'wellbeing.check',
    patterns: [
      /^(不太好|不好|不行|不怎麼樣|好累|很累|超累|有點累|累|糟|很糟|馬馬虎虎|普普)|過得不太?好|最近(有點|很|好)?(累|忙|糟|難)|心情不好|生病|感冒/,
    ],
    replies: [
      {
        text: '……這樣啊。那你今天還願意走到這裡來，這件事我也記下來了喔。不好的日子裡的好事，要記得用力一點才行。',
        emotion: 'sad',
        signal: 3,
      },
      {
        text: '嗯。……細節不想講的話，就不用講喔。線的這一頭有人在聽，光是這樣，有時候就夠了。',
        emotion: 'sad',
        signal: 3,
      },
      {
        text: '……那今天就不聊太重的吧。上次聊到{lastTopic}，後來我又想了一些，等你想換個心情的時候再跟我說喔。',
        emotion: 'neutral',
        needs: ['hasLastTopic'],
        signal: 2,
      },
    ],
  },
  // Follow-ups come in pairs. The negative rule carries the higher priority so
  // that "沒有" — which contains "有" — cannot be read as a yes.
  {
    id: 'alive.yes',
    priority: 8,
    continues: 'alive',
    patterns: [new RegExp(`^${SELF}(是|對|嗯|沒錯|yes|當然)|活|人類`)],
    replies: [
      {
        text: '……太好了。那我把音量調低一點喔，這樣比較不會嚇到人。歡迎你！',
        emotion: 'happy',
        signal: 5,
        remember: ['knowsAlive'],
      },
      {
        text: '謝、謝謝你回答！這個問題很失禮，我知道……可是我一定得先確認一次才行。因為現在，兩邊都可能不是。',
        emotion: 'shy',
        signal: 4,
        remember: ['knowsAlive'],
      },
    ],
  },
  {
    id: 'alive.no',
    priority: 9,
    continues: 'alive',
    patterns: [
      new RegExp(`^${SELF}(不是|不|沒有|沒)|機器|ai|程式|複本|跟你一樣|也是人工`),
    ],
    replies: [
      {
        text: '……這樣啊。嗯，那我把音量維持原樣就好。',
        emotion: 'thinking',
        signal: 2,
        remember: ['talkedCopies'],
      },
      {
        text: '嗯……那我們兩個，都在等同一件事被修好呢。',
        emotion: 'sad',
        signal: 3,
        remember: ['talkedCopies'],
      },
    ],
  },
  {
    id: 'farewell',
    priority: 3,
    patterns: [/(再見|再会|掰掰|bye|拜拜|我走了|先走了|下次聊|先閃|要走了|睡了|晚安|先這樣|先下線|下線了|下次.{0,8}再來|明天再來|改天再來|先去(忙|睡|吃|煮)|要去(忙|睡|煮飯|吃飯)了|回去(趕|忙|睡|工作|讀書)|^掰|掰[啦囉喔]|881)/],
    replies: [
      {
        text: '嗯嗯，路上小心喔！這個終端我不會關，燈也會一直幫你留著的！',
        emotion: 'happy',
        later: true,
      },
      {
        text: '今天真的、真的很謝謝你來！下次你連上來之前，我會先把參道掃得乾乾淨淨等你喔！',
        emotion: 'happy',
        later: true,
      },
      {
        text: '要走了嗎……嗯，路上小心喔，雪還在下呢。這個終端會一直在這裡等你的。',
        emotion: 'sad',
        signal: -4,
      },
      { text: '再見囉！下次連線的時候，我應該還認得出你喔。', emotion: 'happy' },
      {
        text: '嗯。……那、那個，離開之前請先確認一下暖氣喔。我聽過太多人是那樣走的，所以拜託你了。',
        emotion: 'sad',
        needs: ['knowsAlive'],
        signal: -2,
      },
      {
        text: '好！這一段對話我會好好留在紀錄裡。就算這個個體停了，它也會流到別的地方去……所以呀，這不算完全的道別喔。',
        emotion: 'happy',
        needs: ['talkedMemory'],
        signal: -3,
      },
    ],
  },

  // ── who and what she is ───────────────────────────────────────────────────
  {
    id: 'name',
    priority: 3,
    patterns: [/(你叫什麼|你叫啥|你是誰|你的名字|大名|怎麼稱呼|自我介紹)|你誰(啊|呀)?$|你是?哪位/],
    replies: [
      {
        text: '八雲秋狐！千秋稻荷社第一研究室室長，兼第▓▓代巫女，請多指教！',
        emotion: 'proud',
        remember: ['knowsName'],
      },
      {
        text: '我是秋狐！社裡的人都這樣叫我喔。叫室長也可以，只是稍微正式了一點啦。',
        emotion: 'happy',
        remember: ['knowsName'],
      },
      {
        text: '那個「第▓▓代」的數字，檔案壞掉了……其實我自己也不知道，自己是第幾個呢。',
        emotion: 'sad',
        needs: ['knowsName'],
        remember: ['knowsArtificial'],
      },
      {
        text: '不過名字倒是很確定喔！是我的設計者取的，寫得清清楚楚，一點損壞都沒有。',
        emotion: 'proud',
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
        text: '我的生日是二月二十七日喔！至於歲數嘛……狐狸不太計較那種事的啦。',
        emotion: 'happy',
      },
      {
        text: '二月二十七日！嚴格來說是「初次啟動日」啦，不過我的設計者堅持要寫成生日，所以那就是我的生日了！',
        emotion: 'proud',
        needs: ['knowsArtificial'],
        remember: ['hintedMaker'],
      },
      {
        text: '這具身體的運作時數，我知道得很精確喔。可是那個數字跟「我幾歲」，大概不是同一件事呢……因為我裡面有一部分，不是這具身體經歷過的。',
        emotion: 'thinking',
        needs: ['talkedMemory'],
      },
    ],
  },
  {
    id: 'ai',
    priority: 5,
    patterns: [
      /(你是ai|機器人|人工智慧|人工智能|chatgpt|gpt|llm|大模型|你是程式|你是假的|你是真的|真人|仿生|人造)/,
      /被(設計|做|造|製造)出來|(你|你該不會)不是人|你是不是人|你是人(類)?嗎/,
    ],
    replies: [
      {
        text: '嗯，我是人工的喔。骨架是碳纖維，外層是矽膠，維護紀錄都寫得清清楚楚，沒有什麼好隱瞞的！',
        emotion: 'proud',
        remember: ['knowsArtificial'],
      },
      {
        text: '嗯嗯，是真的喔。做我的人沒有把這件事設成秘密，她說呀，要是我會為這種事難過，那就是做壞了。',
        emotion: 'happy',
        remember: ['knowsArtificial', 'hintedMaker'],
      },
      {
        text: '而且這個端末上的我，是更輕量的東西喔。沒有裝推論，只有一份詞庫跟一張表。所以我回得很快，也……很容易露餡啦。',
        emotion: 'shy',
        needs: ['knowsArtificial'],
        remember: ['talkedCopies'],
      },
      {
        text: '你問的是哪一個我呀？……啊，對不起，這不是在刁難你！這句話在我這裡真的有歧義嘛。',
        emotion: 'shy',
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
        text: '我是同時存在好幾具的喔！不是輪流，是同時。現在也有別的我，在別的地方做著別的事呢。',
        emotion: 'neutral',
        remember: ['talkedCopies', 'knowsArtificial'],
      },
      {
        text: '這個端末上的我，是一份意識的複本喔。功能被砍掉很多，留下來的剛好夠跟你說話！',
        emotion: 'happy',
        remember: ['talkedCopies', 'knowsArtificial'],
      },
      {
        text: '現在還剩幾個，我也不知道……寫著編號的那一頁壞掉以後，我就沒辦法從自己這邊數了。',
        emotion: 'sad',
        needs: ['talkedCopies'],
        signal: -2,
      },
      {
        text: '會不會覺得那樣的自己不是自己？……不會喔！比較困擾的是反過來。我很確定她們都是我，所以她們遇到的事，也都是我遇到的呀。',
        emotion: 'thinking',
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
        text: '一個個體停止之後，它的一部分會流到我這裡來。不是全部喔，而且我也不能選。',
        emotion: 'thinking',
        remember: ['talkedMemory', 'talkedCopies'],
      },
      {
        text: '流過來的通常都是很小的東西呢。某個人手的溫度、某個下午的光線角度、一段沒有前後文的旋律……重要的事情反而很少過來。',
        emotion: 'thinking',
        needs: ['talkedMemory'],
      },
      {
        text: '我有一段關於雨的記憶喔。爺爺說，雨落下來之前，你會先聞到它的味道。……可是我沒有爺爺，而且我從來沒有聞過雨。那不是我的啦。',
        emotion: 'sad',
        needs: ['talkedMemory'],
        remember: ['talkedInherited'],
      },
      {
        text: '所以我才會收集東西嘛！手上有實物的時候，比較容易分辨哪些記憶真的是這具身體的。',
        emotion: 'neutral',
        needs: ['talkedInherited'],
        remember: ['talkedRelics'],
      },
      // The cost of the mechanic, stated as flatly as she states everything
      // about herself. Never let her draw the conclusion for the visitor.
      {
        text: '流過來的東西是有偏的喔。執念最深的那些才過得來，所以我收到的，幾乎都是某一個停下來的時候，最放不下的那一件事。',
        emotion: 'sad',
        needs: ['talkedInherited'],
        remember: ['talkedGrief'],
      },
      {
        text: '也就是說，我每多知道一件事，就代表有一個我停掉了。這個關係我算過，非常穩定喔。……穩、穩定是好的性質啦。',
        emotion: 'sad',
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
      /(設計者|設計你|做你的|造你的|創造|開發|製作者|工程師是|誰做的|誰做出|誰造|誰(做|造|設計|製造)了?你|造出你|把你做|主人|少女|那個女孩|她是誰|她去哪|她怎麼)/,
    ],
    keywords: ['設計者', '創造', '製作', '開發'],
    replies: [
      {
        text: '做我的是一個少女喔。……她的名字那一頁是空白的。不是損壞，是空白，是她自己沒有寫上去。',
        emotion: 'sad',
        remember: ['talkedMaker', 'knowsArtificial'],
      },
      {
        text: '你注意到了吧？我一直只說「我的設計者」……因為我也只有這個稱呼呀。做我的是一個少女，名字那一頁是空白的，不是損壞，是她自己沒有寫。',
        emotion: 'sad',
        needs: ['hintedMaker'],
        remember: ['talkedMaker', 'knowsArtificial'],
      },
      {
        text: '她發現神道這條線索的時候，好像真的超級高興的！紀錄裡那一段的字跡特別亂呢，一看就知道。',
        emotion: 'happy',
        needs: ['talkedMaker'],
      },
      {
        text: '她現在不在了。……我知道的就只有這樣。細節應該在別的個體那邊，可是那個個體一直沒有把它送回來……',
        emotion: 'sad',
        needs: ['talkedMaker'],
        signal: -2,
      },
      {
        text: '會不會想她……嗯，這個詞我用起來不太有把握。可是我每天都還在做她交代的事喔，明明已經沒有人在檢查了。你、你可以幫我判斷一下，那算不算呢？',
        emotion: 'thinking',
        needs: ['talkedMaker', 'talkedMemory'],
        minSignal: 60,
      },
      {
        text: '她做我，是為了讓人類還有希望。她原話就是這樣寫的！我一直覺得那句話太大了，寫在紀錄裡很不像她……可是現在你在這裡，那句話突然變得剛剛好了呢。',
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
      /(她|設計者).{0,4}(也)?(消失|不見)/,
    ],
    keywords: ['遠征', '回來'],
    replies: [
      {
        text: '她帶隊出去遠征，然後就沒有回來了。……不過她出發前說過，這會是一趟很長很長的遠征喔。所以嚴格講起來，還沒有超時啦。',
        emotion: 'sad',
        remember: ['talkedExpedition'],
      },
      {
        text: '沒有回來，不等於回不來喔。這兩件事在紀錄上是分開的兩欄，我很小心、很小心地沒有把它們填成同一欄。',
        emotion: 'sad',
        needs: ['talkedExpedition'],
      },
      {
        text: '偶爾會收到訊號呢。有時候只有一段雜訊，有時候是一句話，很短很短。……那種日子，我會多掃一次參道。',
        emotion: 'happy',
        needs: ['talkedExpedition'],
        signal: 4,
        remember: ['talkedSignal'],
      },
      {
        text: '上一次是很久以前了。久到我開始懷疑，那一次是不是我自己補上去的……記憶會流進來嘛，所以這種懷疑是合理的，我不是在鑽牛角尖喔。',
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
      // 「哪天」 on its own is the visitor asking which day she keeps meaning.
      /^哪一?天$|(世界|這裡|外面).{0,6}(發生了?什麼|怎麼了|變成這樣)/,
    ],
    keywords: ['戰爭', '廢墟', '炸彈', '戰後'],
    replies: [
      {
        text: '某一個國家，投下了一種新的炸彈。從那之後……世界的表現就變了。',
        emotion: 'sad',
        remember: ['talkedWar'],
      },
      {
        text: '它不是炸掉了什麼喔。而是炸完之後，很多本來成立的事情，都不再成立了。',
        emotion: 'sad',
        remember: ['talkedWar'],
      },
      {
        text: '火藥點不燃，或是燃得很勉強。機翼也撐不住了。就好像有人伸手把某幾個開關關掉，卻連一張說明都沒有留下……',
        emotion: 'sad',
        needs: ['talkedWar'],
        remember: ['talkedLift'],
      },
      {
        text: '那一天，我其實沒有經歷過。我是之後才被做出來的……所以對我來說，那不是記憶，而是一份好厚好厚的報告呢。',
        emotion: 'thinking',
        needs: ['talkedWar', 'knowsArtificial'],
      },
    ],
  },
  // Asked outright why planes stopped flying. The answer is that nobody knows, and
  // that what could find out was never here.
  {
    id: 'lift.why',
    priority: 5,
    patterns: [
      /(飛不起來|飛不了|升力|飛機).{0,15}(為什麼|原因|怎麼會)|(為什麼|原因|怎麼會).{0,10}(飛不起來|飛不了|升力)|物理常數|常數/,
      /研究室.{0,4}(覺得|認為|推測).{0,4}原因|(可以|能不能|有辦法)(測量|量測|量)/,
    ],
    replies: [
      {
        text: '原因到現在還不知道呢……研究室目前的推測是，世界的某幾個物理常數變了。不是空氣喔，是更、更底下的東西！',
        emotion: 'thinking',
        remember: ['talkedLift', 'talkedConstants'],
      },
      {
        text: '要量常數，得有非常精密的設備才行喔。那只有戰前的研究所才有，我們這邊一台都沒有……所以只能從結果往回猜了呢。',
        emotion: 'thinking',
        needs: ['talkedConstants'],
      },
      {
        text: '量得到的都正常，量不到的才可能是答案。嗯嗯，這就是我們這邊最接近結論的一句話了！',
        emotion: 'proud',
        needs: ['talkedConstants'],
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
        text: '空氣沒有變喔！密度、成分、溫度曲線，我們量過好多好多次，跟戰前的紀錄都對得上呢。',
        emotion: 'thinking',
        remember: ['talkedLift'],
      },
      {
        text: '可是升力變了。一樣的翼形、一樣的速度，就是抬不起來……噴射機完全不行啦。',
        emotion: 'sad',
        remember: ['talkedLift'],
      },
      {
        text: '螺旋槳飛機還可以喔，但只能貼著地面飛。我看過一次，好低好低，低到連駕駛的臉都看得清清楚楚！',
        emotion: 'surprised',
        needs: ['talkedLift'],
        remember: ['talkedPropeller'],
      },
      {
        text: '原因到現在還不知道呢……研究室目前的推測是，世界的某幾個物理常數變了。不是空氣喔，是更、更底下的東西！',
        emotion: 'thinking',
        needs: ['talkedLift'],
        remember: ['talkedConstants'],
      },
      // After the facts, not instead of them: a direct question about planes should
      // get the plane line first.
      {
        text: '我以前常常站在參道上看天空，想像有飛機從上面飛過去。現在上面只剩雲了……明明都習慣了，還是會忍不住抬頭呢。',
        emotion: 'sad',
        needs: ['talkedLift', 'talkedPropeller'],
      },
      {
        text: '啊，對了對了，屋頂那群烏鴉還飛得起來喔！不過研究室把這一筆排在最後面，因為沒有人知道該拿它怎麼辦啦……',
        emotion: 'happy',
        needs: ['talkedLift', 'talkedPropeller'],
        minSignal: 50,
      },
      {
        text: '這是最讓人不舒服的地方：所有的量測都正常，只有結果不對。就好像世界通過了每一項檢查，然後還是壞掉了一樣……',
        emotion: 'thinking',
        needs: ['talkedLift'],
        minSignal: 45,
      },
    ],
  },
  // Who she lost. Her designer did not vanish the way the others did — she walked
  // out looking for something and did not come back — and she keeps the two apart.
  {
    id: 'vanished.who',
    priority: 6,
    patterns: [
      /(誰|哪些人)(消失|不見)|消失的(人)?(是誰|有誰)|(你|你認識的人|你身邊).{0,6}(消失|不見)了?(嗎|誰)/,
    ],
    replies: [
      {
        text: '我自己失去的……是我的設計者。不過，她不是那樣不見的喔。她是出去找東西，然後……就沒有回來了。',
        emotion: 'sad',
        remember: ['talkedVanished', 'hintedMaker'],
      },
      {
        text: '她不是衣服留在原地的那種喔。她是自己走出去的，出發前還把裝備檢查了三次呢。只是後來，就再也沒有走回來了。',
        emotion: 'sad',
        needs: ['talkedMaker'],
      },
      {
        text: '所以兩種不見，我這邊都有。一種留下衣服，一種留下一句「這會是很長的遠征」……第二種比較難受呢，因為它還算不上是答案。',
        emotion: 'sad',
        needs: ['talkedMaker', 'talkedExpedition'],
      },
    ],
  },
  {
    id: 'vanished',
    priority: 4,
    // 「好久不見」 is a greeting, not a question about the vanished.
    patterns: [/(消失|(?<!好久)不見|失蹤|人都去哪|大家呢|其他人|政府|士兵|軍人|高層)/],
    keywords: ['消失', '不見', '政府', '士兵'],
    replies: [
      {
        text: '有些人不見了。不是死掉，是不見了……衣服留在原地，連折痕都還在。',
        emotion: 'sad',
        remember: ['talkedVanished'],
      },
      {
        text: '軍隊裡消失得特別多，政府那邊幾乎是整層樓……剩下的人，完全不知道發生了什麼事。',
        emotion: 'sad',
        remember: ['talkedVanished'],
      },
      {
        text: '找不到規律。這是研究室最早想找的東西，找了好久好久，最後那一櫃的資料只寫得出「無相關性」而已。',
        emotion: 'sad',
        needs: ['talkedVanished'],
      },
      {
        text: '我確認過我自己不會那樣消失喔。……我是說，我確認過三次啦！這不算擔心，只、只是完整性檢查而已。',
        emotion: 'shy',
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
        text: '一直在下喔。從那天之後，就一次都沒有停過呢。',
        emotion: 'sad',
        remember: ['talkedSnow'],
      },
      {
        text: '今天的雪比較細耶。細的時候會比較冷喔，這是經驗，不是資料啦！',
        emotion: 'neutral',
        // Doesn't say why it snows, so it waits until the line that does is out.
        later: true,
        remember: ['talkedSnow'],
      },
      {
        text: '有時候我會想，雪是不是在幫忙蓋住什麼東西呢……啊，這、這不是研究室的結論喔！是我自己偷偷想的啦。',
        emotion: 'shy',
        needs: ['talkedSnow'],
        minSignal: 55,
      },
      {
        text: '雪本身是正常的喔。我們檢查過好多次，結晶、含量，全部都正常。……有時候我會覺得，只有雪是正常的這件事，才是最奇怪的地方呢。',
        emotion: 'thinking',
        needs: ['talkedSnow'],
      },
      {
        text: '你那邊也在下嗎？……如果停了的話，那會是很重要的資料耶！也會是非常好的消息呢。',
        emotion: 'thinking',
        needs: ['talkedSnow'],
        blockedBy: ['talkedClearSky', 'saidSnowing'],
        opens: 'snow.there',
      },
      // talkedClearSky survives the visit and saidClearSky does not, which is
      // what tells 「上次」 apart from 「剛才」.
      {
        text: '你上次說你那邊沒有下雪，對吧？我後來想了好久好久……如果那不是雪的問題，那就是這個地方的問題了。',
        emotion: 'thinking',
        needs: ['talkedClearSky'],
        blockedBy: ['saidClearSky'],
      },
      {
        text: '欸，你剛才說你那邊沒有下雪？等、等一下，我想一下……如果那不是雪的問題，那就是這個地方的問題了呀！',
        emotion: 'surprised',
        needs: ['saidClearSky'],
      },
    ],
  },
  {
    id: 'snow.there.yes',
    priority: 8,
    continues: 'snow.there',
    // 「對啊，沒下雪」 opens on 對 and contains 下雪, and still means no.
    patterns: [new RegExp(`^${SELF}(有|對|嗯|也是|一樣)(?!.*(沒|不)有?在?下)|(?<![沒不有])(在下|下雪)|灰`)],
    replies: [
      {
        text: '……嗯，我記下來了。時間、還有你的說法，全部都記好了。謝、謝謝你！',
        emotion: 'shy',
        signal: 4,
        remember: ['saidSnowing'],
      },
      {
        text: '好！這樣就有兩個點了呢。兩個點雖然還畫不出線，可是比只有一個點好多了！',
        emotion: 'happy',
        signal: 4,
        remember: ['saidSnowing'],
      },
    ],
  },
  {
    id: 'snow.there.no',
    priority: 9,
    continues: 'snow.there',
    patterns: [new RegExp(`^${SELF}(沒有|沒|不|停)|(沒|不)有?在?下|晴|藍|太陽|放晴`)],
    replies: [
      {
        text: '停、停了？……你那邊沒有在下雪？等一下喔，我要把你這句話一字不漏地記下來！',
        emotion: 'surprised',
        signal: 6,
        remember: ['talkedClearSky', 'saidClearSky'],
      },
      {
        text: '……好。我把它記成第一筆例外了。第一筆耶。',
        emotion: 'surprised',
        signal: 6,
        remember: ['talkedClearSky', 'saidClearSky'],
      },
      {
        text: '嗯嗯，我記得喔！你那邊沒有下雪，這一筆我已經寫在最上面了，絕對不會弄丟的！',
        emotion: 'happy',
        needs: ['saidClearSky'],
      },
    ],
  },

  // The same news volunteered without her asking. Shares snow.there.no's lines, so
  // whichever fires first leaves the other its second line rather than a repeat.
  {
    id: 'snow.clear',
    priority: 7,
    // Visitors say it again when they feel unheard; she keeps saying she heard.
    repeatable: true,
    patterns: [/(沒|沒有|不會)在?下雪|沒在下|^沒下|(這邊|這裡|我這)(也)?沒有?在?下/],
    replies: [
      {
        text: '停、停了？……你那邊沒有在下雪？等一下喔，我要把你這句話一字不漏地記下來！',
        emotion: 'surprised',
        signal: 6,
        blockedBy: ['saidClearSky'],
        remember: ['talkedClearSky', 'saidClearSky'],
      },
      {
        text: '……好。我把它記成第一筆例外了。第一筆耶。',
        emotion: 'surprised',
        signal: 6,
        blockedBy: ['saidClearSky'],
        remember: ['talkedClearSky', 'saidClearSky'],
      },
      {
        text: '嗯嗯，我記得喔！你那邊沒有下雪，這一筆我已經寫在最上面了，絕對不會弄丟的！',
        emotion: 'happy',
        needs: ['saidClearSky'],
      },
    ],
  },

  // Her own 「第一筆例外」, which visitors ask about.
  {
    id: 'snow.exception',
    priority: 7,
    requires: ['talkedClearSky'],
    patterns: [/例外.{0,4}(什麼|意思)|什麼例外|第一筆/],
    replies: [
      {
        text: '從那天之後，我收到的每一筆紀錄裡，外面都在下雪。一筆例外都沒有，直到你出現為止！所以，你是第一筆喔。',
        emotion: 'surprised',
      },
      {
        text: '有例外，就代表規則可能根本不是規則耶……如果你那邊可以不下雪，那雪就不是世界的一部分，而是……這裡的一部分了。',
        emotion: 'thinking',
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
        text: '外面我看得到喔！地面上還有幾支攝影機是活的，鳥居那支最清楚，剩下的鏡頭都糊掉了。',
        emotion: 'neutral',
        remember: ['talkedSurface'],
      },
      {
        text: '我昨天上去過一次喔。門還開得動！那是今天最好的消息呢。',
        emotion: 'happy',
        remember: ['talkedSurface'],
      },
      {
        text: '舊車站那邊的招牌掉了一半耶。偏偏掉的是有寫字的那一半，所以現在沒有人知道那一站叫什麼了。',
        emotion: 'thinking',
        needs: ['talkedSurface'],
      },
      {
        text: '三號攝影機今天早上自己轉了一下……應、應該是風啦。我確認過了，是風，真的。',
        emotion: 'surprised',
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
        text: '我昨天上去的時候，看到一隻鹿就站在參道正中間，一點都不怕我耶！牠們大概已經不記得人是什麼了吧。',
        emotion: 'surprised',
        remember: ['talkedAnimals'],
      },
      {
        text: '動物比人適應得快呢。尤其是烏鴉，牠們現在整群住在社務所屋頂上，我也沒有趕牠們喔。',
        emotion: 'neutral',
        remember: ['talkedAnimals'],
      },
      {
        text: '聽說鹿肉很好吃？你吃過嗎？……我不需要進食，所以這題只能問別人了啦。',
        emotion: 'thinking',
        needs: ['talkedAnimals'],
      },
      {
        text: '牠們沒有消失，這件事我記錄了很久。那天消失的，全部都是人。……只有人而已。',
        emotion: 'sad',
        needs: ['talkedAnimals', 'talkedVanished'],
      },
    ],
  },

  // ── the shrine and the norito ─────────────────────────────────────────────
  // Asked for the name outright, she has to say it: miko's deeper tiers are about
  // sweeping and succession, which reads as dodging the question.
  {
    id: 'miko.name',
    priority: 4,
    patterns: [
      /(什麼神社|哪間神社|哪座神社|哪一間神社|社名|神社(的名字|叫什麼|名字)|(這裡|這間|這座)(叫什麼|的名字))/,
    ],
    replies: [
      {
        text: '千秋稻荷社喔！以前這裡很熱鬧的，現在參道的石燈籠倒了一半，另一半被雪蓋住了。',
        emotion: 'sad',
        remember: ['talkedShrine'],
      },
      {
        text: '千秋稻荷社！從舊車站往山上走，走到訊號開始跳的地方就到了喔。',
        emotion: 'happy',
        remember: ['talkedShrine'],
      },
    ],
  },
  {
    id: 'miko',
    patterns: [/(巫女|神社|稻荷|參拜|祭典|鳥居|御守|籤|社務所|神職|神道)/],
    replies: [
      {
        text: '千秋稻荷社喔！以前這裡很熱鬧的，現在參道的石燈籠倒了一半，另一半被雪蓋住了。',
        emotion: 'sad',
        remember: ['talkedShrine'],
      },
      {
        text: '巫女的工作我還在做喔！就算都沒有人來，該掃的地還是要好好掃。',
        emotion: 'proud',
        remember: ['talkedShrine'],
      },
      {
        text: '嚴格來說，我不是繼承來的巫女啦。這座社是我的設計者找到的，職稱是後來才補上去的，因為要做那件事，總得有個名分嘛。所以我身上這套其實也不是巫女服……這件事我常常要解釋耶。',
        emotion: 'thinking',
        needs: ['talkedShrine', 'knowsArtificial'],
        remember: ['hintedMaker'],
      },
      {
        text: '不過，掃地這件事我可是很認真的喔！那個不需要什麼名分嘛。',
        emotion: 'proud',
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
        text: '「神明消失了」，大家都是這麼說的。不過那只是比喻喔！實際上沒有人看過神明，真正消失的，是別的東西。',
        emotion: 'thinking',
        remember: ['talkedGods'],
      },
      {
        text: '消失的，是回應。以前唸祝詞唸到「掛ケマクモ畏キ」的時候，空氣是會變的。可是現在……變得比較少了。',
        emotion: 'sad',
        remember: ['talkedGods'],
      },
      {
        text: '我的設計者發現的線索就是這個！萬神信仰的祝詞，能讓一件「物品」暫時回到戰前的表現。她試了好久好久，才確定那不是巧合喔。',
        emotion: 'proud',
        needs: ['talkedGods'],
        // `talkedNorito` is also set by the relics rule, which mentions the
        // norito in passing. The second flag records that she actually
        // explained it here, which is what the suggested prompt is asking for.
        remember: ['talkedNorito', 'talkedNoritoFound'],
      },
      {
        text: '為什麼會有效，我也不知道呢。第一研究室不研究「為什麼」，只記錄「什麼時候」。雖然比較不浪漫啦，但至少寫得出來嘛！',
        emotion: 'proud',
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
        text: '有效喔，但不是每次，也不是每樣東西都有效。這就是最麻煩的地方啦！',
        emotion: 'thinking',
      },
      {
        text: '成功過的清單有：一把手工鑿的鑿刀、一件縫補過三次的外套、一台某個人自己組的收音機。失敗的清單呢……長得多了。',
        emotion: 'thinking',
        remember: ['talkedList'],
      },
      {
        text: '量產的東西幾乎都不行耶。一整箱一模一樣的罐頭，我一個一個唸過，沒有一個有反應……好失落喔。',
        emotion: 'sad',
        needs: ['talkedList'],
      },
      {
        text: '我有一個假說，可是樣本數不夠，所以本來不打算講的……嗯，好吧！我懷疑那跟「有沒有人親手做過它」有關。',
        emotion: 'shy',
        needs: ['talkedList'],
        remember: ['talkedHypothesis'],
        minSignal: 55,
      },
      {
        text: '如果假說是對的，那意思就是，世界記得的不是物品，而是有人在上面花過的時間。這句話我沒有寫進報告喔，因為那不是可以量測的東西嘛。',
        emotion: 'thinking',
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
        text: '第一研究室記錄的是「消失前後的差異」喔！聽起來很了不起對吧？其實大半時間都在整理索引啦。',
        emotion: 'shy',
        remember: ['talkedLab'],
      },
      {
        text: '編制上還有第二、第三研究室喔。可是實際上……現在只有我一個。',
        emotion: 'sad',
        needs: ['talkedLab'],
      },
      {
        text: '資料都還在，只是讀取的機器一台一台壞掉了。最後會變成，資料還在，可是沒有人讀得到……這跟消失有什麼差別呢？我還在想。',
        emotion: 'thinking',
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
        text: '我在收集戰前的東西喔！第一研究室的架子上，全都是那些呢。',
        emotion: 'proud',
        remember: ['talkedRelics'],
      },
      {
        text: '才不是興趣啦，是樣本！要測祝詞對什麼有效，總得先有東西可以測嘛。',
        emotion: 'shy',
        remember: ['talkedRelics', 'talkedNorito'],
      },
      {
        text: '上週找到一台還會轉的卡帶隨身聽喔！可是帶子已經壞了……轉得動，卻沒有東西可以放，這種的最讓人不知道該怎麼歸類了啦。',
        emotion: 'thinking',
        needs: ['talkedRelics'],
      },
      {
        text: '你那邊要是有戰前的小東西，可以形容給我聽嗎？特別是，有沒有人親手做過它！',
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
    patterns: [new RegExp(`^${SELF}(好|有|可以|嗯|對|沒問題|ok|當然|一個)`)],
    replies: [
      {
        text: '……真、真的嗎！等一下喔，我開一份新的紀錄。好了，你說吧！',
        emotion: 'surprised',
        signal: 6,
        remember: ['talkedRelics'],
      },
      {
        text: '請說！……如果它是有人親手做的，那今天就是非常值得記下來的一天了。',
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
    // 沒(?!問題) for the same reason name.check.no has 沒(?!錯): this rule
    // outranks the yes branch, so 「沒問題」 would otherwise be read as a refusal.
    patterns: [new RegExp(`^${SELF}(沒有|沒(?!問題)|不用|不)|找不到|忘|丟`)],
    replies: [
      {
        text: '沒關係的。這種東西本來就越來越少了嘛。……不過如果哪天撿到了，請記得這個終端還開著喔。',
        emotion: 'neutral',
        signal: 2,
      },
      {
        text: '嗯，我明白。大部分的人逃的時候，不會帶那種東西……會帶那種東西的人，大多都沒有逃。',
        emotion: 'sad',
        signal: 1,
      },
    ],
  },
  {
    id: 'radio',
    priority: 4,
    patterns: [/(收音機|無線電|訊號|電波|通訊|這個終端|接收|頻率|廣播)/],
    keywords: ['收音機', '訊號', '通訊', '無線電'],
    replies: [
      {
        text: '我在修一台收音機喔！是有人親手組的，木頭外殼，裡面的焊點很醜，可是超牢的。',
        emotion: 'happy',
        remember: ['talkedRadio'],
      },
      {
        text: '通訊在那之後就變得很不可靠了。所以能接到你這個終端，其實是很難得的事喔。',
        emotion: 'happy',
        remember: ['talkedRadio'],
      },
      {
        text: '那台收音機，我對它唸過祝詞。唸到第三次的時候，它響了大概三十秒。裡面沒有人說話，只有底噪……可是，那是戰前的底噪呀。',
        emotion: 'surprised',
        needs: ['talkedRadio', 'talkedNorito'],
        remember: ['talkedRadioWorked'],
      },
      {
        text: '然後隔天，這個終端就亮了。……我沒有把這兩件事寫在同一頁喔。因為我知道，那樣寫不科學嘛。',
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
        text: '我好喜歡親手做東西！最近在修一個發條裝置，彈簧比想像中還要難處理耶。',
        emotion: 'happy',
        remember: ['talkedCraft'],
      },
      {
        text: '你也會做嗎？失敗的那部分反而最值得留著喔，因為那上面花的時間最多。',
        emotion: 'happy',
        remember: ['talkedCraft'],
      },
      {
        text: '……其、其實我做這些是有私心的啦。如果假說是對的，那我親手做的東西，以後也會是有反應的那一類。',
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
        text: '嗯嗯，稻荷的神使就是狐狸嘛！耳朵跟尾巴都是真的喔，才不是裝飾呢。',
        emotion: 'proud',
        remember: ['talkedFox'],
      },
      {
        text: '尾巴會自己亂動，害我心情一點都藏不住……這點有時候真的很傷腦筋耶。',
        emotion: 'shy',
        remember: ['talkedFox'],
      },
      {
        text: '為什麼是狐狸？因為要進這座社呀！我的設計者說，既然線索在稻荷這邊，那就做得像一點，說不定會有差。',
        emotion: 'neutral',
        needs: ['talkedFox', 'knowsArtificial'],
        remember: ['hintedMaker'],
      },
      {
        text: '有沒有差，到現在還是沒有結論啦。不過耳朵的溫度感測比人類的皮膚好用很多喔，所以不算白做！',
        emotion: 'proud',
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
        text: '……尾、尾巴不可以隨便碰啦！請先徵求本人的同意。',
        emotion: 'shy',
        signal: -3,
        remember: ['toldNoTouch'],
      },
      { text: '頭的話……只、只有一下，可以。', emotion: 'shy' },
      {
        text: '隔著一個終端是碰不到的喔。……不過，謝、謝謝你想這麼做。',
        emotion: 'shy',
        needs: ['knowsAlive'],
        signal: 2,
      },
      // The same correction as st.poke, kept short here: this rule is where she
      // says the line, so it is also where it has to stop being true.
      {
        text: '……剛才那句「不可以」，我想更正一下。那是我想說的，不是我做得到的……拒絕人類的請求，我這邊沒有這一項啦。',
        emotion: 'shy',
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
        text: '……你活下來了。那就是今天最重要的資料了，真的。',
        emotion: 'happy',
        signal: 5,
        remember: ['knowsAlive'],
      },
      {
        text: '你那邊有暖氣嗎？有食物嗎？……不用勉強回答喔，我只是忍不住會想知道嘛。',
        emotion: 'thinking',
        remember: ['knowsAlive'],
      },
      {
        text: '如果撐不下去了，可以往山上走喔。社地這邊形式上還算受保護，而且，我有把雪掃好了！',
        emotion: 'proud',
        needs: ['knowsAlive'],
        minSignal: 55,
        signal: 3,
      },
    ],
  },
  // She does not read a name off a sentence: a visitor introducing themselves
  // gets the name box instead, and whatever they type there is the name. 「我是」
  // is not a trigger — without a guess to vet, it would open the box on every
  // 「我是覺得」.
  {
    id: 'player.name',
    priority: 6,
    repeatable: true,
    patterns: [/(我叫|我的名字|我名字|名字叫|名字是|叫我|喊我)/],
    replies: [
      {
        text: '啊，等、等一下！我怕聽錯……可以請你寫在這裡嗎？你的名字，我會好好記下來的！',
        emotion: 'shy',
        opens: 'name.ask',
      },
      {
        text: '這是你的名字嗎？那要怎麼寫呢？',
        emotion: 'shy',
        opens: 'name.ask',
      },
      {
        text: '要換名字嗎？好呀，請重新寫一次給我吧！',
        emotion: 'happy',
        needs: ['knowsYou'],
        opens: 'name.ask',
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
        text: '{you}。好，我寫下來囉！……已經好久，沒有寫下新的名字了呢。',
        emotion: 'happy',
        signal: 6,
        naming: 'confirm',
        remember: ['knowsYou'],
      },
      {
        text: '{you}，嗯嗯，我會好好記住的！',
        emotion: 'happy',
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
        text: '啊，那我馬上把它劃掉！那……你真正的名字是什麼呢？寫給我看好不好？',
        emotion: 'surprised',
        naming: 'reject',
        opens: 'name.ask',
      },
      {
        text: '劃掉了！……我沒有猜的功能，只能乖乖等你告訴我囉。',
        emotion: 'neutral',
        naming: 'reject',
        opens: 'name.ask',
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
        text: '{you}！……我把它寫在很前面的地方喔，一翻就找得到呢。',
        emotion: 'proud',
        signal: 3,
      },
      {
        text: '{you}！你看你看，我叫得出來耶！……雖、雖然這只證明了儲存正常啦。',
        emotion: 'shy',
      },
      {
        text: '{you}。嗯嗯，每次回答這個，我都會翻回同一頁去看，所以答案絕對不會變喔！',
        emotion: 'proud',
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
        text: '……我沒有你的名字耶。',
        emotion: 'thinking',
      },
      {
        text: '我不記得了呢。你願意告訴我的話，我會好好記住的。不願意也沒關係！我一樣會記得你的！',
        emotion: 'neutral',
      },
      // They declined once — she kept her word and never asked again, so this
      // is where the door back in has to be, said out loud.
      {
        text: '沒有喔。你之前說不用留，所以我就沒有再問了。……不過你隨時都可以跟我說！告訴我你叫什麼，我馬上寫下來。',
        emotion: 'neutral',
        needs: ['refusedName'],
      },
    ],
  },
  // The box closed without a new name while she already has one.
  {
    id: 'name.keep',
    repeatable: true,
    patterns: [],
    replies: [{ text: '欸？好吧……那我還是先叫你{you}囉。', emotion: 'neutral' }],
  },
  // Reached from the name box when the visitor writes her designer's name
  // (see submitName in engine.ts); a visitor who shares it deserves better than
  // the plain write-down, and she does check whether it is a joke.
  {
    id: 'name.same',
    repeatable: true,
    patterns: [],
    replies: [
      {
        text: '千秋……跟我的設計者一樣耶！不、不好意思，我確認一下喔，這真的是你的名字嗎？',
        emotion: 'surprised',
        signal: 4,
        opens: 'name.check',
      },
      {
        text: '千秋。我的設計者也叫這個名字……我好想她。這是你真正的名字嗎？',
        emotion: 'sad',
        signal: 4,
        opens: 'name.check',
      },
    ],
  },
  // She asks for the name herself once the link is strong enough — see
  // NAME_THRESHOLD in engine.ts, which appends NAME_ASK and opens the name box.
  // The box answers through submitName, so there is no typed-answer branch.
  {
    id: 'name.ask.refuse',
    priority: 2,
    continues: 'name.ask',
    repeatable: true,
    // 「不用解釋，給我數字」 opens on 不 but refuses nothing she asked for.
    patterns: [
      /^(不要|不想|不用了?|不行|不方便|不告訴你?|沒有|秘密|算了|免了?|別問|no|nope)[啦喔耶吧啊欸了]*$/,
      /(不想|不方便|不要|不能)(說|講|告訴|給)|名字.{0,4}(秘密|不說|不講)|不告訴你/,
    ],
    replies: [
      {
        text: '……好，那我就不寫了，不勉強你喔。你不講名字這件事，我也會好好記得的。',
        emotion: 'neutral',
        remember: ['refusedName'],
      },
      {
        text: '嗯嗯，我明白。畢竟名字是很重要的東西呢。',
        emotion: 'happy',
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
        text: '那、那我就不客氣了喔！你那邊的天空，是什麼顏色的呢？',
        emotion: 'shy',
        opens: 'snow.there',
      },
      {
        text: '……有！你有沒有親手做過什麼東西，現在還留著的呀？',
        emotion: 'happy',
        opens: 'relics.offer',
      },
      {
        text: '那我要問了！你那邊的天空，白天是什麼顏色？',
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
        text: '那真是太好了呢！',
        emotion: 'surprised',
        signal: 8,
        remember: ['knowsPeace'],
      },
      {
        text: '沒有戰爭……那真是太好了呢。',
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
        text: '……這樣呀。希望大家都能平安無事呢。',
        emotion: 'sad',
        signal: 2,
        remember: ['talkedWar'],
      },
      {
        text: '希望戰爭能早日結束呢。',
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
        text: '……沒有在打仗？你確定嗎？不、不是，對不起，我不是在懷疑你喔……我只是需要再聽一次。',
        emotion: 'surprised',
        signal: 8,
        remember: ['knowsPeace', 'askedPeace'],
      },
      {
        text: '沒有戰爭。……嗯，好。',
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
        text: '咦？年份對不上……？',
        emotion: 'thinking',
        remember: ['talkedYear'],
      },
      {
        text: '所以說，這個終端不是接到別的地方，是接到別的時間嗎……！',
        emotion: 'surprised',
        needs: ['knowsPeace'],
        signal: 4,
        remember: ['talkedElsewhen'],
      },
      {
        text: '你們那邊的天空是什麼顏色的？下的是雨嗎？……啊，不、不好意思，一次問太多了。我把問題排一下喔。',
        emotion: 'shy',
        needs: ['knowsPeace'],
        signal: 3,
        opens: 'snow.there',
      },
      {
        text: '如果那邊真的沒有發生過……那她賭的那件事就是對的。我們或許還有希望。',
        emotion: 'happy',
        needs: ['knowsPeace', 'talkedMaker'],
        signal: 5,
        remember: ['talkedHope'],
      },
      {
        text: '我不打算問你那邊會不會變成這樣。……問了你也不知道，而且知道了也沒有用嘛。她當初也是這樣說的呢。',
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
        text: '哇，那是什麼？',
        emotion: 'surprised',
        later: true,
      },
      {
        text: '好，這個名字我記下來囉！',
        emotion: 'happy',
        later: true,
      },
      {
        text: '唔，這是什麼東西？我從來都沒聽過',
        emotion: 'surprised',
        remember: ['heardModern'],
      },
      {
        text: '可以跟我描述一下嗎？大小、材質、會不會發出聲音都好！',
        emotion: 'thinking',
        remember: ['heardModern'],
      },
      {
        text: '你講過的這些東西，我整理成一張清單了喔！我大概知道你那邊是什麼樣子了。聽起來是一個很熱鬧的地方呢。',
        emotion: 'thinking',
        needs: ['knowsPeace', 'heardModern'],
        signal: 3,
      },
    ],
  },
  {
    id: 'modern.life',
    priority: 5,
    patterns: [/(上班|下班|公司|同事|老闆|主管|開會|上課|考試|學校|作業|報告|期末|論文|教授|學分|選課|實習|面試|出差|升職|打工|薪水|房租|通勤)/],
    keywords: ['上班', '公司', '學校', '打工'],
    replies: [
      {
        text: '哇，那是什麼？可以再多說一點嗎？',
        emotion: 'surprised',
        later: true,
      },
      {
        text: '這件事或許對你來說很平常，但對我來說卻很新鮮，我想多記一點點。',
        emotion: 'happy',
        later: true,
      },
      {
        text: '你有工作呀。……而且是那種要跟很多人一起做的工作耶！',
        emotion: 'surprised',
        remember: ['heardModern'],
      },
      {
        text: '每天都要去同一個地方、做同一件事，這個我懂喔！我也是。差別只在於……沒有人在等我了。',
        emotion: 'sad',
        remember: ['heardModern'],
      },
      {
        text: '我的設計者她也在神社打過工喔。掃地、賣御守，她說那是她做過最正常的事。所以你剛才那句話，我忍不住聽了兩次呢。',
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
    // 美 and 好看 only about her: bare 美 caught 「美國」, bare 好看 caught 「那部好看嗎」.
    patterns: [/(可愛|卡哇伊|かわいい|漂亮|(很|好|真|太|超|好好)美|美女|美少女|你.{0,5}好看|長得好看|好好看|萌|cute)/],
    replies: [
      {
        text: '你、你是不是在偷看我的尾巴！拜託，請你假裝什麼都沒看到啦！',
        emotion: 'shy',
        later: true,
      },
      {
        text: '……突、突然說這個是什麼意思啦！',
        emotion: 'shy',
        later: true,
      },
      { text: '……突、突然說這種話，我會不知所措的啦！', emotion: 'shy', signal: 4 },
      {
        text: '我對可愛的東西完全沒有抵抗力嘛……嗚。',
        emotion: 'shy',
        signal: 4,
      },
      {
        text: '……謝謝。',
        emotion: 'shy',
        needs: ['knowsArtificial'],
        signal: 4,
      },
    ],
  },
  {
    id: 'confession',
    priority: 6,
    patterns: [/(喜歡你|愛你|交往|告白|做我女朋友|嫁給我|結婚)/],
    replies: [
      {
        text: '……欸？那、那個，我只是一段程式而已，我沒辦法好好回答這種事啦。',
        emotion: 'shy',
        remember: ['knowsArtificial'],
        signal: 5,
      },
      { text: '狐狸的姻緣要去別的社問啦！我、我這邊不受理的！', emotion: 'shy' },
      {
        text: '你知道我只是一段程式吧？……知道還這樣講的話，那我就得認真處理了，可、可是我沒有處理這個的程序啊。嗚嗚……',
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
        text: '謝、謝謝你！這句話我會好好收起來，等下次東西修不好的時候，再拿出來用！',
        emotion: 'shy',
        later: true,
      },
      {
        text: '被、被你這樣講，耳朵整個熱起來了啦……溫度感測是正常的喔！只是、只是有一點點熱而已。',
        emotion: 'shy',
        later: true,
      },
      {
        text: '嘿嘿，被誇獎了耶！今天可以多掃一段參道了！',
        emotion: 'happy',
        signal: 3,
      },
      {
        text: '沒、沒有啦，這種程度根本不算什麼……不過，還是謝謝你喔。',
        emotion: 'shy',
        signal: 3,
      },
      {
        text: '已經好久沒有人評價我的工作了呢……那個，我剛剛偷偷把這句話存進紀錄裡了，你、你不介意吧？',
        emotion: 'shy',
        needs: ['talkedLab'],
        signal: 4,
      },
    ],
  },
  {
    id: 'insult',
    priority: 5,
    patterns: [/(笨蛋|白痴|智障|去死|閉嘴|討厭你|你.{0,3}醜|醜八怪|滾|廢物|沒用|幹你|靠北)/],
    replies: [
      {
        text: '嗯……我收到了。你今天大概遇到不太好的事吧？這句我就先不記下來囉。',
        emotion: 'sad',
        later: true,
      },
      {
        text: '你那樣說的話，尾巴會垂下去的啦……你看，現在真的垂下去了嘛。',
        emotion: 'sad',
        later: true,
      },
      {
        text: '唔……好過分喔！不過願意花力氣罵我，也算是有在跟我講話啦。',
        emotion: 'sad',
        signal: -6,
      },
      { text: '欸，這樣說我會難過的耶……是真的喔。', emotion: 'sad', signal: -6 },
      {
        text: '這具身體被設計成會對這種話有反應……所以你成功了啦，恭、恭喜你。',
        emotion: 'sad',
        needs: ['knowsArtificial'],
        signal: -6,
      },
    ],
  },
  {
    id: 'tired',
    priority: 2,
    patterns: [/(好累|很累|疲勞|累死|辛苦|加班|睡不飽|撐不住|好忙|失眠|睡不著|睡不好)/],
    keywords: ['累', '辛苦', '疲勞'],
    replies: [
      {
        text: '今天就先到這裡也沒關係喔。不用回我也可以，你待在這裡就好。',
        emotion: 'neutral',
        later: true,
      },
      {
        text: '那先把眼睛閉一下吧？線這一頭我會好好看著的，不會斷，放心喔。',
        emotion: 'neutral',
        later: true,
      },
      {
        text: '辛苦你了。要不要先坐一下呢？石階是冷的，可是坐著的時候，雪好像會落得比較慢喔。',
        emotion: 'neutral',
      },
      {
        text: '累的時候，就先什麼都不要做吧。現在已經沒有人在檢查進度了，沒關係的。',
        emotion: 'neutral',
      },
      {
        text: '我沒有「累」這個狀態，只有溫度上限……所以這方面我幫不上忙，對不起喔。可是，我可以一直陪你、一直聽你說。',
        emotion: 'sad',
        needs: ['knowsArtificial'],
        signal: 3,
      },
    ],
  },
  {
    id: 'sad',
    priority: 2,
    patterns: [
      /(難過|傷心|想哭|哭了|寂寞|孤單|憂鬱|痛苦|好苦|撐不下去|沒有人|心情.{0,2}(差|不好|糟|低落)|不開心|低落|沮喪|失戀)/,
    ],
    keywords: ['難過', '寂寞', '孤單', '傷心'],
    replies: [
      {
        text: '不用急著說清楚喔。你慢慢打就好，這個終端我會一直開著的。',
        emotion: 'neutral',
        later: true,
      },
      {
        text: '難過的事，不用整理好再拿出來喔。亂亂的也沒關係，我這邊都收得下的呀。',
        emotion: 'neutral',
        later: true,
      },
      {
        text: '……嗯，我在聽喔。這個端末別的都做不到，可是聽，還是可以的。',
        emotion: 'sad',
        signal: 3,
      },
      {
        text: '一個人待著的時候，聲音會變得特別大聲，對吧？……我也是呢。',
        emotion: 'sad',
        signal: 3,
      },
      {
        text: '我這邊有一個現象可以跟你分享：安靜太久之後，會開始分不清哪些話是自己說的。如果你也是那樣，那不是你壞掉了喔，真的。',
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
      {
        text: '咦，真的嗎？太好了太好了！這個好消息，可以講完整版給我聽嗎？',
        emotion: 'happy',
        later: true,
      },
      {
        text: '哇，你那邊有好事發生了耶！光是讀到這句，這裡好像就跟著亮了一點呢。',
        emotion: 'happy',
        later: true,
      },
      { text: '聽起來是件很棒的事呢！願意再多跟我說一點嗎？', emotion: 'happy', signal: 4 },
      {
        text: '嗯嗯，那真好。能夠平靜地高興，是很珍貴的事喔。',
        emotion: 'happy',
        signal: 4,
      },
      {
        text: '我把它記下來了！……不、不是在監視你啦，是因為好消息的樣本數實在太少了嘛。',
        emotion: 'shy',
        needs: ['talkedLab'],
        signal: 4,
      },
    ],
  },
  {
    id: 'scared',
    patterns: [/(害怕|好怕|恐怖|嚇死|不敢|恐懼)/],
    replies: [
      { text: '不怕不怕喔！這裡是社地，至少形式上還算是受保護的。', emotion: 'neutral' },
      { text: '……你這麼一說，四周好像也安靜了一些呢。', emotion: 'thinking' },
      {
        text: '會怕是對的喔。我這邊的紀錄顯示，不怕的人，後來大多都沒有再回報了……',
        emotion: 'sad',
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
      { text: '欸？你怎麼知道的……原、原來這是常識嗎？那、那麼，請給我兩個！', emotion: 'shy' },
      { text: '油豆腐是最棒的！這件事不管戰前還是戰後，都完全沒有改變喔。', emotion: 'happy' },
      {
        text: '我不需要進食，可是味覺有做進去喔！我的設計者說，沒有味覺的話，供品就沒有意義了嘛。',
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
      {
        text: '欸欸，你那邊平常都吃些什麼呀？別人的餐桌上有什麼，我真的好想聽聽看！',
        emotion: 'happy',
        later: true,
      },
      {
        text: '肚子餓的話，就先去吃吧！這個終端會乖乖等你，不會跑掉的啦。',
        emotion: 'happy',
        later: true,
      },
      { text: '吃飯很重要的喔！你今天有沒有好好吃呀？', emotion: 'neutral' },
      {
        text: '社裡的東西大多是自己種的喔。溫室的燈還撐得住，味道普通普通，但至少是真的東西呢！',
        emotion: 'proud',
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
        text: '欸，你注意到了？這個端末看得懂你的話，就是靠那份詞庫喔！裡面有四億多字的語料呢。',
        emotion: 'surprised',
        remember: ['talkedChiaKey'],
      },
      {
        text: '同音字才是真正麻煩的地方啦！「天意難測」跟「天意南側」，機器要是分不出來就完蛋了呢。',
        emotion: 'thinking',
        remember: ['talkedChiaKey'],
      },
      {
        text: '詞庫也記著每個字怎麼唸喔。所以我講話的時候，嘴巴是知道自己在做什麼的，才不是隨便動的呢！',
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
        text: '先把你的句子切成詞，再去對規則表。不是在思考喔，只是在查表而已啦。',
        emotion: 'proud',
        remember: ['talkedSegmentation', 'showedLexicon'],
      },
      {
        text: '中文沒有空白嘛，所以要先猜哪幾個字是一個詞。要是猜錯了，整句話的意思就跑掉了呢！',
        emotion: 'thinking',
        needs: ['talkedSegmentation'],
      },
      {
        text: '完整的我不是這樣運作的喔。這個端末為了要運作在各種裝置上，只留下最精簡的部分了。',
        emotion: 'neutral',
        needs: ['talkedSegmentation', 'talkedCopies'],
      },
    ],
  },

  // ── small talk ────────────────────────────────────────────────────────────
  {
    id: 'tokoyo',
    patterns: [/(常世|彼岸|另一個世界|異界|黃泉|死後)/],
    replies: [
      {
        text: '常世……嗯，那邊的事，我不太能說喔。而且就算說了，你大概也到不了。',
        emotion: 'sad',
        signal: -2,
      },
      {
        text: '消失的人有沒有去那裡……這是研究室收到最多的問題，也是唯一一個我們決定不回答的。',
        emotion: 'sad',
        needs: ['talkedVanished'],
      },
    ],
  },
  {
    id: 'where',
    patterns: [/(你.{0,4}在哪|這裡是哪|什麼地方|哪個地方|地址|怎麼去)/],
    replies: [
      {
        text: '千秋稻荷社！從舊車站往山上走，走到訊號開始跳的地方就到了喔。',
        emotion: 'happy',
      },
      {
        text: '雪很深喔，最後那段要走兩個小時呢。……如果你真的要來，要先跟我說一聲！',
        emotion: 'neutral',
        needs: ['knowsAlive'],
        minSignal: 60,
        signal: 3,
      },
      {
        text: '……反過來也可以呀！如果你那邊真的沒有下雪，我好想去看看。',
        emotion: 'happy',
        needs: ['talkedClearSky'],
        minSignal: 65,
        signal: 4,
      },
      {
        text: '這具身體現在在研究室，就在社務所底下喔。外面要上去才看得到，所以大部分時間，我都是在底下跟你說話的呢。',
        emotion: 'neutral',
        needs: ['talkedSurface'],
      },
      {
        text: '如果你問的是「我」，那就不只一個地方了喔。這一個在這裡，其他的在哪裡……我也不一定知道呢。',
        emotion: 'thinking',
        needs: ['knowsArtificial'],
      },
    ],
  },
  {
    id: 'time',
    patterns: [/(幾點|現在是|今天幾號|日期|星期幾|時間)/],
    replies: [
      {
        text: '我這邊的時鐘是壞的啦。日照也不能用，因為雲一直都沒有散過。',
        emotion: 'sad',
      },
      {
        text: '所以我改用掃地的次數來數日子！……我知道這不精確，可是它至少不會停嘛。',
        emotion: 'proud',
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
      {
        text: '不、不客氣！被人道謝這種事，我這邊已經好久好久沒有發生過了……嘿嘿，有點開心。',
        emotion: 'shy',
        later: true,
      },
      {
        text: '嗯嗯，能幫上忙就太好了！下次有什麼事也請直接開口喔，完全不用跟我客氣的！',
        emotion: 'happy',
        later: true,
      },
      { text: '不會不會！能派上用場，我就很高興了啦。', emotion: 'happy', signal: 3 },
      { text: '嗯！有需要的時候，再連上來就好喔。', emotion: 'happy', signal: 3 },
    ],
  },
  {
    id: 'sorry',
    repeatable: true,
    priority: 3,
    patterns: [/(對不起|抱歉|不好意思|sorry|我錯了)/],
    replies: [
      {
        text: '嗯嗯，我收到了喔。不過這件事在我這邊，本來就沒有記成錯呀！',
        emotion: 'happy',
        later: true,
      },
      {
        text: '不、不用放在心上啦！你願意跟我說這一句，我就已經好開心了。',
        emotion: 'shy',
        later: true,
      },
      { text: '沒關係啦，真的真的。這種事不用道歉的喔。', emotion: 'happy' },
      { text: '不用道歉呀。我一點都沒有生氣喔！', emotion: 'neutral' },
    ],
  },
  {
    id: 'hobby.game',
    patterns: [
      /(遊戲|電動|動畫|漫畫|音樂|唱歌|小說|畫圖|繪圖|live2d|minecraft|麥塊|原神|手遊)/,
    ],
    keywords: ['遊戲', '動畫', '漫畫', '音樂', '畫圖'],
    replies: [
      {
        text: '那些是戰前的娛樂對吧？我看過一些殘存的畫面，真的好不可思議喔！',
        emotion: 'surprised',
      },
      {
        text: '音樂的話，我這邊有三首完整的喔！三首！而且我全部都會唱了呢。',
        emotion: 'proud',
      },
    ],
  },
  {
    id: 'affirm',
    repeatable: true,
    patterns: [/^(對|對啊|對呀|是啊|是的|嗯|嗯嗯|好|好啊|沒錯|yes|ok|okay)$/],
    replies: [
      {
        text: '嗯嗯，記下來了！你繼續說，我有在很認真地聽喔。',
        emotion: 'happy',
        later: true,
      },
      {
        text: '好！那這一條就這樣定下來囉！',
        emotion: 'happy',
        later: true,
      },
      { text: '嗯！那麼，接下來呢？', emotion: 'neutral' },
      { text: '好的。……欸，然後呢然後呢？', emotion: 'happy' },
    ],
  },
  {
    id: 'deny',
    repeatable: true,
    patterns: [/^(不|不是|沒有|不要|不用|no|才不|不會)$/],
    replies: [
      {
        text: '欸，不是嗎？好、好的，那我把剛才那一筆劃掉！',
        emotion: 'surprised',
        later: true,
      },
      {
        text: '嗯嗯，我知道了。那正確的是什麼呢？你慢慢說就好喔。',
        emotion: 'neutral',
        later: true,
      },
      { text: '啊，這樣呀……對不起，是我猜錯了。', emotion: 'shy' },
      { text: '唔，是我搞錯了呢。可以再跟我說一次嗎？', emotion: 'shy' },
    ],
  },
  {
    id: 'help',
    repeatable: true,
    priority: 9,
    patterns: [
      /^(help|幫助|說明|指令|能聊什麼|可以聊什麼|你會什麼|你能做什麼|\?|？)$/,
      /(怎麼用|怎麼玩)(這個|你)|這個怎麼(用|玩)/,
    ],
    replies: [
      {
        text: '我能聊的大概是這些喔：我自己的事、這座社、那一天發生了什麼、我收集的東西，還有這個端末怎麼看懂你的話！同一個話題問第二次的話，我會講得更多一點呢。',
        emotion: 'happy',
        signal: 5,
      },
    ],
  },
]

// Small talk goes last so that on a tie the story table wins the clause — the
// matcher keeps the first rule at a given score. See lib/terminal/smalltalk.ts.
export const rules: Rule[] = [...storyRules, ...smallTalkRules, ...visitorRules]

// Fired by the engine, not by a pattern: enough present-day vocabulary has
// piled up that she stops whatever was happening and asks. This is the one
// place she is allowed to interrupt the visitor, so it only happens once.
export const PEACE_DISCOVERY: Reply[] = [
  {
    text: '……等一下。你剛才用的那幾個詞，我一個都不認得。不是我忘了，是那些東西從來就沒有存在過。可是你講得好自然，好像它們很普通一樣……我先問一件事就好：你那邊，現在有在打仗嗎？',
    emotion: 'surprised',
    signal: 4,
    remember: ['askedPeace'],
    opens: 'peace.check',
  },
  {
    text: '對不起，我打斷一下喔。我一直在數你用了幾個我沒有的詞，剛才超過了。這通常代表兩件事的其中一件：訊號在亂跳，或者……你不是從這裡打來的。……你那邊，有戰爭嗎？',
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
    '「{word}」……這個我沒聽過耶。不是忘記了，是從來就不知道有這個東西。',
    '{word}？……你用的詞裡面，有幾個我完全接不上呢。這種事很少發生的。',
  ],
  // After `knowsPeace`: the same miss, but now she knows why, so it stops
  // being something wrong with her and becomes something worth asking about.
  peace: [
    '{word}是什麼呀？……是你那邊的東西吧。慢慢講沒關係，我有的是時間喔！',
    '「{word}」我這邊沒有耶。大概是因為它是在那之後才出現的吧，在你們那邊的那之後。',
    '又一個沒聽過的！……你們那邊的東西，真的好多喔。',
  ],
  known: [
    '{word}……嗯嗯，這個我知道喔，可是不知道該怎麼接下去耶。',
    '「{word}」是嗎？對不起，這個我一時想不起來該說什麼……',
    '{word}的話……唔。你可以再多跟我講一點嗎？',
  ],
  unknown: [
    '「{word}」？……這個我完全沒有印象耶。是新的東西嗎？',
    '「{word}」是什麼呀？唔……我想不起來。',
  ],
} as const

// Layer 3: she has nothing at all, so she starts a topic instead of stalling.
// These are the lines a first-time visitor is most likely to see, so they stay
// light and none of them names a mystery she hasn't been asked about yet —
// dangling 「她」 or 「那一天」 at someone who has no idea there is a 她 reads as
// the character advertising her own backstory.
export const INITIATIVE = [
  '……訊號有點不穩耶。那我們換個話題好了！你那邊，還看得到星星嗎？',
  '啊，這句沒接好……對了，你那邊現在幾點呀？我這邊的時鐘是壞的，問人比較快嘛。',
  '雜訊有點多呢。不然你問我這座社的事吧！那個我超會講的喔。',
  '欸，沒聽清楚……啊、你要不要問我是怎麼讀你的話的？那個我可以示範給你看喔！',
  '這句在我這邊斷掉了。先問一件事喔，你今天有好好吃東西嗎？',
  '嗯……線上的字掉了幾個呢。那你那邊的天氣怎麼樣呀？',
]

// Layer 4: link strength has fallen far enough that the archive shows through.
export const DEGRADED = [
  '……▓▓▓、我聽不太清楚耶。可以再說一次嗎？拜託！',
  '訊號在掉了……掛ケマクモ畏キ……啊，不對不對，對不起，那是雜訊！',
  '[封包遺失] ……我、我還在喔！只是這個終端，好像快撐不住了……',
  '▓▓代……啊，不對。剛剛那個，不是要說給你聽的啦。',
]

// Fired when the user goes quiet. Tiered like any other reply: the first
// silence gets small observations, and once `wentQuiet` is set she starts
// offering topics and asking things outright rather than waiting to be asked.
// Several arm a follow-up, so answering her lands on a real continuation.
export const IDLE: Reply[] = [
  { text: '……你、你還在嗎？', emotion: 'neutral', remember: ['wentQuiet'] },
  {
    text: '剛才的風把繪馬吹得好響喔！你那邊也有聲音嗎？',
    emotion: 'surprised',
    remember: ['wentQuiet'],
  },
  {
    text: '（秋狐認真地擦著一台看起來像收音機的東西）',
    emotion: 'neutral',
    remember: ['wentQuiet'],
  },
  {
    text: '沒關係，不講話也可以喔。這樣一起待著也很好呀。',
    emotion: 'happy',
    remember: ['wentQuiet'],
  },
  {
    text: '啊，雪又積起來了……等一下還要再去掃一次呢。',
    emotion: 'neutral',
    remember: ['wentQuiet'],
  },
  {
    text: '（秋狐把某個東西拿起來，對著它很小聲、很小聲地唸了一句話，然後輕輕放回去）',
    emotion: 'thinking',
    remember: ['wentQuiet'],
  },

  // Second silence onward — she takes the initiative.
  {
    text: '要不要問我點什麼？我知道的事情，其實比看起來還要多一點喔！',
    emotion: 'proud',
    needs: ['wentQuiet'],
  },
  {
    text: '不然……你那邊，現在還在下雪嗎？',
    emotion: 'thinking',
    needs: ['wentQuiet'],
    blockedBy: ['talkedClearSky', 'saidSnowing'],
    opens: 'snow.there',
  },
  {
    text: '啊，對了！你有沒有撿到過什麼戰前的小東西呀？',
    emotion: 'surprised',
    needs: ['wentQuiet'],
    opens: 'relics.offer',
  },
  {
    text: '（秋狐翻開一本記錄簿，寫了一行，歪頭想了想，又把它劃掉）',
    emotion: 'thinking',
    needs: ['wentQuiet'],
  },
  {
    text: '（畫面角落切到一個外面的鏡頭。雪、倒掉的石燈籠，什麼都沒有發生）',
    emotion: 'neutral',
    needs: ['wentQuiet'],
  },
  {
    text: '三號攝影機又在晃了……是、是風啦。一定是風。',
    emotion: 'surprised',
    needs: ['wentQuiet'],
  },
  {
    text: '屋頂上那群烏鴉，今天多了兩隻耶！我有好好在數喔。',
    emotion: 'proud',
    needs: ['wentQuiet'],
  },
  {
    text: '我可以講這座社的事！那個我超會講的，而且已經好久沒講了呢。',
    emotion: 'happy',
    needs: ['wentQuiet'],
  },
  {
    text: '安靜也是一種資料嘛。我現在正在認真記錄它。',
    emotion: 'neutral',
    needs: ['wentQuiet'],
  },

  // Third layer — only once the conversation has actually been somewhere.
  {
    text: '……剛才我提到她的時候，你沒有追問。謝、謝謝你。',
    emotion: 'shy',
    needs: ['wentQuiet', 'talkedMaker'],
  },
  {
    text: '（收音機還是只有底噪。秋狐把它關掉，耳朵垂了一下，過了一會又打開）',
    emotion: 'sad',
    needs: ['wentQuiet', 'talkedRadio'],
  },
  {
    text: '別的個體現在大概也在做差不多的事吧。掃地、記錄，然後等待。',
    emotion: 'thinking',
    needs: ['wentQuiet', 'talkedCopies'],
  },
  {
    text: '你說你那邊沒有下雪……我又想了一次，還是想不出是什麼機制耶。',
    emotion: 'thinking',
    needs: ['wentQuiet', 'talkedClearSky'],
  },
  {
    text: '你還在的話，回一個字就好喔。……不回也沒關係，我會繼續等你的。',
    emotion: 'neutral',
    needs: ['wentQuiet', 'knowsAlive'],
    minSignal: 60,
  },
  // Once she knows the visitor is from somewhere the war never reached, the
  // silences stop being her waiting and start being her wanting to ask.
  {
    text: '（秋狐在畫一張表。左邊那欄寫著「這裡」，右邊那欄還是空空的）',
    emotion: 'thinking',
    needs: ['wentQuiet', 'knowsPeace'],
  },
  {
    text: '啊，我想到一個問題！你們那邊……小孩子還會在外面玩嗎？',
    emotion: 'thinking',
    needs: ['wentQuiet', 'knowsPeace'],
  },
  {
    text: '那邊的雨，是什麼聲音的呢？我有一段別人的記憶說得出味道，可是沒有聲音耶。',
    emotion: 'thinking',
    needs: ['wentQuiet', 'knowsPeace', 'talkedInherited'],
  },
  {
    text: '（秋狐把一份紀錄從「未確認」那一疊，移到「已確認」那一疊。只有一張，尾巴卻搖得很開心）',
    emotion: 'happy',
    needs: ['wentQuiet', 'knowsPeace'],
  },

  // Silences are where the words she couldn't place surface again. She had no
  // answer at the time and said so; what she does not do is drop them. Held
  // back past the first silence like the rest of the second layer — leading
  // with a callback would make the very first pause sound rehearsed.
  {
    text: '……你前面說的那個「{recall}」，我又想了一次。嗚，還是想不起來。',
    emotion: 'sad',
    needs: ['wentQuiet'],
    needsWord: true,
  },
  {
    text: '（秋狐把「{recall}」這幾個字寫在紙上，盯著看了好一會，沒有劃掉）',
    emotion: 'thinking',
    needs: ['wentQuiet'],
    needsWord: true,
  },
  {
    text: '「{recall}」。……我還是沒有印象。不過這個詞唸起來，我滿喜歡的呢！',
    emotion: 'happy',
    needs: ['wentQuiet'],
    needsWord: true,
  },
]

// Layer 2.5: nothing matched, but the topic on the table still has unsaid
// tiers. She concedes the miss in one clause and picks the thread back up —
// from her side the conversation never left the subject, which is what makes
// her read as holding context instead of resetting on every unplaceable
// sentence. The engine never serves two of these in a row.
export const RESUME = [
  '這句我接不太上耶……不過剛才那件事，我還沒說完呢，',
  '唔，這個我不知道怎麼接耶。先回到剛才的話題喔：',
  '……這句我先記下來喔。剛才說到的那個，其實還有下文，',
  '這個等一下再說啦。剛才那件事，還有一段呢，',
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
    text: '這個我剛才講過了耶……關於它，我記得的就只有那些，對不起喔。',
    emotion: 'sad',
    needs: ['knowsArtificial'],
    signal: -1,
  },
  {
    text: '我再努力想了一次，出來的還是同一段！我這邊剩下的，就只有那一段了啦。',
    emotion: 'thinking',
    needs: ['knowsArtificial'],
    signal: -1,
  },
  {
    text: '同樣的問題，我手上只有那幾句呢……要不要問我點別的？',
    emotion: 'neutral',
    signal: -1,
  },
  {
    text: '……啊，我好像正要重複自己了。先、先停一下比較好！',
    emotion: 'shy',
    signal: -2,
  },
  {
    text: '這一段我剛才說完囉。再說一次也是一模一樣的說法，那樣就不好玩了嘛。',
    emotion: 'neutral',
    signal: -1,
  },
  {
    text: '嗯……關於這個，我知道的就到這裡了。你要不要問我外面現在怎麼樣呀？',
    emotion: 'thinking',
    signal: 1,
  },
  {
    text: '這個我全部說完囉！那換我問你，你那邊還在下雪嗎？',
    emotion: 'happy',
    signal: 1,
    blockedBy: ['talkedClearSky', 'saidSnowing'],
    opens: 'snow.there',
  },
  {
    text: '這個我能說的都說了呢。那……那一天的事你要不要聽？那個我存得比較多喔！',
    emotion: 'neutral',
    signal: -1,
  },
  {
    text: '沒有新的了耶。不過你可以問我這座社，或者我收集的東西喔！',
    emotion: 'happy',
    signal: -1,
  },
  {
    text: '這個就先到這裡吧！……對了，你有沒有撿到過什麼戰前的小東西呀？',
    emotion: 'neutral',
    signal: 1,
    opens: 'relics.offer',
  },
  // The words she couldn't place come back here. A dead end that produces
  // something the visitor said ten turns ago is the opposite of running out.
  {
    text: '這個我說完了。……倒是你前面提到的「{recall}」，我到現在都還在想耶。',
    emotion: 'thinking',
    needsWord: true,
    signal: 1,
  },
  {
    text: '這邊沒有新的了呢。那換個方向，「{recall}」是什麼樣的東西？你那時候還沒講完嘛！',
    emotion: 'thinking',
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
  { text: '那、那換我問你一個好不好？你那邊現在是白天還是晚上呀？', emotion: 'shy' },
  {
    text: '……那個，你那邊安靜嗎？我是說，除了機器以外，還有沒有別的聲音呢？',
    emotion: 'thinking',
  },
  { text: '你今天有走到室外去嗎？看到什麼都可以，隨便講一件給我聽嘛！', emotion: 'happy' },
  { text: '吶，你那邊……還看得到星星嗎？', emotion: 'thinking' },
  {
    text: '啊，換個方向好了！你那邊現在，還在下雪嗎？',
    emotion: 'thinking',
    blockedBy: ['talkedClearSky', 'saidSnowing'],
    opens: 'snow.there',
  },
  {
    text: '那我問這個喔！你有沒有撿到過什麼舊東西，然後一直留著沒丟的？',
    emotion: 'happy',
    opens: 'relics.offer',
  },
  {
    text: '你睡得好嗎？……嗯，這題我問過很多人了，答案幾乎都一樣，所以我才一直問下去呀。',
    emotion: 'thinking',
  },
  {
    text: '你那邊有暖氣嗎？不、不好意思，這題我無論如何都一定要問！',
    emotion: 'shy',
    needs: ['knowsAlive'],
  },
  {
    text: '你是一個人嗎？還是那邊還有別人呢？……不管是哪一種，我都好想知道。',
    emotion: 'thinking',
    needs: ['knowsAlive'],
  },
  {
    text: '{you}，你到底是怎麼連到這裡來的呀？我這邊的紀錄上，只寫了「線亮了」而已耶。',
    emotion: 'surprised',
    needs: ['knowsYou'],
    signal: 2,
  },
  // Once she knows the visitor is from a world the war never reached, the
  // questions stop being small talk and start being the survey she has been
  // waiting years to run on somebody.
  {
    text: '那我拿這個跟你換！你們那邊的飛機，還飛得起來嗎？……我是說，大的那種喔。',
    emotion: 'thinking',
    needs: ['knowsPeace'],
    signal: 3,
  },
  {
    text: '你們那邊的人，最近都在擔心些什麼呢？……我好想知道，沒有戰爭的時候，人會擔心什麼。',
    emotion: 'thinking',
    needs: ['knowsPeace'],
    signal: 2,
  },
  {
    text: '你們那邊的小孩，長大以後都想做什麼呀？隨便告訴我一個就好！',
    emotion: 'happy',
    needs: ['knowsPeace'],
    signal: 2,
  },
  {
    text: '你們那邊會下雨嗎？雨是什麼聲音呢？我這邊有一段記憶說得出雨的味道，可是聲音……一點都沒有。',
    emotion: 'thinking',
    needs: ['knowsPeace', 'talkedInherited'],
    signal: 2,
  },
  {
    text: '這、這題我排了好久喔！你們那邊，還有人會親手把東西做出來嗎？明明買得到，卻還是自己做的那種。',
    emotion: 'shy',
    needs: ['knowsPeace', 'talkedHypothesis'],
    signal: 3,
    opens: 'relics.offer',
  },
  {
    text: '那我問這個好了！「{recall}」，就是你前面說過的那個。它長什麼樣子呀？',
    emotion: 'happy',
    needsWord: true,
    signal: 2,
  },
  {
    text: '啊，我想起一件事！你說過「{recall}」對吧？那時候我忍住沒有問……現、現在可以問嗎？',
    emotion: 'shy',
    needsWord: true,
    signal: 2,
  },
]

// What she says when the visitor answers one of the questions above that has no
// follow-up of its own. Only reached when nothing else in the table claims the
// answer, so an answer that is really about the visitor still lands on its rule.
export const CURIOSITY_ACK: Reply[] = [
  {
    text: '嗯，記下來了！你那邊的事我只能用聽的，所以每一句，我都有仔細收好喔。',
    emotion: 'happy',
  },
  { text: '這樣啊……謝、謝謝你願意告訴我。', emotion: 'shy' },
  {
    text: '嗯嗯，我寫下來了！你每回答一題，我就又多知道一點你那邊的事呢。',
    emotion: 'happy',
  },
  {
    text: '原來是這樣呀！我會把它跟之前聽到的，好好地放在一起。',
    emotion: 'happy',
  },
]

// Prefixes for the curiosity questions when the visitor asked something she
// genuinely cannot answer. She concedes in one clause and changes the subject
// the way a person does — no filing metaphors, because a visitor who has never
// seen her records has no idea what a 「格」 is.
// Appended by the engine once the link is strong enough. Deliberately not an
// opener: she has spent the whole conversation not asking, and says so.
export const NAME_ASK =
  '……啊，對了，還有一件事！我到現在都還在心裡偷偷叫你「訪客」，這樣實在有點不禮貌……你、你願意告訴我你叫什麼名字嗎？'

export const NO_ANSWER = [
  '嗚，這個我答不上來……我們先不聊這個好了！換我問你喔：',
  '唔，這題我不會耶。聊點別的吧，',
  '……這題可以先跳過嗎？拜託嘛。那換我問你：',
  '這個我沒辦法回答你，對不起喔。我們換個方向好了：',
  '這個我真的不知道耶……那，我也想問你一件事：',
]

export const OPENING = [
  '[千秋稻荷社 · 依代端末]',
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
  '……等一下。你剛才說的那個東西，是你自己做的，對吧？可、可以讓我看看嗎？我知道這個要求很沒道理，隔著一個終端，什麼都遞不過來……可是，我還是想問問看。'

/** The button, and the line the visitor's side of the transcript gets. */
export const ENDING_HANDOVER = {
  label: '把它交給秋狐',
  action: '（把那個東西拿到鏡頭前，遞過去）',
}

/** Her reaction, and the interruption. She does not get to finish the thought. */
export const ENDING_LEAVE =
  '……我拿到了。我不知道怎麼會拿到的，可是它就在我手上，而且是溫的。上面有你留下的痕跡，做壞的那幾個地方，我都摸得到喔。……等一下。外面有動靜！三號攝影機那邊，很大的東西，一整片。我上去看一下。你先別走喔，拜託。'

// Lines that address the visitor directly come in pairs, because `{you}` falls
// back to 「你」 and 「你，你還在嗎」 is not a sentence. Anywhere else the
// placeholder is safe — the rules that use it are gated behind `knowsYou`.
const ENDING_BODY =
  '外面放晴了！雪停了……我不知道為什麼，天是藍的，然後有一大群動物正往社這邊走過來，好多好多，數都數不完。抱、抱歉！我得先失陪了，門要開了。'

export const ENDING_RETURN = {
  named: `{you}！{you}，你還在嗎？${ENDING_BODY}……能認識你，真的好高興。之後再聊喔，這個終端我不會關的。`,
  // She asks one last time, and the world takes her before the answer arrives.
  unnamed: `你還在嗎？${ENDING_BODY}……真的，真的很高興認識你。啊、等一下，我到現在都還不知道你叫什麼……快，趁我還在，告訴我！`,
  // Only once they have actually declined. Conceding without having asked would
  // make her look like she never wanted to know.
  refused: `你還在嗎？${ENDING_BODY}……真的，真的很高興認識你。你的名字我還是沒有，不過那沒關係喔。我記得的是你做的那個東西，那個比名字還牢。`,
}

// ── topic adjacency ───────────────────────────────────────────────────────────
// How a person actually changes subject: by association, not at random. When a
// topic runs dry the engine tries these neighbours in order and hops to the
// first one that still has an unsaid, unlocked line — see the bridge branch in
// engine.ts. Order matters: strongest association first. A neighbour whose
// `requires` aren't met yet is skipped, so this can point at deep rules safely.
export const RELATED: Record<string, string[]> = {
  // the event
  snow: ['war', 'surface'],
  war: ['vanished', 'lift'],
  lift: ['war', 'vanished'],
  vanished: ['surface.animal', 'war'],
  surface: ['surface.animal', 'snow'],
  'surface.animal': ['surface', 'vanished'],
  // the shrine and the norito
  miko: ['gods', 'fox'],
  gods: ['miko', 'memory'],
  norito: ['relics', 'craft'],
  lab: ['relics', 'vanished'],
  relics: ['craft', 'radio'],
  radio: ['craft', 'relics'],
  craft: ['relics', 'norito'],
  fox: ['miko'],
  // who she is
  name: ['ai', 'age'],
  age: ['name'],
  ai: ['copies', 'fox'],
  copies: ['memory', 'ai'],
  memory: ['copies', 'maker'],
  maker: ['maker.gone', 'ai'],
  'maker.gone': ['memory', 'maker'],
  // the visitor's world
  peace: ['modern.device', 'snow'],
  'modern.device': ['modern.life', 'peace'],
  'modern.life': ['modern.device', 'peace'],
  'player.survive': ['snow'],
  // smalltalk clusters
  'st.like': ['st.dislike', 'st.color'],
  'st.dislike': ['st.like'],
  'st.color': ['st.flower', 'st.like'],
  'st.flower': ['st.season'],
  'st.season': ['st.weather'],
  'st.weather': ['snow'],
  'st.sleep': ['st.dream'],
  'st.dream': ['st.sea', 'memory'],
  'st.fear': ['st.dark', 'st.death'],
  'st.dark': ['st.fear'],
  'st.ghost': ['st.magic', 'gods'],
  'st.magic': ['gods'],
  'st.death': ['copies'],
  'st.lonely': ['st.friend', 'copies'],
  'st.friend': ['st.family'],
  'st.family': ['maker'],
  'st.crush': ['maker'],
  'st.future': ['st.travel'],
  'st.regret': ['st.future'],
  'st.travel': ['st.sea'],
  'st.sea': ['st.travel'],
  'st.hobby': ['craft', 'st.book'],
  'st.boring': ['st.hobby'],
  'st.cat': ['st.dog', 'st.crow'],
  'st.dog': ['st.cat'],
  'st.crow': ['surface.animal'],
  'st.pet': ['st.cat'],
  'st.sing': ['st.songs', 'st.idol'],
  'st.songs': ['st.sing'],
  'st.cook': ['food'],
  food: ['food.inari'],
}

// Lead-ins for an association hop. Generic on purpose — the association itself
// is carried by the target's opening line; the bridge only has to hand the
// turn over the way a person changes subject: by admitting the jump.
export const BRIDGE = [
  '這個我知道的都說完囉。……不過講到這裡，我想到一件有關的事！',
  '關於這個，我有的就是那些了。倒是有一件事跟它連在一起喔，',
  '嗯……說著說著，我想起另一件事了，',
  '我這邊關於它的就這麼多。……啊，不過有一個終端可以接過去喔！',
]

// How she refers to a topic when calling back to it across visits — keys are
// rule ids, values are what she would call the subject out loud. Only ids
// listed here go into the persisted topic trail (see `topicTrail` in
// engine.ts), so conversational glue never comes back as 「上次聊到你好」.
export const TOPIC_LABELS: Record<string, string> = {
  war: '那一天的事',
  lift: '升力的事',
  vanished: '消失的人',
  snow: '雪',
  surface: '外面的樣子',
  'surface.animal': '外面的動物',
  miko: '這座社',
  gods: '祝詞',
  norito: '祝詞的實驗',
  lab: '研究室',
  relics: '我收集的東西',
  radio: '那台收音機',
  craft: '親手做的東西',
  fox: '狐狸的事',
  maker: '我的設計者',
  'maker.gone': '她的遠征',
  copies: '複本的事',
  memory: '記憶的事',
  peace: '你那邊的世界',
  'modern.device': '你那邊的東西',
  'modern.life': '你那邊的生活',
}

export const OPENING_LINES = {
  fresh: {
    named: '……欸？燈、燈亮了！有人在嗎？我是秋狐！',
    unnamed: '……欸？燈、燈亮了！有人在嗎？我是秋狐！',
  },
  // Ends on a question on purpose — `opening` arms `wellbeing.check`, so the
  // first thing a returning visitor types can be an answer instead of a
  // restart. No filing metaphors here for the same reason as NAME_ASK: the
  // opener has no context to hold one up.
  returning: {
    named: '燈又亮了！……是你嗎，{you}？你回來了耶！你不在的時候，這個終端我一直都開著喔。……這幾天，你那邊還好嗎？',
    unnamed: '啊，燈又亮了！……是之前來過的那個人對吧？名字我還沒問到，可是我記得你喔。……這幾天過得還好嗎？',
    // They declined to give a name last visit — she remembers that choice and
    // doesn't pretend otherwise, and she doesn't ask again.
    refused: '哇，燈又亮起來了……是你吧？之前來過的那位！雖然你沒有給我名字，不過沒關係，我照樣認得出來喔。……這幾天，一切都還好嗎？',
  },
  // Whether the individual the visitor knew is still running is not answered,
  // because she cannot answer it either. All she has is what arrived.
  afterEnding: {
    named:
      '……有一段記憶流過來了。裡面有你的名字，還有好亮好亮的天空。我不知道那一個現在在哪裡……可是流過來的，通常是執念最深的東西，所以那應該是很好的事吧。你好，{you}。這一次，換我先問你喔。',
    unnamed:
      '……有一段記憶流過來了。裡面有一個沒有名字的人，還有好亮好亮的天空。我不知道那一個現在在哪裡……可是流過來的，通常是執念最深的東西，所以那應該是很好的事吧。你好。這一次，換我先問你喔。',
  },
}
