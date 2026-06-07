// Verifies data-level acceptance criteria against the live DB.
import { createClient } from '@supabase/supabase-js'

const sb = createClient('https://vaibkrkcdorivvtsnayc.supabase.co', process.env.SEED_SUPABASE_SECRET, { auth: { persistSession: false } })
const out = []
const check = (id, name, cond, detail = '') => { out.push(cond); console.log(`${cond ? '✓' : '✗'} ${id} ${name}${detail ? ' — ' + detail : ''}`) }

// AC-1.3 per-state transitional dates
const { data: states } = await sb.from('member_states').select('code, transitional_months, transitional_end_date, application_deadline')
const byCode = Object.fromEntries(states.map((s) => [s.code, s]))
check('AC-1.3a', 'NL = 6 months', byCode.NL?.transitional_months === 6)
check('AC-1.3b', 'DE = 12 months', byCode.DE?.transitional_months === 12)
check('AC-1.3c', 'FR = 18 months', byCode.FR?.transitional_months === 18)
check('AC-1.4', 'Poland = 18 months (veto exception)', byCode.PL?.transitional_months === 18)
check('AC-1.5', 'Italy operating end = 2026-06-30', byCode.IT?.transitional_end_date === '2026-06-30')
check('AC-1.6', 'Denmark no transitional period', byCode.DK?.transitional_months === null && byCode.DK?.application_deadline === '2024-12-30')

// AC-2.3 source_url NOT NULL on every status row
const { data: statuses } = await sb.from('firm_statuses').select('source_url, last_verified, confidence, source_type')
const nullSource = statuses.filter((s) => !s.source_url).length
check('AC-2.3', 'Every status has source_url', nullSource === 0, `${statuses.length} rows, ${nullSource} null`)
check('AC-2.4', 'Every status has last_verified', statuses.every((s) => s.last_verified))
check('AC-2.5', 'Every status has valid confidence', statuses.every((s) => ['high', 'medium', 'reported'].includes(s.confidence)))

// AC-3.1 ≥150 firms
const { count: firmCount } = await sb.from('firms').select('*', { count: 'exact', head: true })
check('AC-3.1', '≥150 named firms', firmCount >= 150, `${firmCount} firms`)

// AC-3.3 ≥10 member states represented
const { data: firms } = await sb.from('firms').select('home_state_code, trading_name, category')
const repStates = new Set(firms.map((f) => f.home_state_code).filter(Boolean))
check('AC-3.3', '≥10 member states represented', repStates.size >= 10, `${repStates.size} states`)

// AC-3.5 major names present
const names = firms.map((f) => f.trading_name.toLowerCase())
const majors = ['coinbase', 'kraken', 'okx', 'crypto.com', 'bitstamp', 'bitpanda', 'binance', 'bitget']
const missing = majors.filter((m) => !names.some((n) => n.includes(m)))
check('AC-3.5', 'Major names present', missing.length === 0, missing.length ? 'missing: ' + missing.join(',') : 'all present')

// AC-4.1 authorized only via ESMA/NCA source types
const { data: authd } = await sb.from('firm_statuses').select('source_type').eq('status', 'authorized')
const badAuth = authd.filter((s) => !['esma_csv', 'nca_register'].includes(s.source_type)).length
check('AC-4.1', 'Authorized backed by ESMA/NCA only', badAuth === 0, `${authd.length} authorized, ${badAuth} bad`)

// AC-5.1 numerator from ESMA
const { count: esmaAuth } = await sb.from('firm_statuses').select('*', { count: 'exact', head: true }).eq('status', 'authorized').eq('source_type', 'esma_csv')
check('AC-5.1', 'Authorized count register-derived', esmaAuth > 200, `${esmaAuth} ESMA-sourced authorized`)

// AC-8.1 changelog populated
const { count: clCount } = await sb.from('changelog_entries').select('*', { count: 'exact', head: true })
check('AC-8.1', 'Changelog populated', clCount > 0, `${clCount} entries`)

// AC-12.4 history append-only present
const { count: histCount } = await sb.from('status_history').select('*', { count: 'exact', head: true })
check('AC-12.4', 'Status history recorded', histCount > 0, `${histCount} rows`)

const passed = out.filter(Boolean).length
console.log(`\n${passed}/${out.length} acceptance checks passed`)
process.exit(passed === out.length ? 0 : 1)
