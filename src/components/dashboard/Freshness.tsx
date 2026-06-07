const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

interface Props {
  registerLastChecked: string | null
  latestChange: string | null
}

export function Freshness({ registerLastChecked, latestChange }: Props) {
  if (!registerLastChecked && !latestChange) return null

  return (
    <div className="flex flex-wrap items-baseline justify-end gap-x-6 gap-y-1 text-ink-faint">
      {registerLastChecked && (
        <span className="eyebrow normal-case tracking-normal">
          ESMA register last checked · <span className="cd-cell">{fmt(registerLastChecked)}</span>
        </span>
      )}
      {latestChange && (
        <span className="eyebrow normal-case tracking-normal">
          Most recent change · <span className="cd-cell">{fmt(latestChange)}</span>
        </span>
      )}
    </div>
  )
}
