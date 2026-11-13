'use strict';
// Synthetic-only CI safety contract. Static checks complement, not replace, GitHub settings review.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const workflow = fs.readFileSync(path.join(__dirname,'../.github/workflows/eons-m21-ci.yml'),'utf8');

test('M21 CI is read-only and does not persist checkout credentials', () => {
  assert.match(workflow, /^permissions:\s*\n\s+contents: read/m);
  assert.match(workflow, /persist-credentials:\s*false/);
  assert.doesNotMatch(workflow, /(?:contents|actions|deployments|packages|id-token):\s*write/);
});
test('M21 CI executes the committed synthetic suite under a bounded runtime', () => {
  assert.match(workflow, /run:\s*npm run test:eons/);
  assert.match(workflow, /timeout-minutes:\s*10/);
  assert.match(workflow, /node-version:\s*['"]?22/);
});
test('M21 CI has no deploy, publish, or external data acquisition steps', () => {
  assert.doesNotMatch(workflow, /^\s*(?:deploy|publish|release|upload|terraform|kubectl|docker login|curl|wget)\b/im);
  assert.doesNotMatch(workflow, /secrets\s*\./i);
  assert.doesNotMatch(workflow, /environment:\s*production/i);
});
