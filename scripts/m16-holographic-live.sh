#!/usr/bin/env bash
set -euo pipefail
ROOT=/opt/eons-tax-platform/source/docs
HTML="$ROOT/index.html"
DOMAIN=eons-tax.142-93-114-74.sslip.io
test -s "$HTML"
test -s "$ROOT/assets/eons-brand-logo.webp"
test -s "$ROOT/assets/eons-brand-hero.webp"
test -s "$ROOT/assets/eons-brand-icon.webp"
BACKUP="/opt/eons-tax-platform/backup-M16-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp -a "$ROOT" "$BACKUP/docs"
cat > "$ROOT/assets/eons-m16.css" <<'CSS'
:root{--m16-ice:#9defff;--m16-violet:#b69dff;--m16-copper:#e6b996}
html{scroll-behavior:smooth}
body{background:radial-gradient(ellipse at 50% 0%,#24395c 0%,#101727 40%,#070b15 100%);background-attachment:fixed}
body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background:linear-gradient(transparent 97%,#86dfff0d 98%),linear-gradient(90deg,transparent 97%,#86dfff0b 98%);background-size:52px 52px;mask-image:linear-gradient(#0006,transparent 85%)}
.eons-m16-nav,.eons-m16-hero,.eons-m16-shortcuts{position:relative;z-index:1;box-sizing:border-box}
.eons-m16-nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px clamp(16px,4vw,42px);background:#0d1828cf;backdrop-filter:blur(22px);border-bottom:1px solid #9defff50;box-shadow:0 12px 55px #0008}
.eons-m16-brand{display:flex;gap:12px;align-items:center;color:#f8f4ee;text-decoration:none;font-weight:800;letter-spacing:.12em}
.eons-m16-brand img{width:56px;height:56px;object-fit:cover;border-radius:15px;box-shadow:0 0 22px #a4dcff55}
.eons-m16-navlinks{display:flex;flex-wrap:wrap;gap:8px}
.eons-m16-navlinks a,.eons-m16-actions a,.eons-m16-shortcuts a{color:#f7fbff;text-decoration:none;border:1px solid #d5eaff6b;border-radius:16px;background:linear-gradient(140deg,#e8faff28,#4e6c9926 48%,#d6b1ff20);box-shadow:inset 0 1px 1px #ffffff70,0 8px 22px #0007,0 0 19px #9defff18;backdrop-filter:blur(18px);transition:transform .22s,box-shadow .22s,border-color .22s}
.eons-m16-navlinks a{padding:10px 14px;font-size:13px}
.eons-m16-hero{isolation:isolate;overflow:hidden;min-height:420px;display:grid;align-items:center;grid-template-columns:1.15fr .85fr;gap:22px;margin:20px auto 18px;max-width:1240px;padding:clamp(24px,5vw,64px);border-radius:34px;border:1px solid #a8e8ff6b;background:radial-gradient(circle at 82% 35%,#6acfff31,transparent 45%),linear-gradient(125deg,#111d34f2,#0b1323ed);box-shadow:inset 0 2px 2px #ffffff5c,0 32px 80px #000a,0 0 70px #56c8ff19}
.eons-m16-hero:before{content:"";position:absolute;inset:0;background:linear-gradient(130deg,#fff2,transparent 34%,#a6c9ff10 64%,transparent);pointer-events:none}
.eons-m16-kicker{font-size:12px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--m16-ice)}
.eons-m16-hero h1{font-size:clamp(2.4rem,6vw,5.4rem);line-height:1.06;margin:14px 0 20px;letter-spacing:-.05em;text-shadow:0 6px 28px #7fdcff4b}
.eons-m16-hero h1 em{font-style:normal;color:#a7eaff}
.eons-m16-hero p{color:#d4e3f4;line-height:1.65;max-width:600px}
.eons-m16-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}
.eons-m16-actions a{padding:15px 18px;font-weight:750}
.eons-m16-actions a:first-child{background:linear-gradient(125deg,#c9faff77,#8b9cff44);border-color:#a7efff}
.eons-m16-orb{position:relative;min-height:300px;display:grid;place-items:center;perspective:850px}
.eons-m16-orb:before,.eons-m16-orb:after{content:"";position:absolute;width:min(78%,290px);aspect-ratio:1;border-radius:50%;border:1px solid #9ae9ff9c;box-shadow:0 0 36px #66d9ff50,inset 0 0 32px #6bdcff2d;transform:rotateX(62deg) rotateZ(-25deg)}
.eons-m16-orb:after{transform:rotateY(65deg) rotateZ(28deg);border-color:#d6b1ff9c}
.eons-m16-orb img{width:min(80%,310px);aspect-ratio:1;object-fit:cover;border-radius:50%;box-shadow:0 0 0 8px #b0eaff22,0 0 65px #68d8ff6e,0 35px 70px #000b;transform:translateZ(38px)}
.eons-m16-shortcuts{max-width:1240px;margin:0 auto 24px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:0 12px}
.eons-m16-shortcuts a{padding:20px;display:flex;flex-direction:column;gap:8px}
.eons-m16-shortcuts strong{font-size:1.04rem}
.eons-m16-shortcuts span{font-size:.85rem;color:#d3e4f2}
.eons-m16-navlinks a:hover,.eons-m16-actions a:hover,.eons-m16-shortcuts a:hover{transform:translateY(-4px);border-color:#b6f7ff;box-shadow:inset 0 1px 2px #fff8,0 15px 35px #0009,0 0 28px #89eaff60}
button,.button{transition:transform .22s,box-shadow .22s}
button:hover,.button:hover{transform:translateY(-3px);box-shadow:0 12px 28px #69d5ff45}
button:focus-visible,a:focus-visible{outline:3px solid #a2efff;outline-offset:4px}
@media(max-width:760px){.eons-m16-nav{align-items:flex-start;flex-direction:column}.eons-m16-hero{grid-template-columns:1fr;margin:12px 10px;border-radius:26px}.eons-m16-orb{min-height:230px}.eons-m16-orb img{width:195px}.eons-m16-shortcuts{grid-template-columns:1fr}.eons-m16-actions a{flex:1 1 100%;text-align:center}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation:none!important;transition:none!important}}
CSS
python3 - "$HTML" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1])
s=p.read_text()
if 'eons-m16-nav' in s:
 print('M16_ALREADY_INSTALLED=PASS')
 raise SystemExit(0)
assert '</head>' in s and '<body' in s and 'eons-brand-logo.webp' in s
s=s.replace('</head>','<link rel="stylesheet" href="/assets/eons-m16.css?v=1"></head>',1)
nav='''<nav class="eons-m16-nav" aria-label="Command navigation"><a class="eons-m16-brand" href="/"><img src="/assets/eons-brand-icon.webp" alt="">EONS / FINANCIAL FABRIC</a><div class="eons-m16-navlinks"><a href="#eons-m16-work">Explore</a><a href="/pages/financial-dashboard.html">Dashboard</a><a href="/pages/master-control-center.html">Evidence Center</a></div></nav>'''
hero='''<section class="eons-m16-hero" aria-labelledby="eons-m16-title"><div><div class="eons-m16-kicker">EONS • Matthew 22:17–21 • Render & Review</div><h1 id="eons-m16-title">Truth in every record.<br><em>Clarity in every decision.</em></h1><p>A new dimension in evidence-led financial accountability. Reconcile transactions, identify discrepancies, preserve documentation and prepare for professional review—without sacrificing dignity or lawful compliance.</p><div class="eons-m16-actions"><a href="/pages/financial-dashboard.html">Launch Financial Command Center ↗</a><a href="/pages/master-control-center.html">Enter Evidence Control ↗</a></div></div><div class="eons-m16-orb"><img src="/assets/eons-brand-logo.webp" alt="Official EONS cinematic emblem" loading="eager"></div></section>'''
quick='''<section class="eons-m16-shortcuts" id="eons-m16-work" aria-label="Featured workspaces"><a href="/pages/financial-dashboard.html"><strong>◈ Reconciliation Intelligence</strong><span>Review sample ledger exceptions and CSV reports.</span></a><a href="/pages/transaction-matching.html"><strong>◇ Transaction Matrix</strong><span>Compare individual transaction identifiers and values.</span></a><a href="/pages/master-control-center.html"><strong>⬡ Evidence Command</strong><span>Explore documentation and review workflows.</span></a></section>'''
import re
s,n=re.subn(r'(<body\b[^>]*>)',lambda m:m.group(1)+nav+hero+quick,s,count=1,flags=re.I)
assert n==1
p.write_text(s)
print('M16_HOLOGRAPHIC_UI=INSTALLED')
PY
python3 - "$HTML" <<'PY'
from pathlib import Path
import sys
s=Path(sys.argv[1]).read_text()
for x in ['eons-m16-nav','eons-m16-hero','eons-m16-shortcuts','Matthew 22:21','eons-brand-logo.webp']:
 assert x in s,x
print('M16_MARKERS=PASS')
PY
for path in / /assets/eons-m16.css /assets/eons-brand-logo.webp /pages/financial-dashboard.html; do
 code=$(curl -sS -o /dev/null --max-time 15 -w '%{http_code}' "https://$DOMAIN$path")
 echo "$path HTTP=$code"
 test "$code" = 200
done
systemctl is-active eons-m9-private.service
systemctl is-active eons-m11-private.service
echo "M16_BACKUP=$BACKUP"
echo "M16_DEPLOYMENT=PASS"
