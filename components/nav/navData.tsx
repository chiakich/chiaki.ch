import type { ReactNode } from 'react'
import {
  AkitraIcon,
  ArtIcon,
  CharacterIcon,
  ChiaKeyIcon,
  CollectionIcon,
  HuninnIcon,
  KumikoIcon,
  NixieIcon,
  SplitFlapIcon,
  StoryIcon,
  TgJpgIcon,
  TokyonoIcon,
} from './navIcons'

export interface NavItem {
  id: string
  title: string
  path: string
  icon: ReactNode
}

export interface NavSection {
  /** 桌機常駐 SubNav 左側的區段標題（flyout 不再重複顯示） */
  title: string
  items: NavItem[]
}

export type Translate = (key: string) => string

export const getMainLinks = (t: Translate): [string, string][] => [
  [t('nav.home'), '/'],
  [t('nav.about'), '/about'],
  [t('nav.story'), '/story'],
  [t('nav.works'), '/works'],
  [t('nav.fonts'), '/fonts'],
]

// 有 flyout 的區段。每個區段的第一個項目就是該區的 landing page。
export const getNavSections = (t: Translate): Record<string, NavSection> => ({
  [t('nav.story')]: {
    title: t('nav.storyTitle'),
    items: [
      { id: 'story', title: t('nav.storyIndex'), path: '/story', icon: <StoryIcon /> },
      {
        id: 'character',
        title: t('nav.character'),
        path: '/story/character',
        icon: <CharacterIcon />,
      },
      {
        id: 'art',
        title: t('nav.art'),
        path: '/story/character/art',
        icon: <ArtIcon />,
      },
    ],
  },
  [t('nav.works')]: {
    title: t('nav.works'),
    items: [
      { id: 'works', title: t('nav.worksIndex'), path: '/works', icon: <CollectionIcon /> },
      {
        id: 'chiakey',
        title: 'ChiaKey',
        path: '/works/chiakey',
        icon: <ChiaKeyIcon />,
      },
      { id: 'kumiko', title: 'Kumiko', path: '/works/kumiko', icon: <KumikoIcon /> },
      {
        id: 'tokyono-sora',
        title: '東京乃空',
        path: '/works/tokyono-sora',
        icon: <TokyonoIcon />,
      },
      { id: 'tg-jpg', title: 'tg.jpg', path: '/works/tg-jpg', icon: <TgJpgIcon /> },
      {
        id: 'split-flap',
        title: 'Split Flap',
        path: '/works/split-flap',
        icon: <SplitFlapIcon />,
      },
    ],
  },
  [t('nav.fonts')]: {
    title: t('nav.fonts'),
    items: [
      { id: 'fonts', title: t('nav.fontsIndex'), path: '/fonts', icon: <CollectionIcon /> },
      {
        id: 'akitra',
        title: t('nav.akitra'),
        path: '/fonts/akitra',
        icon: <AkitraIcon />,
      },
      { id: 'nixie', title: 'Nixie', path: '/fonts/nixie', icon: <NixieIcon /> },
      { id: 'huninn', title: t('nav.huninn'), path: '/fonts/huninn', icon: <HuninnIcon /> },
    ],
  },
})
