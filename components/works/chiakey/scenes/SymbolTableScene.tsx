import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

const symbols = ['，', '。', '「', '」', '《', '》', '—', '…', '※', '☆', '℃', '→']

const SymbolTableScene = () => (
  <svg viewBox="0 0 640 300" width="100%" height="100%" role="img" aria-label="按 Option Command 句點叫出符號表">
    <SceneBackground title="符號表" />
    <Keycap x={70} y={128} width={76} label="option" active={false} />
    <text x={158} y={153} fontSize="18" fill="#738196">＋</text>
    <Keycap x={176} y={128} width={90} label="command" active={false} />
    <text x={278} y={153} fontSize="18" fill="#738196">＋</text>
    <Keycap x={296} y={128} label="." active={false} />
    <g transform="translate(374 78)">
      <rect width="196" height="144" rx="12" fill="#24272d" />
      {symbols.map((symbol, index) => {
        const x = 17 + (index % 4) * 44
        const y = 18 + Math.floor(index / 4) * 38
        return <g key={symbol}><rect x={x} y={y} width="34" height="30" rx="5" fill={index === 0 ? '#347fd6' : '#343840'} /><text x={x + 17} y={y + 21} textAnchor="middle" fontSize="16" fill="white">{symbol}</text></g>
      })}
    </g>
  </svg>
)

export default SymbolTableScene
