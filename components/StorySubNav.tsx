import SubNav, { SubNavItem } from './SubNav'

const storyItems: SubNavItem[] = [
  {
    id: 'story',
    title: '故事',
    path: '/story',
  },
  {
    id: 'character',
    title: '角色介紹',
    path: '/story/character',
  },
  {
    id: 'art',
    title: '作品集',
    path: '/story/character/art',
  },
]

const StorySubNav = () => {
  return <SubNav title="千秋稻荷社" items={storyItems} />
}

export default StorySubNav
