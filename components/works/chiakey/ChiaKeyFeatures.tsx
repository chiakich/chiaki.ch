import { Box, Grid, Stack, styled } from 'styled-system/jsx'
import SectionHeading from 'components/portfolio/SectionHeading'
import FeatureScene from './FeatureScene'
import AddPhraseScene from './scenes/AddPhraseScene'
import ConversionScene from './scenes/ConversionScene'
import LayoutsScene from './scenes/LayoutsScene'
import LearningScene from './scenes/LearningScene'
import SymbolTableScene from './scenes/SymbolTableScene'

const Text = styled.p

const ChiaKeyFeatures = () => (
  <Stack gap={10}>
    <Box>
      <SectionHeading en="FEATURES" accent="#78b7ff">功能不多，但每一個都是真的</SectionHeading>
      <Text maxW="720px" lineHeight="1.9" opacity={.72}>以下的按鍵、提示文字與行為都對照輸入法實際的原始碼；打開輸入法照著按，就會發生一樣的事。</Text>
    </Box>
    <Grid columns={{ base: 1, md: 2 }} gap={5}>
      <FeatureScene number="01" title="選字學習" description="候選排序來自 bigram 語言模型加上你的選字紀錄。常選的字下次會排前面；在密碼等安全輸入欄位則不學習。"><LearningScene /></FeatureScene>
      <FeatureScene number="02" title="加入新詞" description="組字中按 Shift+方向鍵選取字詞、Enter 加入使用者詞庫；也可以按 Ctrl+2 直接把游標前兩個字加進去（Ctrl+1～9 取對應字數）。"><AddPhraseScene /></FeatureScene>
      <FeatureScene number="03" title="符號表" description="Control+Command+. 開啟符號表。組字區是空的時候，按 Ctrl+0 也會列出標點符號候選。"><SymbolTableScene /></FeatureScene>
      <FeatureScene number="04" title="繁體中文轉簡體" description="Control+Command+G 切換輸出濾鏡，注音照打、送出簡體。另外 Command+Shift+Space 可切換全形英數。"><ConversionScene /></FeatureScene>
      <FeatureScene number="05" title="五種鍵盤配置" description="標準、倚天、倚天26、許氏、漢語拼音。佔用數字列的配置會自動把選字鍵換成字母鍵。" wide><LayoutsScene /></FeatureScene>
    </Grid>
  </Stack>
)

export default ChiaKeyFeatures
