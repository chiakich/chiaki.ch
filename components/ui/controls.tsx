import React from 'react'
import { Box, Center, Flex, styled } from 'styled-system/jsx'
import type { HTMLStyledProps } from 'styled-system/types/jsx'
import { css, cx } from 'styled-system/css'

const StyledButton = styled.button
const DRAWER_TRANSITION_MS = 320

const DrawerMotionContext = React.createContext({ isVisible: false })

export type ButtonProps = HTMLStyledProps<'button'> &
  Pick<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'download' | 'href' | 'rel' | 'target'
  > & {
    leftIcon?: React.ReactNode
    isExternal?: boolean
    colorScheme?: 'blue' | 'gray' | 'red' | 'whiteAlpha' | string
    variant?: 'ghost' | 'outline' | 'solid' | string
    size?: 'sm' | 'md' | 'lg' | string
  }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      leftIcon,
      children,
      className,
      type = 'button',
      colorScheme,
      variant,
      size,
      isExternal,
      ...props
    },
    ref
  ) => (
    <StyledButton
      ref={ref}
      type={type}
      className={cx(
        css({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          borderRadius: '100px',
          bg: 'rgba(100, 100, 100, 0.5)',
          color: 'white',
          fontWeight: '600',
          transition: 'filter .2s, background-color .2s, color .2s, border-color .2s',
          cursor: 'pointer',
          border: '0',
          minH: '2.5rem',
          px: '1rem',
          _hover: { filter: 'brightness(1.3)' },
          _active: { filter: 'brightness(1.5)' },
          _disabled: {
            cursor: 'not-allowed',
            opacity: 0.5,
          },
          ...(variant === 'outline'
            ? {
                bg: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.8)',
              }
            : {}),
          ...(colorScheme === 'red'
            ? {
                bg: 'red.600',
                _hover: { bg: 'red.500', filter: 'brightness(1.05)' },
              }
            : {}),
          ...(colorScheme === 'blue'
            ? {
                color: 'blue.300',
                borderColor: 'blue.300',
                _hover: { bg: 'blue.500', color: 'white' },
              }
            : {}),
          ...(size === 'sm'
            ? {
                minH: '2rem',
                px: '0.75rem',
                fontSize: '0.875rem',
              }
            : {}),
        }),
        className
      )}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      {...props}
    >
      {leftIcon}
      {children}
    </StyledButton>
  )
)

Button.displayName = 'Button'

const StyledIconButton = styled.button

export type IconButtonProps = HTMLStyledProps<'button'> & {
  icon: React.ReactNode
  'aria-label': string
  colorScheme?: string
  variant?: string
  size?: 'sm' | 'md' | 'lg' | string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, type = 'button', size, ...props }, ref) => (
    <StyledIconButton
      ref={ref}
      type={type}
      className={cx(
        css({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2rem',
          height: '2rem',
          border: '0',
          borderRadius: '9999px',
          bg: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          transition: 'background-color .2s, filter .2s',
          _hover: { bg: 'rgba(255, 255, 255, 0.12)' },
          ...(size === 'lg'
            ? {
                width: '3rem',
                height: '3rem',
                fontSize: '1.25rem',
              }
            : {}),
        }),
        className
      )}
      {...props}
    >
      {icon}
    </StyledIconButton>
  )
)

IconButton.displayName = 'IconButton'

export const Spinner = ({ className }: HTMLStyledProps<'span'>) => (
  <styled.span
    className={cx(
      css({
        display: 'inline-block',
        width: '3rem',
        height: '3rem',
        borderRadius: '9999px',
        border: '4px solid rgba(156, 163, 175, 0.35)',
        borderTopColor: 'rgb(156, 163, 175)',
        animation: 'spin 0.8s linear infinite',
      }),
      className
    )}
  />
)

