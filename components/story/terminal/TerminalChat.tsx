import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { Spinner } from 'components/ui/controls'
import { createSession, respond, type Session } from 'lib/terminal/engine'
import { loadLexicon, type Lexicon, type Token } from 'lib/terminal/lexicon'
import { IDLE, OPENING } from 'lib/terminal/rules'
import type { Message } from 'lib/terminal/types'
import type { TerminalAvatarHandle } from './TerminalAvatarClient'
import LexiconPanel from './LexiconPanel'
import { useI18n } from 'i18n'

const Text = styled.p
const Label = styled.span
const Input = styled.input
const Form = styled.form
const Send = styled.button
const Chip = styled.button

const TerminalAvatarClient = dynamic(() => import('./TerminalAvatarClient'), {
  ssr: false,
})

// Typing speed for her replies. Slow enough to read as speech, fast enough that
// a long line doesn't outstay its welcome.
const CHAR_INTERVAL = 42
const IDLE_DELAY = 45_000

const SUGGESTIONS = ['你是誰？', '神明去哪裡了？', '你在收集什麼？', '你是 AI 嗎？']

const TerminalChat = () => {
  const { t } = useI18n()
  const avatarRef = useRef<TerminalAvatarHandle | null>(null)
  const sessionRef = useRef<Session>(createSession())
  const nextId = useRef(0)
  const transcriptRef = useRef<HTMLDivElement>(null)

  const [lexicon, setLexicon] = useState<Lexicon | null>(null)
  const [lexiconFailed, setLexiconFailed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [tokens, setTokens] = useState<Token[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState<string | null>(null)
  const [signal, setSignal] = useState(sessionRef.current.signal)

  const push = useCallback((message: Omit<Message, 'id'>) => {
    nextId.current += 1
    setMessages((current) => [...current, { ...message, id: nextId.current }])
  }, [])

  useEffect(() => {
    loadLexicon().then(setLexicon).catch(() => setLexiconFailed(true))
  }, [])

  // Opening lines, once the boot chrome has had a beat to settle.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      OPENING.forEach((line) => push({ role: 'system', text: line }))
      push({
        role: 'chiaki',
        text: 'はおーっ！……欸，燈亮了。有人在嗎？',
        emotion: 'surprised',
        ruleId: 'opening',
      })
      avatarRef.current?.setEmotion('surprised')
    }, 700)
    return () => window.clearTimeout(timer)
  }, [push])

  // Type her reply out one character at a time, flapping the mouth meanwhile.
  useEffect(() => {
    if (typing === null) return undefined
    avatarRef.current?.setSpeaking(true)
    let index = 0
    const id = window.setInterval(() => {
      index += 1
      setMessages((current) => {
        const next = [...current]
        const last = next[next.length - 1]
        if (last?.role === 'chiaki') next[next.length - 1] = { ...last, text: typing.slice(0, index) }
        return next
      })
      if (index >= typing.length) {
        window.clearInterval(id)
        avatarRef.current?.setSpeaking(false)
        setTyping(null)
      }
    }, CHAR_INTERVAL)
    return () => {
      window.clearInterval(id)
      avatarRef.current?.setSpeaking(false)
    }
  }, [typing])

  useEffect(() => {
    const element = transcriptRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages])

  // She fills the silence herself rather than sitting frozen.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (typing !== null) return
      const line = IDLE[Math.floor(Math.random() * IDLE.length)]
      push({ role: 'chiaki', text: '', emotion: 'neutral', ruleId: 'idle' })
      setTyping(line)
      avatarRef.current?.setEmotion('neutral')
    }, IDLE_DELAY)
    return () => window.clearTimeout(timer)
  }, [messages, push, typing])

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || typing !== null) return

      push({ role: 'user', text })
      setDraft('')

      const turn = respond(text, sessionRef.current, lexicon)
      setTokens(turn.tokens)
      setSignal(turn.signal)
      avatarRef.current?.setEmotion(turn.emotion)

      // A short beat before she answers — instant replies give away the lookup.
      window.setTimeout(() => {
        push({ role: 'chiaki', text: '', emotion: turn.emotion, ruleId: turn.ruleId })
        setTyping(turn.text)
      }, 260)
    },
    [lexicon, push, typing]
  )

  const lastRuleId = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'chiaki')?.ruleId,
    [messages]
  )

  return (
    <Grid
      gridTemplateColumns={{ base: '1fr', lg: '380px 1fr' }}
      gap={{ base: '16px', lg: '24px' }}
      width="100%"
      maxWidth="width.section"
      mx="auto"
      px={{ base: '16px', md: '40px', lg: '60px' }}
      alignItems="stretch"
    >
      {/* Left: the model, framed as a viewport on the shrine office */}
      <Box
        position="relative"
        height={{ base: '260px', lg: 'auto' }}
        minHeight={{ lg: '540px' }}
        border="1px solid rgba(120,200,180,.16)"
        background="radial-gradient(ellipse at 50% 30%, rgba(28,42,46,.85), rgba(4,8,10,.95) 72%)"
        overflow="hidden"
      >
        <Box position="absolute" inset="0">
          <TerminalAvatarClient controls={avatarRef} />
        </Box>

        {/* Scanlines over the model, matching the story sections' CRT treatment */}
        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          opacity=".38"
          backgroundImage="repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,.3) 3px)"
        />
        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          background="radial-gradient(ellipse 74% 74% at 50% 45%, transparent 46%, rgba(0,0,0,.72) 100%)"
        />

        <Flex
          position="absolute"
          top="12px"
          left="14px"
          right="14px"
          justifyContent="space-between"
          alignItems="center"
          pointerEvents="none"
        >
          <Label
            fontFamily="nixie"
            fontSize="9px"
            letterSpacing=".22em"
            color="rgba(190,215,208,.5)"
          >
            CH.01 / SHRINE OFFICE
          </Label>
          <Label
            fontFamily="nixie"
            fontSize="9px"
            letterSpacing=".16em"
            color="rgba(190,215,208,.4)"
            animation="hudPulse 2.4s ease-in-out infinite"
          >
            ● LIVE
          </Label>
        </Flex>

        {/* Link strength — driven by whether the rule table is keeping up */}
        <Box position="absolute" bottom="12px" left="14px" right="14px" pointerEvents="none">
          <Flex justifyContent="space-between" alignItems="baseline" mb="5px">
            <Label
              fontFamily="nixie"
              fontSize="9px"
              letterSpacing=".2em"
              color="rgba(190,215,208,.5)"
            >
              LINK
            </Label>
            <Label
              fontFamily="nixie"
              fontSize="9px"
              letterSpacing=".14em"
              color={signal < 25 ? 'rgba(255,120,96,.9)' : 'rgba(190,215,208,.55)'}
            >
              {String(Math.round(signal)).padStart(2, '0')}%
            </Label>
          </Flex>
          <Box height="2px" background="rgba(255,255,255,.1)">
            <Box
              height="100%"
              width={`${signal}%`}
              background={
                signal < 25
                  ? 'linear-gradient(90deg, rgba(255,120,96,.4), rgba(255,120,96,.95))'
                  : 'linear-gradient(90deg, rgba(75,224,184,.35), rgba(190,255,233,.85))'
              }
              transition="width .5s ease, background .5s ease"
            />
          </Box>
        </Box>
      </Box>

      {/* Right: transcript, composer, and the segmentation readout */}
      <Flex direction="column" gap="12px" minWidth="0">
        <Box
          ref={transcriptRef}
          flex="1"
          minHeight={{ base: '320px', lg: '360px' }}
          maxHeight={{ base: '52vh', lg: '58vh' }}
          overflowY="auto"
          border="1px solid rgba(120,200,180,.16)"
          background="rgba(4,10,9,.6)"
          px={{ base: '14px', md: '20px' }}
          py="16px"
        >
          <Flex direction="column" gap="14px">
            {messages.map((message) =>
              message.role === 'system' ? (
                <Text
                  key={message.id}
                  fontFamily="nixie"
                  fontSize="10px"
                  letterSpacing=".2em"
                  color="rgba(229,188,99,.5)"
                >
                  {message.text}
                </Text>
              ) : (
                <Box
                  key={message.id}
                  alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
                  maxWidth="86%"
                >
                  <Label
                    display="block"
                    fontFamily="nixie"
                    fontSize="9px"
                    letterSpacing=".2em"
                    mb="4px"
                    textAlign={message.role === 'user' ? 'right' : 'left'}
                    color={
                      message.role === 'user'
                        ? 'rgba(190,215,208,.35)'
                        : 'rgba(229,188,99,.55)'
                    }
                  >
                    {message.role === 'user' ? 'YOU' : 'CHIAKI'}
                    {message.role === 'chiaki' && message.ruleId
                      ? ` · ${message.ruleId}`
                      : ''}
                  </Label>
                  <Box
                    px="12px"
                    py="9px"
                    border="1px solid"
                    borderColor={
                      message.role === 'user'
                        ? 'rgba(120,200,180,.2)'
                        : 'rgba(229,188,99,.28)'
                    }
                    background={
                      message.role === 'user'
                        ? 'rgba(75,224,184,.05)'
                        : 'rgba(229,188,99,.06)'
                    }
                    color={
                      message.role === 'user'
                        ? 'rgba(214,247,238,.9)'
                        : 'rgba(248,238,220,.95)'
                    }
                    fontSize={{ base: '14px', md: '15px' }}
                    lineHeight="1.75"
                    whiteSpace="pre-wrap"
                  >
                    {message.text}
                    {typing !== null && message.id === messages[messages.length - 1]?.id && (
                      <Box
                        as="span"
                        ml="2px"
                        color="rgba(245,220,170,.9)"
                        animation="cursorBlink .7s steps(1) infinite"
                      >
                        ▌
                      </Box>
                    )}
                  </Box>
                </Box>
              )
            )}
          </Flex>
        </Box>

        <Flex gap="6px" flexWrap="wrap">
          {SUGGESTIONS.map((suggestion) => (
            <Chip
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              disabled={typing !== null}
              px="10px"
              py="5px"
              border="1px solid rgba(120,200,180,.22)"
              background="transparent"
              color="rgba(190,215,208,.7)"
              fontSize="12px"
              cursor="pointer"
              transition="all .18s"
              _hover={{ borderColor: 'rgba(229,188,99,.5)', color: 'rgba(245,220,170,.95)' }}
              _disabled={{ opacity: 0.35, cursor: 'default' }}
            >
              {suggestion}
            </Chip>
          ))}
        </Flex>

        <Form
          display="flex"
          gap="8px"
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
            py="11px"
            border="1px solid rgba(120,200,180,.24)"
            background="rgba(4,10,9,.7)"
            color="rgba(224,247,238,.95)"
            fontSize={{ base: '15px', md: '15px' }}
            fontFamily="body"
            outline="none"
            transition="border-color .18s"
            _focus={{ borderColor: 'rgba(229,188,99,.6)' }}
            _placeholder={{ color: 'rgba(190,215,208,.3)' }}
          />
          <Send
            type="submit"
            disabled={typing !== null || draft.trim().length === 0}
            px="18px"
            border="1px solid rgba(229,188,99,.4)"
            background="rgba(229,188,99,.1)"
            color="rgba(245,220,170,.95)"
            fontFamily="nixie"
            fontSize="11px"
            letterSpacing=".2em"
            cursor="pointer"
            transition="all .18s"
            _hover={{ background: 'rgba(229,188,99,.2)' }}
            _disabled={{ opacity: 0.3, cursor: 'default' }}
          >
            SEND
          </Send>
        </Form>

        <LexiconPanel tokens={tokens} wordCount={lexicon?.weights.size ?? null} />

        <Flex alignItems="center" gap="8px" minHeight="16px">
          {!lexicon && !lexiconFailed && <Spinner color="rgba(190,215,208,.4)" />}
          <Label fontFamily="nixie" fontSize="9px" letterSpacing=".16em" color="rgba(190,215,208,.35)">
            {lexiconFailed
              ? t('terminalPage.lexiconFailed')
              : lexicon
                ? `RULE ${lastRuleId ?? '—'}`
                : t('terminalPage.lexiconLoading')}
          </Label>
        </Flex>
      </Flex>
    </Grid>
  )
}

export default TerminalChat
