import { SceneBackground, SvgCandidateMenu } from '../ChiaKeySvgPrimitives'

const words = ['手搖', '鹽酥雞', '巷口', '捷運', '厝邊', '機車'] as const

const TaiwanLexiconScene = () => (
  <svg viewBox="0 0 640 300" width="100%" height="100%" role="img" aria-label="台灣常用詞彙收錄在詞庫並出現在候選列">
    <SceneBackground title="千秋輸入法綜合詞庫" />
    <text x="72" y="98" fontSize="12" fill="#69798c" letterSpacing="1">TAIWAN LEXICON · 台灣詞庫</text>
    {words.map((word, index) => {
      const x = 72 + (index % 2) * 118
      const y = 116 + Math.floor(index / 2) * 46
      return (
        <g key={word}>
          <rect x={x} y={y} width="104" height="34" rx="8" fill="#fff" stroke="#c2d0e0" />
          <text x={x + 52} y={y + 22} textAnchor="middle" fontSize="16" fill="#2c5684">{word}</text>
        </g>
      )
    })}
    <SvgCandidateMenu items={['手搖', '手搖飲', '手搖杯']} x={378} y={110} page="1/4" animated={false} />
  </svg>
)

export default TaiwanLexiconScene
