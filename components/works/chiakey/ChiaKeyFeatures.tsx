import { Grid, Stack } from 'styled-system/jsx'
import SectionHeading from 'components/portfolio/SectionHeading'
import FeatureScene from './FeatureScene'
import AddPhraseScene from './scenes/AddPhraseScene'
import ConversionScene from './scenes/ConversionScene'
import EnginesScene from './scenes/EnginesScene'
import LearningScene from './scenes/LearningScene'
import SymbolTableScene from './scenes/SymbolTableScene'

const ChiaKeyFeatures = () => (
  <Stack gap={2}>
    <SectionHeading
      en="Features"
      accent="#c77dff"
      center
      sub="以下的按鍵、提示文字與行為都對照輸入法實際的原始碼；打開輸入法照著按，就會發生一樣的事。"
    >
      功能不多，但每一個都是真的
    </SectionHeading>
    <Grid columns={{ base: 1, md: 2 }} gap={5}>
      <FeatureScene title="選字學習" description="候選排序來自語言模型加上你的選字紀錄。常選的字下次會排前面；在密碼等安全輸入欄位則不學習。"><LearningScene /></FeatureScene>
      <FeatureScene title="加入新詞" description="按住 Shift、每按一次 ← 就往前多選一個字，選好按 Enter 加入使用者詞庫；或按 Ctrl+3 直接取游標前三個字（Ctrl+1～9 對應字數）。"><AddPhraseScene /></FeatureScene>
      <FeatureScene title="符號表" description="Control+Command+. 開啟符號表。組字區是空的時候，按 Ctrl+0 也會列出標點符號候選。"><SymbolTableScene /></FeatureScene>
      <FeatureScene title="繁體中文轉簡體" description="Control+Command+G 切換輸出濾鏡，注音照打、送出簡體。另外 Command+Shift+Space 可切換全形英數。"><ConversionScene /></FeatureScene>
      <FeatureScene title="老朋友都還在" description="預設是好打注音的智慧組字，但傳統注音、倉頡、簡易這些 OpenVanilla 時代的輸入模組也一併保留。" wide><EnginesScene /></FeatureScene>
    </Grid>
  </Stack>
)

export default ChiaKeyFeatures
