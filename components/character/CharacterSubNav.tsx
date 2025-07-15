import SubNav, { SubNavItem } from '../SubNav'

const characterItems: SubNavItem[] = [
  {
    id: 'overview',
    title: '介紹',
    path: '/character',
  },
  {
    id: 'art',
    title: '作品集',
    path: '/character/art',
  },
]

const CharacterSubNav = () => {
  return <SubNav title="角色介紹" items={characterItems} />
}

export default CharacterSubNav
