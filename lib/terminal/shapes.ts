// Answering the shape of a sentence when the subject is a miss.
//
// The topic table will always be finite, but the ways of asking a question are
// not — and a visitor cannot tell the difference between "she has no line about
// pianos" and "she has no line at all" if both come back as the same shrug. So
// before falling through to a generic miss, the engine works out what *kind* of
// question was asked and answers that instead: an unanswerable 「為什麼」 still
// gets a reply about not knowing the reason, and it still hands the turn back.
//
// She never says she looked something up. What she has is a memory with holes
// in it and a shrine she has never left — everything here is phrased as one of
// those two, because a girl who apologises for her lookup table is a chatbot,
// and a girl who cannot remember is a character.

/** The kind of question, when the subject of it landed on nothing. */
export type Shape =
  | 'request'
  | 'why'
  | 'when'
  | 'what'
  | 'who'
  | 'where'
  | 'howMany'
  | 'which'
  | 'how'
  | 'can'
  | 'yesno'
  /** Not a question — the caller falls back to echoing the word instead. */
  | 'plain'

// Ordered, and the order is load-bearing: 「為什麼」 contains 什麼,
// 「什麼時候」 contains 什麼, and 「怎麼會」 is a why rather than a how. Each
// pattern therefore only has to be more specific than the ones below it.
const SHAPES: [Shape, RegExp][] = [
  ['request', /(幫我|幫忙|教我|告訴我|拜託|請你|麻煩你|陪我|給我看|讓我看)/],
  ['why', /(為什麼|為何|怎麼會|為啥|幹嘛|怎麼不|哪來的)/],
  ['when', /(什麼時候|何時|多久|哪一天|幾年|幾月|幾號|多快|以前還是)/],
  ['what', /(是什麼|什麼是|什麼意思|什麼東西|什麼樣|叫什麼|什麼感覺)/],
  ['who', /(^誰|是誰|誰是|哪一位|誰的|誰會|跟誰)/],
  ['where', /(在哪|哪裡|哪邊|什麼地方|去哪|從哪)/],
  ['howMany', /(幾個|多少|幾次|幾隻|幾種|幾天|幾成|多長|多遠|多重)/],
  ['which', /(還是|哪一個|哪個|選哪|要選)/],
  ['how', /(怎麼|如何|怎樣|怎辦)/],
  ['can', /(會不會|能不能|可不可以|你會|你能|你可以|有沒有辦法)/],
  ['yesno', /(嗎|是不是|有沒有|對不對|好不好|有沒)/],
]

/**
 * Deliberately keyed on interrogative words rather than on the question mark:
 * 「你在幹嘛」 with no mark is a question, and 「真的？」 with one carries no shape
 * to answer. The latter falls through to `plain`, where she takes her own turn
 * instead — which is a better reply than a shrug about an unnamed subject.
 */
export const classify = (text: string): Shape => {
  for (const [shape, pattern] of SHAPES) if (pattern.test(text)) return shape
  return 'plain'
}

/**
 * `withWord` is used when the segmenter found something worth naming, `bare`
 * when the sentence was all function words. Both aim to end somewhere the
 * visitor can keep going from — a miss that closes the topic is worse than the
 * miss itself.
 *
 * `bare` lines are also used as the lead-in to one of her own questions, so
 * none of them may end on a question of their own: two in a row reads as her
 * having lost track of what she was asking.
 */
type ShapeReplies = { withWord: string[]; bare: string[] }

