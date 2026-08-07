// Input normalisation for the terminal's rule matcher.
//
// Every rule pattern is written against normalised text, so patterns only ever
// have to spell one form of a word. Note that \b is useless here — Chinese has
// no word boundaries — so patterns rely on the dictionary segmenter instead.

// Common simplified → traditional, restricted to characters with a single
// unambiguous traditional form. Ambiguous ones (后/後, 发/發/髮, 干/乾/幹,
// 面/麵, 只/隻, 里/裡, 云/雲…) are deliberately absent: guessing wrong reads
// worse than leaving the character alone, and the segmenter just treats an
// unmapped character as unknown.
const SIMPLIFIED_PAIRS =
  '爱愛碍礙袄襖罢罷摆擺败敗办辦帮幫绑綁谤謗剥剝饱飽宝寶报報辈輩贝貝备備惫憊绷繃笔筆毕畢币幣闭閉边邊编編变變辩辯辫辮标標鳖鱉宾賓滨濱饼餅拨撥驳駁补補财財参參蚕蠶残殘惭慚惨慘灿燦苍蒼舱艙仓倉沧滄厕廁侧側测測层層搀攙掺摻蝉蟬馋饞谗讒缠纏忏懺尝嘗长長偿償肠腸厂廠畅暢钞鈔车車彻徹尘塵陈陳衬襯撑撐称稱惩懲诚誠骋騁痴癡迟遲驰馳齿齒宠寵畴疇踌躊筹籌绸綢橱櫥厨廚锄鋤雏雛础礎储儲触觸处處传傳疮瘡闯闖创創锤錘纯純绰綽辞辭词詞赐賜聪聰丛叢凑湊窜竄错錯达達带帶贷貸担擔单單掸撣胆膽惮憚诞誕弹彈当當挡擋党黨荡蕩档檔导導岛島捣搗祷禱灯燈邓鄧敌敵涤滌递遞缔締点點垫墊电電钓釣调調谍諜叠疊钉釘顶頂订訂东東动動栋棟冻凍独獨读讀赌賭镀鍍锻鍛断斷缎緞兑兌队隊对對吨噸顿頓钝鈍夺奪堕墮鹅鵝额額恶惡饿餓儿兒尔爾饵餌贰貳罚罰阀閥矾礬烦煩贩販饭飯访訪纺紡飞飛废廢费費纷紛坟墳奋奮愤憤粪糞丰豐枫楓锋鋒风風疯瘋冯馮缝縫讽諷凤鳳肤膚辐輻抚撫辅輔赋賦负負妇婦缚縛该該钙鈣盖蓋赶趕秆稈冈岡刚剛钢鋼纲綱岗崗镐鎬搁擱鸽鴿阁閣铬鉻个個给給龚龔巩鞏贡貢沟溝构構购購够夠蛊蠱顾顧剐剮关關观觀馆館惯慣贯貫广廣犷獷规規归歸龟龜闺閨轨軌诡詭柜櫃贵貴刽劊辊輥滚滾锅鍋国國过過骇駭韩韓汉漢阂閡鹤鶴贺賀轰轟鸿鴻红紅壶壺护護沪滬华華画畫话話怀懷坏壞欢歡环環缓緩换換唤喚痪瘓谎謊挥揮辉輝毁毀贿賄秽穢会會烩燴讳諱诲誨绘繪荤葷浑渾获獲货貨祸禍击擊机機积積饥飢讥譏鸡雞绩績缉緝极極辑輯级級挤擠蓟薊剂劑济濟计計记記际際继繼纪紀夹夾荚莢颊頰贾賈钾鉀价價驾駕歼殲坚堅笺箋间間艰艱缄緘茧繭检檢碱鹼拣揀捡撿简簡俭儉减減荐薦槛檻鉴鑑践踐贱賤见見键鍵舰艦剑劍饯餞渐漸溅濺涧澗将將浆漿蒋蔣桨槳奖獎讲講酱醬胶膠浇澆骄驕娇嬌搅攪铰鉸矫矯侥僥饺餃缴繳绞絞轿轎较較阶階节節洁潔结結诫誡届屆紧緊谨謹进進晋晉烬燼缙縉茎莖鲸鯨惊驚经經颈頸静靜镜鏡径徑竞競净淨纠糾旧舊驹駒举舉据據剧劇惧懼锯鋸鹃鵑绢絹觉覺决決诀訣绝絕军軍骏駿开開凯凱忾愾龛龕铠鎧恳懇垦墾抠摳库庫裤褲夸誇块塊侩儈宽寬矿礦旷曠亏虧溃潰馈饋扩擴阔闊蜡蠟腊臘莱萊来來赖賴兰蘭拦攔栏欄烂爛滥濫蓝藍篮籃阑闌谰讕榄欖缆纜捞撈劳勞涝澇唠嘮乐樂镭鐳垒壘类類泪淚离離篱籬礼禮鲤鯉丽麗厉厲励勵砾礫隶隸俩倆联聯莲蓮连連涟漣怜憐镰鐮敛斂恋戀炼煉练練粮糧两兩辆輛谅諒疗療辽遼镣鐐猎獵临臨邻鄰鳞鱗凛凜赁賃龄齡铃鈴灵靈岭嶺领領馏餾刘劉浏瀏龙龍聋聾咙嚨笼籠垄壟拢攏陇隴楼樓娄婁搂摟篓簍芦蘆卢盧颅顱庐廬炉爐掳擄卤滷虏虜鲁魯赂賂禄祿录錄陆陸驴驢吕呂铝鋁侣侶屡屢缕縷虑慮滤濾绿綠峦巒挛攣孪孿乱亂抡掄轮輪伦倫沦淪论論萝蘿罗羅逻邏锣鑼箩籮骡騾骆駱络絡妈媽玛瑪码碼蚂螞马馬骂罵吗嗎买買卖賣迈邁麦麥脉脈瞒瞞馒饅蛮蠻满滿谩謾猫貓锚錨铆鉚贸貿么麼霉黴没沒镁鎂门門闷悶们們锰錳梦夢谜謎弥彌觅覓绵綿缅緬庙廟灭滅悯憫闽閩鸣鳴铭銘谬謬缪繆蓦驀谋謀亩畝纳納钠鈉难難挠撓脑腦恼惱闹鬧馁餒内內拟擬腻膩撵攆酿釀鸟鳥聂聶镊鑷镍鎳柠檸拧擰泞濘钮鈕纽紐脓膿浓濃农農疟瘧欧歐鸥鷗殴毆呕嘔沤漚盘盤庞龐抛拋赔賠辔轡喷噴鹏鵬骗騙飘飄频頻贫貧苹蘋凭憑评評泼潑颇頗扑撲铺鋪谱譜脐臍齐齊骑騎岂豈启啟气氣弃棄讫訖牵牽铅鉛迁遷签簽谦謙钱錢钳鉗潜潛浅淺谴譴堑塹枪槍呛嗆墙牆蔷薔抢搶锹鍬桥橋窍竅窃竊钦欽亲親寝寢轻輕氢氫倾傾顷頃请請庆慶琼瓊穷窮趋趨区區驱驅龋齲权權劝勸鹊鵲让讓饶饒扰擾绕繞热熱韧韌认認纫紉荣榮绒絨软軟锐銳闰閏润潤洒灑萨薩鳃鰓赛賽伞傘丧喪骚騷扫掃涩澀杀殺纱紗筛篩晒曬删刪闪閃陕陝赡贍缮繕伤傷赏賞烧燒绍紹赊賒摄攝慑懾设設绅紳审審婶嬸肾腎渗滲声聲绳繩胜勝圣聖师師狮獅湿濕诗詩时時蚀蝕实實识識驶駛势勢释釋饰飾视視试試寿壽兽獸枢樞输輸书書赎贖属屬树樹竖豎数數帅帥双雙谁誰顺順说說硕碩烁爍丝絲饲飼讼訟颂頌诵誦擞擻苏蘇诉訴肃肅虽雖随隨绥綏岁歲孙孫损損笋筍缩縮琐瑣锁鎖獭獺挞撻态態摊攤贪貪瘫癱滩灘坛壇谭譚谈談叹嘆汤湯烫燙涛濤绦絛讨討腾騰誊謄锑銻题題体體屉屜条條贴貼铁鐵厅廳听聽烃烴铜銅统統头頭图圖涂塗团團颓頹蜕蛻脱脫驼駝鸵鴕洼窪袜襪弯彎湾灣顽頑万萬网網违違围圍为為潍濰维維苇葦伟偉伪偽纬緯谓謂卫衛闻聞纹紋稳穩问問瓮甕挝撾蜗蝸涡渦窝窩呜嗚钨鎢乌烏诬誣无無芜蕪吴吳坞塢雾霧务務误誤牺犧锡錫袭襲习習铣銑戏戲细細虾蝦辖轄峡峽侠俠狭狹厦廈吓嚇鲜鮮纤纖贤賢衔銜闲閒显顯险險现現献獻县縣馅餡羡羨宪憲线線厢廂镶鑲乡鄉详詳响響项項萧蕭销銷晓曉啸嘯蝎蠍协協挟挾携攜胁脅谐諧写寫泻瀉谢謝锌鋅衅釁兴興汹洶锈鏽绣繡虚虛嘘噓许許绪緒续續轩軒悬懸选選癣癬绚絢学學勋勳询詢寻尋驯馴训訓讯訊逊遜压壓鸦鴉鸭鴨哑啞亚亞讶訝阉閹盐鹽严嚴颜顏阎閻艳艷厌厭砚硯彦彥谚諺验驗鸯鴦杨楊扬揚疡瘍阳陽痒癢养養样樣谣謠摇搖尧堯窑窯药藥爷爺页頁业業医醫铱銥颐頤遗遺仪儀蚁蟻义義议議谊誼译譯异異绎繹荫蔭阴陰银銀饮飲隐隱樱櫻婴嬰鹰鷹应應缨纓莹瑩萤螢营營蝇蠅赢贏颖穎哟喲拥擁痈癰踊踴咏詠优優忧憂邮郵铀鈾犹猶诱誘与與屿嶼语語誉譽预預驭馭鸳鴛渊淵辕轅园園员員圆圓缘緣远遠约約跃躍钥鑰粤粵悦悅阅閱郧鄖匀勻陨隕运運蕴蘊韵韻杂雜灾災攒攢暂暫赞讚赃贓凿鑿枣棗灶竈责責择擇则則泽澤贼賊赠贈轧軋铡鍘闸閘诈詐斋齋债債毡氈斩斬盏盞辗輾崭嶄栈棧战戰绽綻张張涨漲帐帳账賬胀脹赵趙蛰蟄辙轍锗鍺这這贞貞针針侦偵诊診镇鎮阵陣挣掙睁睜铮錚筝箏证證郑鄭织織职職执執纸紙挚摯掷擲帜幟质質滞滯终終肿腫众眾诌謅轴軸皱皺昼晝骤驟猪豬诸諸诛誅烛燭瞩矚嘱囑贮貯铸鑄驻駐专專转轉赚賺桩樁装裝妆妝壮壯状狀锥錐坠墜缀綴谆諄浊濁资資渍漬踪蹤综綜总總纵縱邹鄒诅詛组組钻鑽龊齪'

