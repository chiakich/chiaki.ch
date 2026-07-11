import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

const ShiftPreferenceScene = () => (
  <svg viewBox="0 0 640 300" width="100%" height="100%" role="img" aria-label="偏好設定控制按住 Shift 時輸出大寫或小寫英文">
    <SceneBackground title="偏好設定 · 鍵盤" />
    <text x="92" y="104" fontSize="14" fill="#506276">按住 Shift 鍵時輸出</text>
    <rect x="92" y="122" width="238" height="42" rx="9" fill="#e5e8ec" />
    <rect x="96" y="126" width="113" height="34" rx="7" fill="white" stroke="#b9c3cf" />
    <text x="152" y="149" textAnchor="middle" fontSize="14" fontWeight="700" fill="#28394b">大寫英文</text>
    <text x="270" y="149" textAnchor="middle" fontSize="14" fill="#8794a3">小寫英文</text>

    <Keycap x={390} y={112} width={74} label="shift" active={false} />
    <text x={472} y={137} fontSize="18" fill="#738196">＋</text>
    <Keycap x={492} y={112} label="a" active={false} />

    <path d="M414 190 H520" fill="none" stroke="#9aabbe" strokeWidth="2.5" markerEnd="url(#shift-arrow)" />
    <defs>
      <marker id="shift-arrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#9aabbe" /></marker>
    </defs>
    <text x="467" y="238" textAnchor="middle" fontSize="46" fontWeight="700" fill="#2478db">A</text>
  </svg>
)

export default ShiftPreferenceScene
