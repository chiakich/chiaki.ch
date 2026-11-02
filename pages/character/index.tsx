import CharactersIndexPage from 'components/characters/CharactersIndexPage'
import { makeStaticProps } from 'i18n/messages'

export default CharactersIndexPage

export const getStaticProps = makeStaticProps('character')
