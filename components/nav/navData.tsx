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

export const mainLinks: [string, string][] = [
  ['Home', '/'],
  ['About', '/about'],
  ['Story', '/story'],
  ['Works', '/works'],
  ['Fonts', '/fonts'],
]

// 有 flyout 的區段。每個區段的第一個項目就是該區的 landing page。
export const navSections: Record<string, NavSection> = {
  Story: {
    title: '千秋稻荷社',
    items: [
      { id: 'story', title: '故事', path: '/story', icon: <StoryIcon /> },
      {
        id: 'character',
        title: '角色介紹',
        path: '/story/character',
        icon: <CharacterIcon />,
      },
      {
        id: 'art',
        title: '作品集',
        path: '/story/character/art',
        icon: <ArtIcon />,
      },
    ],
  },
  Works: {
    title: 'Works',
    items: [
      { id: 'works', title: '作品集', path: '/works', icon: <CollectionIcon /> },
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
  Fonts: {
    title: 'Fonts',
    items: [
      { id: 'fonts', title: '字體集', path: '/fonts', icon: <CollectionIcon /> },
      {
        id: 'akitra',
        title: '台鐵字體',
        path: '/fonts/akitra',
        icon: <AkitraIcon />,
      },
      { id: 'nixie', title: 'Nixie', path: '/fonts/nixie', icon: <NixieIcon /> },
      { id: 'huninn', title: '粉圓', path: '/fonts/huninn', icon: <HuninnIcon /> },
    ],
  },
}
