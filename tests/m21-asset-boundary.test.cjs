'use strict';
// M21.11: source-only asset and link safety contract; browser/server checks remain necessary.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'docs/pages/evidence-provenance-lab.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'docs/assets/m21-lab.css'), 'utf8');

test('local stylesheet and script references resolve inside docs without traversal', () => {
  const refs = [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"[^>]*>/gi)]
    .map(match => match[1]).filter(ref => ref.endsWith('.js') || ref.endsWith('.css'));
  assert.ok(refs.length >= 4, 'expected local JS and CSS');
  for (const ref of refs) {
    assert.match(ref, /^\/assets\/[a-z0-9-]+\.(?:js|css)$/i);
    const resolved = path.resolve(root, 'docs', '.' + ref);
    assert.ok(resolved.startsWith(path.join(root, 'docs', 'assets') + path.sep));
    assert.ok(fs.statSync(resolved).isFile(), ref);
  }
});

test('demonstration has no external executable or CSS imports', () => {
  assert.doesNotMatch(html, /<(?:script|link)\b[^>]*(?:src|href)="(?:https?:)?\/\//i);
  assert.doesNotMatch(css, /@import\b|url\(\s*['"]?\s*(?:https?:|\/\/|data:)/i);
  assert.doesNotMatch(html, /\b(?:srcdoc|integrity|crossorigin)\s*=/i);
});

test('navigation links stay local and never open unprotected new tabs', () => {
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map(m => m[1]);
  assert.ok(hrefs.length >= 2);
  for (const href of hrefs) {
    assert.match(href, /^(?:#main|\/#main|\/|\/pages\/[a-z0-9-]+\.html)$/i);
  }
  assert.doesNotMatch(html, /\btarget\s*=\s*["']_blank["']/i);
});
