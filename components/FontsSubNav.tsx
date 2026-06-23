import SubNav, { SubNavItem } from './SubNav'

const fonts: SubNavItem[] = [
  {
    id: 'works',
    title: '作品集',
    path: '/works',
  },
  {
    id: 'akitra',
    title: '台鐵客貨車字體',
    path: '/works/akitra',
  },
  {
    id: 'nixie',
    title: 'Nixie 字體',
    path: '/works/nixie',
  },
  {
    id: 'huninn',
    title: '粉圓字體',
    path: '/works/huninn',
  },
]

const FontsSubNav = () => {
  return <SubNav title="作品" items={fonts} />
}

export default FontsSubNav
