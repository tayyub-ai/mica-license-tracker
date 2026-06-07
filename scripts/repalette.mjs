import fs from 'fs'

const files = [
  'src/app/admin/(protected)/page.tsx',
  'src/app/admin/(protected)/firms/page.tsx',
  'src/app/admin/(protected)/firms/new/page.tsx',
  'src/app/admin/(protected)/firms/[id]/page.tsx',
  'src/app/admin/(protected)/esma-review/page.tsx',
  'src/components/admin/FirmForm.tsx',
  'src/components/admin/ReviewActions.tsx',
  'src/components/admin/LogoutButton.tsx',
]

// Order matters: most-specific first.
const map = [
  [/bg-zinc-950/g, 'bg-paper'],
  [/bg-zinc-900\/50/g, 'bg-paper-2'],
  [/bg-zinc-900\/30/g, 'bg-paper-2'],
  [/bg-zinc-900/g, 'bg-paper-2'],
  [/bg-zinc-800\/50/g, 'bg-paper-3'],
  [/bg-zinc-800\/30/g, 'bg-paper-3'],
  [/bg-zinc-800\/20/g, 'bg-paper-3'],
  [/bg-zinc-800/g, 'bg-paper-3'],
  [/bg-zinc-700/g, 'bg-paper-3'],
  [/bg-zinc-100/g, 'bg-oxblood'], // hover state on dark buttons → oxblood
  [/hover:bg-zinc-800\/50/g, 'hover:bg-paper-3'],
  [/hover:bg-zinc-800/g, 'hover:bg-paper-3'],
  [/hover:bg-zinc-700/g, 'hover:bg-paper-3'],
  [/hover:bg-zinc-100/g, 'hover:bg-oxblood'],
  [/text-white/g, 'text-ink'],
  [/text-zinc-300/g, 'text-ink'],
  [/text-zinc-400/g, 'text-ink-soft'],
  [/text-zinc-500/g, 'text-ink-faint'],
  [/text-zinc-600/g, 'text-ink-faint'],
  [/text-black/g, 'text-paper'],
  [/border-zinc-800\/50/g, 'border-rule'],
  [/border-zinc-800/g, 'border-rule'],
  [/border-zinc-700/g, 'border-rule'],
  [/border-zinc-500/g, 'border-oxblood'],
  [/placeholder-zinc-500/g, 'placeholder-ink-faint'],
  [/bg-white/g, 'bg-ink'],
  [/focus:border-zinc-500/g, 'focus:border-oxblood'],
  // status accent colors → palette
  [/text-emerald-400/g, 'text-forest'],
  [/bg-emerald-500\/20/g, 'bg-forest/15'],
  [/bg-emerald-500\/30/g, 'bg-forest/20'],
  [/hover:bg-emerald-500\/30/g, 'hover:bg-forest/25'],
  [/border-emerald-500\/30/g, 'border-forest/40'],
  [/text-amber-400/g, 'text-ochre'],
  [/text-amber-500\/70/g, 'text-ochre'],
  [/text-amber-500/g, 'text-ochre'],
  [/bg-amber-500\/20/g, 'bg-ochre/15'],
  [/bg-amber-500\/15/g, 'bg-ochre/12'],
  [/bg-amber-500\/10/g, 'bg-ochre/10'],
  [/hover:bg-amber-500\/15/g, 'hover:bg-ochre/15'],
  [/border-amber-500\/30/g, 'border-ochre/40'],
  [/text-red-400/g, 'text-oxblood'],
]

let total = 0
for (const f of files) {
  if (!fs.existsSync(f)) { console.log('skip (missing):', f); continue }
  let s = fs.readFileSync(f, 'utf8')
  const before = s
  for (const [re, rep] of map) s = s.replace(re, rep)
  if (s !== before) { fs.writeFileSync(f, s); total++; console.log('updated:', f) }
  else console.log('unchanged:', f)
}
console.log(`\n${total} files updated`)
