import { getDashboardStats } from '@/lib/queries/firms'

export const revalidate = 3600

export async function GET(req: Request) {
  const stats = await getDashboardStats()
  const base = new URL(req.url).origin
  const authorized = stats.authorized
  const total = stats.total

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>MiCA Tracker Widget</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; background:#09090b; color:#fff; padding:20px; }
  .card { border:1px solid #27272a; border-radius:14px; padding:20px; background:linear-gradient(180deg,#18181b,#09090b); }
  .label { font-size:11px; text-transform:uppercase; letter-spacing:.15em; color:#a1a1aa; }
  .count { font-size:34px; font-weight:800; font-variant-numeric:tabular-nums; margin:6px 0; }
  .count .total { color:#52525b; font-size:20px; }
  .green { color:#34d399; }
  .cd { display:flex; gap:14px; margin-top:14px; padding-top:14px; border-top:1px solid #27272a; }
  .unit { text-align:center; }
  .unit b { font-size:22px; font-variant-numeric:tabular-nums; display:block; }
  .unit span { font-size:9px; text-transform:uppercase; letter-spacing:.1em; color:#71717a; }
  a.foot { display:block; margin-top:14px; font-size:11px; color:#a1a1aa; text-decoration:none; }
  a.foot:hover { color:#fff; }
</style>
</head>
<body>
  <div class="card">
    <div class="label">EU MiCA Authorizations</div>
    <div class="count"><span class="green">${authorized}</span> <span class="total">/ ${total} tracked firms</span></div>
    <div class="cd" id="cd">
      <div class="unit"><b id="d">--</b><span>days</span></div>
      <div class="unit"><b id="h">--</b><span>hrs</span></div>
      <div class="unit"><b id="m">--</b><span>min</span></div>
      <div class="unit"><b id="s">--</b><span>sec</span></div>
    </div>
    <a class="foot" href="${base}" target="_blank" rel="noopener">Deadline 1 Jul 2026 · MiCA License Tracker →</a>
  </div>
<script>
  var target = new Date('2026-07-01T00:00:00Z').getTime();
  function tick(){
    var diff = target - Date.now();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff/864e5), h = Math.floor(diff/36e5)%24, m = Math.floor(diff/6e4)%60, s = Math.floor(diff/1e3)%60;
    document.getElementById('d').textContent = d;
    document.getElementById('h').textContent = ('0'+h).slice(-2);
    document.getElementById('m').textContent = ('0'+m).slice(-2);
    document.getElementById('s').textContent = ('0'+s).slice(-2);
  }
  tick(); setInterval(tick, 1000);
</script>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': 'frame-ancestors *',
    },
  })
}
