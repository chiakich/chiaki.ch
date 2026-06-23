import { NextPage } from 'next'
import FontPage from '../../components/FontPage'

const NixiePage: NextPage = () => {
  return (
    <FontPage
      title="Nixie 字體"
      description="靈感來自輝光管顯示器的數位字體，包含數字與特殊符號。這個字體重現了輝光管獨特的視覺效果，適合用於數位時鐘、計數器等需要復古科技感的設計。"
      iframeUrl="https://chiaki.uk/nixie"
    />
  )
}

export default NixiePage
