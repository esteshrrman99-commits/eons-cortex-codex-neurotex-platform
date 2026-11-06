'use strict';
// M21.4: static mobile/accessibility and privacy contract; no browser emulation claims.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('docs/pages/evidence-provenance-lab.html');
const css = read('docs/assets/m21-lab.css');
const js = read('docs/assets/m21-lab.js');

test('mobile viewport and language declared', () => {
  assert.match(html, /<html\s+lang="en"/i);
  assert.match(html, /<meta\s+name="viewport"\s+content="width=device-width,initial-scale=1"/i);
});
test('all three demo actions are native buttons with visible descriptions', () => {
  for (const id of ['run-evidence','run-tax','run-audit']) {
    assert.match(html, new RegExp('<button\\s+type="button"\\s+id="'+id+'"[^>]*>[^<]+</button>'));
  }
});
test('results announce status without unsolicited autofocus', () => {
  for (const id of ['evidence-output','tax-output','audit-output']) {
    assert.match(html, new RegExp('<pre\\s+id="'+id+'"\\s+role="status"\\s+aria-live="polite"'));
  }
  assert.doesNotMatch(html, /\bautofocus\b/i);
});
test('keyboard skip target exists and navigation is named', () => {
  assert.match(html, /href="#main"/);
  assert.match(html, /<main\s+id="main"/);
  assert.match(html, /<nav\s+aria-label="[^"]+"/);
});
test('no real-data input or network APIs in demonstration', () => {
  assert.doesNotMatch(html, /<(?:form|input|textarea|iframe)\b/i);
  assert.doesNotMatch(js, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage)\b/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
});
test('reduced-motion and keyboard focus treatment exist', () => {
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});
test('all referenced local assets are present in repository', () => {
  for (const name of ['m21-lab.css','m18-reconciliation.js','m21-evidence.js','m21-lab.js']) {
    assert.ok(fs.statSync(path.join(root,'docs/assets',name)).isFile(), name);
  }
});
