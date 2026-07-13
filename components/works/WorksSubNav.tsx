import SubNav, { SubNavItem } from 'components/SubNav'

// 也提供給 TopBar 的手機漢堡選單使用
export const worksNavItems: SubNavItem[] = [
  { id: 'works', title: '作品集', path: '/works' },
  { id: 'chiakey', title: 'ChiaKey', path: '/works/chiakey' },
  { id: 'kumiko', title: 'Kumiko', path: '/works/kumiko' },
  { id: 'tokyono-sora', title: '東京乃空', path: '/works/tokyono-sora' },
  { id: 'tg-jpg', title: 'tg.jpg', path: '/works/tg-jpg' },
  { id: 'split-flap', title: 'Split Flap', path: '/works/split-flap' },
]

const WorksSubNav = () => <SubNav title="Works" items={worksNavItems} />

export default WorksSubNav
