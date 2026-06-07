export type TeamMember = {
  initials: string
  name: string
  role: string
  summary: string
  biography: string
  focus: string[]
  linkedinUrl: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    initials: 'TY',
    name: 'Tayyub Yaqoob',
    role: 'AI Implementation Expert',
    summary: 'Builds the data systems, automation, and product experience behind MiCA Tracker.',
    biography:
      'Tayyub turns complex research and regulatory workflows into dependable digital products. His work on MiCA Tracker spans data architecture, automation, quality assurance, and the public-facing experience.',
    focus: ['Data systems', 'AI implementation', 'Product engineering'],
    linkedinUrl: 'https://www.linkedin.com/in/tayyubyaqoob/',
  },
  {
    initials: 'GK',
    name: 'Guneet Kaur',
    role: 'Fintech & Blockchain Expert',
    summary: 'Brings digital-asset research, regulatory context, and editorial rigour to the tracker.',
    biography:
      'Guneet is a fintech and blockchain specialist with experience translating technical and regulatory developments into clear, useful analysis. She contributes subject-matter research, context, and editorial quality.',
    focus: ['Digital assets', 'Regulatory research', 'Editorial quality'],
    linkedinUrl: 'https://www.linkedin.com/in/connectwithguneet-kaur/',
  },
]
