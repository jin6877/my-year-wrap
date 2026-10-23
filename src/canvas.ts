import type { SlideContent } from './types'
import type { Theme } from './themes'

export const SITE_LABEL = 'my-year-wrap.vercel.app'

const FONT_STACK =
  '"Space Grotesk", "Apple SD Gothic Neo", "Pretendard", "Malgun Gothic", sans-serif'

export type ExportFormat = 'story' | 'square'
export const FORMAT_SIZES: Record<ExportFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
}

/** Make sure the webfont used on canvas is actually loaded before drawing. */
export async function ensureFonts(): Promise<void> {
  const d = document as Document & { fonts?: FontFaceSet }
  if (!d.fonts) return
  try {
    await Promise.all([
      d.fonts.load('700 120px "Space Grotesk"'),
      d.fonts.load('500 60px "Space Grotesk"'),
      d.fonts.load('400 48px "Space Grotesk"'),
    ])
  } catch {
    /* ignore */
  }
  try {
    await d.fonts.ready
  } catch {
    /* ignore */
  }
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number) {
  ctx.font = `${weight} ${size}px ${FONT_STACK}`
}

/** word-aware wrapping that falls back to char-breaking for long unbroken strings */
function wrapParagraph(ctx: CanvasRenderingContext2D, para: string, maxWidth: number): string[] {
  if (para.trim() === '') return ['']
  const words = para.split(' ')
  const lines: string[] = []
  let line = ''

  const breakLongWord = (word: string): string => {
    let chunk = ''
    for (const ch of Array.from(word)) {
      const test = chunk + ch
      if (ctx.measureText(test).width > maxWidth && chunk) {
        lines.push(chunk)
        chunk = ch
      } else {
        chunk = test
      }
    }
    return chunk
  }

  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width <= maxWidth) {
      line = test
      continue
    }
    if (line) {
      lines.push(line)
      line = ''
    }
    if (ctx.measureText(word).width > maxWidth) {
      line = breakLongWord(word)
    } else {
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  return text
    .split('\n')
    .flatMap((para) => wrapParagraph(ctx, para, maxWidth))
}

type FitResult = { lines: string[]; size: number; lineHeight: number }

/** Shrink font until the wrapped text fits inside the given box. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  opts: {
    maxWidth: number
    maxHeight: number
    maxSize: number
    minSize: number
    weight: number
    lineHeightRatio: number
  },
): FitResult {
  let size = opts.maxSize
  let lines: string[] = []
  while (size >= opts.minSize) {
    setFont(ctx, opts.weight, size)
    lines = wrapText(ctx, text, opts.maxWidth)
    const lineHeight = size * opts.lineHeightRatio
    if (lines.length * lineHeight <= opts.maxHeight) {
      return { lines, size, lineHeight }
    }
    size -= 2
  }
  setFont(ctx, opts.weight, opts.minSize)
  lines = wrapText(ctx, text, opts.maxWidth)
  return { lines, size: opts.minSize, lineHeight: opts.minSize * opts.lineHeightRatio }
}

function drawCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  cx: number,
  topY: number,
  lineHeight: number,
): number {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  let y = topY + lineHeight * 0.78
  for (const line of lines) {
    ctx.fillText(line, cx, y)
    y += lineHeight
  }
  return topY + lines.length * lineHeight
}

function paintBackground(ctx: CanvasRenderingContext2D, w: number, h: number, theme: Theme) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  const stops = theme.stops
  stops.forEach((c, i) => g.addColorStop(stops.length === 1 ? 1 : i / (stops.length - 1), c))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const blob = (x: number, y: number, r: number, hex: string, a: number) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
    rg.addColorStop(0, hexToRgba(hex, a))
    rg.addColorStop(1, hexToRgba(hex, 0))
    ctx.fillStyle = rg
    ctx.fillRect(0, 0, w, h)
  }
  blob(w * 0.22, h * 0.16, w * 0.62, theme.blobs[0], 0.55)
  blob(w * 0.86, h * 0.82, w * 0.68, theme.blobs[1], 0.5)
  blob(w * 0.9, h * 0.08, w * 0.4, theme.blobs[0], 0.35)
}

type Block = {
  lines: string[]
  size: number
  lineHeight: number
  color: string
  weight: number
  gapAfter: number
  letterSpacing?: string
}

function stackHeight(blocks: Block[]): number {
  return blocks.reduce((sum, b) => sum + b.lines.length * b.lineHeight + b.gapAfter, 0)
}

function drawStack(
  ctx: CanvasRenderingContext2D,
  blocks: Block[],
  cx: number,
  topY: number,
) {
  let y = topY
  for (const b of blocks) {
    setFont(ctx, b.weight, b.size)
    ctx.fillStyle = b.color
    try {
      ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
        b.letterSpacing ?? '0px'
    } catch {
      /* unsupported */
    }
    y = drawCenteredLines(ctx, b.lines, cx, y, b.lineHeight)
    y += b.gapAfter
  }
  try {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
  } catch {
    /* ignore */
  }
}

