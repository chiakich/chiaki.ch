import { motion } from 'framer-motion'
import { Box, Flex, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import { useI18n } from 'i18n'

const Heading = styled.h3
const Text = styled.p
const Code = styled.code
const Chip = styled.span
const Image = styled.img

// ChiaKey-Lexicon 的四個資料層（release builder 依固定順序疊加），
// 裝到使用者機器上之後，runtime 再疊上使用者詞庫與學習快取。
// 陣列順序 = 疊放順序（index 0 在最底層）。
const spreadY = (index: number) => 115 - index * 105
const stackedY = (index: number) => 10 - index * 39

const LexiconLayers = ({ layers, localMachine }: { layers: { name: string; local?: boolean; fill: string; border: string }[]; localMachine: string }) => (
  <Box
    position="relative"
    height={{ base: '450px', md: '450px' }}
    style={{ perspective: '1200px' }}
    overflow={{ base: 'hidden', md: 'visible' }}
  >
    {layers.map(({ name, local, fill, border }, index) => (
      <motion.div
        key={name}
        initial={{ y: spreadY(index), opacity: 0 }}
        whileInView={{ y: stackedY(index), opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: index * 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '42%',
          marginLeft: 'max(-24vw, -210px)',
        }}
      >
        <Box
          width={{ base: '48vw', md: '420px' }}
          height={{ base: '104px', md: '200px' }}
          borderRadius="22px"
          p={4}
          style={{
            transform: 'rotateX(56deg) rotateZ(-38deg)',
            background: fill,
            border: `1px ${local ? 'dashed' : 'solid'} ${border}`,
            boxShadow: '0 30px 60px rgba(10,0,25,.45)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <HStack gap={2}>
            <Text
              fontSize="md"
              fontWeight="bold"
              letterSpacing=".08em"
              color="rgba(255,255,255,.92)"
            >
              {name}
            </Text>
            {local && (
              <Text fontSize="10px" color="rgba(236,220,255,.7)">
                · {localMachine}
              </Text>
            )}
          </HStack>
        </Box>
      </motion.div>
    ))}
  </Box>
)

const ChiaKeyLexicon = () => {
  const { t } = useI18n()
  const layers = [
    { name: t('chiakeyPage.lexicon.layers.0'), fill: 'rgba(46,32,66,.94)', border: 'rgba(199,125,255,.22)' },
    { name: t('chiakeyPage.lexicon.layers.1'), fill: 'rgba(66,26,84,.86)', border: 'rgba(199,125,255,.32)' },
    { name: t('chiakeyPage.lexicon.layers.2'), fill: 'rgba(95,16,105,.78)', border: 'rgba(199,125,255,.45)' },
    { name: t('chiakeyPage.lexicon.layers.3'), fill: 'rgba(135,36,148,.72)', border: 'rgba(199,125,255,.58)' },
    { name: t('chiakeyPage.lexicon.layers.4'), local: true, fill: 'rgba(178,68,190,.62)', border: 'rgba(236,220,255,.72)' },
  ]
  const dataLayerItems = [
    ['keykey-boneyard-bootstrap', 'keykey-punctuations-cin', 'keykey-module-cin', 'keykey-prepopulated-service-data', 'bpmf-ext-cin'],
    ['libchewing-data', 'rime-essay', 'mozc-emoticon-data'],
    ['chiaki-modern-overlay', 'chiaki-auto-hotwords-overlay', 'chiaki-synthetic-overlay', '...'],
    ['chiaki-rime-conversion-policy', 'chiaki-fragment-denylist'],
  ]
  const dataLayers = dataLayerItems.map((items, index) => ({ name: t(`chiakeyPage.lexicon.dataLayers.${index}.title`), goal: t(`chiakeyPage.lexicon.dataLayers.${index}.description`), items }))
  const localLayers = [0, 1].map((index) => [t(`chiakeyPage.lexicon.localLayers.${index}.title`), t(`chiakeyPage.lexicon.localLayers.${index}.description`)])

  return (
  <Stack gap={2}>
    <Image
      src="/assets/works/chiakey/chiakey-lexicon-icon.webp"
      alt={t('chiakeyPage.lexicon.iconAlt')}
      width={{ base: '76px', md: '104px' }}
      height={{ base: '76px', md: '104px' }}
      mx="auto"
      mb={2}
      borderRadius={{ base: '17px', md: '23px' }}
      boxShadow="0 18px 40px rgba(7,2,14,.32)"
    />
    <SectionHeading
      en={t('chiakeyPage.lexicon.english')}
      accent="#c77dff"
      center
      sub={t('chiakeyPage.lexicon.description')}
    >
      {t('chiakeyPage.lexicon.title')}
    </SectionHeading>
    <MotionSection>
      <LexiconLayers layers={layers} localMachine={t('chiakeyPage.lexicon.localMachine')} />
    </MotionSection>
    <Grid columns={{ base: 1, md: 2 }} gap={4} mt={{ base: 8, md: 12 }}>
      {dataLayers.map(({ name, goal, items }, index) => (
        <MotionSection key={name} delay={index * 0.06}>
          <Box backgroundColor="#150d20" borderRadius="20px" p={6} height="100%">
            <HStack gap={2} mb={2}>
              <Box
                width="9px"
                height="9px"
                borderRadius="full"
                style={{ background: layers[index].border }}
              />
              <Heading fontSize="md">{name}</Heading>
            </HStack>
            <Text fontSize="xs" opacity={0.6} lineHeight="1.9" mb={3}>
              {goal}
            </Text>
            <Flex gap={1.5} flexWrap="wrap">
              {items.map((item) => (
                <Chip
                  key={item}
                  fontFamily="mono"
                  fontSize="10px"
                  backgroundColor="rgba(199,125,255,.08)"
                  color="#cfa9ee"
                  borderRadius="6px"
                  px={2}
                  py={1}
                >
                  {item}
                </Chip>
              ))}
            </Flex>
          </Box>
        </MotionSection>
      ))}
    </Grid>
    <Grid columns={{ base: 1, md: 2 }} gap={4} mt={4}>
      {localLayers.map(([name, description], index) => (
        <MotionSection key={name} delay={index * 0.06}>
          <Box
            borderRadius="20px"
            p={6}
            height="100%"
            border="1px dashed rgba(236,220,255,.35)"
            backgroundColor="rgba(21,13,32,.6)"
          >
            <HStack gap={2} mb={2}>
              <Box
                width="9px"
                height="9px"
                borderRadius="full"
                style={{ background: layers[4].border }}
              />
              <Heading fontSize="md">{name}</Heading>
              <Text fontSize="10px" opacity={0.5}>
                {t('chiakeyPage.lexicon.localMachine')}
              </Text>
            </HStack>
            <Text fontSize="xs" opacity={0.6} lineHeight="1.9">
              {description}
            </Text>
          </Box>
        </MotionSection>
      ))}
    </Grid>
    <MotionSection>
      <Box
        backgroundColor="#150d20"
        borderRadius="24px"
        p={{ base: 6, md: 8 }}
        mt={4}
      >
        <Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
          <Stack gap={3}>
            <Heading fontSize="xl" letterSpacing="-.01em">
              {t('chiakeyPage.lexicon.update.title')}
            </Heading>
            <Text fontSize="sm" lineHeight="2" opacity={0.7}>
              {t('chiakeyPage.lexicon.update.before')}{' '}
              <Code fontSize=".95em" color="#d49bff">
                ChiaKey-Lexicon
              </Code>{' '}
              {' '}{t('chiakeyPage.lexicon.update.after')}
            </Text>
          </Stack>
          <HStack
            gap={3}
            flexWrap="wrap"
            justifyContent={{ base: 'flex-start', md: 'flex-end' }}
          >
            <ProjectLink
              href="https://github.com/chiakich/ChiaKey-Lexicon"
              label={t('chiakeyPage.lexicon.update.contribute')}
              detail="GitHub"
              accent="#c77dff"
            />
          </HStack>
        </Grid>
      </Box>
    </MotionSection>
  </Stack>
  )
}

export default ChiaKeyLexicon
