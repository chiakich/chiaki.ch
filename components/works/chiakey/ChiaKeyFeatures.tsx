import { Grid, Stack } from 'styled-system/jsx'
import SectionHeading from 'components/portfolio/SectionHeading'
import FeatureScene from './FeatureScene'
import AddPhraseScene from './scenes/AddPhraseScene'
import ConversionScene from './scenes/ConversionScene'
import EnginesScene from './scenes/EnginesScene'
import LearningScene from './scenes/LearningScene'
import SegmentationScene from './scenes/SegmentationScene'
import SymbolTableScene from './scenes/SymbolTableScene'
import { useI18n } from 'i18n'

const ChiaKeyFeatures = () => {
  const { t } = useI18n()

  return (
  <Stack gap={2}>
    <SectionHeading
      en={t('chiakeyPage.features.english')}
      accent="#c77dff"
      center
      sub={t('chiakeyPage.features.description')}
    >
      {t('chiakeyPage.features.title')}
    </SectionHeading>
    <Grid columns={{ base: 1, md: 2 }} gap={5}>
      <FeatureScene
        title={t('chiakeyPage.features.items.0.title')}
        description={t('chiakeyPage.features.items.0.description')}
      >
        <LearningScene />
      </FeatureScene>
      <FeatureScene
        title={t('chiakeyPage.features.items.1.title')}
        description={t('chiakeyPage.features.items.1.description')}
      >
        <AddPhraseScene />
      </FeatureScene>
      <FeatureScene
        title={t('chiakeyPage.features.items.2.title')}
        description={t('chiakeyPage.features.items.2.description')}
      >
        <SymbolTableScene />
      </FeatureScene>
      <FeatureScene
        title={t('chiakeyPage.features.items.3.title')}
        description={t('chiakeyPage.features.items.3.description')}
      >
        <ConversionScene />
      </FeatureScene>
      <FeatureScene
        title={t('chiakeyPage.features.items.4.title')}
        description={t('chiakeyPage.features.items.4.description')}
      >
        <SegmentationScene />
      </FeatureScene>
      <FeatureScene
        title={t('chiakeyPage.features.items.5.title')}
        description={t('chiakeyPage.features.items.5.description')}
      >
        <EnginesScene />
      </FeatureScene>
    </Grid>
  </Stack>
  )
}

export default ChiaKeyFeatures
