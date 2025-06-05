import SubNav, { SubNavItem } from './SubNav'

const fonts: SubNavItem[] = [
  {
    id: 'akitra',
    title: '台鐵客貨車字體',
    path: '/fonts/akitra',
  },
  {
    id: 'nixie',
    title: 'Nixie 字體',
    path: '/fonts/nixie',
  },
  {
    id: 'huninn',
    title: '粉圓字體',
    path: '/fonts/huninn',
  },
]

const FontsSubNav = () => {
  return <SubNav title="字體作品" items={fonts} />
}

export default FontsSubNav
