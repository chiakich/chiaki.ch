import { NextPage } from 'next'
import FontPage from '../../components/FontPage'

const AkitraPage: NextPage = () => {
  return (
    <FontPage
      title="台鐵客貨車字體"
      description="基於台鐵客貨車表記文字設計的字體，重現台灣鐵道文化之美。這個字體收錄了台鐵客貨車上常見的表記文字，包括車種代號、車號、載重等資訊，讓使用者能夠重現台灣鐵道文化的視覺特色。"
      iframeUrl="https://chiaki.uk/akitra"
    />
  )
}

export default AkitraPage
