import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

const SegmentationScene = () => (
  <svg viewBox="0 0 640 300" width="100%" height="100%" role="img" aria-label="按 Tab 重新劃分組字邊界，今天使者變成金天使者">
    <SceneBackground title="Tab 斷詞" />

    <text x="72" y="120" fontSize="12" fill="#8a9bb0">按 Tab 前</text>
    <text x="72" y="150" fontSize="30" fill="#1d2b3a">今天使者</text>
    <line x1="72" y1="160" x2="132" y2="160" stroke="#9aabbe" strokeWidth="3" strokeLinecap="round" />

    <Keycap x={272} y={122} width={92} label="tab ↹" active={false} />
    <path d="M250 141 H392" fill="none" stroke="#2f80ed" strokeWidth="3" markerEnd="url(#seg-arrow)" />
    <defs>
      <marker id="seg-arrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#2f80ed" /></marker>
    </defs>

    <text x="426" y="120" fontSize="12" fill="#8a9bb0">按 Tab 後</text>
    <text x="426" y="150" fontSize="30" fill="#1d2b3a">金天使者</text>
    <line x1="426" y1="160" x2="486" y2="160" stroke="#2f80ed" strokeWidth="3" strokeLinecap="round" />

    <text x="320" y="222" textAnchor="middle" fontSize="14" fill="#2b5d95">游標移到「今｜天」之間按 Tab，重新劃分組字邊界</text>
  </svg>
)

export default SegmentationScene
