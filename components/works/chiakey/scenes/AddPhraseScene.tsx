import { InputLine, Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

const AddPhraseScene = () => (
  <svg viewBox="0 0 640 300" width="100%" height="100%" role="img" aria-label="組字狀態下按 Control 加候選數字快速加入新詞">
    <SceneBackground title="快速加入詞典" />
    <InputLine text="少戰" x={112} y={126} width={62} animated={false} />
    <Keycap x={354} y={91} width={76} label="control" active={false} />
    <text x="444" y="116" fontSize="20" fill="#738196">＋</text>
    <Keycap x={470} y={91} label="1" active={false} />
    <g>
      <rect x="112" y="174" width="416" height="52" rx="10" fill="#e9f3ff" stroke="#76adf1" />
      <circle cx="140" cy="200" r="12" fill="#2f80ed" />
      <path d="M134 200 L139 205 L147 195" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <text x="164" y="206" fontSize="17" fill="#23466e">加入新詞：「少戰」</text>
    </g>
  </svg>
)

export default AddPhraseScene
