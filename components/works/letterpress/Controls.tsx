import { useState } from 'react'
import { Box, HStack, styled } from 'styled-system/jsx'

const Text = styled.p
const Span = styled.span

/**
 * 見本帖上的按鈕。線框與填滿兩種狀態，跟整本的語彙一致。
 *
 * mousedown 一律擋掉預設行為：按鈕若搶走焦點，旁邊的 contenteditable 會失焦、
 * 選取範圍當場消失，「選一段字改字級」就永遠沒有東西可改。
 */
export const Key = ({
  children,
  on,
  onClick,
  title,
}: {
  children: React.ReactNode
  on?: boolean
  onClick: () => void
  title?: string
}) => (
  <styled.button
    type="button"
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    aria-pressed={on}
    title={title}
    className="sg"
    px={3}
    py="6px"
    cursor="pointer"
    style={{
      border: '1px solid var(--ink)',
      background: on ? 'var(--ink)' : 'transparent',
      color: on ? 'var(--paper)' : 'var(--ink)',
      fontSize: 13,
      letterSpacing: '.1em',
      transition: 'background .2s ease, color .2s ease',
    }}
  >
    {children}
  </styled.button>
)

/** 開關。方框勾選，跟整本的線條語彙一致。 */
export const Switch = ({
  label,
  on,
  onToggle,
}: {
  label: string
  on: boolean
  onToggle: () => void
}) => (
  <styled.button
    type="button"
    onMouseDown={(event) => event.preventDefault()}
    onClick={onToggle}
    aria-pressed={on}
    className="sg"
    display="inline-flex"
    alignItems="center"
    gap={2}
    px={4}
    py={2}
    alignSelf="flex-end"
    cursor="pointer"
    style={{
      border: '1px solid var(--ink)',
      background: on ? 'var(--ink)' : 'transparent',
      color: on ? 'var(--paper)' : 'var(--ink)',
      fontSize: 14,
      letterSpacing: '.14em',
      transition: 'background .2s ease, color .2s ease',
    }}
  >
    <Span aria-hidden>{on ? '■' : '□'}</Span>
    {label}
  </styled.button>
)

/**
 * 調節鈕。
 *
 * 純粹改 CSS 變數的（行高、字距、歪斜、濃淡）拖動時就即時反應，那不用重算什麼；
 * 會重建整棵濾鏡樹的（墨壓強度）則等放開才套用，拖到一半的中間值本來也沒人要看。
 */
export const Dial = ({
  label,
  value,
  min = 0,
  max = 2,
  step = 0.1,
  live = false,
  format = (v: number) => v.toFixed(1),
  onCommit,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  live?: boolean
  format?: (value: number) => string
  onCommit: (value: number) => void
}) => {
  const [dragging, setDragging] = useState(value)
  const commit = () => onCommit(dragging)

  return (
    <Box minWidth="170px" flexGrow={1} maxWidth="240px">
      <HStack justifyContent="space-between" mb={2}>
        <Text className="lbl">{label}</Text>
        <Text className="tp" style={{ fontSize: 12 }}>{format(dragging)}</Text>
      </HStack>
      <styled.input
        type="range"
        min={min}
        max={max}
        step={step}
        value={dragging}
        onChange={(event) => {
          const next = Number(event.currentTarget.value)
          setDragging(next)
          if (live) onCommit(next)
        }}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        aria-label={label}
        width="100%"
        cursor="pointer"
        style={{ accentColor: 'var(--ink)' }}
      />
    </Box>
  )
}
