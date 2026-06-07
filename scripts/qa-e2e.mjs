// End-to-end QA: drives a real browser through public + admin flows.
import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@mica-tracker.eu'
const ADMIN_PASS = 'MicaAdmin2026!'

const results = []
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail })
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

try {
  // --- Homepage ---
  await page.goto(BASE, { waitUntil: 'networkidle' })
  check('Homepage loads', await page.title() !== '')
  check('Countdown renders', await page.locator('text=Time remaining').count() > 0)
  check('At-risk banner renders', await page.locator('text=At Risk').count() > 0)
  check('EU map renders (tiles)', await page.locator('button:has-text("DE")').count() > 0)
  check('Email capture present', await page.locator('input[type=email]').count() > 0)

  // --- Map click → registry filter ---
  await page.locator('button:has-text("DE")').first().click()
  await page.waitForURL('**/firms?state=DE', { timeout: 10000 }).catch(() => {})
  check('Map click navigates to filtered registry', page.url().includes('state=DE'), page.url())

  // --- Registry ---
  await page.goto(`${BASE}/firms`, { waitUntil: 'networkidle' })
  const rowCount = await page.locator('table tbody tr').count()
  check('Registry table populated', rowCount > 100, `${rowCount} rows`)
  // search filter
  await page.locator('input[type=search]').fill('Coinbase')
  await page.waitForTimeout(400)
  const filtered = await page.locator('table tbody tr').count()
  check('Registry search filters', filtered > 0 && filtered < rowCount, `${filtered} after search`)

  // --- Firm detail (navigate directly to a known slug) ---
  await page.goto(`${BASE}/firms/coinbase-9845`, { waitUntil: 'networkidle' })
  check('Firm detail loads', /\/firms\/coinbase-9845$/.test(page.url()), page.url())
  check('Firm detail shows source', await page.locator('text=Source').count() > 0)
  check('Firm detail shows status history', await page.locator('text=Status History').count() > 0)

  // --- Methodology + changelog ---
  await page.goto(`${BASE}/methodology`, { waitUntil: 'networkidle' })
  check('Methodology dispute channel present', await page.locator('text=corrections@mica-tracker.eu').count() > 0)
  await page.goto(`${BASE}/changelog`, { waitUntil: 'networkidle' })
  check('Changelog populated', await page.locator('text=recorded as').count() > 0)

  // --- Admin login protection ---
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  check('Admin redirects to login when unauthenticated', page.url().includes('/admin/login'))

  // --- Admin login ---
  await page.locator('input[type=email]').fill(ADMIN_EMAIL)
  await page.locator('input[type=password]').fill(ADMIN_PASS)
  await page.locator('button[type=submit]').click()
  await page.waitForURL('**/admin', { timeout: 12000 }).catch(() => {})
  await page.waitForLoadState('networkidle')
  check('Admin login succeeds → dashboard', /\/admin$/.test(page.url()), page.url())
  check('Admin dashboard shows stats', await page.locator('text=Dashboard').count() > 0)

  // --- Admin firms list ---
  await page.goto(`${BASE}/admin/firms`, { waitUntil: 'networkidle' })
  check('Admin firm registry loads', await page.locator('table tbody tr').count() > 100)

  // --- Admin add-firm form: required-field enforcement ---
  await page.goto(`${BASE}/admin/firms/new`, { waitUntil: 'networkidle' })
  check('Add-firm form present', await page.locator('text=Source URL').count() > 0)
  // The source_url input is required → browser blocks submit. Confirm attribute.
  const sourceRequired = await page.locator('input[type=url][required]').count()
  check('Source URL is required field', sourceRequired > 0)

  // --- ESMA review queue ---
  await page.goto(`${BASE}/admin/esma-review`, { waitUntil: 'networkidle' })
  check('ESMA review queue loads', await page.locator('text=ESMA Review Queue').count() > 0)

  check('No uncaught page errors', errors.length === 0, errors.join('; ').slice(0, 200))
} catch (e) {
  check('E2E run completed without throwing', false, e.message)
} finally {
  await browser.close()
}

const passed = results.filter((r) => r.pass).length
console.log(`\n${passed}/${results.length} checks passed`)
process.exit(passed === results.length ? 0 : 1)