const SIMPLIFIED = new Map<string, string>()
for (let i = 0; i + 1 < SIMPLIFIED_PAIRS.length; i += 2) {
  SIMPLIFIED.set(SIMPLIFIED_PAIRS[i], SIMPLIFIED_PAIRS[i + 1])
}

// Anything here separates clauses; the matcher scores each clause on its own so
// "你好，你叫什麼名字" can hit the name rule rather than only the greeting.
const CLAUSE_BREAK = /[，。！？；、,.!?;~～\n\r]+/

export type NormalizedInput = {
  /** Punctuation-free, traditional, lower-cased — what patterns match against. */
  text: string
  /** Same treatment, split on clause punctuation. */
  clauses: string[]
  /** Trailing/embedded question marks, before punctuation was stripped. */
  hasQuestionMark: boolean
  /** Repeated ！ or ？ — treated as raised voice by a few rules. */
  emphatic: boolean
}

const toTraditional = (text: string) => {
  let out = ''
  for (const char of text) out += SIMPLIFIED.get(char) ?? char
  return out
}

// Keeps CJK, latin, digits and the few kana that show up in her own lines.
const KEEP = /[㐀-䶿一-鿿豈-﫿ぁ-んァ-ヶー0-9a-z]/i

const strip = (text: string) => {
  let out = ''
  for (const char of text) if (KEEP.test(char)) out += char
  return out
}

