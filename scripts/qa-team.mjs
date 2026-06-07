import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

const [teamData, teamCard, teamPage, homePage, footer, sitemap] = await Promise.all([
  read('src/lib/constants/team.ts'),
  read('src/components/team/TeamProfileCard.tsx'),
  read('src/app/team/page.tsx'),
  read('src/app/page.tsx'),
  read('src/components/layout/Footer.tsx'),
  read('src/app/sitemap.ts'),
])

const requiredProfileContent = [
  'Tayyub Yaqoob',
  'AI Implementation Expert',
  'https://www.linkedin.com/in/tayyubyaqoob/',
  'Guneet Kaur',
  'Fintech & Blockchain Expert',
  'https://www.linkedin.com/in/connectwithguneet-kaur/',
]

for (const value of requiredProfileContent) {
  assert.ok(teamData.includes(value), `Missing shared team content: ${value}`)
}

assert.ok(teamCard.includes('TeamProfileCard'), 'Missing reusable TeamProfileCard')
assert.ok(teamCard.includes('View {member.name} on LinkedIn'), 'LinkedIn links need descriptive labels')
assert.ok(teamPage.includes("title: 'Team'"), 'Team page needs static metadata')
assert.ok(teamPage.includes('Independently maintained'), 'Team page needs an independence statement')
assert.ok(homePage.includes('Built by specialists'), 'Homepage needs the team section')
assert.ok(homePage.includes('href="/team"'), 'Homepage needs a team page link')
assert.ok(footer.includes("['Team', '/team']"), 'Footer needs a Team link')
assert.ok(sitemap.includes('`${SITE_URL}/team`'), 'Sitemap needs the team route')

console.log('Team feature QA passed')
