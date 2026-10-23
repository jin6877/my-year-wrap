import { useEffect, useRef, useState } from 'react'
import type { SlideContent } from '../types'
import type { Theme } from '../themes'
import Slide from './Slide'
import ThemePicker from './ThemePicker'
import { exportSlideBlob, type ExportFormat } from '../canvas'

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export default function StoryViewer({
  slides,
  theme,
  themeId,
  onThemeChange,
  onBack,
}: {
  slides: SlideContent[]
  theme: Theme
  themeId: string
  onThemeChange: (id: string) => void
  onBack: () => void
}) {
  const [index, setIndex] = useState(0)
  const [format, setFormat] = useState<ExportFormat>('story')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const clamped = Math.min(index, slides.length - 1)
  const slide = slides[clamped]

  const go = (dir: number) => {
    setIndex((i) => Math.max(0, Math.min(slides.length - 1, i + dir)))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length])

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  const handleShare = async () => {
    if (busy) return
    setBusy(true)
    try {
      const blob = await exportSlideBlob(slide, theme, format)
      const file = new File([blob], `my-year-wrap-${slide.id}.png`, { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean }
      if (nav.canShare && nav.canShare({ files: [file] }) && typeof navigator.share === 'function') {
        await navigator.share({ files: [file], title: 'My Year Wrap', text: '나의 2026 결산 카드 ✨' })
        showToast('공유했어요 ✨')
      } else {
        downloadBlob(blob, file.name)
        showToast('이미지를 저장했어요 📥')
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        try {
          const blob = await exportSlideBlob(slide, theme, format)
          downloadBlob(blob, `my-year-wrap-${slide.id}.png`)
          showToast('이미지를 저장했어요 📥')
        } catch {
          showToast('저장에 실패했어요. 다시 시도해 주세요')
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3 px-4 pt-[max(14px,env(safe-area-inset-top))] pb-2">
        <button
          onClick={onBack}
          className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          ← 다시 입력
        </button>
        <div className="shrink">
          <ThemePicker value={themeId} onChange={onThemeChange} compact />
        </div>
      </div>

      {/* stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
        {/* desktop arrows */}
        <button
          onClick={() => go(-1)}
          disabled={clamped === 0}
          aria-label="이전"
          className="absolute left-2 z-20 hidden h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white/80 transition hover:bg-white/10 disabled:opacity-25 sm:flex"
        >
          ‹
        </button>
        <button
          onClick={() => go(1)}
          disabled={clamped === slides.length - 1}
          aria-label="다음"
          className="absolute right-2 z-20 hidden h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white/80 transition hover:bg-white/10 disabled:opacity-25 sm:flex"
        >
          ›
        </button>

        {/* card */}
        <div
          className="relative overflow-hidden rounded-[7%] shadow-2xl ring-1 ring-white/10"
          style={{ width: 'min(92vw, 43vh)', aspectRatio: '9 / 16' }}
          onTouchStart={(e) => {
            touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
          }}
          onTouchEnd={(e) => {
            const s = touchStart.current
            if (!s) return
            const dx = e.changedTouches[0].clientX - s.x
            const dy = e.changedTouches[0].clientY - s.y
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
            touchStart.current = null
          }}
        >
          {/* progress segments */}
          <div className="absolute inset-x-0 top-0 z-40 flex gap-1 p-2.5">
            {slides.map((s, i) => (
              <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: i < clamped ? '100%' : i === clamped ? '100%' : '0%', opacity: i <= clamped ? 1 : 0 }}
                />
              </div>
            ))}
          </div>

          {/* tap zones */}
          <button
            aria-label="이전"
            onClick={() => go(-1)}
            className="absolute inset-y-0 left-0 z-30 w-[32%] cursor-default focus:outline-none"
          />
          <button
            aria-label="다음"
            onClick={() => go(1)}
            className="absolute inset-y-0 right-0 z-30 w-[68%] cursor-default focus:outline-none"
          />

          <Slide slide={slide} theme={theme} animKey={clamped} />
        </div>
      </div>

      {/* bottom controls */}
      <div className="px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs text-white/50">
            <span>
              {clamped + 1} / {slides.length}
            </span>
          </div>

          {/* format toggle */}
          <div className="mb-3 flex items-center justify-center">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs font-medium">
              <button
                onClick={() => setFormat('story')}
                className={`rounded-full px-4 py-1.5 transition ${format === 'story' ? 'bg-white text-black' : 'text-white/60'}`}
              >
                스토리 9:16
              </button>
              <button
                onClick={() => setFormat('square')}
                className={`rounded-full px-4 py-1.5 transition ${format === 'square' ? 'bg-white text-black' : 'text-white/60'}`}
              >
                정사각 1:1
              </button>
            </div>
          </div>

          <button
            onClick={handleShare}
            disabled={busy}
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_8px_30px_-6px_rgba(236,72,153,0.6)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? '이미지 만드는 중…' : '이 카드 저장 · 공유하기'}
          </button>
          <p className="mt-2 text-center text-[11px] text-white/35">
            지금 보고 있는 슬라이드를 {format === 'story' ? '1080×1920' : '1080×1080'} 이미지로 저장해요
          </p>
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center">
          <div className="anim-float rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-xl">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
