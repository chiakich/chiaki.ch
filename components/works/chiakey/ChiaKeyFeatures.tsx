import { Box, Grid, Stack, styled } from 'styled-system/jsx'
import SectionHeading from 'components/portfolio/SectionHeading'
import FeatureScene from './FeatureScene'
import AddPhraseScene from './scenes/AddPhraseScene'
import ConversionScene from './scenes/ConversionScene'
import LearningScene from './scenes/LearningScene'
import PunctuationScene from './scenes/PunctuationScene'
import SegmentationScene from './scenes/SegmentationScene'
import ShiftPreferenceScene from './scenes/ShiftPreferenceScene'
import SymbolTableScene from './scenes/SymbolTableScene'
import TaiwanLexiconScene from './scenes/TaiwanLexiconScene'

const Heading = styled.h3
const Text = styled.p

const Chapter = ({ label, title, children }: { label: string; title: string; children: React.ReactNode }) => (
  <Stack gap={5}>
    <Box>
      <Text color="#78b7ff" fontFamily="mono" fontSize="xs" letterSpacing=".22em" mb={2}>{label}</Text>
      <Heading fontSize={{ base: '1.6rem', md: '2rem' }}>{title}</Heading>
    </Box>
    <Grid columns={{ base: 1, md: 2 }} gap={5}>{children}</Grid>
  </Stack>
)

const ChiaKeyFeatures = () => (
  <Stack gap={14}>
    <Box><SectionHeading en="FEATURES" accent="#78b7ff">懂中文，也懂你怎麼打字</SectionHeading><Text maxW="720px" lineHeight="1.9" opacity={.72}>這些功能不是藏在規格表裡；每一格都對照實際的按鍵、組字狀態與輸入結果。</Text></Box>
    <Chapter label="CHAPTER 01" title="懂你的中文">
      <FeatureScene number="01" title="為台灣整理的詞庫" description="專門收集台灣常用詞彙，讓候選結果貼近每天真正使用的語言。"><TaiwanLexiconScene /></FeatureScene>
      <FeatureScene number="02" title="智慧學習偏好" description="常選的候選詞會逐漸往前，輸入法跟著你的使用習慣調整。"><LearningScene /></FeatureScene>
      <FeatureScene number="03" title="內建繁簡轉換" description="不離開輸入流程就能切換繁體與簡體輸出。" wide><ConversionScene /></FeatureScene>
    </Chapter>
    <Chapter label="CHAPTER 02" title="編輯組字，不必重打">
      <FeatureScene number="04" title="快速加入新詞" description="「少戰」仍在藍色底線的組字狀態時，按 Control 加候選數字即可加入詞典。"><AddPhraseScene /></FeatureScene>
      <FeatureScene number="05" title="Tab 斷詞" description="把游標移到「今｜天」之間按 Tab，建立組字邊界，重新組成「金天使者」。"><SegmentationScene /></FeatureScene>
    </Chapter>
    <Chapter label="CHAPTER 03" title="鍵盤就在手上">
      <FeatureScene number="06" title="Shift 大小寫偏好" description="在偏好設定決定按住 Shift 時，要輸出大寫還是小寫英文。"><ShiftPreferenceScene /></FeatureScene>
      <FeatureScene number="07" title="快捷符號表" description="按 Option + Command + .，符號表立刻出現在輸入位置附近。"><SymbolTableScene /></FeatureScene>
      <FeatureScene number="08" title="全形標點快捷鍵" description="Shift + , 直接輸出全形逗號，其他常用符號也都有相應快捷鍵。" wide><PunctuationScene /></FeatureScene>
    </Chapter>
  </Stack>
)

export default ChiaKeyFeatures
