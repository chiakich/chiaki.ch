import { Box, Container, Flex, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import ZipcodeHero from './ZipcodeHero'
import { useI18n } from 'i18n'

const Heading = styled.h3
const Text = styled.p
const Span = styled.span
const Code = styled.code
const Pre = styled.pre

const ACCENT = '#3fcf8e'

const CARD_BG = '#101a15'

// 說明模糊比對的樣本：地址與郵遞區號固定，說明文字走 i18n。
const FUZZY_ROWS = [
  ['臺北市信義區市府路1號', '110204'],
  ['台北市秀山街', '100005'],
  ['松山區', '105'],
  ['松江路100號', '104091'],
]

const METRICS = [
  ['1.7–2.0 µs', 0],
  ['34 ms', 1],
  ['0.80 MB', 2],
  ['5.3 MB', 3],
] as const

// translate() 的實際輸出；第三筆刻意翻不出來（信義區沒有四維三路）。
const TRANSLATE_ROWS = [
  [
    '臺北市中正區忠孝東路一段1巷1弄1號1樓',
    '1F., No. 1, Aly. 1, Ln. 1, Sec. 1, Zhongxiao E. Rd., Zhongzheng Dist., Taipei City 100009, Taiwan (R.O.C.)',
  ],
  ['政大郵局第12號信箱', 'P.O. Box 12, National Chengchi University, Taipei City 116979, Taiwan (R.O.C.)'],
  ['臺北市信義區四維三路2號', ''],
]

const NODE_SNIPPET = `import { find, lookup, translate } from 'tw-fuzzy-zipcode'

find('臺北市信義區市府路1號')
// '110204'
find('松江路100號')
// '104091'，路名全臺唯一，縣市與行政區可以省略
lookup('臺北市')
// { zipcode: '1', source: 'gradual', resolution: 'prefix' }
translate('臺北市信義區市府路1號').english
// 'No. 1, Shifu Rd., Xinyi Dist., Taipei City 110204, Taiwan (R.O.C.)'`

const BROWSER_SNIPPET = `import { loadZipcode } from 'tw-fuzzy-zipcode/browser'

// 瀏覽器沒有 fs，改用 loadZipcode() 載入隨套件發布的資料檔
const zip = await loadZipcode({
  gradualUrl: '/data/gradual.tsv',
  preciseUrl: '/data/precise.tsv',
  mailboxUrl: '/data/mailbox.tsv',
})

zip.find('臺北市信義區市府路1號')
// '110204'`

const API_ROWS = [
  'find(address)',
  'lookup(address)',
  'findAddress() / findMailbox()',
  'translate(address)',
  'loadZipcode({ gradualUrl, preciseUrl, mailboxUrl })',
  'loadTranslator({ roadUrl, districtUrl })',
]

const VALUE_ROWS = [
  ['source', 'precise · gradual · mailbox'],
  ['resolution', 'six-digit · three-digit · prefix'],
]

const CodeBlock = ({ label, code }: { label: string; code: string }) => (
  <Box backgroundColor={CARD_BG} borderRadius="16px" px={{ base: 5, md: 6 }} py={4} overflowX="auto">
    <Text fontSize="10px" letterSpacing=".14em" color="#6f8579" mb={2}>
      {label}
    </Text>
    <Pre fontFamily="monospace" fontSize={{ base: 'xs', md: 'sm' }} lineHeight="1.9">
      {code.split('\n').map((line, index) => (
        <Code
          key={index}
          display="block"
          whiteSpace="pre"
          color={line.trimStart().startsWith('//') ? '#6f8579' : undefined}
        >
          {line || ' '}
        </Code>
      ))}
    </Pre>
  </Box>
)

const ZipcodePage = () => {
  const { t } = useI18n()

  return (
    <Box backgroundColor="#080d0b" color="white" minHeight="100vh">
      <ZipcodeHero />
      <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 20 }}>
        <Stack gap={20}>
          <MotionSection>
            <SectionHeading en="IDEA" accent={ACCENT}>
              {t('zipcodePage.idea')}
            </SectionHeading>
            <Text maxW="760px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={0.78}>
              {t('zipcodePage.ideaText')}
            </Text>
          </MotionSection>

          <Box>
            <SectionHeading en="FUZZY MATCHING" accent={ACCENT} sub={t('zipcodePage.fuzzyText')}>
              {t('zipcodePage.fuzzy')}
            </SectionHeading>
            <Stack gap={3}>
              {FUZZY_ROWS.map(([address, zipcode], index) => (
                <MotionSection key={address} delay={index * 0.06}>
                  <Flex
                    backgroundColor={CARD_BG}
                    borderRadius="18px"
                    px={{ base: 5, md: 7 }}
                    py={{ base: 5, md: 5 }}
                    gap={{ base: 3, md: 6 }}
                    direction={{ base: 'column', md: 'row' }}
                    alignItems={{ base: 'flex-start', md: 'center' }}
                  >
                    <Text fontSize={{ base: 'md', md: 'lg' }} flex="1" letterSpacing=".01em">
                      {address}
                    </Text>
                    <HStack gap={4} flexShrink={0}>
                      <Span color={ACCENT} opacity={.55}>→</Span>
                      <Span fontFamily="monospace" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color={ACCENT}>
                        {zipcode}
                      </Span>
                    </HStack>
                    <Text
                      fontSize="sm"
                      opacity={.6}
                      lineHeight="1.7"
                      width={{ base: '100%', md: '300px' }}
                      flexShrink={0}
                    >
                      {t(`zipcodePage.fuzzyNotes.${index}`)}
                    </Text>
                  </Flex>
                </MotionSection>
              ))}
            </Stack>
          </Box>

          <MotionSection>
            <Grid columns={{ base: 1, md: 2 }} gap={10} alignItems="center">
              <Box>
                <SectionHeading en="UNIQUE ROAD" accent={ACCENT}>
                  {t('zipcodePage.unique')}
                </SectionHeading>
                <Text lineHeight="1.9" opacity={0.75}>
                  {t('zipcodePage.uniqueText')}
                </Text>
              </Box>
              <Stack gap={3} backgroundColor={CARD_BG} borderRadius="24px" px={{ base: 6, md: 8 }} py={{ base: 7, md: 8 }}>
                <Text fontSize="10px" letterSpacing=".16em" color="#6f8579" textTransform="uppercase">
                  {t('zipcodePage.uniqueInput')}
                </Text>
                <Text fontSize={{ base: 'lg', md: 'xl' }}>松江路100號</Text>
                <Text color={ACCENT} opacity={.55}>↓</Text>
                <Text fontSize="10px" letterSpacing=".16em" color="#6f8579" textTransform="uppercase">
                  {t('zipcodePage.uniqueFilled')}
                </Text>
                <Text fontSize={{ base: 'lg', md: 'xl' }}>
                  <Span color={ACCENT}>臺北市中山區</Span>松江路100號
                </Text>
                <Text fontFamily="monospace" fontSize="2rem" fontWeight="bold" color={ACCENT} mt={2}>
                  104091
                </Text>
              </Stack>
            </Grid>
          </MotionSection>

          <Box>
            <SectionHeading en="SPEED" accent={ACCENT} sub={t('zipcodePage.speedText')}>
              {t('zipcodePage.speed')}
            </SectionHeading>
            <Grid columns={{ base: 2, md: 4 }} gap={4}>
              {METRICS.map(([value, index]) => (
                <MotionSection key={value} delay={index * 0.07}>
                  <Box backgroundColor={CARD_BG} borderRadius="24px" p={{ base: 5, md: 7 }} height="100%">
                    <Text
                      fontFamily="monospace"
                      fontSize={{ base: '1.4rem', md: '1.8rem' }}
                      fontWeight="bold"
                      color={ACCENT}
                      letterSpacing="-.02em"
                    >
                      {value}
                    </Text>
                    <Text fontSize="sm" opacity={.65} lineHeight="1.7" mt={3}>
                      {t(`zipcodePage.metrics.${index}`)}
                    </Text>
                  </Box>
                </MotionSection>
              ))}
            </Grid>
            <MotionSection delay={0.1}>
              <Text fontSize="sm" opacity={.5} lineHeight="1.9" mt={5} maxW="760px">
                {t('zipcodePage.speedFootnote')}
              </Text>
            </MotionSection>
          </Box>

          <MotionSection>
            <Grid columns={{ base: 1, md: 2 }} gap={10} alignItems="center">
              <Stack gap={4} backgroundColor={CARD_BG} borderRadius="24px" px={{ base: 6, md: 8 }} py={{ base: 7, md: 8 }} order={{ md: 2 }}>
                <Text fontSize={{ base: 'md', md: 'lg' }}>基隆愛三路郵局第5號信箱</Text>
                <HStack gap={4}>
                  <Span color={ACCENT} opacity={.55}>→</Span>
                  <Span fontFamily="monospace" fontSize="1.8rem" fontWeight="bold" color={ACCENT}>200900</Span>
                </HStack>
                <Text fontSize="sm" opacity={.55} lineHeight="1.8" fontFamily="monospace">
                  P.O. Box 5, Keelung Ai 3rd Road, Keelung City 200900
                </Text>
              </Stack>
              <Box>
                <SectionHeading en="P.O. BOX" accent={ACCENT}>
                  {t('zipcodePage.mailbox')}
                </SectionHeading>
                <Text lineHeight="1.9" opacity={0.75}>
                  {t('zipcodePage.mailboxText')}
                </Text>
              </Box>
            </Grid>
          </MotionSection>

          <Box>
            <SectionHeading en="ENGLISH ADDRESS" accent={ACCENT} sub={t('zipcodePage.translateText')}>
              {t('zipcodePage.translate')}
            </SectionHeading>
            <Stack gap={3}>
              {TRANSLATE_ROWS.map(([chinese, english], index) => (
                <MotionSection key={chinese} delay={index * 0.06}>
                  <Stack
                    gap={3}
                    backgroundColor={CARD_BG}
                    borderRadius="18px"
                    px={{ base: 5, md: 7 }}
                    py={{ base: 5, md: 6 }}
                  >
                    <Text fontSize={{ base: 'md', md: 'lg' }}>{chinese}</Text>
                    {english ? (
                      <Text fontFamily="monospace" fontSize={{ base: 'xs', md: 'sm' }} lineHeight="1.8" color={ACCENT}>
                        {english}
                      </Text>
                    ) : (
                      <Text fontFamily="monospace" fontSize={{ base: 'xs', md: 'sm' }} opacity={.4}>
                        english: &apos;&apos;
                      </Text>
                    )}
                    <Text fontSize="sm" opacity={.55} lineHeight="1.7">
                      {t(`zipcodePage.translateNotes.${index}`)}
                    </Text>
                  </Stack>
                </MotionSection>
              ))}
            </Stack>
          </Box>

          <MotionSection>
            <SectionHeading en="OPEN SOURCE" accent={ACCENT}>
              {t('zipcodePage.openSource')}
            </SectionHeading>
            <Text maxW="760px" lineHeight="1.9" opacity={0.75} mb={7}>
              {t('zipcodePage.openSourceText')}
            </Text>
            <Flex gap={3} flexWrap="wrap">
              <ProjectLink href="https://zipcode.chiaki.ch/" label={t('zipcodePage.tryIt')} solid accent={ACCENT} />
              <ProjectLink
                href="https://www.npmjs.com/package/tw-fuzzy-zipcode"
                label="npm"
                detail="tw-fuzzy-zipcode"
                accent={ACCENT}
              />
              <ProjectLink
                href="https://github.com/chiakich/tw-fuzzy-zipcode"
                label="GitHub Repository"
                detail="MIT"
                accent={ACCENT}
              />
            </Flex>
            <Text fontSize="sm" opacity={.45} lineHeight="1.9" mt={8} maxW="760px">
              {t('zipcodePage.credit')}
            </Text>
          </MotionSection>

          <Box>
            <SectionHeading en="USAGE" accent={ACCENT} sub={t('zipcodePage.usageText')}>
              {t('zipcodePage.usage')}
            </SectionHeading>
            <Stack gap={4}>
              <MotionSection>
                <CodeBlock label="TERMINAL" code={'$ npm install tw-fuzzy-zipcode'} />
              </MotionSection>
              <MotionSection delay={0.06}>
                <CodeBlock label="NODE.JS" code={NODE_SNIPPET} />
              </MotionSection>
              <MotionSection delay={0.12}>
                <CodeBlock label="BROWSER" code={BROWSER_SNIPPET} />
              </MotionSection>
            </Stack>

            <MotionSection delay={0.06}>
              <Heading fontSize="lg" mt={12} mb={4} letterSpacing="-.01em">
                {t('zipcodePage.api.title')}
              </Heading>
              <Stack gap={0} borderTop="1px solid rgba(255,255,255,.08)">
                {API_ROWS.map((signature, index) => (
                  <Flex
                    key={signature}
                    direction={{ base: 'column', md: 'row' }}
                    gap={{ base: 2, md: 8 }}
                    py={4}
                    borderBottom="1px solid rgba(255,255,255,.08)"
                  >
                    <Code
                      fontFamily="monospace"
                      fontSize="sm"
                      color={ACCENT}
                      width={{ base: '100%', md: '340px' }}
                      flexShrink={0}
                      wordBreak="break-word"
                    >
                      {signature}
                    </Code>
                    <Text fontSize="sm" opacity={.65} lineHeight="1.8">
                      {t(`zipcodePage.api.rows.${index}`)}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </MotionSection>

            <MotionSection delay={0.06}>
              <Heading fontSize="lg" mt={12} mb={4} letterSpacing="-.01em">
                {t('zipcodePage.api.valuesTitle')}
              </Heading>
              <Stack gap={0} borderTop="1px solid rgba(255,255,255,.08)">
                {VALUE_ROWS.map(([field, values], index) => (
                  <Flex
                    key={field}
                    direction={{ base: 'column', md: 'row' }}
                    gap={{ base: 2, md: 8 }}
                    py={4}
                    borderBottom="1px solid rgba(255,255,255,.08)"
                  >
                    <Box width={{ base: '100%', md: '340px' }} flexShrink={0}>
                      <Code fontFamily="monospace" fontSize="sm" color={ACCENT}>{field}</Code>
                      <Text fontFamily="monospace" fontSize="xs" opacity={.5} mt={1}>{values}</Text>
                    </Box>
                    <Text fontSize="sm" opacity={.65} lineHeight="1.8">
                      {t(`zipcodePage.api.values.${index}`)}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </MotionSection>

            <MotionSection delay={0.06}>
              <Flex gap={3} flexWrap="wrap" mt={9}>
                <ProjectLink
                  href="https://github.com/chiakich/tw-fuzzy-zipcode#readme"
                  label={t('zipcodePage.readDocs')}
                  detail="README"
                  accent={ACCENT}
                />
                <ProjectLink
                  href="https://github.com/chiakich/tw-fuzzy-zipcode/blob/main/docs/benchmark.md"
                  label={t('zipcodePage.readBenchmark')}
                  accent={ACCENT}
                />
              </Flex>
            </MotionSection>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default ZipcodePage
