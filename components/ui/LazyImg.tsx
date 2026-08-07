import { styled } from 'styled-system/jsx'

// A plain `styled.img` with the two attributes next/image sets for free. Used
// for below-the-fold content images; an explicit prop on the call site wins.
export const LazyImg = styled(
  'img',
  {},
  { defaultProps: { loading: 'lazy', decoding: 'async' } }
)
