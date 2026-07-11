import SubNav, { SubNavItem } from 'components/SubNav'

const items: SubNavItem[] = [
  { id: 'fonts', title: '字體集', path: '/fonts' },
  { id: 'akitra', title: '台鐵字體', path: '/fonts/akitra' },
  { id: 'nixie', title: 'Nixie', path: '/fonts/nixie' },
  { id: 'huninn', title: '粉圓', path: '/fonts/huninn' },
]

const FontsSubNav = () => <SubNav title="Fonts" items={items} />

export default FontsSubNav
