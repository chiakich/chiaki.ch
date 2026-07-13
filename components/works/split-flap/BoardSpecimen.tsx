import { useEffect, useState } from 'react'
import { Presets, SplitFlap } from 'react-split-flap'
import { Flex, HStack, styled } from 'styled-system/jsx'

const Text = styled.p
const Span = styled.span

const DESTINATIONS = ['三崎口', '羽田空港', '成田空港', '京急久里浜']

// Works index card specimen: a tiny flap clock + rotating destination.
const BoardSpecimen = () => {
  const [destination, setDestination] = useState(DESTINATIONS[0])
  const [time, setTime] = useState('')

  useEffect(() => {
    let index = 0
    const rotate = setInterval(() => {
      index = (index + 1) % DESTINATIONS.length
      setDestination(DESTINATIONS[index])
    }, 3200)
    const tick = () => {
      const now = new Date()
      setTime(`${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`)
    }
    tick()
    const clock = setInterval(tick, 1000)
    return () => { clearInterval(rotate); clearInterval(clock) }
  }, [])

  return (
    <Flex width="100%" height="100%" backgroundColor="#151013" direction="column" justifyContent="center" alignItems="center" gap={4} overflow="hidden">
      <HStack gap={3}>
        <SplitFlap value={time.slice(0, 2)} chars={Presets.NUM} length={2} theme="dark" size="medium" animateOnMount={false} />
        <Span color="#ff5d52" fontWeight="700">:</Span>
        <SplitFlap value={time.slice(2, 4)} chars={Presets.NUM} length={2} theme="dark" size="medium" animateOnMount={false} />
      </HStack>
      <SplitFlap value={destination} chars={DESTINATIONS} mode="words" theme="dark" size="large" timing={80} />
      <Text fontSize="9px" letterSpacing=".3em" color="#ff5d52">PATA PATA</Text>
    </Flex>
  )
}

export default BoardSpecimen