export const normalize = (raw: string): NormalizedInput => {
  // NFKC folds full-width latin and digits; the rest is done by hand because
  // NFKC would also decompose characters we want to keep intact.
  const folded = toTraditional(raw.normalize('NFKC').toLowerCase())

  return {
    text: strip(folded),
    clauses: folded
      .split(CLAUSE_BREAK)
      .map(strip)
      .filter((clause) => clause.length > 0),
    hasQuestionMark: /[?？]/.test(raw),
    emphatic: /[!！]{2,}|[?？]{2,}/.test(raw),
  }
}

// Function words carry no topic, so they never become the echoed keyword.
export const STOP_WORDS = new Set(
  ('的 了 是 在 有 和 也 都 就 很 我 你 妳 他 她 它 們 我們 你們 他們 這 那 這個 那個 ' +
    '什麼 怎麼 為什麼 哪 誰 嗎 呢 吧 啊 喔 唷 耶 欸 呀 嘛 哦 唔 嗯 一 個 不 沒 沒有 ' +
    '要 會 能 可以 可能 應該 覺得 好 好像 還 又 再 才 只 但 但是 而且 所以 因為 如果 ' +
    '之 與 或 跟 對 從 把 被 讓 給 用 到 去 來 說 想 看 知道 一個 一下 一點 現在 時候 ' +
    '真的 其實 反正 然後 然後呢 不過 大概 有點 比較 最 更 太 超 好了 這樣 那樣 怎樣')
    .split(' ')
    .filter(Boolean)
)
