import SubNav, { SubNavItem } from 'components/SubNav'

const items: SubNavItem[] = [
  { id: 'works', title: '作品集', path: '/works' },
  { id: 'chiakey', title: 'ChiaKey', path: '/works/chiakey' },
  { id: 'kumiko', title: 'Kumiko', path: '/works/kumiko' },
  { id: 'tokyono-sora', title: '東京乃空', path: '/works/tokyono-sora' },
  { id: 'tg-jpg', title: 'tg.jpg', path: '/works/tg-jpg' },
]

const WorksSubNav = () => <SubNav title="Works" items={items} />

export default WorksSubNav
