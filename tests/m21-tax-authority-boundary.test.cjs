'use strict';
// M21.6: synthetic-only tax authority boundary regression tests.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ruleMetadata, taxRuleGate } = require('../docs/assets/m21-evidence.js');
const fixture = (overrides = {}) => ({
  ruleId: 'DEMO-RULE', jurisdiction: 'US', taxYear: 2026, version: '1.0.0',
  sourceUrl: 'https://example.org/synthetic-rule', retrievedAt: '2026-11-06T12:00:00Z',
  effectiveFrom: '2026-01-01', effectiveThrough: '2026-12-31',
  reviewStatus: 'reviewed', ...overrides
});
const request = { jurisdiction: 'US', taxYear: 2026, asOf: '2026-06-01' };

test('reviewed metadata cannot grant calculation, filing or legal authority', () => {
  const result = taxRuleGate([fixture()], request);
  assert.equal(result.mode, 'METADATA_ONLY');
  assert.equal(result.reviewStatus, 'reviewed');
  assert.equal(result.reason, 'metadata_not_tax_authority');
  assert.equal(result.calculationAuthorized, false);
  assert.equal(result.filingAuthorized, false);
  assert.equal(result.legalConclusionProvided, false);
  assert.equal(Object.isFrozen(result), true);
});
test('overlapping versions remain ambiguous even when both are reviewed', () => {
  const result = taxRuleGate([fixture(), fixture({version:'2.0.0'})], request);
  assert.equal(result.reviewStatus, 'unresolved');
  assert.equal(result.reason, 'ambiguous_versions');
  assert.equal(result.filingAuthorized, false);
});
test('missing date coverage remains unresolved', () => {
  const result = taxRuleGate([fixture({effectiveThrough:'2026-05-31'})], request);
  assert.equal(result.matches, 0);
  assert.equal(result.reason, 'no_applicable_version');
  assert.equal(result.calculationAuthorized, false);
});
test('source URL credentials and non-HTTPS protocols are rejected', () => {
  for (const sourceUrl of ['http://example.org/rule', 'https://user:secret@example.org/rule', 'javascript:alert(1)']) {
    assert.throws(() => ruleMetadata(fixture({sourceUrl})), TypeError);
  }
});
test('unknown approval fields cannot be smuggled into rule metadata', () => {
  assert.throws(() => ruleMetadata(fixture({filingAuthorized:true})), TypeError);
  assert.throws(() => taxRuleGate([fixture()], {...request, overrideApproved:true}), TypeError);
});
