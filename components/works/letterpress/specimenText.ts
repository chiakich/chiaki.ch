// 見本帖上的樣張內容。這是「字」本身的樣品，不是介面文案，所以三個語系都印同一份 ——
// 中文直排那塊在英文版也該印中文，不然就不叫中文見本了。

/**
 * 見本行，仿美華書館的見本帖。
 *
 * 那六個英文名不是隨手配的級數名，是美華書館拿來標自己漢字活字的分類。早期各地做的
 * 漢字活字尺寸並不統一（戴爾、柏林、巴黎、香港、上海各一套），美華書館蒐集之後把它們
 * 歸到最接近的西文字身上再編號，號數制就是這麼固定下來的。
 *
 * 兩套名字說的是同一批活字：五號 Small Pica、二號 Double Small Pica，而號數表上
 * 二號正好是五號的兩倍；六號 Brevier、三號 Two-line Brevier，也正好兩倍。
 * 所以這裡並列著印，字級直接用號數 class。
 */
export const SPECIMEN_ROWS = [
  { hao: '一號', name: 'Double Pica.', cls: 'lp-sz-1', text: '千秋印書館' },
  { hao: '二號', name: 'Double Small Pica.', cls: 'lp-sz-2', text: '常世電子活版所' },
  { hao: '三號', name: 'Two-line Brevier.', cls: 'lp-sz-3', text: '代印中西各種書籍' },
  { hao: '四號', name: 'Three-line Diamond.', cls: 'lp-sz-4', text: '鉛字紙墨與印工俱備' },
  { hao: '五號', name: 'Small Pica.', cls: 'lp-sz-5', text: '本館開設以來已有五十餘年' },
  { hao: '六號', name: 'Brevier.', cls: 'lp-sz-6', text: '承印經史子集章程契據名帖傳單' },
]

/** 中文樣張。直排與橫排印的是同一份，才對照得出差別。 */
export const CN_TITLE = '活版印刷'
export const CN_LINES = [
  '一顆鉛字是一塊金屬。字面朝上，排進版盤裡，一顆挨著一顆，行與行之間夾進薄薄的鉛條決定行距。',
  '排好的版上機、著墨、壓紙。壓力落在紙上，字就陷進纖維裡，指腹摸得到那道凹痕 —— 這是活版與平版最明顯的分別。',
  '墨不會每次都沾得一樣勻。這一顆吃飽了墨，飽滿發黑；那一顆沾得少，筆畫就虛了半邊。',
  '鉛字會磨損。用久的字邊角崩了口，印出來缺一角，換一顆新的又太黑，同一頁上深淺不齊。',
  '排字工的手也不是尺。每顆字擺進去都差那麼一點點，整段看下去，字是活的，行是斜的。',
  '這些在照相排版之後都被修掉了。字距均勻、墨色一致、邊緣銳利，乾淨，但也就少了那點手的溫度。',
  '這個套件把上面這些事寫回樣式裡：紙的纖維、墨的濃淡、字的歪斜與缺角，一層一層疊回去。',
  '你現在讀的這段，直排與橫排是同一份內容。',
]

/** 英文樣張。同樣三個語系共用。 */
export const EN_TITLE = 'On Movable Type'
export const EN_LINES = [
  'A sort is a small block of metal. Face up, locked into the forme, one against the next, with thin strips of lead between the lines to hold them apart.',
  'The forme goes on the press, takes ink, and meets the paper. The pressure drives the face into the fibre, and you can feel the bite with a fingertip.',
  'The ink never lands evenly. One letter comes up full and black, the next takes less and goes thin along one side of the stroke.',
  'Type wears out. An old sort prints with a corner missing; a fresh one prints too dark, and the page is never quite level.',
  'Nor is the compositor a ruler. Every piece sits a fraction off, and read as a paragraph the letters are alive and the lines lean.',
  'Photocomposition tidied all of this away — even spacing, even colour, clean edges. Cleaner, and colder.',
  'This package writes those accidents back in: the fibre of the paper, the weight of the ink, the lean and the chipped corner.',
]

/** 字體見本。每一行是「字體名＋樣字」，整行用該字體排，字體名本身就是樣張。 */
export const FACE_ROWS = [
  { name: 'I.Ming', zh: '一點明體', note: '明體 · 開源自架', stack: "'I.Ming', 'Chiaki IMing Subset', serif" },
  { name: 'Rixing Song No.2', zh: '日星宋體貳號', note: '宋體 · justfont', stack: "'rixingsong-semibold', serif" },
  { name: 'Source Han Sans', zh: '思源黑體', note: '黑體 · justfont', stack: "'sourcehansans-tc', sans-serif" },
  { name: 'Lanyang Hei', zh: '蘭陽黑', note: '超黑 · justfont', stack: "'jf-lanyanghei', sans-serif" },
]

/** 字體見本每一行印的樣字，接在字體名後面。 */
export const FACE_SAMPLE = '千秋印書館'


/** 版權頁那一行，仿原帖的「上海美華書館北京路十八號」。 */
export const COLOPHON = '千秋稻荷社印書館　常世町一丁目'
