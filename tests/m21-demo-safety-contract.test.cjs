'use strict';
// M21.5: static safety contract, not a substitute for HTTP-header or browser testing.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'docs/pages/evidence-provenance-lab.html'),'utf8');
const js=fs.readFileSync(path.join(root,'docs/assets/m21-lab.js'),'utf8');

test('synthetic lab explicitly rejects real financial activity',()=>{
  for(const word of ['Synthetic Demo','No uploads','personal information','tax calculations','payments','Independent qualified review']) {
    assert.ok(html.includes(word),word);
  }
});
test('no external script/style URLs or inline executable handlers',()=>{
  const assets=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/gi)].map(m=>m[1]);
  assert.ok(assets.length>=4);
  for(const url of assets) assert.match(url,/^\/assets\/[a-z0-9.-]+\.(?:js|css)$/i);
  assert.doesNotMatch(html,/\son(?:click|load|error|submit|input)\s*=/i);
  assert.doesNotMatch(html,/<script\b(?![^>]*\bsrc=)[^>]*>/i);
});
test('demo results use textContent rather than HTML injection sinks',()=>{
  assert.match(js,/\.textContent\s*=/);
  assert.doesNotMatch(js,/\b(?:innerHTML|outerHTML|insertAdjacentHTML|eval|Function)\b/);
});
test('demonstration blocks indexing and external connections',()=>{
  assert.match(html,/name="robots" content="noindex,nofollow"/);
  assert.match(html,/default-src 'none'/);
  assert.match(html,/connect-src 'none'/);
  assert.match(html,/base-uri 'none'/);
  assert.match(html,/object-src 'none'/);
});
