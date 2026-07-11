import { HStack, styled } from 'styled-system/jsx'

const Link = styled.a
const Text = styled.span

interface ProjectLinkProps {
  href: string
  label: string
  detail?: string
  accent?: string
}

const ProjectLink = ({ href, label, detail, accent = '#df8a42' }: ProjectLinkProps) => (
  <Link
    href={href}
    target="_blank"
    rel="noreferrer"
    border="1px solid"
    borderColor="var(--link-accent)"
    px={5}
    py={3}
    display="inline-flex"
    color="var(--link-accent)"
    backgroundColor="transparent"
    _hover={{ backgroundColor: 'var(--link-accent)', color: 'black' }}
    style={{ '--link-accent': accent, transition: 'all .25s ease' } as React.CSSProperties}
  >
    <HStack gap={3}>
      <Text fontWeight="900" letterSpacing="0.08em">{label}</Text>
      {detail && <Text fontSize="xs" opacity={0.7}>{detail}</Text>}
      <Text aria-hidden>↗</Text>
    </HStack>
  </Link>
)

export default ProjectLink
