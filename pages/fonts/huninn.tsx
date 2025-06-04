import { NextPage } from 'next'
import FontPage from '../../components/FontPage'

const HuninnPage: NextPage = () => {
  return (
    <FontPage
      title="粉圓字體"
      description="在 justfont 期間製作的開源圓體字型，為台灣使用者優化設計。粉圓字體是一款基於 Kosugi Maru 改作的字型，針對台灣使用者的需求進行優化，包含完整的繁體中文字符集，以及優化過的排版設定。"
      iframeUrl="https://justfont.com/huninn/"
    />
  )
}

export default HuninnPage
