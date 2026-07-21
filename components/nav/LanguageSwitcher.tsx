import { Box, VStack, styled } from 'styled-system/jsx'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Language, NavArrowDownSolid } from 'iconoir-react'
import { localizedPath, pagePathFromLocalePath, useI18n } from 'i18n'

const LanguageSwitcher: React.FC = () => {
  const [isOpen, setOpen] = useState(false)
  const currentPath = usePathname()
  const { locale, t } = useI18n()
  const pagePath = pagePathFromLocalePath(currentPath ?? '/')

  // 換頁時收起選單
  useEffect(() => {
    setOpen(false)
  }, [currentPath])

  return (
    <Box position="relative" ml="auto" pl={4}>
      <styled.button
        type="button"
        aria-label={`${t('language.label')}: ${locale.toUpperCase()}`}
        aria-expanded={isOpen}
        onClick={() => setOpen((open) => !open)}
        display="inline-flex"
        alignItems="center"
        gap={1}
        bg="transparent"
        border="0"
        color="white"
        cursor="pointer"
        fontSize="13px"
        fontWeight="medium"
        px={2}
        py={1}
        borderRadius="6px"
      >
        <Language width={18} height={18} aria-hidden />
        <Box as="span" display={{ base: 'none', sm: 'inline' }}>
          {locale.toUpperCase()}
        </Box>
        <NavArrowDownSolid
          width={13}
          height={13}
          aria-hidden
          style={{
            transform: isOpen ? 'rotate(180deg)' : undefined,
            transition: 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </styled.button>
      <VStack
        as="ul"
        role="menu"
        position="absolute"
        right="0"
        top="calc(100% + 8px)"
        minW="150px"
        alignItems="stretch"
        gap={0}
        listStyleType="none"
        m={0}
        p={1}
        border="1px solid rgba(255,255,255,.14)"
        borderRadius="8px"
        bg="rgba(31,31,34,.98)"
        boxShadow="0 12px 30px rgba(0,0,0,.3)"
        opacity={isOpen ? 1 : 0}
        transform={isOpen ? 'translateY(0)' : 'translateY(-6px)'}
        transition={
          isOpen
            ? 'opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms cubic-bezier(0.22, 1, 0.36, 1)'
            : 'opacity 160ms ease, transform 160ms ease, visibility 0s 160ms'
        }
        visibility={isOpen ? 'visible' : 'hidden'}
        pointerEvents={isOpen ? 'auto' : 'none'}
        aria-hidden={!isOpen}
      >
        {(['tw', 'ja', 'en'] as const).map((itemLocale) => (
          <Box as="li" key={itemLocale} role="none">
            <Link
              href={localizedPath(pagePath, itemLocale)}
              role="menuitem"
              onClick={() => setOpen(false)}
              tabIndex={isOpen ? 0 : -1}
              style={{
                display: 'block',
                padding: '.5rem .65rem',
                borderRadius: '5px',
                fontSize: '.85rem',
                color: 'white',
                opacity: itemLocale === locale ? 1 : 0.55,
              }}
            >
              {t(`language.${itemLocale}`)}
            </Link>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}

export default LanguageSwitcher
