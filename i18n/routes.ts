// Every path that also exists under /ja and /en. pages/[locale]/[[...slug]].tsx
// types its component map against this list, so the two cannot drift apart.
export const LOCALIZED_ROUTES = [
  '',
  'profile',
  'character',
  'character/chiaki',
  'story',
  'story/character',
  'story/character/art',
  'story/terminal',
  'works',
  'works/chiakey',
  'works/kumiko',
  'works/tg-jpg',
  'works/split-flap',
  'works/letterpress',
  'works/tw-address-tools',
  'works/tw-fuzzy-zipcode',
  'works/tokyono-sora',
  'fonts',
  'fonts/akitra',
  'fonts/huninn',
  'fonts/nixie',
  'blog',
] as const

export type LocalizedRoute = (typeof LOCALIZED_ROUTES)[number]
