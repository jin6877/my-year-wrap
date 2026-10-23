import { EMPTY_DATA, type WrapData } from './types'
import { DEFAULT_THEME_ID } from './themes'

const DATA_KEY = 'myw.data.v1'
const THEME_KEY = 'myw.theme.v1'

export function loadData(): WrapData {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) return { ...EMPTY_DATA }
    const parsed = JSON.parse(raw)
    return { ...EMPTY_DATA, ...parsed }
  } catch {
    return { ...EMPTY_DATA }
  }
}

export function saveData(data: WrapData) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch {
    /* ignore quota / private mode errors */
  }
}

export function loadTheme(): string {
  try {
    return localStorage.getItem(THEME_KEY) ?? DEFAULT_THEME_ID
  } catch {
    return DEFAULT_THEME_ID
  }
}

export function saveTheme(id: string) {
  try {
    localStorage.setItem(THEME_KEY, id)
  } catch {
    /* ignore */
  }
}
