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
      '{word}為什麼會那樣……我想不起來了。也許以前有人跟我說過，可是那一段沒有留住呢。',
      '嗯……{word}的原因啊。我沒有印象耶。不過你願意講的話，我很想聽喔！',
      '這個我答不出來……關於{word}，我記得的部分是有缺口的。畢竟那太久以前了嘛。',
    ],
    bare: [
      '為什麼呀……我想不起來了。不過你問了，我大概會一直一直想下去吧。',
      '原因的話，我沒什麼把握耶。這邊的記憶，不是每一段都還在的。',
      '……我不知道。可是，我不想隨便編一個答案給你。',
    ],
  },
  when: {
    withWord: [
      '{word}是什麼時候的事啊……對不起喔，我這邊的時間感是壞的，給不出日期來。',
      '嗯……時間我總是算不準呢。{word}那件事，感覺好像已經是很久以前了。',
      '唔，{word}嗎……我只知道那是在雪開始下之前，或者之後吧。中間那一段，我真的分不出來啦。',
    ],
    bare: [
      '時間的話，我這邊不準喔！時鐘壞掉好久了，後來我都改用掃雪的次數來數日子呢。',
      '什麼時候呀……唔，我說不上來耶。這裡的每一天，長得都一模一樣嘛。',
      '我記得的順序有點亂，前後常常會弄反……真、真的很抱歉喔。',
    ],
  },
  what: {
    withWord: [
      '欸？{word}是什麼……我沒有印象耶。是你那邊才有的東西嗎？',
      '唔，{word}……這個我接不上來。可以描述給我聽嗎？形狀、顏色，什麼都好喔！',
      '{word}啊……我想不起來了。不過聽起來不像是壞東西呢！',
    ],
    bare: [
      '這個是什麼呀……我不知道耶。你再多講一點的話，也許我就想起來了！',
      '唔，我完全沒有頭緒……你說詳細一點的話，說不定我就想起來了喔。',
      '……我答不上來。可、可是我有在認真聽喔！',
    ],
  },
  who: {
    withWord: [
      '{word}是誰呢……我想不起來。人的名字，是我這邊掉得最快的東西了。',
      '這個人我沒有印象耶。{word}……對不起，真的沒有。',
      '唔，{word}。好像在哪裡聽過耶，可是後面接不下去了。',
    ],
    bare: [
      '是誰啊……我想不起來了。名字這種東西，我總是留不太住。',
      '這個我不知道耶。現在我認得的人，大概只剩下你了。',
      '……沒有印象。可是你要是願意講，我會好好記著的！',
    ],
  },
  where: {
    withWord: [
      '{word}啊……那個在哪裡，我不知道耶。我沒有離開過這座社，外面的事都只能用猜的。',
      '位置我不太清楚呢。{word}的話，也許在山下，也許……早就已經沒有了。',
      '唔，我想不起來{word}在哪裡。雪蓋掉的東西太多了，連路標都不算數了呀。',
    ],
    bare: [
      '地點的話我幫不上忙耶，我能走到的就只有這座社。對了，',
      '在哪裡……唔，沒有印象耶。雪下了這麼久，很多地方我已經對不上了。說到這個，',
      '我不知道耶……要不要換個問法？也許我知道的是別的部分喔。對了，',
    ],
  },
  howMany: {
    withWord: [
      '{word}有幾個……我沒有數過耶。現在開始數也可以喔，只是會很慢很慢。',
      '數量我不太確定呢……{word}這方面，我記得的只有個大概而已。',
      '唔，{word}的數目……本來應該是知道的，可是那一段怎麼樣都找不回來了。',
    ],
    bare: [
      '數字我不太行耶。我會數的只有屋頂上的烏鴉，那個我每天都有在數喔！',
      '多少啊……我沒什麼概念耶。抱、抱歉。',
      '我算不出來啦……這方面以前一直是別人在管的。',
    ],
  },
  which: {
    withWord: [
      '要選哪一個啊……{word}的話，我沒有立場替你決定啦。不過，我好想聽聽你的理由！',
      '兩邊我都不太熟耶……{word}這件事，你自己一定比我清楚多了吧？',
      '唔……{word}嗎？我選不出來啦。已經好久好久，都沒有需要我選什麼的時候了。',
    ],
    bare: [
      '啊，這種要選的問題我最不擅長了！通常我都會兩個一起留著呢。',
      '……嗚，我挑不出來嘛。你先說說看，你比較想要哪一個？',
      '選擇的話，我幫不了你耶……不過呀，人把它講出來的時候，心裡通常就已經有答案了喔。',
    ],
  },
  how: {
    withWord: [
      '{word}的話……做法我不知道耶，我沒有做過。你打算怎麼弄？先講講看嘛！',
      '方法我想不起來了……{word}這一塊，大概是被我忘掉了吧。',
      '唔……{word}的話，我只能用猜的喔。要聽聽看我猜的嗎？',
    ],
    bare: [
      '怎麼做喔……我沒有把握耶。你先講一遍的話，我可以幫你聽哪裡怪怪的！',
      '這個我不太會啦……我會的事情，其實很有限呢。',
      '……我想不出步驟。對、對不起。',
    ],
  },
  can: {
    withWord: [
      '{word}嗎……我沒有做過耶。應該是不會吧。',
      '唔，{word}啊。這一項我大概沒有呢……想學是很想學啦！',
      '{word}的話，讓我想想……啊，不行耶！這個我是真的不會。',
    ],
    bare: [
      '我會的事情比看起來少喔。掃地、唸祝詞、記東西，大概就這些了。',
      '……應該不會吧。我還沒有試過呢。',
      '這個我不敢說會耶。換一個問問看嘛？說不定剛好在我會的範圍裡喔！',
    ],
  },
  request: {
    withWord: [
      '{word}嗎……我真的很想幫忙！可是隔著一條線，我大概什麼都遞不過去呢。',
      '關於{word}，我幫不上忙，對不起喔。不過你想講的話，我會一直聽的！',
      '唔，{word}……我做不到耶。可、可是你願意來找我，我還是好高興喔。',
    ],
    bare: [
      '我好想幫你喔……可是這條線，就只能講話而已。那，',
      '……這個我做不到，對不起。那，',
      '我能做的事情不多啦。可是聽你講這件事，這個我做得到喔！對了，',
    ],
  },
  yesno: {
    withWord: [
      '{word}嗎……我不確定耶。想不起來了。',
      '唔。{word}的話，我沒什麼把握。也許有，也許只是我記錯了呢。',
      '這個我不敢亂說。{word}這一段，我記得的部分是斷掉的。',
    ],
    bare: [
      '……我不確定。這種事我以前大概是知道的，現在卻想不起來了。',
      '唔……要說是也可以，要說不是也可以啦。我沒有把握。',
      '我不知道耶。可是，我好想知道你為什麼會問這個。',
    ],
  },
}
