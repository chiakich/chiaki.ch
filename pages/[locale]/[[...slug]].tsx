import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import type { ComponentType } from 'react'
import type { Locale } from 'i18n'
import dynamic from 'next/dynamic'

// Each route stays SSR'd (default ssr:true) for static export output,
// but split into its own chunk so one locale page doesn't bundle every route's JS.
const routes: Record<string, ComponentType> = {
  '': dynamic(() => import('pages/index')),
  profile: dynamic(() => import('pages/profile')),
  story: dynamic(() => import('pages/story')),
  'story/character': dynamic(() => import('pages/story/character')),
  'story/character/art': dynamic(() => import('pages/story/character/art')),
  works: dynamic(() => import('pages/works')),
  'works/chiakey': dynamic(() => import('pages/works/chiakey')),
  'works/kumiko': dynamic(() => import('pages/works/kumiko')),
  'works/tg-jpg': dynamic(() => import('pages/works/tg-jpg')),
  'works/split-flap': dynamic(() => import('pages/works/split-flap')),
  'works/tokyono-sora': dynamic(() => import('pages/works/tokyono-sora')),
  fonts: dynamic(() => import('pages/fonts')),
  'fonts/akitra': dynamic(() => import('pages/fonts/akitra')),
  'fonts/huninn': dynamic(() => import('pages/fonts/huninn')),
  'fonts/nixie': dynamic(() => import('pages/fonts/nixie')),
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