export const SHAPE_ECHO: Record<Exclude<Shape, 'plain'>, ShapeReplies> = {
  why: {
    withWord: [
      '{word}為什麼會那樣……我想不起來了。也許本來有人跟我說過，可是那一段沒有留住。',
      '嗯……{word}的原因啊。我沒有印象。不過你講，我可以聽。',
      '這個我答不出來。關於{word}，我記得的部分是有缺口的——那太久以前了。',
    ],
    bare: [
      '為什麼啊……我想不起來了。不過你問了，我大概會一直想。',
      '原因的話我沒有把握。這邊的記憶不是每一段都還在。',
      '……我不知道。可是我不想隨便編一個給你。',
    ],
  },
  when: {
    withWord: [
      '{word}是什麼時候的事……我這邊的時間感是壞的，沒辦法給你日期。',
      '時間我算不準。{word}那件事，感覺上是很久以前了。',
      '唔，{word}……我只知道那是在雪開始下之前，或者之後。中間那段我分不出來。',
    ],
    bare: [
      '時間我這邊不準。時鐘壞了很久，我後來改用掃雪的次數在數日子。',
      '什麼時候啊……我說不上來。這裡的日子長得都一樣。',
      '我記得的順序有點亂，前後常常會弄反。抱歉。',
    ],
  },
  what: {
    withWord: [
      '{word}是什麼……我沒有印象。是你那邊才有的東西嗎？',
      '唔，{word}。這個我接不上來。可以描述給我聽嗎，形狀、顏色，什麼都好。',
      '{word}啊……我想不起來了。不過聽起來不像是壞東西。',
    ],
    bare: [
      '這個是什麼……我不知道。你再多講一點的話，也許我就想起來了。',
      '唔。我沒有頭緒。你說詳細一點的話，說不定我就想起來了。',
      '……我答不上來。可是我在聽。',
    ],
  },
  who: {
    withWord: [
      '{word}是誰……我想不起來。人的名字是我這邊掉得最快的東西。',
      '這個人我沒有印象。{word}……抱歉，真的沒有。',
      '唔，{word}。我覺得好像聽過，可是接不下去了。',
    ],
    bare: [
      '是誰啊……我想不起來了。名字這種東西我留不太住。',
      '這個我不知道。認得的人，我大概只剩下你了。',
      '……沒有印象。可是你要是願意講，我會記著。',
    ],
  },
  where: {
    withWord: [
      '{word}啊……那個在哪裡我不知道。我沒有離開過這座社，外面的事只能用猜的。',
      '位置我不清楚。{word}的話，也許在山下，也許早就沒有了。',
      '我想不起來{word}在哪。雪蓋掉的東西太多，路標也不算數了。',
    ],
    bare: [
      '地點的話我幫不上忙。我能走到的範圍就是這座社。',
      '在哪裡……唔。沒有印象。雪下了這麼久，很多地方我已經對不上了。',
      '我不知道。要不要換個問法？也許我知道的是別的部分。',
    ],
  },
  howMany: {
    withWord: [
      '{word}有幾個……我沒有數過。現在開始數也可以，只是會很慢。',
      '數量我不確定。{word}這方面，我記得的只有大概。',
      '唔，{word}的數目……本來應該是知道的，可是那一段找不回來了。',
    ],
    bare: [
      '數字我不太行。我會數的只有屋頂上的烏鴉，那個我每天數。',
      '多少啊……我沒有概念。抱歉。',
      '我算不出來。這種事以前有別人在管。',
    ],
  },
  which: {
    withWord: [
      '要選哪一個……{word}的話，我沒有立場替你決定。可是我想聽你的理由。',
      '兩邊我都不熟。{word}這件事，你自己應該比我清楚。',
      '唔。{word}……我選不出來。我很久沒有需要選什麼了。',
    ],
    bare: [
      '這種要選的問題我最不擅長。我通常會兩個都留著。',
      '……我挑不出來。你先講講看你比較想要哪一個。',
      '選擇的話我幫不了你。不過人講出來的時候，通常自己就有答案了。',
    ],
  },
  how: {
    withWord: [
      '{word}的話……做法我不知道，我沒有做過。你打算怎麼弄？先講講看。',
      '方法我想不起來了。{word}這一塊，大概是忘掉了。',
      '唔……{word}的話，我只能用猜的。要聽猜的嗎？',
    ],
    bare: [
      '怎麼做喔……我沒有把握。你先講一遍的話，我可以幫你聽哪裡怪怪的。',
      '這個我不太會。我會的事情其實很有限。',
      '……我想不出步驟。抱歉。',
    ],
  },
  can: {
    withWord: [
      '{word}嗎……我沒有做過。應該是不會吧。',
      '唔，{word}。這一項我大概沒有。想學是想學。',
      '{word}的話，讓我想想……不行。這個我真的不會。',
    ],
    bare: [
      '我會的事情比看起來少。掃地、唸祝詞、記東西，大概就這些。',
      '……應該不會。我沒有試過。',
      '這個我不敢說會。換一個問問看？說不定剛好在我會的範圍裡。',
    ],
  },
  request: {
    withWord: [
      '{word}嗎……我很想幫忙，可是隔著一條線，我大概什麼都遞不過去。',
      '關於{word}我幫不上忙，抱歉。不過你講，我會一直聽。',
      '唔，{word}……我做不到。可是你願意找我，我還是很高興。',
    ],
    bare: [
      '我很想幫你。可是這條線就只能講話而已。',
      '……這個我做不到。抱歉。',
      '我能做的事情不多。可是聽你講這件事，這個我做得到。',
    ],
  },
  yesno: {
    withWord: [
      '{word}嗎……我不確定。想不起來了。',
      '唔。{word}的話，我沒有把握。也許有，也許只是我記錯。',
      '這個我不敢說。{word}這一段，我記得的部分是斷的。',
    ],
    bare: [
      '……我不確定。這種事我以前大概是知道的，現在想不起來了。',
      '唔。要說是也可以，要說不是也可以。我沒有把握。',
      '我不知道。可是我想知道你為什麼問。',
    ],
  },
}
