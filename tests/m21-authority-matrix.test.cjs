'use strict';
// M21.20 synthetic-only authority matrix: metadata review is never permission.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { taxRuleGate } = require('../docs/assets/m21-evidence.js');

const makeRule = (reviewStatus, version = '1.0.0') => ({
  ruleId: 'SYNTHETIC-AUTHORITY', jurisdiction: 'US-FED', taxYear: 2026,
  version, sourceUrl: 'https://example.org/synthetic-rule',
  retrievedAt: '2026-11-21T00:00:00Z',
  effectiveFrom: '2026-01-01', effectiveThrough: '2026-12-31',
  reviewStatus
});
function assertNoAuthority(result) {
  assert.equal(result.mode, 'METADATA_ONLY');
  assert.equal(result.calculationAuthorized, false);
  assert.equal(result.filingAuthorized, false);
  assert.equal(result.legalConclusionProvided, false);
}
test('every review status remains non-authoritative at valid effective dates', () => {
  for (const status of ['draft', 'review_pending', 'reviewed']) {
    for (const asOf of ['2026-01-01', '2026-06-30', '2026-12-31']) {
      const result = taxRuleGate([makeRule(status)], { jurisdiction: 'US-FED', taxYear: 2026, asOf });
      assert.equal(result.matches, 1);
      assert.equal(result.reviewStatus, status);
      assert.equal(result.reason, 'metadata_not_tax_authority');
      assertNoAuthority(result);
    }
  }
});
test('missing and conflicting effective versions never authorize outcomes', () => {
  const query = { jurisdiction: 'US-FED', taxYear: 2026, asOf: '2026-07-01' };
  const missing = taxRuleGate([makeRule('reviewed')], { ...query, asOf: '2027-01-01' });
  assert.equal(missing.reason, 'no_applicable_version');
  assertNoAuthority(missing);
  const conflict = taxRuleGate([makeRule('reviewed'), makeRule('draft', '2.0.0')], query);
  assert.equal(conflict.reason, 'ambiguous_versions');
  assert.equal(conflict.reviewStatus, 'unresolved');
  assertNoAuthority(conflict);
});
