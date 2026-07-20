import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import type { ComponentType } from 'react'
import type { Locale } from 'i18n'
import Home from 'pages/index'
import About from 'pages/about'
import Story from 'pages/story'
import Character from 'pages/story/character'
import CharacterArt from 'pages/story/character/art'
import Works from 'pages/works'
import ChiaKey from 'pages/works/chiakey'
import Kumiko from 'pages/works/kumiko'
import TgJpg from 'pages/works/tg-jpg'
import SplitFlap from 'pages/works/split-flap'
import TokyonoSora from 'pages/works/tokyono-sora'
import Fonts from 'pages/fonts'
import Akitra from 'pages/fonts/akitra'
import Huninn from 'pages/fonts/huninn'
import Nixie from 'pages/fonts/nixie'

const routes: Record<string, ComponentType> = {
  '': Home,
  about: About,
  story: Story,
  'story/character': Character,
  'story/character/art': CharacterArt,
  works: Works,
  'works/chiakey': ChiaKey,
  'works/kumiko': Kumiko,
  'works/tg-jpg': TgJpg,
  'works/split-flap': SplitFlap,
  'works/tokyono-sora': TokyonoSora,
  fonts: Fonts,
  'fonts/akitra': Akitra,
  'fonts/huninn': Huninn,
  'fonts/nixie': Nixie,
}

type LocalePageProps = { locale: Locale; route: string }

const LocalePage: NextPage<LocalePageProps> = ({ route }) => {
  const Page = routes[route]
  return <Page />
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: (['ja', 'en'] as Locale[]).flatMap((locale) =>
    Object.keys(routes).map((route) => ({
      params: { locale, slug: route ? route.split('/') : [] },
    }))
  ),
  fallback: false,
})

export const getStaticProps: GetStaticProps<LocalePageProps> = async ({ params }) => ({
  props: {
    locale: params?.locale as Locale,
    route: Array.isArray(params?.slug) ? params.slug.join('/') : '',
  },
})

export default LocalePage
