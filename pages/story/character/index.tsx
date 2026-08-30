import type { NextPage } from 'next'
import CharacterFile from 'components/character/file/CharacterFile'
import { makeStaticProps } from 'i18n/messages'

const CharacterOverviewPage: NextPage = () => <CharacterFile />

export default CharacterOverviewPage

export const getStaticProps = makeStaticProps('story/character')