export const Switch = ({
  id,
  isChecked,
  onChange,
}: {
  id?: string
  isChecked?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  colorScheme?: string
  size?: string
}) => (
  <styled.label
    display="inline-flex"
    alignItems="center"
    w="2.75rem"
    h="1.5rem"
    cursor="pointer"
    position="relative"
  >
    <styled.input
      id={id}
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      position="absolute"
      w="1px"
      h="1px"
      overflow="hidden"
      clip="rect(0, 0, 0, 0)"
      whiteSpace="nowrap"
    />
    <Box
      position="absolute"
      inset={0}
      borderRadius="9999px"
      bg={isChecked ? 'red.500' : 'gray.600'}
      transition="background-color .2s"
    />
    <Box
      position="absolute"
      left="0.1875rem"
      w="1.125rem"
      h="1.125rem"
      borderRadius="9999px"
      bg="white"
      transform={isChecked ? 'translateX(1.25rem)' : 'translateX(0)'}
      transition="transform .2s"
    />
  </styled.label>
)

export const useDisclosure = (initial = false) => {
  const [isOpen, setIsOpen] = React.useState(initial)
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen((value) => !value),
  }
}

export const Drawer = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  placement?: string
  size?: string
}) => {
  React.useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return (
    <DrawerMotionContext.Provider value={{ isVisible: isOpen }}>
      {children}
    </DrawerMotionContext.Provider>
  )
}

export const DrawerOverlay = ({ style, ...props }: HTMLStyledProps<'div'>) => {
  const { isVisible } = React.useContext(DrawerMotionContext)
  const visibilityDelay = isVisible ? '0ms' : `${DRAWER_TRANSITION_MS}ms`
  const transition = `opacity ${DRAWER_TRANSITION_MS}ms ease, visibility 0ms linear ${visibilityDelay}`

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={30}
      bg="rgba(0, 0, 0, 0.55)"
      opacity={isVisible ? 1 : 0}
      style={{
        pointerEvents: isVisible ? 'auto' : 'none',
        visibility: isVisible ? 'visible' : 'hidden',
        transition,
        ...style,
      }}
      {...props}
    />
  )
}

export const DrawerContent = ({
  children,
  style,
  ...props
}: HTMLStyledProps<'div'>) => {
  const { isVisible } = React.useContext(DrawerMotionContext)
  const visibilityDelay = isVisible ? '0ms' : `${DRAWER_TRANSITION_MS}ms`
  const transition = `transform ${DRAWER_TRANSITION_MS}ms cubic-bezier(0.32, 0.72, 0, 1), visibility 0ms linear ${visibilityDelay}`

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      zIndex={31}
      w="min(20rem, 84vw)"
      h="100vh"
      bg="black"
      color="white"
      boxShadow="0 0 30px rgba(0, 0, 0, 0.45)"
      transform={isVisible ? 'translateX(0)' : 'translateX(-100%)'}
      style={{
        pointerEvents: isVisible ? 'auto' : 'none',
        visibility: isVisible ? 'visible' : 'hidden',
        transition,
        willChange: 'transform',
        ...style,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

export const DrawerHeader = Flex
export const DrawerBody = Box

export const AlertDialog = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  leastDestructiveRef?: React.RefObject<HTMLButtonElement | null>
  isCentered?: boolean
  children: React.ReactNode
}) => {
  React.useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return isOpen ? <>{children}</> : null
}

export const AlertDialogOverlay = ({ children }: { children: React.ReactNode }) => (
  <Center position="fixed" inset={0} zIndex={40} bg="rgba(0, 0, 0, 0.7)" p="1rem">
    {children}
  </Center>
)

export const AlertDialogContent = Box
export const AlertDialogHeader = Box
export const AlertDialogBody = Box
export const AlertDialogFooter = Flex

export const Avatar = ({
  icon,
  name,
  className,
  ...props
}: HTMLStyledProps<'div'> & {
  icon?: React.ReactNode
  name?: string
}) => (
  <Center
    className={cx(
      css({
        w: '3rem',
        h: '3rem',
        borderRadius: '9999px',
        bg: 'blue.500',
        color: 'white',
        flexShrink: 0,
      }),
      className
    )}
    aria-label={name}
    {...props}
  >
    {icon ?? name?.slice(0, 1)}
  </Center>
)

export const Tooltip = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <span title={label}>{children}</span>
)
