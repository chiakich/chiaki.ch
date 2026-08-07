import type { Rule } from './types'

// 涼風千秋's response table. Patterns run against normalised text (traditional,
// punctuation stripped, lower-cased) — see lib/terminal/normalize.ts.
//
// Voice notes: elegant and warm from the shrine upbringing, with a restrained
// smile and an occasional 「欸」「唔」 only when genuinely caught off guard. She was born after the war, so pre-war
// things are objects of fascination to her, not memories.

export const rules: Rule[] = [
  {
    id: 'greeting',
    priority: 2,
    patterns: [/(你好|妳好|您好|哈囉|哈嘍|嗨|早安|午安|安安|hello|hi|はお|こんにちは|おはよう)/],
    replies: [
      { text: '晚上好，我是涼風千秋。這條線很久沒有亮起來了。', emotion: 'neutral' },
      { text: '你好。能在這裡相遇，似乎是一件很難得的事。', emotion: 'happy' },
      { text: '你好。社務所這邊的訊號還算安定。', emotion: 'neutral' },
    ],
  },
  {
    id: 'greeting.again',
    priority: 3,
    requires: ['greeted'],
    patterns: [/(你好|妳好|哈囉|嗨|安安|hello|hi)/],
    replies: [
      { text: '嗯，剛才已經見過了。你不必這麼拘謹。', emotion: 'neutral' },
      { text: '又一次嗎……那麼，我也再向你問候一次。', emotion: 'happy' },
    ],
  },
  {
    id: 'farewell',
    priority: 3,
    patterns: [/(再見|再会|掰掰|bye|拜拜|我走了|下次聊|先閃|要走了|睡了|晚安)/],
    replies: [
      {
        text: '要走了嗎……路上小心。這條線會在這裡等你。',
        emotion: 'sad',
        signal: -4,
      },
      { text: '再見。下次連線時，我應該還會認得你。', emotion: 'happy' },
    ],
  },
  {
    id: 'name',
    priority: 3,
    patterns: [/(你叫什麼|妳叫什麼|你是誰|妳是誰|你的名字|大名|怎麼稱呼|自我介紹)/],
    replies: [
      {
        text: '涼風千秋。千秋稻荷社第一研究室室長，兼第▓▓代巫女……那個數字檔案壞掉了，我自己也不確定。',
        emotion: 'thinking',
        remember: ['knowsName'],
      },
      {
        text: '我是千秋。社裡的人都這樣叫我；稱呼室長也可以，只是稍微正式了一點。',
        emotion: 'neutral',
        remember: ['knowsName'],
      },
    ],
  },
  {
    id: 'age',
    priority: 3,
    patterns: [/(幾歲|多大|年紀|年齡|生日|哪一年出生)/],
    replies: [
      { text: '生日是二月二十七日。至於歲數……狐狸不太計較那個。', emotion: 'proud' },
      {
        text: '我是戰後出生的，所以比你想的年輕。但比你想的看過更多舊東西。',
        emotion: 'neutral',
      },
    ],
  },
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
    ],
  },
  {
    id: 'fox.touch',
    priority: 5,
    patterns: [/(摸|揉|搓|抓|rub|pat).{0,4}(尾巴|耳朵|頭|毛)|(尾巴|耳朵|頭).{0,3}(摸|揉|給我)/],
    replies: [
      { text: '……尾巴不可以隨便碰。請先徵求本人的同意。', emotion: 'shy', signal: -3 },
      { text: '頭的話……只有一下，可以。', emotion: 'shy' },
    ],
  },
  {
    id: 'miko',
    patterns: [/(巫女|神社|稻荷|參拜|祭典|鳥居|御守|籤|社務所|神職)/],
    replies: [
      {
        text: '千秋稻荷社。以前這裡很熱鬧的，現在參道的石燈籠倒了一半。',
        emotion: 'neutral',
        remember: ['talkedShrine'],
      },
      {
        text: '巫女的工作我還在做喔。就算收不到回音，該掃的地還是要掃。',
        emotion: 'neutral',
        remember: ['talkedShrine'],
      },
    ],
  },
  {
    id: 'gods',
    priority: 2,
    patterns: [/(神明|神様|信仰|祈禱|祈願|許願|祝詞|祭祀|大神|神在不在|神去哪)/],
    keywords: ['神明', '祈禱', '祝詞', '信仰', '許願'],
    replies: [
      {
        text: '……那一夜之後就沒有回應了。祝詞還是照唸，唸到「掛ケマクモ畏キ」的時候，以前空氣會變。現在不會。',
        emotion: 'sad',
        signal: -2,
        remember: ['talkedGods'],
      },
      {
        text: '有沒有走掉，我不知道。但我覺得，還聽得見的話，總得有人繼續講話才行吧。',
        emotion: 'neutral',
        remember: ['talkedGods'],
      },
    ],
  },
  {
    id: 'war',
    priority: 2,
    patterns: [/(戰爭|大戰|戰前|戰後|炸彈|轟炸|廢墟|軍隊|末日|世界末日)/],
    keywords: ['戰爭', '廢墟', '炸彈', '戰後'],
    replies: [
      {
        text: '新式的炸彈落下之後，火藥點不燃了，機翼也撐不住了。像是有人把某個開關關掉。',
        emotion: 'neutral',
        remember: ['talkedWar'],
      },
      {
        text: '我沒看過戰爭本身，只看過它留下來的東西。廢墟其實很安靜，安靜得有點過分。',
        emotion: 'sad',
        remember: ['talkedWar'],
      },
    ],
  },
  {
    id: 'relics',
    patterns: [/(遺物|遺留|收集|蒐集|古董|舊東西|老東西|以前的東西|文物|挖到|撿到)/],
    keywords: ['收集', '古董', '遺物', '照片', '唱片', '底片'],
    replies: [
      {
        text: '我在收集戰前的東西。上週找到一台仍會轉動的卡帶隨身聽，只是帶子已經壞了。',
        emotion: 'neutral',
        remember: ['talkedRelics'],
      },
      {
        text: '第一研究室的架子上全是那些。你要是有戰前的小東西，可以拿來給我看看嗎？',
        emotion: 'happy',
        remember: ['talkedRelics'],
      },
    ],
  },
  {
    id: 'craft',
    patterns: [/(手作|自己做|做東西|diy|模型|縫|木工|焊|組裝|做了一個)/],
    keywords: ['手作', '模型', '組裝'],
    replies: [
      { text: '我喜歡親手製作東西。最近在修一個發條裝置，彈簧比想像中更難處理。', emotion: 'happy' },
      { text: '你也會做嗎？有時候，失敗的部分反而最值得記住。', emotion: 'neutral' },
    ],
  },
  {
    id: 'cute',
    priority: 4,
    patterns: [/(可愛|卡哇伊|かわいい|漂亮|好看|美|萌|cute)/],
    replies: [
      { text: '……突然說這種話，多少會讓人不知所措。', emotion: 'shy', signal: 4 },
      { text: '我對可愛的東西完全沒有抵抗力，包括被說可愛的時候。', emotion: 'shy', signal: 4 },
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
    ],
  },
  {
    id: 'praise',
    priority: 3,
    patterns: [/(好棒|厲害|了不起|好強|佩服|謝謝你做|做得好)/],
    replies: [
      { text: '嘿嘿，被誇獎了。今天可以多掃一段參道。', emotion: 'proud', signal: 3 },
      { text: '沒有啦，這種程度不算什麼……不過還是謝謝你。', emotion: 'shy', signal: 3 },
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
    ],
  },
  {
    id: 'tired',
    priority: 2,
    patterns: [/(好累|很累|疲勞|累死|辛苦|加班|睡不飽|撐不住|好忙)/],
    keywords: ['累', '辛苦', '疲勞'],
    replies: [
      { text: '辛苦了。要不要先坐一下？這裡的階梯是石頭的，夏天很涼喔。', emotion: 'neutral' },
      { text: '累的時候就先什麼都不要做。神明都不在了，沒人會怪你的。', emotion: 'neutral' },
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
    ],
  },
  {
    id: 'scared',
    patterns: [/(害怕|好怕|恐怖|嚇死|不敢|恐懼)/],
    replies: [
      { text: '不怕不怕。這裡是社地，至少形式上還算受保護的。', emotion: 'neutral' },
      { text: '……你這麼說，四周似乎也安靜了一些。', emotion: 'thinking' },
    ],
  },
  {
    id: 'rain',
    patterns: [/(下雨|雨天|天氣|晴天|颱風|下雪|雲|好熱|好冷|溫度)/],
    keywords: ['雨', '天氣', '雪', '颱風'],
    replies: [
      {
        text: '爺爺說，以前的雨落下來之前，你會先聞到它的味道。我試過很多次，聞不到。',
        emotion: 'thinking',
        remember: ['talkedRain'],
      },
      { text: '這裡今天陰陰的。儀器說天空沒有問題，可是看起來就是不太對。', emotion: 'neutral' },
    ],
  },
  {
    id: 'food.inari',
    priority: 5,
    patterns: [/(油豆腐|豆皮|稻荷壽司|いなり|豆腐皮|炸豆皮)/],
    replies: [
      { text: '你怎麼知道……原來這是常識嗎？那麼，請給我兩個。', emotion: 'happy' },
      { text: '油豆腐是最好的。這件事戰前戰後都沒有改變。', emotion: 'proud' },
    ],
  },
  {
    id: 'food',
    patterns: [/(吃|餓|好吃|料理|煮飯|晚餐|午餐|早餐|零食|甜點|喝)/],
    keywords: ['吃', '料理', '晚餐', '零食'],
    replies: [
      { text: '吃飯很重要喔。你今天有好好吃嗎？', emotion: 'happy' },
      { text: '社裡的東西大多是自己種的。味道普通，但至少是真的。', emotion: 'neutral' },
    ],
  },
  {
    id: 'chiakey',
    priority: 4,
    patterns: [/(輸入法|注音|選字|詞庫|打字|鍵盤|chiakey|千秋輸入法|同音|bigram)/],
    keywords: ['輸入法', '注音', '詞庫', '選字'],
    replies: [
      {
        text: '欸，你注意到了？這個端末看得懂你的話，就是靠那份詞庫。裡面有四億多字的台灣語料。',
        emotion: 'proud',
        remember: ['talkedChiaKey'],
      },
      {
        text: '同音字才是真正麻煩的地方喔。「天意難測」跟「天意南側」，機器分不出來的話就完蛋了。',
        emotion: 'proud',
        remember: ['talkedChiaKey'],
      },
    ],
  },
  {
    id: 'segmentation',
    priority: 4,
    patterns: [/(斷詞|分詞|怎麼看懂|怎麼理解|怎麼運作|演算法|regex|正則|nlp|jieba)/],
    replies: [
      {
        text: '右邊那排就是我看到的樣子——先把你的句子切成詞，再去對規則表。沒有在思考，只是在查表。',
        emotion: 'thinking',
        remember: ['talkedSegmentation'],
      },
      {
        text: '中文沒有空白嘛，所以要先猜哪幾個字是一個詞。猜錯的話，整句話的意思就跑掉了。',
        emotion: 'thinking',
        remember: ['talkedSegmentation'],
      },
    ],
  },
  {
    id: 'ai',
    priority: 5,
    patterns: [/(你是ai|妳是ai|機器人|人工智慧|chatgpt|gpt|llm|大模型|你是程式|你是假的|真人)/],
    replies: [
      {
        text: '我是規則寫成的喔，全部都是事先寫好的句子。沒有在想事情，只是把你的話對到最接近的那一條。',
        emotion: 'neutral',
        remember: ['talkedAI'],
      },
      {
        text: '這個端末裡沒有裝模型，只有一份詞庫跟一張表。所以我會回得很快，但也很容易露餡。',
        emotion: 'thinking',
        remember: ['talkedAI'],
      },
    ],
  },
  {
    id: 'lab',
    patterns: [/(研究室|研究|實驗|資料|檔案|紀錄|報告|調查)/],
    keywords: ['研究', '實驗', '資料', '檔案'],
    replies: [
      {
        text: '第一研究室主要在記錄「消失前後的差異」。聽起來很了不起，其實大半時間在整理索引。',
        emotion: 'neutral',
      },
      { text: '資料還在，只是讀取的機器一台一台壞掉。這才是最麻煩的部分。', emotion: 'sad' },
    ],
  },
  {
    id: 'tokoyo',
    patterns: [/(常世|彼岸|另一個世界|那邊|異界|黃泉)/],
    replies: [
      {
        text: '常世……嗯，那邊的事我不太能說。而且說了，你大概也到不了。',
        emotion: 'thinking',
        signal: -2,
      },
    ],
  },
  {
    id: 'where',
    patterns: [/(你在哪|這裡是哪|什麼地方|哪個地方|地址|怎麼去)/],
    replies: [
      { text: '千秋稻荷社。從舊車站往山上走，走到訊號開始跳的地方就是了。', emotion: 'neutral' },
    ],
  },
  {
    id: 'time',
    patterns: [/(幾點|現在是|今天幾號|日期|星期幾|時間)/],
    replies: [
      {
        text: '時鐘我這邊是壞的。距離的概念本來就模糊了，時間大概也一樣吧。',
        emotion: 'thinking',
      },
    ],
  },
  {
    id: 'thanks',
    priority: 3,
    patterns: [/(謝謝|感謝|thanks|thank you|多謝|感恩)/],
    replies: [
      { text: '不會不會。能派上用場我就很高興了。', emotion: 'happy', signal: 3 },
      { text: '嗯。有需要時，再連上來就好。', emotion: 'happy', signal: 3 },
    ],
  },
  {
    id: 'sorry',
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
        text: '那些是戰前的娛樂對吧？我有看過殘存的畫面，覺得很不可思議。',
        emotion: 'thinking',
      },
      { text: '這個我知道。雖然只看過資料，沒有真正接觸過。', emotion: 'happy' },
    ],
  },
  {
    id: 'tech',
    patterns: [/(電腦|網路|程式|寫程式|伺服器|手機|訊號|通訊|工程師)/],
    keywords: ['電腦', '網路', '程式', '訊號'],
    replies: [
      {
        text: '通訊這種東西，戰後就變得很不可靠了。能接到你這條線其實滿難得的。',
        emotion: 'neutral',
      },
      { text: '你也在弄這些嗎？那你應該懂那種修了一整天還是不會動的心情。', emotion: 'neutral' },
    ],
  },
  {
    id: 'affirm',
    patterns: [/^(對|對啊|對呀|是啊|是的|嗯|嗯嗯|好|好啊|沒錯|yes|ok|okay)$/],
    replies: [
      { text: '嗯。那麼，接下來呢？', emotion: 'happy' },
      { text: '好。……欸，然後呢？', emotion: 'neutral' },
    ],
  },
  {
    id: 'deny',
    patterns: [/^(不|不是|沒有|不要|不用|no|才不|不會)$/],
    replies: [
      { text: '喔、這樣啊。抱歉，我猜錯了。', emotion: 'sad' },
      { text: '唔，那是我搞錯了。可以再說一次嗎？', emotion: 'thinking' },
    ],
  },
  {
    id: 'help',
    priority: 9,
    patterns: [/^(help|幫助|說明|指令|能聊什麼|可以聊什麼|你會什麼|你能做什麼|\?|？)$/],
    replies: [
      {
        text: '我能聊的大概是這些：我自己的事、這座社、戰爭跟神明、我收集的戰前遺物、還有這個端末怎麼看懂你的話。試著問問看吧。',
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
  '沒有對應的回答……啊、你要不要看看右邊？那是我把你的句子切開的樣子。',
]

// Layer 4: link strength has fallen far enough that the archive shows through.
export const DEGRADED = [
  '……▓▓▓、聽不太清楚。可以再說一次嗎？',
  '訊號在掉。掛ケマクモ畏キ……不對，抱歉，這是雜訊。',
  '[封包遺失] ……我還在喔。只是這條線快不行了。',
]

// Fired when the user goes quiet — she talks to herself rather than freezing.
export const IDLE = [
  '……還在嗎？',
  '剛才的風把繪馬吹得很響。你那邊也有聲音嗎？',
  '（千秋在擦一個看起來像收音機的東西）',
  '沒關係，不講話也可以。這樣待著也不錯。',
]

export const OPENING = [
  '[千秋稻荷社 · 社務所應答端末]',
  '[本機模式：詞庫比對 · 未連接外部推論]',
]
