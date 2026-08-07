import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Flex, styled } from 'styled-system/jsx'
import { createSession, respond, type Session } from 'lib/terminal/engine'
import { loadLexicon, type Lexicon } from 'lib/terminal/lexicon'
import { createSpeechBeats } from 'lib/terminal/speech'
import { IDLE } from 'lib/terminal/rules'
import type { Message } from 'lib/terminal/types'
import type { TerminalAvatarHandle } from './TerminalAvatarClient'
import { useI18n } from 'i18n'

const Text = styled.p
const Label = styled.span
const Input = styled.input
const Form = styled.form
const Send = styled.button
const Chip = styled.button
const Img = styled.img

const TerminalAvatarClient = dynamic(() => import('./TerminalAvatarClient'), {
  ssr: false,
})

const IDLE_DELAY = 45_000
const SUGGESTIONS = ['你是誰？', '神明去哪裡了？', '你在收集什麼？']

type TerminalChatProps = { started?: boolean }

const TerminalChat = ({ started = true }: TerminalChatProps) => {
  const { t } = useI18n()
  const avatarRef = useRef<TerminalAvatarHandle | null>(null)
  const sessionRef = useRef<Session>(createSession())
  const nextId = useRef(0)
  const transcriptRef = useRef<HTMLDivElement>(null)

  const [lexicon, setLexicon] = useState<Lexicon | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState<string | null>(null)
  const [signal, setSignal] = useState(sessionRef.current.signal)

  const push = useCallback((message: Omit<Message, 'id'>) => {
    nextId.current += 1
    setMessages((current) => [...current, { ...message, id: nextId.current }])
  }, [])

  useEffect(() => {
    loadLexicon()
      .then(setLexicon)
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!started || messages.length > 0) return undefined
    const timer = window.setTimeout(() => {
      push({
        role: 'chiaki',
        text: '',
        emotion: 'neutral',
        ruleId: 'opening',
      })
      setTyping('……欸，燈亮了。有人在嗎？我是千秋。')
      avatarRef.current?.setEmotion('neutral')
    }, 480)
    return () => window.clearTimeout(timer)
  }, [messages.length, push, started])

  // The lexicon determines word boundaries; each syllabic character becomes a
  // mouth beat and punctuation becomes a pause in both text and animation.
  useEffect(() => {
    if (typing === null) return undefined
    const beats = createSpeechBeats(typing, lexicon)
    const avatar = avatarRef.current
    let index = 0
    let timer = 0

    const advance = () => {
      const beat = beats[index]
      if (!beat) {
        avatar?.stopSpeaking()
        avatar?.setEmotion('neutral')
        setTyping(null)
        return
      }
      index += 1
      setMessages((current) => {
        const next = [...current]
        const last = next[next.length - 1]
        if (last?.role === 'chiaki') {
          next[next.length - 1] = {
            ...last,
            text: beats
              .slice(0, index)
              .map((item) => item.char)
              .join(''),
          }
        }
        return next
      })
      avatar?.speakBeat(beat.open, beat.form, beat.delay)
      timer = window.setTimeout(advance, beat.delay)
    }

    timer = window.setTimeout(advance, 80)
    return () => {
      window.clearTimeout(timer)
      avatar?.stopSpeaking()
    }
  }, [lexicon, typing])

  useEffect(() => {
    const element = transcriptRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!started || messages.length === 0) return undefined
    const timer = window.setTimeout(() => {
      if (typing !== null) return
      const line = IDLE[Math.floor(Math.random() * IDLE.length)]
      push({ role: 'chiaki', text: '', emotion: 'neutral', ruleId: 'idle' })
      setTyping(line)
      avatarRef.current?.setEmotion('neutral')
    }, IDLE_DELAY)
    return () => window.clearTimeout(timer)
  }, [messages, push, started, typing])

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || typing !== null) return
      push({ role: 'user', text })
      setDraft('')

      const turn = respond(text, sessionRef.current, lexicon)
      setSignal(turn.signal)
      avatarRef.current?.setEmotion(turn.emotion)
      window.setTimeout(() => {
        push({
          role: 'chiaki',
          text: '',
          emotion: turn.emotion,
          ruleId: turn.ruleId,
        })
        setTyping(turn.text)
      }, 340)
    },
    [lexicon, push, typing]
  )

  const visibleMessages = messages
    .filter((message) => message.role !== 'system')
    .slice(-3)

  return (
    <Box
      position="relative"
      width="100%"
      height="calc(100svh - 92px)"
      minHeight={{ base: '680px', md: '600px' }}
      overflow="hidden"
      isolation="isolate"
      background="radial-gradient(ellipse 72% 74% at 56% 35%, #2b1008 0%, #100704 46%, #030201 100%)"
      opacity={started ? 1 : 0}
      transition="opacity 1.1s ease"
    >
      <Box
        position="absolute"
        inset="0"
        opacity=".18"
        backgroundImage="linear-gradient(rgba(231,105,45,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(231,105,45,.06) 1px, transparent 1px)"
        backgroundSize={{ base: '38px 38px', md: '54px 54px' }}
        maskImage="radial-gradient(ellipse 68% 74% at 56% 40%, black 0%, transparent 76%)"
        pointerEvents="none"
      />

      <Box position="absolute" inset="0" zIndex={0}>
        <TerminalAvatarClient controls={avatarRef} />
      </Box>

      <Box
        position="absolute"
        inset="0"
        zIndex={1}
        pointerEvents="none"
        backgroundImage="repeating-linear-gradient(transparent 0px, transparent 1px, rgba(0,0,0,.27) 2px, rgba(0,0,0,.27) 3px)"
        mixBlendMode="multiply"
        opacity=".78"
      />
      <Box
        position="absolute"
        inset="0"
        zIndex={1}
        pointerEvents="none"
        background="linear-gradient(90deg, rgba(219,67,20,.045), rgba(255,142,76,.012) 52%, rgba(117,31,9,.05))"
        mixBlendMode="screen"
      />
      <Box
        position="absolute"
        left="0"
        right="0"
        height="16%"
        zIndex={1}
        pointerEvents="none"
        background="linear-gradient(180deg, transparent, rgba(235,111,53,.055) 50%, transparent)"
        animation="scanlineDrift 8s linear infinite"
      />
      <Box
        position="absolute"
        inset="0"
        zIndex={1}
        pointerEvents="none"
        boxShadow="inset 0 0 170px 42px rgba(0,0,0,.88)"
        animation="crtFlicker 9s linear infinite"
      />

      <Flex
        position="absolute"
        zIndex={3}
        top={{ base: '18px', md: '28px' }}
        left={{ base: '16px', md: '34px' }}
        right={{ base: '16px', md: '34px' }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Flex alignItems="center" gap="11px">
          <Img
            src="/assets/icon/logo_white.svg"
            alt=""
            width={{ base: '32px', md: '40px' }}
            height={{ base: '32px', md: '40px' }}
            opacity=".78"
            filter="sepia(1) saturate(4.2) hue-rotate(332deg) brightness(1.12)"
          />
          <Label
            fontFamily="nixie"
            fontSize={{ base: '9px', md: '10px' }}
            letterSpacing=".22em"
            color="rgba(238,150,98,.76)"
          >
            PERSONALITY ARCHIVE / 01
          </Label>
        </Flex>
        <Flex alignItems="center" gap="8px">
          <Box
            width="5px"
            height="5px"
            borderRadius="full"
            background="#e76c32"
            boxShadow="0 0 12px #e76c32"
            animation="hudPulse 2.8s ease-in-out infinite"
          />
          <Label
            fontFamily="nixie"
            fontSize="9px"
            letterSpacing=".18em"
            color="rgba(238,150,98,.55)"
          >
            LINK {String(Math.round(signal)).padStart(2, '0')}
          </Label>
        </Flex>
      </Flex>

      <Flex
        position="absolute"
        zIndex={4}
        left={{ base: '0', md: '50%' }}
        bottom="0"
        width={{ base: '100%', md: 'min(760px, calc(100% - 64px))' }}
        transform={{ base: 'none', md: 'translateX(-50%)' }}
        direction="column"
        px={{ base: '14px', md: '0' }}
        pb={{ base: '16px', md: '22px' }}
      >
        <Box
          ref={transcriptRef}
          maxHeight={{ base: '170px', md: '185px' }}
          overflowY="auto"
          px={{ base: '12px', md: '16px' }}
          py="12px"
          background="linear-gradient(180deg, rgba(8,3,1,.04), rgba(8,3,1,.8))"
          backdropFilter="blur(7px)"
          borderLeft="1px solid rgba(231,105,45,.38)"
        >
          <Flex direction="column" gap="9px">
            {visibleMessages.map((message, index) => (
              <Box
                key={`${message.id}-${index}`}
                alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
                maxWidth="92%"
              >
                <Label
                  display="block"
                  fontFamily="nixie"
                  fontSize="8px"
                  letterSpacing=".2em"
                  mb="3px"
                  textAlign={message.role === 'user' ? 'right' : 'left'}
                  color={
                    message.role === 'user'
                      ? 'rgba(238,150,98,.3)'
                      : 'rgba(238,150,98,.62)'
                  }
                >
                  {message.role === 'user' ? 'YOU' : 'CHIAKI'}
                </Label>
                <Text
                  px="10px"
                  py="7px"
                  color={
                    message.role === 'user'
                      ? 'rgba(242,207,184,.72)'
                      : 'rgba(255,228,207,.94)'
                  }
                  fontSize={{ base: '14px', md: '15px' }}
                  lineHeight="1.75"
                  textShadow="0 0 12px rgba(229,106,49,.1)"
                  whiteSpace="pre-wrap"
                >
                  {message.text}
                  {typing !== null &&
                    message.id === messages[messages.length - 1]?.id && (
                      <Box
                        as="span"
                        ml="2px"
                        color="rgba(238,150,98,.86)"
                        animation="cursorBlink .75s steps(1) infinite"
                      >
                        ▌
                      </Box>
                    )}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>

        <Flex gap="6px" overflowX="auto" py="7px" css={{ scrollbarWidth: 'none' }}>
          {SUGGESTIONS.map((suggestion) => (
            <Chip
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              disabled={typing !== null}
              px="9px"
              py="4px"
              border="1px solid rgba(231,105,45,.16)"
              background="rgba(8,3,1,.34)"
              color="rgba(238,150,98,.56)"
              fontSize="11px"
              cursor="pointer"
              whiteSpace="nowrap"
              transition="all .18s"
              _hover={{
                borderColor: 'rgba(238,150,98,.45)',
                color: 'rgba(255,218,194,.88)',
              }}
              _disabled={{ opacity: 0.28, cursor: 'default' }}
            >
              {suggestion}
            </Chip>
          ))}
        </Flex>

        <Form
          display="flex"
          gap="7px"
          background="rgba(7,3,1,.7)"
          backdropFilter="blur(10px)"
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault()
            send(draft)
          }}
        >
          <Input
            value={draft}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDraft(event.target.value)
            }
            placeholder={t('terminalPage.placeholder')}
            aria-label={t('terminalPage.placeholder')}
            maxLength={120}
            flex="1"
            minWidth="0"
            px="12px"
            py="10px"
            border="1px solid rgba(231,105,45,.2)"
            borderLeft="1px solid rgba(231,105,45,.58)"
            background="transparent"
            color="rgba(255,228,207,.92)"
            fontSize="14px"
            fontFamily="body"
            outline="none"
            transition="border-color .18s"
            _focus={{ borderColor: 'rgba(238,150,98,.55)' }}
            _placeholder={{ color: 'rgba(238,150,98,.25)' }}
          />
          <Send
            type="submit"
            disabled={typing !== null || draft.trim().length === 0}
            px={{ base: '14px', md: '18px' }}
            border="1px solid rgba(231,105,45,.32)"
            background="rgba(231,105,45,.08)"
            color="rgba(246,180,138,.82)"
            fontFamily="nixie"
            fontSize="10px"
            letterSpacing=".18em"
            cursor="pointer"
            transition="all .18s"
            _hover={{ background: 'rgba(231,105,45,.15)' }}
            _disabled={{ opacity: 0.26, cursor: 'default' }}
          >
            SEND
          </Send>
        </Form>
      </Flex>
    </Box>
  )
}

export default TerminalChat
