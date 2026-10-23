import type { SlideContent } from '../types'
import type { Theme } from '../themes'
import { SITE_LABEL } from '../canvas'

function charLen(text: string): number {
  return Array.from(text.replace(/\n/g, '')).length
}

function titleSize(text: string, kind: string): string {
  const len = charLen(text)
  if (kind === 'cover' || kind === 'outro') {
    if (len <= 6) return '21cqw'
    if (len <= 10) return '16cqw'
    return '12cqw'
  }
  if (kind === 'quote') {
    if (len <= 10) return '13cqw'
    if (len <= 24) return '10cqw'
    if (len <= 44) return '7.6cqw'
    return '6cqw'
  }
  // big
  if (len <= 5) return '19cqw'
  if (len <= 10) return '14.5cqw'
  if (len <= 18) return '10.8cqw'
  if (len <= 30) return '8cqw'
  return '6.2cqw'
}

export default function Slide({
  slide,
  theme,
  animKey,
}: {
  slide: SlideContent
  theme: Theme
  animKey: number
}) {
  const grad = `linear-gradient(140deg, ${theme.stops.join(', ')})`
  const isQuote = slide.kind === 'quote'
  const titleText = slide.title ?? ''

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: grad, color: theme.ink, containerType: 'inline-size' }}
    >
      {/* soft light blobs */}
      <div
        className="blob pointer-events-none absolute"
        style={{
          width: '95%',
          height: '55%',
          left: '-25%',
          top: '-10%',
          background: `radial-gradient(closest-side, ${theme.blobs[0]}, transparent)`,
          opacity: 0.6,
        }}
      />
      <div
        className="blob pointer-events-none absolute"
        style={{
          width: '110%',
          height: '60%',
          right: '-35%',
          bottom: '-12%',
          background: `radial-gradient(closest-side, ${theme.blobs[1]}, transparent)`,
          opacity: 0.55,
          animationDelay: '-6s',
        }}
      />

      {/* watermark pinned to the bottom edge */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[3.4%] z-20 text-center"
        style={{ color: theme.sub, fontSize: '3cqw', letterSpacing: '0.18em', fontWeight: 500 }}
      >
        ✦&nbsp;&nbsp;{SITE_LABEL}
      </div>

      <div
        key={animKey}
        className="relative z-10 flex h-full flex-col justify-between px-[8.5%] pt-[11%] pb-[13%] text-center"
      >
        {/* top eyebrow */}
        <div className="flex min-h-[7cqw] items-start justify-center">
          {slide.eyebrow && (
            <span
              className="anim-float font-semibold uppercase"
              style={{ color: theme.accent, fontSize: '4.2cqw', letterSpacing: '0.28em' }}
            >
              {slide.eyebrow}
            </span>
          )}
        </div>

        {/* middle content */}
        <div className="flex flex-1 flex-col items-center justify-center">
          {slide.label && (
            <p
              className="anim-float mb-[4cqw] font-semibold"
              style={{ color: theme.accent, fontSize: '5cqw', animationDelay: '0.05s' }}
            >
              {slide.label}
            </p>
          )}

          {slide.stats && (
            <div className="flex flex-col items-center gap-[6cqw]">
              {slide.stats.map((s, i) => (
                <div
                  key={s.label}
                  className="anim-pop flex flex-col items-center"
                  style={{ animationDelay: `${0.12 + i * 0.12}s` }}
                >
                  <div
                    className="font-bold leading-none"
                    style={{ fontSize: slide.stats!.length >= 3 ? '19cqw' : '24cqw' }}
                  >
                    {s.value}
                    <span style={{ fontSize: '0.46em' }}>{s.unit}</span>
                  </div>
                  <div className="mt-[2cqw] font-medium" style={{ color: theme.sub, fontSize: '5cqw' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {slide.title && (
            <h1
              className="anim-pop font-bold"
              style={{
                fontSize: titleSize(titleText, slide.kind),
                lineHeight: isQuote ? 1.25 : 1.04,
                letterSpacing: isQuote ? '0' : '-0.01em',
                whiteSpace: titleText.includes('\n') ? 'pre-line' : 'normal',
                wordBreak: 'keep-all',
                animationDelay: '0.12s',
                textWrap: 'balance',
              }}
            >
              {isQuote ? `“${titleText}”` : titleText}
            </h1>
          )}

          {slide.subtitle && (
            <p
              className="anim-float mt-[5cqw] font-medium"
              style={{ color: theme.sub, fontSize: '4.6cqw', animationDelay: '0.28s' }}
            >
              {slide.subtitle}
            </p>
          )}
        </div>

        {/* bottom footer */}
        <div className="flex min-h-[6cqw] items-end justify-center">
          {slide.footer && slide.kind !== 'outro' && (
            <span
              className="anim-float font-medium"
              style={{ color: theme.sub, fontSize: '4cqw', animationDelay: '0.4s' }}
            >
              {slide.footer}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
