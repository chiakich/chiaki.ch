import { useState } from 'react'
import { Box, Container, HStack, Stack, styled } from 'styled-system/jsx'
import { LetterpressFilters, LetterpressStyles, Redacted } from 'kappan/react'
import { useI18n } from 'i18n'
import PressPanel, { type PanelMode } from './PressPanel'
import SpecimenRow from './SpecimenRow'
import FaceRow from './FaceRow'
import CodeBlock from './CodeBlock'
import PressPlayground from './PressPlayground'
import { Dial, Switch } from './Controls'
import { DEMO_OPTIONS, demoCss } from './pressOptions'
import {
  CN_LINES,
  CN_TITLE,
  COLOPHON,
  EN_LINES,
  EN_TITLE,
  FACE_ROWS,
  FACE_SAMPLE,
  SPECIMEN_ROWS,
} from './specimenText'

const Heading = styled.h2
const Text = styled.p
const Span = styled.span

const USAGE_VANILLA = `import { mount, redact } from 'kappan'

const dispose = mount({ typeFamily: "'I.Ming', serif" })
document.querySelectorAll('.sg').forEach(redact)`

const USAGE_REACT = `import { LetterpressStyles, LetterpressFilters, Redacted } from 'kappan/react'

<div className="lp">
  <LetterpressStyles typeFamily="'I.Ming', serif" />
  <LetterpressFilters />

  <i className="lp-fibre" /><i className="lp-grain" />

  {/* 豎排加 .lp-v，橫排拿掉就好 */}
  <p className="sg lp-v lp-typed"><Redacted text="常世通信 ███ 第一號" /></p>
</div>`

// 紙上的髒污。位置寫死不用亂數 —— SSR 兩邊要畫在同一個地方。
const DIRT = [
  { top: '6%', left: '9%', width: 3, height: 3 },
  { top: '23%', left: '92%', width: 2, height: 2 },
  { top: '41%', left: '5%', width: 4, height: 1, hair: true },
  { top: '58%', left: '95%', width: 2, height: 2 },
  { top: '77%', left: '7%', width: 5, height: 1, hair: true },
  { top: '89%', left: '90%', width: 3, height: 3 },
]

/** 調節鈕專用的那一組濾鏡。跟頁面本身那組用 idPrefix 分開，才不會連扉頁跟見本一起動。 */
const DIAL_PREFIX = 'lpdial'

const MODES: { mode: PanelMode; labelKey: string }[] = [
  { mode: 'cn-vertical', labelKey: 'modeVertical' },
  { mode: 'cn-horizontal', labelKey: 'modeHorizontal' },
  { mode: 'en-horizontal', labelKey: 'modeEnglish' },
]

/** 見本帖上的段落標題：一行英文小字，底下一條細線。 */
const Caption = ({ en, children }: { en: string; children?: React.ReactNode }) => (
  <Box textAlign="center" mb={{ base: 8, md: 10 }}>
    <Text className="tp" style={{ fontSize: 14, letterSpacing: '.02em' }}>
      {en}
    </Text>
    {children && (
      <Heading className="sg" mt={2} style={{ fontSize: 27, fontWeight: 600, letterSpacing: '.22em', textIndent: '.11em' }}>
        {children}
      </Heading>
    )}
    <Box mx="auto" mt={5} style={{ width: 46, borderTop: '1px solid var(--ink)' }} />
  </Box>
)

