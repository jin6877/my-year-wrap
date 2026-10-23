import { NEXT_YEAR, WRAP_YEAR, type SlideContent, type StatItem, type WrapData } from './types'

const has = (v: string) => v.trim().length > 0

/** pretty number formatting, keeps original string if not a clean integer */
function numText(v: string): string {
  const n = Number(v.replace(/[, ]/g, ''))
  if (!Number.isFinite(n)) return v.trim()
  return n.toLocaleString('ko-KR')
}

export function buildSlides(data: WrapData): SlideContent[] {
  const slides: SlideContent[] = []
  const name = data.name.trim()

  // Cover (always)
  slides.push({
    id: 'cover',
    kind: 'cover',
    eyebrow: `${WRAP_YEAR} WRAPPED`,
    title: name ? `${name}의\n한 해` : '나의\n한 해',
    subtitle: '올해의 나를 한 장에 담았어요',
    footer: '밀어서 시작 →',
  })

  if (has(data.word)) {
    slides.push({
      id: 'word',
      kind: 'big',
      label: '올해를 한 단어로',
      title: data.word.trim(),
      subtitle: `${WRAP_YEAR}년, 나를 관통한 키워드`,
    })
  }

  if (has(data.selfWord)) {
    slides.push({
      id: 'self',
      kind: 'quote',
      label: '올해의 나는',
      title: data.selfWord.trim(),
    })
  }

  if (has(data.song)) {
    slides.push({
      id: 'song',
      kind: 'big',
      eyebrow: '🎧',
      label: '올해의 노래',
      title: data.song.trim(),
      subtitle: '올해 가장 많이 흥얼거린 곡',
    })
  }

  if (has(data.movie)) {
    slides.push({
      id: 'movie',
      kind: 'big',
      eyebrow: '🎬',
      label: '올해의 영화·드라마',
      title: data.movie.trim(),
      subtitle: '마음에 오래 남은 작품',
    })
  }

  if (has(data.book)) {
    slides.push({
      id: 'book',
      kind: 'big',
      eyebrow: '📚',
      label: '올해의 책',
      title: data.book.trim(),
      subtitle: '올해 나를 채운 한 권',
    })
  }

  // Stats
  const stats: StatItem[] = []
  if (has(data.booksRead)) stats.push({ value: numText(data.booksRead), unit: '권', label: '읽은 책' })
  if (has(data.watched)) stats.push({ value: numText(data.watched), unit: '편', label: '본 영화·드라마' })
  if (has(data.trips)) stats.push({ value: numText(data.trips), unit: '번', label: '떠난 여행' })
  if (stats.length > 0) {
    slides.push({
      id: 'stats',
      kind: 'stats',
      label: `숫자로 보는 ${WRAP_YEAR}`,
      stats,
    })
  }

  if (has(data.bestPlace)) {
    slides.push({
      id: 'place',
      kind: 'big',
      eyebrow: '✈️',
      label: '가장 좋았던 곳',
      title: data.bestPlace.trim(),
      subtitle: '다시 가고 싶은 그곳',
    })
  }

  if (has(data.mostDid)) {
    slides.push({
      id: 'mostdid',
      kind: 'big',
      label: '올해 제일 많이 한 것',
      title: data.mostDid.trim(),
    })
  }

  if (has(data.learned)) {
    slides.push({
      id: 'learned',
      kind: 'big',
      eyebrow: '🌱',
      label: '새로 배운 것 · 도전',
      title: data.learned.trim(),
    })
  }

  if (has(data.moment)) {
    slides.push({
      id: 'moment',
      kind: 'quote',
      label: '잊지 못할 순간',
      title: data.moment.trim(),
    })
  }

  if (has(data.goal)) {
    slides.push({
      id: 'goal',
      kind: 'big',
      eyebrow: '🎯',
      label: `${NEXT_YEAR}, 나의 다짐`,
      title: data.goal.trim(),
      subtitle: '내년의 나에게',
    })
  }

  // Outro (always)
  slides.push({
    id: 'outro',
    kind: 'outro',
    eyebrow: "THAT'S A WRAP",
    title: `수고했어,\n${WRAP_YEAR}`,
    subtitle: '너의 한 해도 카드로 남겨봐',
    footer: 'my-year-wrap.vercel.app',
  })

  return slides
}

/** number of filled fields (used to decide sample fallback) */
export function filledCount(data: WrapData): number {
  return Object.values(data).filter((v) => v.trim().length > 0).length
}
