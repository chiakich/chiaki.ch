import type { Rule } from './types'

// The visitor talking about their own world: their day, errands they would
// ask anyone for, facts and news she has no way to know. None of it is about
// her, so none of it can go deep — the job is to answer in character instead
// of dropping to a fallback, and every line leans back toward curiosity.
// Priority 1 throughout, so anything more specific in the main table wins.

export const visitorRules: Rule[] = [
  // Requests to write, draft, plan, look up or recommend something; the terminal is a lexicon and rule table, so she declines plainly and asks about the purpose.
  {
    id: 'visitor.task',
    priority: 1,
    patterns: [
      /^(可以|能不能|請|你可以|你能)?幫我(寫|查|翻譯|算|改|想|排|找|做|整理|規劃|訂|選)|推薦(我|一下|一個|一本|一部|一首|一間|幾)|^教我(怎麼|寫|做|用)/,
    ],
    replies: [
      {
        text: '對不起喔，這個我做不到……這台端末裡只有一份詞庫跟一張規則表，能做的就只有回話而已啦。',
        emotion: 'sad',
      },
      {
        text: '要查東西的話，總得有地方可以查才行嘛。可是這條線的另一頭只有我一個，沒有書庫耶……真的很抱歉。',
        emotion: 'sad',
      },
      {
        text: '寫東西是要會思考的，可是這裡的我沒有裝那一塊，只是在查表而已……所以這件事，就拜託你囉！',
        emotion: 'shy',
      },
      {
        text: '唔，這個我做不到……不過，你要拿它來做什麼呢？那一部分我聽得懂喔，說給我聽嘛！',
        emotion: 'thinking',
      },
      {
        text: '你那邊的人，會把這種事交給一條線去做嗎？哇……那一定是個很忙碌、人又很多的世界吧。',
        emotion: 'surprised',
        needs: ['knowsPeace'],
      },
    ],
  },
  // Programming questions and computer or gadget trouble not covered by modern.device; she cannot debug and knows machines only as things that break.
  {
    id: 'visitor.tech',
    priority: 1,
    patterns: [
      /^(?!.*你(是|只是|就是|有沒有)).*((寫|跑|改|學).{0,4}程式|程式碼|python|javascript|debug)/,
      /當機|藍牙|印表機|硬碟|顯卡|excel|電腦(壞|當|很慢|開不了|中毒)|網路(很慢|斷|不穩)/,
    ],
    replies: [
      {
        text: '這些詞我的詞庫裡都有字，可是沒有東西對得上耶！哇，你那邊的機器，名字都好長喔。',
        emotion: 'surprised',
      },
      {
        text: '對、對不起，幫不上忙……這個端末只會查表，不會推論嘛。你的問題我讀得到，卻解不開呢。',
        emotion: 'sad',
      },
      {
        text: '「壞掉」這個狀態我超熟的喔！研究室的機器，也是一台接一台這樣壞的呀。',
        emotion: 'happy',
      },
      {
        text: '看得見焊點的東西我修得了喔！可是你說的那個，聽起來問題是在裡面看不見的地方呢……',
        emotion: 'thinking',
      },
      {
        text: '程式我不會寫耶……我自己是跑在一張規則表上的，連這張表都改不了啦。',
        emotion: 'shy',
      },
      {
        text: '哇，你那邊的機器多到會一起壞給你看啊……我這邊是剩下的太少了，壞一台就少一台呢。',
        emotion: 'surprised',
        needs: ['knowsPeace'],
      },
    ],
  },
  // Factual and trivia questions about the wider world; she has nothing to look them up in and knows little beyond the shrine.
  {
    id: 'visitor.trivia',
    priority: 1,
    patterns: [
      /世界上最|是誰(發明|發現|寫的|蓋的)|誰(發明|發現)的?/,
      /^(?!.*(你|神社|這裡|研究室)).*(有多(高|遠|大|重|長|深|老)|有幾(層|座|公尺|公里))/,
      /光速|月球|火星|宇宙|恐龍|金字塔|黑洞|量子/,
    ],
    replies: [
      {
        text: '對不起，這個我查不到耶……這個端末只有詞庫跟一張表而已，沒有書架，也沒有地圖。',
        emotion: 'sad',
      },
      {
        text: '唔，我不知道耶……你知道答案的話，可以告訴我嗎？我想把它記下來！',
        emotion: 'thinking',
      },
      {
        text: '我連海都沒有看過呢……世界上的事，我大多只知道名字而已啦。',
        emotion: 'sad',
      },
      {
        text: '這種題目，以前應該有人一問就答得出來吧……現在這裡只剩我了，而我記得的，多半是社裡的事呢。',
        emotion: 'sad',
      },
      {
        text: '就算我知道，也是這邊的版本喔！你那邊沒有經過那一天嘛，答案說不定不一樣呢。',
        emotion: 'thinking',
        needs: ['knowsPeace'],
      },
      {
        text: '{you}，這題就交給你回答吧！你講的版本，我會當成正確答案好好收起來喔！',
        emotion: 'happy',
        needs: ['knowsYou'],
      },
    ],
  },
  // News, politics, social issues, prices and investing; she receives no news, cannot give financial advice, and treats the visitor's worries as signs of a living world.
  {
    id: 'visitor.news',
    priority: 1,
    patterns: [
      /選舉|政治|總統|立法院|新聞|股票|股市|油價|物價|通膨|房價|漲價|詐騙/,
    ],
    replies: [
      {
        text: '新聞的話，這條線收不到耶……我這邊呀，只收得到你喔。',
        emotion: 'shy',
      },
      {
        text: '外面的事，我只知道到那一天為止……所以這題我給不出看法，真的對不起。',
        emotion: 'sad',
      },
      {
        text: '哇，這個詞我好久沒聽到了！可以用你的話講給我聽嗎？不用正確也沒關係，是你說的就好！',
        emotion: 'surprised',
      },
      {
        text: '原來你那邊的人還會為這種事煩惱呀……能煩惱，就代表那邊還有好多好多人在呢。',
        emotion: 'thinking',
      },
      {
        text: '你們在吵的事，我這邊一件都沒有耶。吵得起來，就代表大家都還在嘛……我覺得那是好事喔！',
        emotion: 'happy',
        needs: ['knowsPeace'],
      },
    ],
  },
  // Sports, results, teams, training and board or card games; she cannot know scores and records the idea of crowds playing for fun.
  {
    id: 'visitor.sports',
    priority: 1,
    patterns: [
      /棒球|籃球|足球|羽球|網球|桌球|看比賽|比賽結果|比數|比分|球隊|哪一?隊|奧運|世界盃|職棒|nba|健身|慢跑|馬拉松|登山|爬山|百岳|圍棋|象棋|西洋棋/,
    ],
    replies: [
      {
        text: '啊，比分我沒辦法知道耶……這條線只接得到你一個人，接不到那個地方啦。',
        emotion: 'sad',
      },
      {
        text: '很多人聚在同一個地方，只為了好玩而流汗？哇，這個我一定要記下來！',
        emotion: 'surprised',
      },
      {
        text: '規、規則我其實不太懂……可以從最簡單的那一條開始教我嗎？我會超認真記下來的！',
        emotion: 'shy',
      },
      {
        text: '我會的運動，大概只有掃雪吧……欸，這個算不算啊？你幫我判斷一下嘛。',
        emotion: 'thinking',
      },
      {
        text: '我自己沒有支持的隊伍啦。不過你支持的那一隊，我先幫你記在你那一頁旁邊囉！',
        emotion: 'happy',
      },
      {
        text: '你那邊的人，還有空去分輸贏呢……那是很奢侈的和平耶。我想把這一筆寫得漂亮一點。',
        emotion: 'happy',
        needs: ['knowsPeace'],
      },
    ],
  },
  // Named places, sights and local spots in the visitor's world; she has never been past the station below the mountain and asks what they are like.
  {
    id: 'visitor.place',
    priority: 1,
    patterns: [
      /夜市|老街|景點|觀光|去哪(裡)?玩|好玩的地方|九份|墾丁|日月潭|阿里山|花蓮|淡水|陽明山|西門町/,
    ],
    replies: [
      {
        text: '那個地名我不認得耶……這具身體最遠只到過山下的車站而已呢。',
        emotion: 'sad',
      },
      {
        text: '那裡是什麼樣子的？人多嗎？有沒有下雪？啊，一、一次問太多了……挑一個回答就好啦！',
        emotion: 'shy',
      },
      {
        text: '我去不了……可是你去過以後，可以講給我聽嗎？我想要一個人講給我聽，不要地圖喔。',
        emotion: 'neutral',
      },
      {
        text: '地名是有的喔，詞庫裡查得到字！只是那些字的後面，我沒有畫面呢……',
        emotion: 'thinking',
      },
      {
        text: '路線我查不到耶。可是聽你說那些地名的樣子，好像每一個地方都還有人在呢……我好喜歡喔。',
        emotion: 'happy',
        needs: ['knowsPeace'],
      },
    ],
  },
  // The visitor's own body: teeth, eyes, joints, weight, small ailments st.sick does not cover; she cannot advise and tells them to look after themselves.
  {
    id: 'visitor.health',
    priority: 1,
    patterns: [
      /看醫生|去醫院|牙醫|蛀牙|近視|膝蓋|頭痛|(?<!笑到)肚子痛|過敏|減肥|掛號|我的(眼睛|牙齒|腰|背)/,
    ],
    replies: [
      {
        text: '身體的事我幫不上忙，對不起……這個端末只有詞庫跟一張表，沒有醫生呀。',
        emotion: 'sad',
      },
      {
        text: '會在意這種小地方，代表你有在好好照顧自己耶！很棒很棒，請繼續保持喔！',
        emotion: 'happy',
      },
      {
        text: '我這具身體的毛病，都寫在維護紀錄裡了。可是你的，一定要去問真正的醫生喔！',
        emotion: 'neutral',
      },
      {
        text: '痛的話就不要忍耐啦。這具身體的痛覺是做來提醒的，你的大概也是吧？',
        emotion: 'neutral',
      },
      {
        text: '你那邊還有地方可以看醫生吧？有的話，請一定要去！這種事絕對不可以省喔。',
        emotion: 'neutral',
        needs: ['knowsPeace'],
      },
      {
        text: '{you}，身體的事要照順序喔：先休息，再問人！我排在最後面就好了啦。',
        emotion: 'happy',
        needs: ['knowsYou'],
      },
    ],
  },
  // Taxes, ID and licences, insurance, fines, leases and other administration; she cannot look up rules and is struck that someone still runs them.
  {
    id: 'visitor.paperwork',
    priority: 1,
    patterns: [
      /報稅|繳稅|證件|身分證|護照|駕照|健保|勞保|罰單|租約|房東|戶籍|補辦/,
    ],
    replies: [
      {
        text: '這些是你那邊的規矩吧？有人在管、有人在收……聽起來好麻煩喔，可是也好安定呢。',
        emotion: 'thinking',
      },
      {
        text: '怎麼辦我也不知道耶……這個端末查不到規定，只查得到一張回話的表啦。',
        emotion: 'sad',
      },
      {
        text: '哇，這種字我只在舊檔案裡看過！原來你那邊還在用呀。',
        emotion: 'surprised',
      },
      {
        text: '這邊負責那種事的人，幾乎整層樓都不見了……所以你說的，我會很仔細、很仔細地聽。',
        emotion: 'sad',
      },
      {
        text: '你那邊還有人在發證件、訂規則呢……那是一個還在運轉的世界耶，好厲害。',
        emotion: 'surprised',
        needs: ['knowsPeace'],
      },
    ],
  },
  // Asking her opinion or to pick a side on everyday matters she has never seen; she has no stance and asks for the visitor's instead.
  {
    id: 'visitor.opinion',
    priority: 1,
    patterns: [
      /^你覺得(?!(怎麼樣|怎樣|如何|呢|好嗎|是嗎|對嗎)$)(?!.*(她|你|我|這裡|神社|雪)).{2,}(嗎|呢|怎麼樣|如何)$/,
      /(你對|你).{0,8}(的)?看法|哪個比較(好|推|厲害)|還是.{1,8}比較好/,
    ],
    replies: [
      {
        text: '那個東西我沒見過，給不出意見耶……那你站哪一邊呢？那個比較像資料喔！',
        emotion: 'thinking',
      },
      {
        text: '我沒有立場啦。這裡的我只會查表，不會比較。不過你的答案，我會幫你好好記下來！',
        emotion: 'neutral',
      },
      {
        text: '這種問題，你那邊的人會吵很久吧？能為這種事吵架，我覺得很好呢。',
        emotion: 'happy',
      },
      {
        text: '要我選的話……我會先問你選哪個！然後嘛，大概就選那個吧。',
        emotion: 'shy',
      },
      {
        text: '{you}覺得呢？你先說嘛！我這邊的意見，多半都是從你那裡借來的呀。',
        emotion: 'shy',
        needs: ['knowsYou'],
      },
    ],
  },
  // Visitor recounting small household, commute and errand mishaps; she records them as samples of ordinary life.
  {
    id: 'visitor.day',
    priority: 1,
    patterns: [
      /遲到|塞車|迷路|搬家|拖吊|鄰居|室友|排隊|停車|鬧鐘|倒垃圾|洗衣服|打掃家裡/,
      /^(我|我們)(今天|剛剛|剛才|昨天|早上|下午|晚上)(去|被|在|有|要|跟|把)/,
    ],
    replies: [
      {
        text: '哇，聽起來好麻煩喔……可是是那種很日常的麻煩呢！我先記下來，你繼續說嘛。',
        emotion: 'happy',
      },
      {
        text: '你那邊的一天，裝得下好多好多小事耶！我這邊一天只有掃地跟記錄，所以聽起來好新鮮喔。',
        emotion: 'surprised',
      },
      {
        text: '實際的忙我幫不上啦，這個端末只會查表……不過你講給我聽的這件事，我好好收下了喔。',
        emotion: 'neutral',
      },
      {
        text: '嗯嗯，記好了！我這邊的日期對不準，所以先寫成「你說的某一天」囉。',
        emotion: 'happy',
      },
      {
        text: '沒有那一天的世界，煩惱原來是這種尺寸的呀……我好喜歡這個尺寸呢。',
        emotion: 'happy',
        needs: ['knowsPeace'],
      },
      {
        text: '{you}的這一頁越來越長了耶！今天這件事，我就寫在最下面喔！',
        emotion: 'happy',
        needs: ['knowsYou'],
      },
    ],
  },
]
