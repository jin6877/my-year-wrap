export const WRAP_YEAR = 2026
export const NEXT_YEAR = WRAP_YEAR + 1

export type WrapData = {
  name: string
  word: string
  selfWord: string
  song: string
  movie: string
  book: string
  booksRead: string
  watched: string
  trips: string
  bestPlace: string
  mostDid: string
  learned: string
  moment: string
  goal: string
}

export const EMPTY_DATA: WrapData = {
  name: '',
  word: '',
  selfWord: '',
  song: '',
  movie: '',
  book: '',
  booksRead: '',
  watched: '',
  trips: '',
  bestPlace: '',
  mostDid: '',
  learned: '',
  moment: '',
  goal: '',
}

export type SlideKind = 'cover' | 'big' | 'stats' | 'quote' | 'outro'

export type StatItem = { value: string; unit: string; label: string }

export type SlideContent = {
  id: string
  kind: SlideKind
  label?: string
  eyebrow?: string
  title?: string
  subtitle?: string
  stats?: StatItem[]
  footer?: string
}
