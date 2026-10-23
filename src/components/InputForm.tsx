import type { WrapData } from '../types'
import { WRAP_YEAR, NEXT_YEAR } from '../types'
import ThemePicker from './ThemePicker'

type Field = {
  key: keyof WrapData
  label: string
  placeholder: string
  numeric?: boolean
  maxLength?: number
}

type Section = { title: string; hint?: string; fields: Field[] }

const SECTIONS: Section[] = [
  {
    title: '시작하기',
    fields: [{ key: 'name', label: '닉네임', placeholder: '표지에 들어갈 이름 (예: 지우)', maxLength: 16 }],
  },
  {
    title: '올해의 나',
    fields: [
      { key: 'word', label: '올해를 한 단어로', placeholder: '예: 단단해짐', maxLength: 20 },
      { key: 'selfWord', label: '올해의 나는, 한마디로', placeholder: '예: 그래도 계속 걷는 사람', maxLength: 40 },
    ],
  },
  {
    title: '올해의 컬렉션',
    fields: [
      { key: 'song', label: '올해의 노래', placeholder: '제목 - 아티스트', maxLength: 50 },
      { key: 'movie', label: '올해의 영화·드라마', placeholder: '예: 너의 이름은', maxLength: 50 },
      { key: 'book', label: '올해의 책', placeholder: '예: 불안의 서', maxLength: 50 },
    ],
  },
  {
    title: `숫자로 보는 ${WRAP_YEAR}`,
    hint: '숫자만 입력',
    fields: [
      { key: 'booksRead', label: '읽은 책 (권)', placeholder: '0', numeric: true, maxLength: 5 },
      { key: 'watched', label: '본 영화·드라마 (편)', placeholder: '0', numeric: true, maxLength: 5 },
      { key: 'trips', label: '떠난 여행 (번)', placeholder: '0', numeric: true, maxLength: 4 },
    ],
  },
  {
    title: '올해의 하이라이트',
    fields: [
      { key: 'bestPlace', label: '가장 좋았던 여행지', placeholder: '예: 제주 월정리 바다', maxLength: 40 },
      { key: 'mostDid', label: '올해 제일 많이 한 것', placeholder: '예: 퇴근하고 러닝 🏃', maxLength: 40 },
      { key: 'learned', label: '새로 배운 것 · 도전', placeholder: '예: 손글씨 캘리그래피', maxLength: 40 },
      { key: 'moment', label: '잊지 못할 순간 (한 줄)', placeholder: '예: 첫 10km 완주하고 바다 앞에서 울었던 날 🌊', maxLength: 80 },
    ],
  },
  {
    title: `${NEXT_YEAR}, 내년의 나에게`,
    fields: [{ key: 'goal', label: '내년 나의 목표·다짐', placeholder: '예: 매일 아침 30분, 나를 위한 시간', maxLength: 60 }],
  },
]

export default function InputForm({
  data,
  onChange,
  themeId,
  onThemeChange,
  onGenerate,
  onFillSample,
  onReset,
  filled,
}: {
  data: WrapData
  onChange: (next: WrapData) => void
  themeId: string
  onThemeChange: (id: string) => void
  onGenerate: () => void
  onFillSample: () => void
  onReset: () => void
  filled: number
}) {
  const set = (key: keyof WrapData, raw: string, field: Field) => {
    let value = raw
    if (field.numeric) value = raw.replace(/[^\d]/g, '')
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-40 pt-10 sm:pt-14">
      {/* hero */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400" />
          {WRAP_YEAR} WRAPPED
        </div>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            나의 한 해
          </span>
          <br />
          결산 카드 만들기
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55 sm:text-base">
          올해의 나를 입력하면 Wrapped 스타일 스토리 카드로 만들어 드려요.
          <br className="hidden sm:block" />
          채우고 싶은 것만 적으면 돼요. 빈 칸은 자동으로 빠집니다.
        </p>
      </header>

      {/* theme */}
      <section className="mb-7 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/80">테마 고르기</h2>
          <span className="text-xs text-white/40">카드 전체에 바로 반영돼요</span>
        </div>
        <ThemePicker value={themeId} onChange={onThemeChange} />
      </section>

      {/* fields */}
      <div className="flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-sm font-semibold text-white/80">{section.title}</h2>
              {section.hint && <span className="text-xs text-white/35">{section.hint}</span>}
            </div>
            <div className="flex flex-col gap-3">
              {section.fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/50">{field.label}</span>
                  <input
                    value={data[field.key]}
                    onChange={(e) => set(field.key, e.target.value, field)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    inputMode={field.numeric ? 'numeric' : 'text'}
                    enterKeyHint="next"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/30 outline-none transition focus:border-fuchsia-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-fuchsia-400/25"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* helper row */}
      <div className="mt-7 flex items-center justify-between text-xs text-white/40">
        <button type="button" onClick={onFillSample} className="rounded-full px-3 py-1.5 font-medium text-white/60 transition hover:bg-white/5 hover:text-white">
          ✦ 샘플로 채워보기
        </button>
        {filled > 0 && (
          <button type="button" onClick={onReset} className="rounded-full px-3 py-1.5 font-medium text-white/45 transition hover:bg-white/5 hover:text-white">
            전체 지우기
          </button>
        )}
      </div>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#05060a]/85 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="hidden text-xs text-white/45 sm:block">
            {filled > 0 ? `${filled}개 채움` : '한 개만 채워도 충분해요'}
          </div>
          <button
            type="button"
            onClick={onGenerate}
            className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 px-6 py-3.5 text-center text-base font-semibold text-white shadow-[0_8px_30px_-6px_rgba(236,72,153,0.6)] transition hover:brightness-110 active:scale-[0.99]"
          >
            카드 만들기 →
          </button>
        </div>
      </div>
    </div>
  )
}
