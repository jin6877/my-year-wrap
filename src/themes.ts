export type Theme = {
  id: string
  name: string
  /** gradient color stops, top-left -> bottom-right */
  stops: string[]
  /** main text color */
  ink: string
  /** secondary / muted text color */
  sub: string
  /** accent color for labels / highlights */
  accent: string
  /** soft glow blob colors used in backgrounds */
  blobs: [string, string]
}

export const THEMES: Theme[] = [
  {
    id: 'sunset',
    name: '네온 선셋',
    stops: ['#FF2E8E', '#B5179E', '#5A189A'],
    ink: '#ffffff',
    sub: 'rgba(255,255,255,0.78)',
    accent: '#FFE1F2',
    blobs: ['#FF7AC6', '#7B2FF7'],
  },
  {
    id: 'aurora',
    name: '오로라',
    stops: ['#00F5A0', '#00C2F0', '#5B2CFF'],
    ink: '#06121f',
    sub: 'rgba(6,18,31,0.72)',
    accent: '#063b3a',
    blobs: ['#8BFFD2', '#59B0FF'],
  },
  {
    id: 'lime',
    name: '라임 팝',
    stops: ['#E8FF52', '#7BE86A', '#00C2A8'],
    ink: '#07231d',
    sub: 'rgba(7,35,29,0.70)',
    accent: '#0a3b2e',
    blobs: ['#F2FF8F', '#54E0B0'],
  },
  {
    id: 'tangerine',
    name: '선셋 탠저린',
    stops: ['#FFB000', '#FF5E3A', '#E4006B'],
    ink: '#ffffff',
    sub: 'rgba(255,255,255,0.80)',
    accent: '#FFE9C7',
    blobs: ['#FFD27A', '#FF6B6B'],
  },
  {
    id: 'grape',
    name: '미드나잇 그레이프',
    stops: ['#3A0CA3', '#5B2CFF', '#4CC9F0'],
    ink: '#ffffff',
    sub: 'rgba(255,255,255,0.78)',
    accent: '#C9D6FF',
    blobs: ['#8A6BFF', '#4CC9F0'],
  },
]

export const DEFAULT_THEME_ID = 'sunset'

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
