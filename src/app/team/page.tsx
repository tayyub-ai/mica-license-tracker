import type { Metadata } from 'next'
import { TeamProfileCard } from '@/components/team/TeamProfileCard'
import { TEAM_MEMBERS } from '@/lib/constants/team'

export const metadata: Metadata = {
  title: 'Team',
  description: 'Meet the specialists who research, build, and maintain MiCA License Tracker.',
}

export default function TeamPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <header className="max-w-3xl mb-12 md:mb-16">
        <p className="eyebrow text-gold mb-2">The people behind the data</p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink">Built by specialists</h1>
        <p className="mt-5 text-lg text-ink-soft leading-relaxed">
          MiCA Tracker brings together product implementation and digital-asset expertise to make European licensing
          data easier to verify, understand, and use.
        </p>
      </header>

      <section aria-labelledby="team-profiles" className="section-rule pt-5">
        <h2 id="team-profiles" className="sr-only">Team profiles</h2>
        <div className="grid grid-cols-1 gap-5">
          {TEAM_MEMBERS.map((member) => (
            <TeamProfileCard key={member.name} member={member} variant="full" />
          ))}
        </div>
      </section>

      <section className="mt-12 md:mt-16 card-paper rounded-xl p-7 md:p-9">
        <p className="eyebrow text-gold mb-3">Independently maintained</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Evidence comes before opinion</h2>
        <p className="mt-4 text-ink-soft leading-relaxed max-w-3xl">
          The team maintains MiCA Tracker as an independent information resource. Every published status is sourced and
          dated, and the tracker is not affiliated with ESMA, a national authority, or any listed firm.
        </p>
      </section>
    </div>
  )
}
