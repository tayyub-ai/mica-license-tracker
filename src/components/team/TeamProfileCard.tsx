import type { TeamMember } from '@/lib/constants/team'

export function TeamProfileCard({
  member,
  variant = 'compact',
}: {
  member: TeamMember
  variant?: 'compact' | 'full'
}) {
  const isFull = variant === 'full'

  return (
    <article className={`card-paper lift rounded-xl ${isFull ? 'p-7 md:p-9' : 'p-6 md:p-7'}`}>
      <div className={`flex ${isFull ? 'flex-col sm:flex-row sm:items-start' : 'items-start'} gap-5`}>
        <div
          aria-hidden="true"
          className={`shrink-0 rounded-full border border-gold/40 bg-gold/10 text-gold flex items-center justify-center font-display font-semibold tracking-tight ${
            isFull ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg'
          }`}
        >
          {member.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="eyebrow text-gold mb-1.5">{member.role}</p>
          <h3 className={`font-display font-semibold text-ink ${isFull ? 'text-3xl' : 'text-2xl'}`}>{member.name}</h3>
          <p className={`text-ink-soft leading-relaxed ${isFull ? 'mt-4' : 'mt-3 text-sm'}`}>
            {isFull ? member.biography : member.summary}
          </p>

          {isFull && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${member.name}'s areas of focus`}>
              {member.focus.map((area) => (
                <li key={area} className="pill-gold rounded-full px-3 py-1.5 text-[11px] uppercase tracking-widest">
                  {area}
                </li>
              ))}
            </ul>
          )}

          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-deep transition-colors"
          >
            View {member.name} on LinkedIn
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  )
}
