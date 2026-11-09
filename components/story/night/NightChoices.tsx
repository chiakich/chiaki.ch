import { useEffect, useState } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import { STOP_INDEX } from 'lib/night/player'
import type { Snapshot, VisibleChoice } from 'lib/night/types'

const Button = styled.button
const Form = styled.form
const Input = styled.input
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace'

const Countdown = ({ deadline, total }: { deadline: number; total: number }) => {
  const [left, setLeft] = useState(total)
  useEffect(() => {
    let frame = 0
    const tick = () => {
      setLeft(Math.max(0, deadline - Date.now()))
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [deadline])
  return (
    <Box height="3px" background="rgba(255,90,60,.18)" mb="8px">
      <Box
        height="100%"
        background="#ff5a3c"
        transformOrigin="left"
        style={{ transform: `scaleX(${left / total})` }}
      />
    </Box>
  )
}

const groupsOf = (choices: VisibleChoice[]) => {
  const groups: { group: string | null; items: VisibleChoice[] }[] = []
  for (const choice of choices.filter((item) => item.index !== STOP_INDEX)) {
    const last = groups[groups.length - 1]
    if (last && last.group === choice.group) last.items.push(choice)
    else groups.push({ group: choice.group, items: [choice] })
  }
  return groups
}

type Props = {
  snapshot: Snapshot
  onChoose: (index: number) => void
  onInput: (text: string) => void
}

const NightChoices = ({ snapshot, onChoose, onInput }: Props) => {
  const [draft, setDraft] = useState('')
  const { choices, input, timeout, status } = snapshot
  const stop = choices.find((choice) => choice.index === STOP_INDEX)

  if (status === 'input' && input) {
    return (
      <Form
        display="flex"
        gap="7px"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault()
          onInput(draft)
          setDraft('')
        }}
      >
        <Input
          autoFocus
          value={draft}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setDraft(event.target.value)
          }
          placeholder={input.prompt}
          aria-label={input.prompt}
          maxLength={40}
          flex="1"
          minWidth="0"
          px="12px"
          py="10px"
          border="1px solid rgba(238,150,98,.45)"
          borderLeft="2px solid rgba(255,204,168,.85)"
          background="rgba(231,105,45,.08)"
          color="rgba(255,238,222,.98)"
          fontSize="14px"
          outline="none"
          _placeholder={{ color: 'rgba(238,150,98,.6)' }}
        />
        <Button
          type="submit"
          disabled={!draft.trim()}
          px="16px"
          border="1px solid rgba(238,150,98,.55)"
          background="rgba(231,105,45,.16)"
          color="#fff"
          fontSize="11px"
          letterSpacing=".16em"
          cursor="pointer"
          _disabled={{ opacity: 0.5, cursor: 'default' }}
          style={{ fontFamily: MONO }}
        >
          SEND
        </Button>
      </Form>
    )
  }

  if (status !== 'choosing') return null

  return (
    <Box>
      {timeout && <Countdown deadline={timeout.deadline} total={timeout.total} />}
      <Box display="grid" gap="10px">
        {groupsOf(choices).map(({ group, items }, groupIndex) =>
          group ? (
            <Box
              key={groupIndex}
              border="1px solid rgba(238,150,98,.35)"
              background="rgba(20,8,3,.7)"
              p="8px"
            >
              <Flex gap="6px" flexWrap="wrap">
                {items.map((choice) => (
                  <Button
                    key={choice.index}
                    type="button"
                    onClick={() => onChoose(choice.index)}
                    px="12px"
                    py="8px"
                    border="1px solid rgba(238,150,98,.55)"
                    background="rgba(231,105,45,.14)"
                    color="#ffe2cc"
                    fontSize="13px"
                    textAlign="left"
                    cursor="pointer"
                    transition="all .15s"
                    _hover={{
                      background: 'rgba(231,105,45,.3)',
                      borderColor: '#df8a42',
                    }}
                  >
                    {choice.label}
                  </Button>
                ))}
              </Flex>
            </Box>
          ) : (
            <Flex
              key={groupIndex}
              gap="6px"
              flexWrap="wrap"
              justifyContent="flex-end"
            >
              {items.map((choice) => (
                <Button
                  key={choice.index}
                  type="button"
                  onClick={() => onChoose(choice.index)}
                  px="10px"
                  py="7px"
                  border="1px solid rgba(255,255,255,.3)"
                  background="rgba(255,255,255,.04)"
                  color="#fff"
                  fontSize="13px"
                  textAlign="left"
                  cursor="pointer"
                  transition="all .15s"
                  _hover={{
                    background: 'rgba(255,255,255,.12)',
                    borderColor: '#fff',
                  }}
                >
                  〔{choice.label}〕
                </Button>
              ))}
            </Flex>
          )
        )}
        {stop && (
          <Flex justifyContent="flex-end">
            <Button
              type="button"
              onClick={() => onChoose(STOP_INDEX)}
              px="10px"
              py="4px"
              border="1px solid rgba(255,255,255,.4)"
              background="transparent"
              color="rgba(255,255,255,.8)"
              fontSize="11px"
              cursor="pointer"
              _hover={{ borderColor: '#fff', color: '#fff' }}
            >
              〔{stop.label}〕
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  )
}

export default NightChoices
