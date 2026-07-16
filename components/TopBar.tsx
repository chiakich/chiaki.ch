import { Flex, Box, HStack, VStack, styled } from 'styled-system/jsx'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
} from 'components/ui/controls'
import { ChevronDownIcon, CloseIcon, HamburgerIcon } from 'components/ui/icons'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import NavFlyout from 'components/nav/NavFlyout'
import SubNav from 'components/nav/SubNav'
import LanguageSwitcher from 'components/nav/LanguageSwitcher'
import { getMainLinks, getNavSections } from 'components/nav/navData'
import { localizedPath, pagePathFromLocalePath, useI18n } from 'i18n'

const Image = styled.img
const Text = styled.p

// 滑鼠裝置才做 hover 展開；觸控裝置改由點擊切換。
const supportsHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

const TopBar: React.FC = () => {
  // activeMenu 是「面板裡顯示哪一區」，isFlyoutOpen 是「面板收合狀態」。
  // 收合時刻意保留 activeMenu，才不會在收合動畫途中內容瞬間消失。
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isFlyoutOpen, setFlyoutOpen] = useState(false)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const currentPath = usePathname()
  const { locale, t } = useI18n()
  const mainLinks = useMemo(() => getMainLinks(t), [t])
  const navSections = useMemo(() => getNavSections(t), [t])
  const pagePath = pagePathFromLocalePath(currentPath ?? '/')
  const navRef = useRef<HTMLDivElement>(null)

  const closeFlyout = useCallback(() => setFlyoutOpen(false), [])

  const openFlyout = useCallback((label: string) => {
    setActiveMenu(label)
    setFlyoutOpen(true)
  }, [])

  // 換頁時收起面板
  useEffect(() => {
    setFlyoutOpen(false)
  }, [currentPath])

  // 點外圍收回
  useEffect(() => {
    if (!isFlyoutOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) closeFlyout()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFlyout()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFlyoutOpen, closeFlyout])

  useEffect(() => {
    if (!isDrawerOpen) return

    const activeParent = mainLinks.find(([, path]) =>
      path === '/' ? pagePath === '/' : pagePath.startsWith(path)
    )?.[0]

    if (activeParent && navSections[activeParent]) {
      setExpandedMenu(activeParent)
    }
  }, [pagePath, isDrawerOpen, mainLinks, navSections])

  const isActive = (path: string) =>
    path === '/' ? pagePath === '/' : pagePath.startsWith(path)

  const handleLinkPointerEnter = (event: React.PointerEvent, label: string) => {
    if (event.pointerType !== 'mouse' || !supportsHover()) return
    if (navSections[label]) openFlyout(label)
    else closeFlyout()
  }

  const handleLinkClick = (event: React.MouseEvent, label: string) => {
    if (!navSections[label]) return
    // 觸控裝置：點擊不跳頁，改為展開／收合面板（landing page 仍是面板的第一項）
    if (!supportsHover()) {
      event.preventDefault()
      if (isFlyoutOpen && activeMenu === label) closeFlyout()
      else openFlyout(label)
    }
  }

  const activeSection = activeMenu ? navSections[activeMenu] : null

  // 常駐 SubNav 直接由網址推導，頁面端不需要各自掛載
  const currentSectionKey = mainLinks.find(
    ([label, path]) =>
      navSections[label] && path !== '/' && pagePath.startsWith(path)
  )?.[0]
  const currentSection = currentSectionKey ? navSections[currentSectionKey] : null

  return (
    <>
      <Box
        as="nav"
        ref={navRef}
        position="fixed"
        width="100%"
        zIndex="20"
        backgroundColor="rgba(29,29,31,.92)"
        backdropFilter="saturate(180%) blur(20px)"
        borderBottom="1px solid"
        borderColor="gray.800"
        fontFamily="body"
        // 觸控裝置會在點擊後送出合成滑鼠事件，只讓真正的 hover 裝置用滑出收合
        onMouseLeave={() => {
          if (supportsHover()) closeFlyout()
        }}
      >
        <Flex
          maxW="width.section"
          mx="auto"
          px={{ base: '20px', md: '40px', lg: '60px' }}
          height="44px"
          alignItems="center"
          justify="space-between"
          fontWeight="normal"
        >
          {/* Left section */}
          <HStack gap={{ base: 4, md: 8 }}>
            <IconButton
              aria-label={t('accessibility.menu')}
              icon={<HamburgerIcon color="white" />}
              variant="ghost"
              size="sm"
              color="white"
              style={{ color: 'white' }}
              _hover={{ bg: 'gray.800' }}
              display={{ base: 'flex', xs: 'none' }}
              onClick={() => {
                setDrawerOpen((prev) => !prev)
              }}
            />
            <Link href={localizedPath('/', locale)}>
              <Image src="/assets/icon/logo_white.svg" alt={t('accessibility.logo')} height="20px" />
            </Link>

            <HStack
              gap={{ base: '12px', sm: '18px', md: '28px' }}
              display={{ base: 'none', xs: 'flex' }}
              color="#F5F5F7"
              fontSize="17px"
              fontWeight="600"
            >
              {mainLinks.map(([label, path]) => {
                const section = navSections[label]
                const isExpanded = isFlyoutOpen && activeMenu === label

                return (
                  <Link
                    key={path}
                    href={localizedPath(path, locale)}
                    onPointerEnter={(event) => handleLinkPointerEnter(event, label)}
                    // 只給鍵盤／滑鼠用。觸控時 focus 會搶在 click 前面觸發，
                    // 讓 click 誤判成「同一區已展開」而收合。
                    onFocus={() => {
                      if (section && supportsHover()) openFlyout(label)
                    }}
                    onClick={(event) => handleLinkClick(event, label)}
                    aria-expanded={section ? isExpanded : undefined}
                    aria-controls={section ? 'nav-flyout' : undefined}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      opacity: isActive(path) ? 1 : 0.5,
                      textShadow: isActive(path)
                        ? '0 0 5px rgba(255,255,255,.5)'
                        : 'none',
                    }}
                  >
                    {label}
                    {/* flyout 展開中的區段：不改字色，改在下方點一個小白點 */}
                    {isExpanded && (
                      <Box
                        as="span"
                        position="absolute"
                        left="50%"
                        bottom="-7px"
                        width="4px"
                        height="4px"
                        borderRadius="full"
                        backgroundColor="white"
                        transform="translateX(-50%)"
                      />
                    )}
                  </Link>
                )
              })}
            </HStack>
          </HStack>

          <LanguageSwitcher />

          <Drawer
            placement="left"
            size="xs"
            isOpen={isDrawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            <DrawerOverlay onClick={() => setDrawerOpen(false)} />
            <DrawerContent backgroundColor="rgba(18,18,20,.98)" color="white">
              <DrawerHeader alignSelf="flex-end" px={3} pt={3} pb={2}>
                <IconButton
                  aria-label={t('accessibility.close')}
                  icon={<CloseIcon />}
                  variant="unstyled"
                  onClick={() => setDrawerOpen(false)}
                />
              </DrawerHeader>
              <DrawerBody px={7} pb={8}>
                <VStack gap={2} alignItems="stretch">
                  {mainLinks.map(([label, path], index) => {
                    const subnavItems = navSections[label]?.items
                    const hasChildren = Boolean(subnavItems)
                    const isExpanded = expandedMenu === label
                    const itemTransition = `opacity 280ms ease ${80 + index * 45}ms, transform 320ms cubic-bezier(0.22, 1, 0.36, 1) ${80 + index * 45}ms`

                    return (
                      <Box
                        key={path}
                        opacity={isDrawerOpen ? 1 : 0}
                        transform={
                          isDrawerOpen ? 'translateX(0)' : 'translateX(-12px)'
                        }
                        transition={itemTransition}
                      >
                        {hasChildren ? (
                          <styled.button
                            type="button"
                            display="flex"
                            width="100%"
                            alignItems="center"
                            justifyContent="space-between"
                            py={2}
                            bg="transparent"
                            border="0"
                            color="white"
                            cursor="pointer"
                            fontSize="1.6rem"
                            fontWeight="600"
                            letterSpacing="-.02em"
                            textAlign="left"
                            opacity={isActive(path) ? 1 : 0.8}
                            onClick={() =>
                              setExpandedMenu((expanded) =>
                                expanded === label ? null : label
                              )
                            }
                            aria-expanded={isExpanded}
                            aria-controls={`mobile-${label.toLowerCase()}-menu`}
                          >
                            {label}
                            <Box
                              as="span"
                              display="inline-flex"
                              fontSize="1.25rem"
                              transform={
                                isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                              }
                              transition="transform 220ms ease"
                            >
                              <ChevronDownIcon />
                            </Box>
                          </styled.button>
                        ) : (
                          <Link
                            href={localizedPath(path, locale)}
                            onClick={() => setDrawerOpen(false)}
                            style={{
                              display: 'block',
                              padding: '.5rem 0',
                              fontSize: '1.6rem',
                              fontWeight: 600,
                              letterSpacing: '-.02em',
                              opacity: isActive(path) ? 1 : 0.8,
                            }}
                          >
                            {label}
                          </Link>
                        )}
                        {hasChildren && (
                          <Box
                            id={`mobile-${label.toLowerCase()}-menu`}
                            maxH={isExpanded ? '20rem' : 0}
                            opacity={isExpanded ? 1 : 0}
                            overflow="hidden"
                            transition="max-height 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease"
                          >
                            <VStack
                              gap={1}
                              alignItems="start"
                              mt={1}
                              mb={2}
                              pl={4}
                              py={1}
                              borderLeft="1px solid rgba(255,255,255,.16)"
                            >
                              {subnavItems?.map((item) => (
                                <Link
                                  key={item.id}
                                  href={localizedPath(item.path, locale)}
                                  onClick={() => setDrawerOpen(false)}
                                  style={{
                                    padding: '.35rem 0',
                                    fontSize: '1.05rem',
                                    opacity: pagePath === item.path ? 1 : 0.55,
                                  }}
                                >
                                  {item.title}
                                </Link>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </Box>
                    )
                  })}
                </VStack>
                <Text mt={8} fontSize="xs" opacity={0.35}>
                  chiaki.ch
                </Text>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Flex>

        {/* Apple 式 flyout：往下滑入的 sub nav bar */}
        <Box
          id="nav-flyout"
          display={{ base: 'none', xs: 'grid' }}
          gridTemplateRows={isFlyoutOpen ? '1fr' : '0fr'}
          transition="grid-template-rows 380ms cubic-bezier(0.22, 1, 0.36, 1)"
        >
          <Box
            minHeight="0"
            overflow="hidden"
            opacity={isFlyoutOpen ? 1 : 0}
            // 跟展開用同一組時間與曲線，淡入才會跟著高度一起走完
            transition="opacity 380ms cubic-bezier(0.22, 1, 0.36, 1)"
            aria-hidden={!isFlyoutOpen}
          >
            {activeSection && (
              <NavFlyout
                section={activeSection}
                currentPath={pagePath}
                onNavigate={closeFlyout}
              />
            )}
          </Box>
        </Box>
      </Box>

      {currentSection && (
        <SubNav section={currentSection} currentPath={pagePath} />
      )}
    </>
  )
}

export default TopBar
