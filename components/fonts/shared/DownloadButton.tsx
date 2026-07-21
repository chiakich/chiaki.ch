import { HStack, styled } from 'styled-system/jsx'

const Anchor = styled.a
const Span = styled.span

interface DownloadButtonProps {
  href: string
  label: string
  sub?: string
  accent?: string
  download?: string | boolean
  external?: boolean
}

// The accent is passed as a CSS variable so Panda can statically extract the styles
const DownloadButton = ({
  href,
  label,
  sub,
  accent = '#df8a42',
  download,
  external,
}: DownloadButtonProps) => (
  <Anchor
    href={href}
    download={download}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    style={{ '--accent': accent } as React.CSSProperties}
    display="inline-flex"
    alignItems="center"
    gap={3}
    border="1px solid var(--accent)"
    color="var(--accent)"
    px={6}
    py={3}
    fontWeight="bold"
    letterSpacing="0.1em"
    clipPath="polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)"
    transition="background-color 0.25s ease, color 0.25s ease"
    _hover={{ backgroundColor: 'var(--accent)', color: 'black' }}
  >
    <HStack gap={2}>
      <Span>{label}</Span>
      {sub && (
        <Span fontSize="xs" opacity={0.7} fontWeight="regular">
          {sub}
        </Span>
      )}
    </HStack>
  </Anchor>
)

export default DownloadButton
