import { THEMES } from '../themes'

export default function ThemePicker({
  value,
  onChange,
  compact = false,
}: {
  value: string
  onChange: (id: string) => void
  compact?: boolean
}) {
  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'grid grid-cols-5 gap-2 sm:gap-3'}>
      {THEMES.map((t) => {
        const active = t.id === value
        const grad = `linear-gradient(140deg, ${t.stops.join(', ')})`
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            title={t.name}
            aria-label={t.name}
            aria-pressed={active}
            className={`group relative flex flex-col items-center gap-1.5 rounded-2xl p-1.5 transition ${
              active ? 'ring-2 ring-white/90' : 'ring-1 ring-white/10 hover:ring-white/40'
            }`}
          >
            <span
              className="block h-10 w-full rounded-xl shadow-lg transition group-active:scale-95 sm:h-12"
              style={{ background: grad }}
            />
            {!compact && (
              <span className={`text-[10px] leading-tight sm:text-[11px] ${active ? 'text-white' : 'text-white/55'}`}>
                {t.name}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
