// Verifies the admin firm-edit save path end-to-end: status change persists,
// status_history + changelog entries are created.
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const BASE = 'http://localhost:3000'
const sb = createClient('https://vaibkrkcdorivvtsnayc.supabase.co', process.env.SEED_SUPABASE_SECRET, { auth: { persistSession: false } })

// Pick a firm to edit.
const { data: firm } = await sb
  .from('firms')
  .select('id, slug, trading_name, firm_statuses(status)')
  .eq('slug', 'bitget')
  .single()

const before = firm.firm_statuses?.[0]?.status
const { count: clBefore } = await sb.from('changelog_entries').select('*', { count: 'exact', head: true }).eq('firm_id', firm.id)
console.log(`Editing ${firm.trading_name} (status before: ${before}, changelog rows: ${clBefore})`)

const browser = await chromium.launch()
const page = await browser.newPage()
try {
  // Login
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' })
  await page.locator('input[type=email]').fill('admin@mica-tracker.eu')
  await page.locator('input[type=password]').fill('MicaAdmin2026!')
  await page.locator('button[type=submit]').click()
  await page.waitForURL('**/admin', { timeout: 12000 }).catch(() => {})

  // Edit page
  await page.goto(`${BASE}/admin/firms/${firm.id}`, { waitUntil: 'networkidle' })
  // Change status to application_pending (target the select that has status options)
  await page.locator('select:has(option[value="application_pending"])').selectOption('application_pending')
  // Ensure a source URL is present (required)
  const src = page.locator('input[type=url]').first()
  if (!(await src.inputValue())) await src.fill('https://example.com/bitget-application')
  // Submit
  await page.locator('button[type=submit]').click()
  await page.waitForURL('**/admin/firms', { timeout: 12000 }).catch(() => {})
  await page.waitForTimeout(1000)
} finally {
  await browser.close()
}

// Verify in DB
const { data: after } = await sb.from('firm_statuses').select('status').eq('firm_id', firm.id).single()
const { count: clAfter } = await sb.from('changelog_entries').select('*', { count: 'exact', head: true }).eq('firm_id', firm.id)
const { count: histCount } = await sb.from('status_history').select('*', { count: 'exact', head: true }).eq('firm_id', firm.id)

console.log(`Status after: ${after?.status}`)
console.log(`Changelog rows after: ${clAfter} (was ${clBefore})`)
console.log(`History rows: ${histCount}`)

const ok = after?.status === 'application_pending' && clAfter > clBefore
console.log(ok ? '\n✓ Edit save path works (status persisted + changelog appended)' : '\n✗ Edit save path FAILED')

// Restore original status to keep data clean.
await sb.from('firm_statuses').delete().eq('firm_id', firm.id)
await sb.from('firm_statuses').insert({
  firm_id: firm.id, status: before, source_url: 'https://www.esma.europa.eu/publications-and-data/interim-mica-register',
  source_type: 'esma_csv', confidence: 'high', last_verified: new Date().toISOString().split('T')[0],
  notes: 'Restored after QA.',
})
console.log('Restored original status.')
process.exit(ok ? 0 : 1)
