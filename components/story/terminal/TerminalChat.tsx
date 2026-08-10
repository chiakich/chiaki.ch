import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Flex, styled } from 'styled-system/jsx'
import {
  createSession,
  endingHandover,
  endingReturn,
  idle,
  opening,
  respond,
  type Session,
  suggestionsFor,
} from 'lib/terminal/engine'
import { ENDING_HANDOVER } from 'lib/terminal/rules'
import { loadLexicon, type Lexicon } from 'lib/terminal/lexicon'
import { load, save } from 'lib/terminal/persist'
import { createUtterance } from 'lib/terminal/speech'
import type { Token } from 'lib/terminal/lexicon'
import type { Message } from 'lib/terminal/types'
import LexiconPanel from './LexiconPanel'
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
/** How long she is away on the surface. A beat, not an intermission. */
const SURFACE_DELAY = 5_000

/**
 * none → she is here · offered → she has asked to see it and the button is up
 * away → gone up to look · closing → back, but leaving · gone → link down.
 */
type EndingPhase = 'none' | 'offered' | 'away' | 'closing' | 'gone'

type TerminalChatProps = { started?: boolean }

const TerminalChat = ({ started = true }: TerminalChatProps) => {
  const { t } = useI18n()
  const avatarRef = useRef<TerminalAvatarHandle | null>(null)
  const sessionRef = useRef<Session>(createSession())
  const nextId = useRef(0)
  const transcriptRef = useRef<HTMLDivElement>(null)

  const visits = useRef(0)
  // Prompts the visitor has already taken — see `suggestionsFor`.
  const asked = useRef<Map<string, number>>(new Map())
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<EndingPhase>('none')
  const [lexicon, setLexicon] = useState<Lexicon | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState<string | null>(null)
  const [signal, setSignal] = useState(sessionRef.current.signal)
  const [tokens, setTokens] = useState<Token[]>([])
  const [prompts, setPrompts] = useState<string[]>([])
  // The panel is a reveal, not furniture: it only exists once she has offered
  // to show it. See the segmentation rule in lib/terminal/rules.ts.
  const [lexiconShown, setLexiconShown] = useState(false)

  // She is still answering while the offer is up — the button is a way out of
  // the conversation, not an interruption of it.
  const locked = phase === 'away' || phase === 'closing' || phase === 'gone'

  const push = useCallback((message: Omit<Message, 'id'>) => {
    nextId.current += 1
    setMessages((current) => [...current, { ...message, id: nextId.current }])
  }, [])

  useEffect(() => {
    loadLexicon()
      .then(setLexicon)
      .catch(() => undefined)
  }, [])

  // Restoring has to happen on the client, so the session starts empty and is
  // replaced on mount. `ready` keeps the opening line from being chosen before
  // she knows whether she has met this visitor before.
  useEffect(() => {
    const saved = load()
    if (saved) {
      visits.current = saved.visits
      sessionRef.current = createSession(saved)
      setSignal(sessionRef.current.signal)
    }
    setPrompts(suggestionsFor(sessionRef.current, asked.current))
    setReady(true)
  }, [])

  useEffect(() => {
    if (!started || !ready || messages.length > 0) return undefined
    const session = sessionRef.current
    const returning = visits.current > 0
    const timer = window.setTimeout(() => {
      // Counted here rather than on mount, so an effect that re-runs before
      // the line lands doesn't book the same visit twice.
      visits.current += 1
      save(session, visits.current)
      push({
        role: 'chiaki',
        text: '',
        emotion: 'neutral',
        ruleId: 'opening',
      })
      setTyping(opening(session, returning))
      avatarRef.current?.setEmotion('neutral')
    }, 480)
    return () => window.clearTimeout(timer)
  }, [messages.length, push, ready, started])

  // The lexicon determines word boundaries and each character's reading; the
  // mouth timeline goes to the avatar in one piece and the transcript follows
  // the same clock, so the two stay in step without driving each other.
  useEffect(() => {
    if (typing === null) return undefined
    const { keys, gestures, chars } = createUtterance(typing, lexicon)
    const avatar = avatarRef.current
    const startedAt = performance.now()
    let index = 0
    let timer = 0

    avatar?.speak(keys, gestures)

    const reveal = () => {
      const elapsed = performance.now() - startedAt
      const previous = index
      while (index < chars.length && chars[index].at <= elapsed) index += 1

      if (index > previous) {
        const text = chars
          .slice(0, index)
          .map((cue) => cue.char)
          .join('')
        setMessages((current) => {
          const next = [...current]
          const last = next[next.length - 1]
          if (last?.role === 'chiaki') next[next.length - 1] = { ...last, text }
          return next
        })
      }

      if (index >= chars.length) {
        setTyping(null)
        return
      }
      timer = window.setTimeout(reveal, Math.max(16, chars[index].at - elapsed))
    }

    reveal()
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
    if (!started || messages.length === 0 || locked) return undefined
    const timer = window.setTimeout(() => {
      if (typing !== null) return
      const turn = idle(sessionRef.current)
      push({ role: 'chiaki', text: '', emotion: turn.emotion, ruleId: 'idle' })
      setTyping(turn.text)
      avatarRef.current?.setEmotion(turn.emotion)
    }, IDLE_DELAY)
    return () => window.clearTimeout(timer)
  }, [locked, messages, push, started, typing])

  // She excused herself; the terminal sits with the visitor until she is back.
  useEffect(() => {
    if (phase !== 'away' || typing !== null) return undefined
    const timer = window.setTimeout(() => {
      const turn = endingReturn(sessionRef.current)
      push({ role: 'chiaki', text: '', emotion: turn.emotion, ruleId: turn.ruleId })
      setTyping(turn.text)
      avatarRef.current?.setEmotion(turn.emotion)
      setPhase('closing')
    }, SURFACE_DELAY)
    return () => window.clearTimeout(timer)
  }, [phase, push, typing])

  useEffect(() => {
    if (phase !== 'closing' || typing !== null) return undefined
    const timer = window.setTimeout(() => setPhase('gone'), 1400)
    return () => window.clearTimeout(timer)
  }, [phase, typing])

  const speak = useCallback(
    (turn: ReturnType<typeof respond>) => {
      setSignal(turn.signal)
      save(sessionRef.current, visits.current)
      setPrompts(suggestionsFor(sessionRef.current, asked.current))
      if (sessionRef.current.flags.has('showedLexicon')) setLexiconShown(true)
      if (turn.ending === 'offer') setPhase('offered')
      if (turn.ending === 'leaving') setPhase('away')
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
    [push]
  )

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || typing !== null || locked) return
      push({ role: 'user', text })
      setDraft('')
      const turn = respond(text, sessionRef.current, lexicon)
      setTokens(turn.tokens)
      speak(turn)
    },
    [lexicon, locked, push, speak, typing]
  )

  const handOver = useCallback(() => {
    if (typing !== null || phase !== 'offered') return
    push({ role: 'user', text: ENDING_HANDOVER.action })
    speak(endingHandover(sessionRef.current))
  }, [phase, push, speak, typing])

  const visibleMessages = messages
    .filter((message) => message.role !== 'system')
    .slice(-3)

  return (
    <Box
      position="relative"
      width="100%"
      height={{ base: 'calc(100svh - 44px)', md: 'calc(100svh - 92px)' }}
      // Deliberately no floor on a phone: a 680px minimum on a 700px screen put
      // the input below the fold, and the panel is laid out to survive being
      // short anyway.
      minHeight={{ md: '600px' }}
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
        zIndex={5}
        pointerEvents="none"
        aria-hidden="true"
        backgroundImage="repeating-linear-gradient(transparent 0px, transparent 1px, rgba(0,0,0,.27) 2px, rgba(0,0,0,.27) 3px)"
        mixBlendMode="multiply"
        opacity=".78"
      />
      {/* The gaps above only subtract; a tube's line is emissive, so add one
          back. Neutral rather than amber — the avatar's colour is decided by
          the tape model now, and tinting it here would undo that. */}
      <Box
        position="absolute"
        inset="0"
        zIndex={5}
        pointerEvents="none"
        aria-hidden="true"
        backgroundImage="repeating-linear-gradient(rgba(255,255,255,.05) 0px, rgba(255,255,255,.05) 1px, transparent 1px, transparent 3px)"
        mixBlendMode="screen"
      />
      {/* The amber wash and the drifting amber band that used to sit here are
          gone: they tinted the avatar after the tape model had already decided
          its colour, which is the one thing that cannot be corrected for. */}
      <Box
        position="absolute"
        left="0"
        right="0"
        height="16%"
        zIndex={5}
        pointerEvents="none"
        aria-hidden="true"
        background="linear-gradient(180deg, transparent, rgba(255,255,255,.035) 50%, transparent)"
        animation="scanlineDrift 8s linear infinite"
      />
      {/* Elliptical, not the inset box-shadow this used to be. A box-shadow
          falls off from every edge equally, so it dims the middle of the top
          and bottom as hard as the corners — and she stands right there. A
          vignette darkens by distance from centre, which leaves the middle of
          each edge nearly untouched and only really bites at the corners. */}
      <Box
        position="absolute"
        inset="0"
        zIndex={5}
        pointerEvents="none"
        aria-hidden="true"
        background="radial-gradient(ellipse 78% 82% at 50% 45%, transparent 42%, rgba(0,0,0,.42) 76%, rgba(0,0,0,.9) 100%)"
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

      {lexiconShown && (
        <Box
          position="absolute"
          zIndex={3}
          display={{ base: 'none', lg: 'block' }}
          top="88px"
          right="34px"
          width="288px"
          maxHeight="calc(100% - 260px)"
          overflowY="auto"
          animation="lexiconReveal .5s ease both"
        >
          <LexiconPanel
            tokens={tokens}
            wordCount={lexicon ? lexicon.weights.size : null}
          />
        </Box>
      )}

      {phase === 'gone' && (
        <Flex
          position="absolute"
          inset="0"
          zIndex={6}
          direction="column"
          alignItems="center"
          justifyContent="center"
          gap="14px"
          background="rgba(3,2,1,.9)"
          animation="lexiconReveal 2.4s ease both"
        >
          <Label
            fontFamily="nixie"
            fontSize={{ base: '10px', md: '11px' }}
            letterSpacing=".28em"
            color="rgba(238,150,98,.5)"
          >
            LINK TERMINATED BY REMOTE HOST
          </Label>
          <Label
            fontFamily="nixie"
            fontSize={{ base: '9px', md: '10px' }}
            letterSpacing=".2em"
            color="rgba(238,150,98,.28)"
          >
            [社務所應答端末 · 待機]
          </Label>
        </Flex>
      )}

      <Flex
        position="absolute"
        zIndex={4}
        left={{ base: '0', md: '50%' }}
        bottom="0"
        width={{ base: '100%', md: 'min(760px, calc(100% - 64px))' }}
        transform={{ base: 'none', md: 'translateX(-50%)' }}
        direction="column"
        justifyContent="flex-end"
        maxHeight="100%"
        px={{ base: '14px', md: '0' }}
        pb={{
          base: 'calc(16px + env(safe-area-inset-bottom))',
          md: '22px',
        }}
      >
        <Box
          ref={transcriptRef}
          flex="0 1 auto"
          minHeight="0"
          maxHeight={{ base: '170px', md: '185px' }}
          overflowY="auto"
          px={{ base: '12px', md: '16px' }}
          py="12px"
          background="linear-gradient(180deg, rgba(8,3,1,.04), rgba(8,3,1,.8))"
          borderLeft="1px solid rgba(231,105,45,.38)"
        >
          {/* Bottom-aligned, so the first line of a conversation opens just
              above the input instead of hanging off the top of the panel. */}
          <Flex direction="column" justifyContent="flex-end" minHeight="100%" gap="9px">
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

        {lexiconShown && (
          <Box
            display={{ base: 'block', lg: 'none' }}
            maxHeight="132px"
            overflowY="auto"
            px={{ base: '12px', md: '16px' }}
            background="rgba(8,3,1,.62)"
            animation="lexiconReveal .5s ease both"
          >
            <LexiconPanel
              tokens={tokens}
              wordCount={lexicon ? lexicon.weights.size : null}
            />
          </Box>
        )}

        <Flex gap="6px" overflowX="auto" py="7px" css={{ scrollbarWidth: 'none' }}>
          {phase === 'offered' ? (
            <Chip
              type="button"
              onClick={handOver}
              disabled={typing !== null}
              px="14px"
              py="6px"
              border="1px solid rgba(238,150,98,.62)"
              background="rgba(231,105,45,.14)"
              color="rgba(255,224,200,.94)"
              fontSize="12px"
              cursor="pointer"
              whiteSpace="nowrap"
              animation="hudPulse 2.4s ease-in-out infinite"
              transition="all .18s"
              _hover={{
                background: 'rgba(231,105,45,.24)',
                borderColor: 'rgba(255,204,168,.9)',
              }}
              _disabled={{ opacity: 0.3, cursor: 'default' }}
            >
              {ENDING_HANDOVER.label}
            </Chip>
          ) : (
            prompts.map((suggestion) => (
              <Chip
                key={suggestion}
                type="button"
                onClick={() => {
                  asked.current.set(
                    suggestion,
                    (asked.current.get(suggestion) ?? 0) + 1
                  )
                  send(suggestion)
                }}
                disabled={typing !== null || locked}
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
            ))
          )}
        </Flex>

        <Form
          display="flex"
          gap="7px"
          background="rgba(7,3,1,.7)"
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault()
            send(draft)
          }}
        >
          <Input
            value={draft}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (draft.length === 0 && event.target.value.length > 0)
                avatarRef.current?.notice()
              setDraft(event.target.value)
            }}
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
            disabled={
              typing !== null || locked || draft.trim().length === 0
            }
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
