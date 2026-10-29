#!/usr/bin/env bash
set -euo pipefail
ROOT=/opt/eons-tax-platform/source/docs
HTML="$ROOT/index.html"
DOMAIN=eons-tax.142-93-114-74.sslip.io
test -s "$HTML"
grep -q 'eons-m16-hero' "$HTML"
test -s "$ROOT/assets/eons-brand-logo.webp"
test -s "$ROOT/assets/eons-m16.css"
BACKUP="/opt/eons-tax-platform/backup-M17-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp -a "$HTML" "$ROOT/assets/eons-m16.css" "$BACKUP/"
echo "===== M17 SOURCE INSPECTION ====="
python3 - "$HTML" <<'PY'
from pathlib import Path
import re,sys
s=Path(sys.argv[1]).read_text()
for name,regex in [('M16_HERO',r'class="eons-m16-hero"'),('OFFICIAL_LOGO',r'eons-brand-logo.webp'),('MATTHEW',r'Matthew 22:21'),('NAVIGATION',r'eons-m16-shortcuts'),('DASHBOARD',r'financial-dashboard.html')]:
 print(name, len(re.findall(regex,s)))
 assert re.search(regex,s),name
print('M17_INSPECTION=PASS')
PY
cat > "$ROOT/assets/eons-m17.css" <<'CSS'
:root{--m17-cyan:#8aefff;--m17-rose:#ffcae8;--m17-ink:#090d1a}
.eons-m16-nav{position:sticky;top:0;z-index:80;box-shadow:0 16px 45px #0009,0 1px 0 #b1faff6e}
.eons-m16-hero{position:relative;background:radial-gradient(ellipse at 82% 18%,#74ddff35,transparent 42%),radial-gradient(ellipse at 12% 95%,#9876ff30,transparent 44%),linear-gradient(145deg,#152441,#090f1e);border:1px solid #c1eaff75;box-shadow:inset 0 2px 0 #ffffff4d,0 35px 85px #000b,0 0 55px #4ddfff2a}
.eons-m16-hero:after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(110deg,transparent 15%,#ffffff13 32%,transparent 45%);background-size:250% 100%;animation:m17-sheen 11s ease-in-out infinite}
.eons-m16-hero>div{position:relative;z-index:2}
.eons-m16-hero h1{background:linear-gradient(125deg,#fff 12%,#a1f4ff 45%,#f4d0ff 75%,#fff);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 6px 20px #7fdcff25)}
.eons-m16-hero h1 em{color:inherit}
.eons-m16-orb{transform-style:preserve-3d}
.eons-m16-orb img{border:1px solid #f4f9ffb8;box-shadow:0 0 0 9px #c1e9ff1c,0 0 80px #6ddaff77,0 38px 65px #000d;animation:m17-float 7s ease-in-out infinite}
.eons-m16-orb:before{animation:m17-ringA 15s linear infinite}
.eons-m16-orb:after{animation:m17-ringB 18s linear infinite reverse}
.eons-m16-shortcuts a{position:relative;overflow:hidden;min-height:110px;justify-content:center;border-color:#a8dcff80;background:linear-gradient(145deg,#2b3f60b8,#101c33d9 58%,#46336070)}
.eons-m16-shortcuts a:before{content:"";position:absolute;top:-50%;left:-60%;width:45%;height:200%;background:linear-gradient(90deg,transparent,#ffffff28,transparent);transform:rotate(25deg);transition:left .65s}
.eons-m16-shortcuts a:hover:before,.eons-m16-shortcuts a:focus-visible:before{left:140%}
.eons-m16-shortcuts strong{color:#e8fbff;text-shadow:0 0 16px #6ce4ff45}
.eons-m16-actions a{position:relative;overflow:hidden;text-shadow:0 1px 4px #0007}
.eons-m17-status{position:relative;z-index:2;display:flex;flex-wrap:wrap;gap:9px;margin:18px 0 0}
.eons-m17-status span{border:1px solid #a6e7ff72;border-radius:99px;padding:7px 12px;background:#b5eeff12;color:#d4f5ff;font-size:.72rem;letter-spacing:.08em;font-weight:700}
.eons-m17-status span:before{content:"";display:inline-block;width:6px;height:6px;margin-right:8px;border-radius:50%;background:#9af5db;box-shadow:0 0 10px #9af5db}
.eons-m17-caption{display:block;color:#c9dbed;font-size:.8rem;letter-spacing:.08em;text-align:center;margin-top:14px}
.eons-m17-scroll{height:3px;position:fixed;left:0;top:0;z-index:100;background:linear-gradient(90deg,#a9f7ff,#ba9dff,#f5c9a3);width:0;box-shadow:0 0 12px #a9f7ff;pointer-events:none}
.eons-m17-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
.eons-m17-reveal.is-visible{opacity:1;transform:none}
@keyframes m17-float{0%,100%{transform:translateY(0) translateZ(38px)}50%{transform:translateY(-13px) translateZ(38px)}}
@keyframes m17-ringA{to{transform:rotateX(62deg) rotateZ(335deg)}}
@keyframes m17-ringB{to{transform:rotateY(65deg) rotateZ(388deg)}}
@keyframes m17-sheen{0%,55%,100%{background-position:150% 0}80%{background-position:-100% 0}}
@media(max-width:760px){.eons-m16-nav{position:relative}.eons-m16-hero{min-height:auto}.eons-m16-hero h1{font-size:clamp(2.15rem,10vw,3.5rem)}.eons-m16-orb img{animation-duration:9s}.eons-m17-status span{font-size:.65rem}}
@media(prefers-reduced-motion:reduce){.eons-m16-orb img,.eons-m16-orb:before,.eons-m16-orb:after,.eons-m16-hero:after{animation:none!important}.eons-m17-reveal{opacity:1;transform:none;transition:none}}
CSS
cat > "$ROOT/assets/eons-m17.js" <<'JS'
(()=>{'use strict';
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero=document.querySelector('.eons-m16-hero');
if(!hero)return;
const status=document.createElement('div');
status.className='eons-m17-status';
for(const t of ['EVIDENCE-FIRST','PRIVATE REVIEW','HUMAN-GATED ACTIONS']){
 const el=document.createElement('span');el.textContent=t;status.appendChild(el);
}
const content=hero.querySelector('div');
if(content)content.appendChild(status);
const orb=hero.querySelector('.eons-m16-orb');
if(orb){const caption=document.createElement('small');caption.className='eons-m17-caption';caption.textContent='EONS • FINANCIAL INTELLIGENCE FABRIC';orb.appendChild(caption)}
const bar=document.createElement('div');bar.className='eons-m17-scroll';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
let pending=false;
const progress=()=>{pending=false;const max=document.documentElement.scrollHeight-innerHeight;bar.style.width=(max>0?Math.max(0,Math.min(100,scrollY/max*100)):0)+'%'};
window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(progress)}},{passive:true});progress();
if(!reduced&&'IntersectionObserver'in window){
 const nodes=document.querySelectorAll('.eons-m16-shortcuts a');
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}},{threshold:.08});
 nodes.forEach(n=>{n.classList.add('eons-m17-reveal');observer.observe(n)});
}
})();
JS
node --check "$ROOT/assets/eons-m17.js"
python3 - "$HTML" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]);s=p.read_text()
if 'eons-m17.css' not in s:
 assert '</head>' in s
 s=s.replace('</head>','<link rel="stylesheet" href="/assets/eons-m17.css?v=1"></head>',1)
if 'eons-m17.js' not in s:
 assert '</body>' in s
 s=s.replace('</body>','<script defer src="/assets/eons-m17.js?v=1"></script></body>',1)
p.write_text(s)
assert s.count('eons-m17.css')==1 and s.count('eons-m17.js')==1
print('M17_ASSET_REFERENCES=PASS')
PY
for path in / /assets/eons-m17.css /assets/eons-m17.js /assets/eons-brand-logo.webp /pages/financial-dashboard.html; do
 code=$(curl --silent --show-error -o /dev/null --max-time 15 -w '%{http_code}' "https://$DOMAIN$path")
 echo "CHECK=$path HTTP=$code"
 test "$code" = 200
done
test "$(systemctl is-active eons-m9-private.service)" = active
test "$(systemctl is-active eons-m11-private.service)" = active
echo "BACKUP=$BACKUP"
echo "M17_DEPLOYMENT=PASS"
