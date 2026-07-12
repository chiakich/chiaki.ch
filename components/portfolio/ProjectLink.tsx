import { HStack, styled } from 'styled-system/jsx'

const Link = styled.a
const Text = styled.span

interface ProjectLinkProps {
  href: string
  label: string
  detail?: string
  accent?: string
  solid?: boolean
  download?: boolean
}

// Apple 式膠囊按鈕：solid 為主要動作（填滿主題色），預設為外框次要動作。
const ProjectLink = ({ href, label, detail, accent = '#df8a42', solid = false, download = false }: ProjectLinkProps) => (
  <Link
    href={href}
    target={download ? undefined : '_blank'}
    rel="noreferrer"
    download={download || undefined}
    px={6}
    py={3}
    display="inline-flex"
    borderRadius="980px"
    fontSize="sm"
    style={{
      '--link-accent': accent,
      transition: 'all .25s ease',
      border: `1px solid ${accent}`,
      backgroundColor: solid ? accent : 'transparent',
      color: solid ? '#000' : accent,
    } as React.CSSProperties}
    _hover={{ transform: 'scale(1.03)', backgroundColor: 'var(--link-accent)', color: 'black' }}
  >
    <HStack gap={3}>
      <Text fontWeight="700" letterSpacing=".02em">{label}</Text>
      {detail && <Text fontSize="xs" opacity={.75}>{detail}</Text>}
      {!download && <Text aria-hidden>↗</Text>}
    </HStack>
  </Link>
)

export default ProjectLink
