// Repairs broken source_url values. The earlier seeds used ESMA landing-page
// URLs that now 404. Point each firm to the direct CSV it came from (always
// resolves, contains the literal row) and the searchable register for majors.
// Run: SEED_SUPABASE_SECRET=<secret> node scripts/fix-source-urls.mjs
import { createClient } from '@supabase/supabase-js'

const SECRET = process.env.SEED_SUPABASE_SECRET
if (!SECRET) { console.error('Set SEED_SUPABASE_SECRET'); process.exit(1) }
const sb = createClient('https://vaibkrkcdorivvtsnayc.supabase.co', SECRET, { auth: { persistSession: false } })

const CASPS = 'https://www.esma.europa.eu/sites/default/files/2024-12/CASPS.csv'
const EMTWP = 'https://www.esma.europa.eu/sites/default/files/2024-12/EMTWP.csv'
const NCASP = 'https://www.esma.europa.eu/sites/default/files/2024-12/NCASP.csv'
const SEARCH = 'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica'

const BROKEN = [
  'https://www.esma.europa.eu/publications-and-data/interim-mica-register',
  'https://www.esma.europa.eu/publications-and-data/registers-and-data',
]

async function main() {
  // Pull firms with their status + category to decide the right source.
  const { data: firms } = await sb
    .from('firms')
    .select('id, category, firm_statuses(id, status, source_url, source_type, notes)')

  let updated = 0
  for (const f of firms ?? []) {
    const s = f.firm_statuses?.[0]
    if (!s || !BROKEN.includes(s.source_url)) continue

    let url, type
    if (s.status === 'authorized') {
      url = f.category === 'stablecoin_issuer' ? EMTWP : CASPS
      type = 'esma_csv'
    } else if (s.source_type === 'nca_register') {
      url = NCASP // non-compliant entities list
      type = 'nca_register'
    } else {
      // not-authorized majors: link to the searchable register to verify absence
      url = SEARCH
      type = 'esma_csv'
    }

    const { error } = await sb
      .from('firm_statuses')
      .update({ source_url: url, source_type: type })
      .eq('id', s.id)
    if (!error) updated++
  }

  // Fix history + changelog rows pointing at the broken URLs too.
  for (const t of ['status_history', 'changelog_entries']) {
    await sb.from(t).update({ source_url: SEARCH }).eq('source_url', BROKEN[0])
    await sb.from(t).update({ source_url: NCASP }).eq('source_url', BROKEN[1])
  }

  console.log(`Updated ${updated} firm_statuses source URLs.`)

  // Report remaining broken refs.
  for (const b of BROKEN) {
    const { count } = await sb.from('firm_statuses').select('*', { count: 'exact', head: true }).eq('source_url', b)
    console.log(`Remaining firm_statuses with ${b.slice(-30)}: ${count}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
