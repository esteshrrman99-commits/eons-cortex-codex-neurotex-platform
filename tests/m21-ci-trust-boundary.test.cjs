'use strict';
// Synthetic-only CI supply-chain and event-boundary checks; not a substitute for action pinning or GitHub policy review.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/eons-m21-ci.yml'), 'utf8');

test('untrusted PRs never execute in privileged target or deployment contexts', () => {
  assert.doesNotMatch(workflow, /^\s*(?:pull_request_target|workflow_run|repository_dispatch|schedule):/m);
  assert.doesNotMatch(workflow, /^\s*(?:environment|container|services):/m);
  assert.match(workflow, /^\s*pull_request:/m);
});

test('CI executes only explicitly allowed GitHub actions', () => {
  const actions = [...workflow.matchAll(/^\s*-?\s*uses:\s*(\S+)\s*$/gm)].map(m => m[1]);
  assert.deepEqual(actions, ['actions/checkout@v4', 'actions/setup-node@v4']);
  assert.doesNotMatch(workflow, /\$\{\{\s*(?:secrets|inputs|github\.event\.pull_request\.title)\b/i);
});

test('CI test step has no network acquisition, publishing or shell interpolation', () => {
  const runs = [...workflow.matchAll(/^\s*run:\s*(.+)$/gm)].map(m => m[1].trim());
  assert.deepEqual(runs, ['npm run test:eons']);
  assert.doesNotMatch(workflow, /^\s*(?:env|environment|id-token):/m);
});
