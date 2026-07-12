import { Grid, Stack } from 'styled-system/jsx'
import SectionHeading from 'components/portfolio/SectionHeading'
import FeatureScene from './FeatureScene'
import AddPhraseScene from './scenes/AddPhraseScene'
import ConversionScene from './scenes/ConversionScene'
import EnginesScene from './scenes/EnginesScene'
import LearningScene from './scenes/LearningScene'
import SegmentationScene from './scenes/SegmentationScene'
import SymbolTableScene from './scenes/SymbolTableScene'

const ChiaKeyFeatures = () => (
  <Stack gap={2}>
    <SectionHeading
      en="Features"
      accent="#c77dff"
      center
      sub="在原本的基礎上稍加改造，保留熟悉的手感，並改善安全性與效能。"
    >
      熟悉的那套，更易用
    </SectionHeading>
    <Grid columns={{ base: 1, md: 2 }} gap={5}>
      <FeatureScene
        title="選字學習"
        description="候選排序來自語言模型加上你的選字紀錄。常選的字下次會排前面。"
      >
        <LearningScene />
      </FeatureScene>
      <FeatureScene
        title="加入新詞"
        description="按住 Shift、每按一次 ← 就往前多選一個字，選好按 Enter 加入使用者詞庫；或按 Ctrl+3 直接取游標前三個字（Ctrl+1～9 對應字數）。"
      >
        <AddPhraseScene />
      </FeatureScene>
      <FeatureScene
        title="符號表"
        description="Control+Command+. 開啟符號表。組字區是空的時候，按 Ctrl+0 也會列出標點符號候選。"
      >
        <SymbolTableScene />
      </FeatureScene>
      <FeatureScene
        title="繁體中文轉簡體"
        description="Control+Command+G 切換輸出濾鏡，注音照打、送出簡體。另外 Command+Shift+Space 可切換全形英數。"
      >
        <ConversionScene />
      </FeatureScene>
      <FeatureScene
        title="Tab 斷詞"
        description="組字中把游標移到想斷開的位置按 Tab，就在那裡強制斷詞——「查相干純」在相干之間按一下，整句重組成「茶香甘醇」。"
      >
        <SegmentationScene />
      </FeatureScene>
      <FeatureScene
        title="老朋友都還在"
        description="預設是好打注音的智慧組字，但傳統注音、倉頡、簡易這些 OpenVanilla 時代的輸入模組也一併保留。"
      >
        <EnginesScene />
      </FeatureScene>
    </Grid>
  </Stack>
)

export default ChiaKeyFeatures
