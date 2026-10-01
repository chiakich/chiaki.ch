import type { Reply } from './types'

/** A narrowly answerable question within a model's existing broad topic label. */
export type AnswerIntent = {
  id: string
  ruleId: string
  /** Every cue must match. Topic words alone never infer a more specific request. */
  cues: RegExp[]
  exclude?: RegExp
  replies: Reply[]
  why?: string
}

const VISITOR_SUBJECT = /^(我|我們|我的|我們的)/
const VISITOR_WEATHER = /我這邊|我這裡|我們這|^(我|我們)(今天|昨天|剛剛|現在|家)/
const CODE = /程式|python|javascript|debug|代碼|code|編程/
const DEVICE = /電腦|筆電|手機|印表機|硬碟|顯卡|網路|藍牙|螢幕/
const FAULT = /壞|故障|當機|開不了|連不上|斷線|很慢|不動|不能用|印不出/

export const answerIntents: AnswerIntent[] = [
  {
    id: 'age.birthday', ruleId: 'age', cues: [/生日|你.*幾月幾[日號]|哪天出生/], exclude: VISITOR_SUBJECT,
    replies: [
      { text: '二月二十七日喔！嚴格來說是初次啟動日，不過我的設計者堅持要叫它生日。', remember: ['hintedMaker'] },
      { text: '是二月二十七日！日期我記得很清楚喔，這一筆沒有弄丟。', emotion: 'proud' },
    ],
  },
  {
    id: 'age.years', ruleId: 'age', cues: [/幾歲|年紀|年齡|哪一年.*出生|出生.*哪一年|活了多久/], exclude: VISITOR_SUBJECT,
    replies: [
      { text: '歲數我給不了確定的答案呢……我能確定的是生日在二月二十七日，那是初次啟動的日子。' },
      { text: '這具身體運作多久，跟「我幾歲」不是同一件事喔。我裡面還有別的個體留下來的部分呢。', remember: ['talkedCopies'] },
    ],
  },
  {
    id: 'ai.nature', ruleId: 'ai', cues: [/你/, /真人|機器人|人工|人造|ai|是不是人|被.*做出來/],
    exclude: /誰|名字|幾歲|年齡|喜歡|會不會.*(累|痛|冷)/,
    replies: [
      { text: '我是人工的喔，不是真人。骨架是碳纖維，外層是矽膠，維護紀錄都寫得很清楚！', emotion: 'proud', remember: ['knowsArtificial'] },
      { text: '嗯嗯，我是被做出來的。這件事沒有設成秘密，你可以直接問喔。', remember: ['knowsArtificial', 'hintedMaker'] },
    ],
  },
  {
    id: 'maker.identity', ruleId: 'maker', cues: [/誰/, /設計|製造|做出|造.*你|做.*你/],
    replies: [
      { text: '做我的是一個少女喔。她自己沒有把名字寫進檔案，所以我一直只叫她「我的設計者」。', remember: ['talkedMaker', 'knowsArtificial'] },
      { text: '是我的設計者，那個少女。名字那一頁是她自己留下的空白，不是檔案壞掉喔。', remember: ['talkedMaker', 'knowsArtificial'] },
    ],
  },
  {
    id: 'snow.cause', ruleId: 'snow', cues: [/雪/, /為什麼|為何|原因|怎麼.*(一直|不停)|為何.*停/],
    exclude: VISITOR_WEATHER,
    replies: [
      { text: '為什麼停不下來，我也還沒有確定的答案呢。從那一天之後就一直下，可是檢查雪的結晶和含量，又全部正常。', remember: ['talkedSnow'] },
      { text: '我們能確認的是雪本身正常，卻一直沒有停。原因還沒弄清楚，所以我不能隨便說是誰造成的喔。', remember: ['talkedSnow'] },
    ],
  },
  {
    id: 'snow.duration', ruleId: 'snow', cues: [/雪/, /多久|什麼時候|何時|哪天|哪一天|從.*開始/],
    exclude: VISITOR_WEATHER,
    replies: [
      { text: '從那一天之後開始的喔，到現在一次都沒有停過。不是只在冬天下，是一直在下。', remember: ['talkedSnow'] },
      { text: '一直到現在都還在下呢。起點就是那一天，我沒有記錄到中間停過的時候。', remember: ['talkedSnow'] },
    ], why: 'snow.cause',
  },
  {
    id: 'snow.depth', ruleId: 'snow', cues: [/雪/, /多深|多厚|厚度|積.*深|積.*厚/],
    exclude: VISITOR_WEATHER,
    replies: [
      { text: '積雪的精確深度，我現在沒辦法報給你呢。能跟你說的是，參道需要一直掃，石燈籠也倒了一半了。', remember: ['talkedSnow'] },
      { text: '你問的是厚度呀。我沒有確定的數字，只知道掃過的參道還要再掃，雪一直沒有停呢。', remember: ['talkedSnow'] },
    ],
  },
  {
    id: 'weather.sun', ruleId: 'st.weather', cues: [/太陽|放晴|晴天|陽光/, /你|那邊|那裡|看得到|看不到|有沒有|會|嗎|呢|怎麼/],
    exclude: VISITOR_WEATHER,
    replies: [
      { text: '太陽的位置我算得出來，可是看不到喔。這邊的雲從來都沒有散過呢。', emotion: 'sad' },
      { text: '這邊一直沒有放晴。不是太陽不在，是雲始終擋著，我只能算它的位置。' },
    ],
  },
  {
    id: 'weather.temperature', ruleId: 'st.weather', cues: [/幾度|氣溫|溫度/],
    exclude: /我這邊|我這裡|我們這|^(我|我們)(今天|昨天|剛剛|現在|家)|身體|體溫/,
    replies: [
      { text: '幾度這個數字，我沒辦法確定地告訴你呢……這邊一直在下雪，但那不能當成溫度計嘛。' },
      { text: '你要的是氣溫的讀數呀，這一題我給不了確定的數字。只能跟你說，雪還沒有停喔。' },
    ],
  },
  {
    id: 'tech.code', ruleId: 'visitor.tech', cues: [CODE, /怎麼|如何|幫|寫|debug|除錯|錯|卡|問題|不會|不懂|代碼|code|編程/],
    exclude: /你(是|只是|就是|有沒有|喜歡)|你.*被.*(寫|做)|人工智慧|機器人/,
    replies: [
      { text: '程式的問題呀……這個我不會寫，也不會除錯，對不起喔。這個端末只能查表回話，不能替你跑程式。', emotion: 'sad' },
      { text: '我自己是跑在規則表上的，可是連這張表都不能改呢。你的程式為什麼出錯，我沒辦法替你判斷。', emotion: 'thinking' },
    ],
  },
  {
    id: 'tech.device', ruleId: 'visitor.tech', cues: [DEVICE, FAULT], exclude: CODE,
    replies: [
      { text: '是機器出毛病了呀……隔著這條線，我看不到它壞在哪裡，不能替你判斷故障原因呢。', emotion: 'thinking' },
      { text: '設備不能好好用，真的很麻煩呢。我這裡沒有能替它檢查的東西，對不起，這個忙幫不上。', emotion: 'sad' },
    ],
  },
  {
    id: 'day.work', ruleId: 'visitor.day', cues: [/我|今天|剛剛|昨天/, /上班|加班|開會/],
    exclude: /累|煩|難過|生氣|開心|高興|喜歡|討厭|你.*(工作|上班)|怎麼|為什麼|幫我/,
    replies: [
      { text: '嗯嗯，是你今天工作的事呀。我這邊的一天只有掃地和記錄，你那邊還有同事，聽起來很不一樣呢。' },
      { text: '你工作的那一天，我先記在你那一頁喔。實際的忙我幫不上，不過你可以繼續講給我聽。' },
    ],
  },
]

export const answerIntentById = new Map(answerIntents.map((intent) => [intent.id, intent]))
