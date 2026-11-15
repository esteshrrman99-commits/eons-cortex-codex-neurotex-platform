'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const e = require('../docs/assets/m21-evidence.js');

const rule = (changes = {}) => ({
  ruleId: 'SYNTHETIC-RULE', jurisdiction: 'US-FED', taxYear: 2026,
  version: '1.0.0', sourceUrl: 'https://example.org/synthetic',
  retrievedAt: '2026-10-31T21:00:00Z',
  effectiveFrom: '2026-01-01', effectiveThrough: '2026-12-31',
  reviewStatus: 'reviewed', ...changes
});
const request = (asOf) => ({ jurisdiction: 'US-FED', taxYear: 2026, asOf });

test('effective date boundaries are inclusive and adjacent dates fail closed', () => {
  const entries = [rule({ effectiveFrom: '2026-04-01', effectiveThrough: '2026-06-30' })];
  for (const day of ['2026-04-01', '2026-06-30']) {
    const result = e.taxRuleGate(entries, request(day));
    assert.equal(result.matches, 1);
    assert.equal(result.calculationAuthorized, false);
    assert.equal(result.filingAuthorized, false);
  }
  for (const day of ['2026-03-31', '2026-07-01']) {
    const result = e.taxRuleGate(entries, request(day));
    assert.equal(result.matches, 0);
    assert.equal(result.reason, 'no_applicable_version');
  }
});

test('adjacent rule versions are distinguishable; overlap is unresolved', () => {
  const first = rule({ version: '1.0.0', effectiveFrom: '2026-01-01', effectiveThrough: '2026-06-30' });
  const second = rule({ version: '2.0.0', effectiveFrom: '2026-07-01', effectiveThrough: '2026-12-31' });
  assert.equal(e.taxRuleGate([first, second], request('2026-06-30')).matches, 1);
  assert.equal(e.taxRuleGate([first, second], request('2026-07-01')).matches, 1);
  const overlapping = rule({ version: '2.0.0', effectiveFrom: '2026-06-30' });
  const result = e.taxRuleGate([first, overlapping], request('2026-06-30'));
  assert.equal(result.reason, 'ambiguous_versions');
  assert.equal(result.calculationAuthorized, false);
});

test('tax year and jurisdiction never bleed into a different request', () => {
  const entries = [rule()];
  for (const query of [
    { jurisdiction: 'US-VA', taxYear: 2026, asOf: '2026-10-31' },
    { jurisdiction: 'US-FED', taxYear: 2025, asOf: '2026-10-31' }
  ]) {
    const result = e.taxRuleGate(entries, query);
    assert.equal(result.reason, 'no_applicable_version');
    assert.equal(result.filingAuthorized, false);
  }
});

test('malformed leap days and query fields are rejected', () => {
  assert.throws(() => e.taxRuleGate([rule()], request('2026-02-29')), TypeError);
  assert.throws(() => e.taxRuleGate([rule()], { ...request('2026-10-31'), taxpayerId: 'SYNTHETIC' }), TypeError);
  assert.throws(() => e.ruleMetadata(rule({ retrievedAt: '2026-11-31T21:00:00Z' })), TypeError);
});
