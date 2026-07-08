import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement>

const iconProps = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export const HamburgerIcon = (props: IconProps) => (
  <svg {...iconProps} {...props}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
)

export const CloseIcon = (props: IconProps) => (
  <svg {...iconProps} {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

export const SearchIcon = (props: IconProps) => (
  <svg {...iconProps} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m16 16 4 4" />
  </svg>
)

export const DownloadIcon = (props: IconProps) => (
  <svg {...iconProps} {...props}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
)

export const CalendarIcon = (props: IconProps) => (
  <svg {...iconProps} {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 10h18" />
  </svg>
)

export const AtSignIcon = (props: IconProps) => (
  <svg {...iconProps} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
)

export const ChevronLeftIcon = (props: IconProps) => (
  <svg {...iconProps} {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)