const LetterpressPage = () => {
  const { locale, t } = useI18n()
  const [texture, setTexture] = useState(true)
  const [strength, setStrength] = useState(1)
  const [lean, setLean] = useState(1)
  const [weight, setWeight] = useState(1)

  const dialFilters = { ...DEMO_OPTIONS, idPrefix: DIAL_PREFIX, filters: { strength } }
  // 只有這個子樹改指到調節鈕那組濾鏡，頁面其他地方照舊。
  const dialVars = {
    '--texture': texture ? 1 : 0,
    '--lean': lean,
    '--weight': weight,
    '--lp-s': `url(#${DIAL_PREFIX}-s)`,
    '--lp-t': `url(#${DIAL_PREFIX}-t)`,
    '--lp-d': `url(#${DIAL_PREFIX}-d)`,
    '--lp-x': `url(#${DIAL_PREFIX}-x)`,
  } as React.CSSProperties
  const caveats = [1, 2, 3].map((n) => t(`letterpressPage.caveat${n}`))

  return (
    <Box className="lp" position="relative" minHeight="100vh">
      {/* 整頁只掛一份樣式與濾鏡，底下所有樣張共用 —— 整本見本帖是同一張紙。 */}
      <LetterpressStyles {...DEMO_OPTIONS} />
      <LetterpressFilters {...DEMO_OPTIONS} />
      <LetterpressFilters {...dialFilters} />
      <style dangerouslySetInnerHTML={{ __html: demoCss }} />

      <i className="lp-fibre" />
      <i className="lp-expose" />
      <i className="lp-grain" />
      <span className="lp-dirt">
        {DIRT.map((d, i) => (
          <i
            key={i}
            className={d.hair ? 'hair' : undefined}
            style={{ top: d.top, left: d.left, width: d.width, height: d.height }}
          />
        ))}
      </span>

      <Box position="relative" zIndex={1} pt="112px" pb={{ base: 16, md: 24 }}>
        <Container maxW="920px" px={{ base: '24px', md: '40px' }}>
          {/* ── 扉頁 ───────────────────────────────────────── */}
          <Box textAlign="center" mb={{ base: 14, md: 20 }}>
            {/* 拉丁小字吃不太到 -t，那支是照漢字筆畫調的；扉頁這行放大並換 .lp-f-x 才看得出墨壓。 */}
            <Text className="tp lp-f-x" style={{ fontSize: 23, letterSpacing: '.22em', textIndent: '.11em' }}>
              CHIAKI LETTERPRESS WORKS
            </Text>
            <Heading
              as="h1"
              className="sg lp-f-x"
              mt={5}
              style={{ fontSize: 'clamp(38px, 8vw, 76px)', fontWeight: 600, letterSpacing: '.34em', textIndent: '.17em', lineHeight: 1.3 }}
            >
              <Redacted text={t('letterpressPage.house')} />
            </Heading>
            <Text className="tp" mt={5} style={{ fontSize: 14, letterSpacing: '.14em' }}>
              TYPE SPECIMEN · LETTERPRESS FOR THE WEB
            </Text>
            <Text className="sg" mx="auto" mt={8} maxW="620px" style={{ fontSize: 16, lineHeight: 1.95, textAlign: 'justify' }}>
              <Redacted text={t('letterpressPage.intro')} />
            </Text>
          </Box>

          {/* ── 活字見本 ───────────────────────────────────── */}
          <Box mb={{ base: 14, md: 20 }}>
            <Caption en="SPECIMEN OF CHINESE TYPE">{t('letterpressPage.specimenTitle')}</Caption>
            <Stack gap={{ base: 8, md: 10 }}>
              {SPECIMEN_ROWS.map((row) => (
                <SpecimenRow key={row.name} {...row} />
              ))}
            </Stack>
          </Box>

          {/* ── 字體見本 ───────────────────────────────────── */}
          <Box mb={{ base: 14, md: 20 }}>
            <Caption en="SPECIMEN OF FACES">{t('letterpressPage.facesTitle')}</Caption>
            <Stack gap={{ base: 8, md: 10 }}>
              {FACE_ROWS.map((face) => (
                <FaceRow key={face.name} {...face} sample={FACE_SAMPLE} />
              ))}
            </Stack>
          </Box>

          {/* ── 豎排與橫排 ─────────────────────────────────── */}
          <Box mb={{ base: 14, md: 20 }}>
            <Caption en="SETTING">{t('letterpressPage.modesTitle')}</Caption>
            <HStack gap={{ base: 6, md: 12 }} justifyContent="center" flexWrap="wrap" mb={10}>
              <Switch label={t('letterpressPage.dialTexture')} on={texture} onToggle={() => setTexture(!texture)} />
              <Dial label={t('letterpressPage.dialStrength')} value={strength} onCommit={setStrength} />
              <Dial label={t('letterpressPage.dialLean')} value={lean} onCommit={setLean} />
              <Dial label={t('letterpressPage.dialWeight')} value={weight} onCommit={setWeight} />
            </HStack>
            <Stack gap={12} style={dialVars}>
              {MODES.map(({ mode, labelKey }) => {
                const latin = mode === 'en-horizontal'
                return (
                  <Box key={mode}>
                    <Text className="lbl" textAlign="center" mb={4}>{t(`letterpressPage.${labelKey}`)}</Text>
                    <PressPanel
                      mode={mode}
                      title={latin ? EN_TITLE : CN_TITLE}
                      lines={latin ? EN_LINES : CN_LINES}
                    />
                  </Box>
                )
              })}
            </Stack>
          </Box>

          {/* ── 試打 ───────────────────────────────────────── */}
          <Box mb={{ base: 14, md: 20 }}>
            <Caption en="SET YOUR OWN">{t('letterpressPage.playTitle')}</Caption>
            <PressPlayground />
          </Box>

          {/* ── 用法 ───────────────────────────────────────── */}
          <Box mb={{ base: 14, md: 20 }}>
            <Caption en="USAGE">{t('letterpressPage.usageTitle')}</Caption>
            <Stack gap={6}>
              {[
                [t('letterpressPage.usagePlain'), USAGE_VANILLA],
                ['React', USAGE_REACT],
              ].map(([label, code]) => (
                <Box key={label} overflowX="auto" p={{ base: 5, md: 7 }} style={{ border: '1px solid var(--ink)' }}>
                  <Text className="lbl" mb={4}>{label}</Text>
                  <CodeBlock code={code} />
                </Box>
              ))}
            </Stack>
          </Box>

          {/* ── 使用前要知道 ───────────────────────────────── */}
          <Box mb={{ base: 14, md: 20 }}>
            <Caption en="BEFORE YOU USE IT">{t('letterpressPage.caveatTitle')}</Caption>
            <Stack gap={5} maxW="700px" mx="auto">
              {caveats.map((caveat, index) => (
                <HStack key={index} gap={4} alignItems="baseline">
                  <Span className="tp" flexShrink={0} style={{ fontSize: 13 }}>{`0${index + 1}`}</Span>
                  <Text className="sg" style={{ fontSize: 14, lineHeight: 1.95, textAlign: 'justify' }}>
                    <Redacted text={caveat} />
                  </Text>
                </HStack>
              ))}
            </Stack>
          </Box>

          {/* ── 版權頁 ─────────────────────────────────────── */}
          <Box textAlign="center">
            <Text className="sg" style={{ fontSize: 13, letterSpacing: '.3em', textIndent: '.15em' }}>
              <Redacted text={COLOPHON} />
            </Text>
            {/* IPA 授權要求標示原字型與授權，子集也算派生程式。 */}
            <Text className="tp" mt={4} style={{ fontSize: 11, letterSpacing: '.02em', opacity: .7 }}>
              Type set in{' '}
              <styled.a href="https://github.com/ichitenfont/I.Ming" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>
                I.Ming 一點明體
              </styled.a>
              {' · '}
              <styled.a href="/fonts/IMing-IPA-LICENSE.md" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>
                IPA Font License 1.0
              </styled.a>
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default LetterpressPage