function drawEyebrow(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, theme: Theme, size: number) {
  setFont(ctx, 600, size)
  ctx.fillStyle = theme.accent
  try {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${size * 0.14}px`
  } catch {
    /* ignore */
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, cx + size * 0.07, y)
  try {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
  } catch {
    /* ignore */
  }
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, theme: Theme) {
  const size = w * 0.03
  setFont(ctx, 500, size)
  ctx.fillStyle = theme.sub
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  try {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${size * 0.08}px`
  } catch {
    /* ignore */
  }
  ctx.fillText(`✦  ${SITE_LABEL}`, w / 2 + size * 0.5, h - w * 0.06)
  try {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
  } catch {
    /* ignore */
  }
}

export function renderSlide(
  canvas: HTMLCanvasElement,
  slide: SlideContent,
  theme: Theme,
  w: number,
  h: number,
) {
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  paintBackground(ctx, w, h, theme)

  const pad = w * 0.085
  const cx = w / 2
  const contentW = w - pad * 2
  const eyebrowY = pad + w * 0.06
  const midY = h * 0.5 - h * 0.02

  if (slide.kind === 'stats' && slide.stats) {
    if (slide.label) drawEyebrow(ctx, slide.label, cx, eyebrowY, theme, w * 0.042)
    const rows = slide.stats
    const valueSize = rows.length >= 3 ? w * 0.19 : w * 0.24
    const labelSize = w * 0.05
    const rowGap = h * 0.055
    const blocks: Block[] = []
    for (const s of rows) {
      blocks.push({
        lines: [`${s.value}${s.unit}`],
        size: valueSize,
        lineHeight: valueSize * 1.0,
        color: theme.ink,
        weight: 700,
        gapAfter: 6,
      })
      blocks.push({
        lines: [s.label],
        size: labelSize,
        lineHeight: labelSize * 1.1,
        color: theme.sub,
        weight: 500,
        gapAfter: rowGap,
      })
    }
    const total = stackHeight(blocks)
    drawStack(ctx, blocks, cx, midY - total / 2)
    drawWatermark(ctx, w, h, theme)
    return
  }

  // text-based kinds: cover, big, quote, outro
  const isCover = slide.kind === 'cover'
  const isQuote = slide.kind === 'quote'
  const isOutro = slide.kind === 'outro'

  if (slide.eyebrow) drawEyebrow(ctx, slide.eyebrow, cx, eyebrowY, theme, w * 0.042)

  const blocks: Block[] = []

  if (slide.label) {
    const s = w * 0.05
    setFont(ctx, 600, s)
    blocks.push({
      lines: wrapText(ctx, slide.label, contentW),
      size: s,
      lineHeight: s * 1.2,
      color: theme.accent,
      weight: 600,
      gapAfter: h * 0.018,
      letterSpacing: `${s * 0.02}px`,
    })
  }

  if (slide.title) {
    const quote = isQuote ? `“${slide.title}”` : slide.title
    const maxSize = isCover || isOutro ? w * 0.19 : isQuote ? w * 0.12 : w * 0.15
    const minSize = w * 0.055
    const maxHeight = isQuote ? h * 0.46 : h * 0.5
    const weight = 700
    const fit = fitText(ctx, quote, {
      maxWidth: contentW,
      maxHeight,
      maxSize,
      minSize,
      weight,
      lineHeightRatio: isQuote ? 1.22 : 1.06,
    })
    blocks.push({
      lines: fit.lines,
      size: fit.size,
      lineHeight: fit.lineHeight,
      color: theme.ink,
      weight,
      gapAfter: slide.subtitle ? h * 0.03 : 0,
      letterSpacing: isQuote ? '0px' : `${-fit.size * 0.01}px`,
    })
  }

  if (slide.subtitle) {
    const s = w * 0.045
    setFont(ctx, 500, s)
    blocks.push({
      lines: wrapText(ctx, slide.subtitle, contentW),
      size: s,
      lineHeight: s * 1.35,
      color: theme.sub,
      weight: 500,
      gapAfter: 0,
    })
  }

  const total = stackHeight(blocks)
  drawStack(ctx, blocks, cx, midY - total / 2)

  if (slide.footer) {
    if (isOutro) {
      // footer is the site label -> rendered by watermark, skip duplicate
    } else {
      const s = w * 0.04
      setFont(ctx, 500, s)
      ctx.fillStyle = theme.sub
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(slide.footer, cx, h - w * 0.14)
    }
  }

  drawWatermark(ctx, w, h, theme)
}

export async function exportSlideBlob(
  slide: SlideContent,
  theme: Theme,
  format: ExportFormat,
): Promise<Blob> {
  await ensureFonts()
  const { w, h } = FORMAT_SIZES[format]
  const canvas = document.createElement('canvas')
  renderSlide(canvas, slide, theme, w, h)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('toBlob failed'))
    }, 'image/png')
  })
}
