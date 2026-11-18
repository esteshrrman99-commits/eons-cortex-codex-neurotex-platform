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

test('valid leap-day applicability stays metadata-only', () => {
  const entry = rule({ taxYear: 2024, effectiveFrom: '2024-02-29', effectiveThrough: '2024-02-29' });
  const result = e.taxRuleGate([entry], { jurisdiction: 'US-FED', taxYear: 2024, asOf: '2024-02-29' });
  assert.equal(result.matches, 1);
  assert.equal(result.reason, 'metadata_not_tax_authority');
  assert.equal(result.calculationAuthorized, false);
  assert.equal(result.filingAuthorized, false);
  assert.equal(result.legalConclusionProvided, false);
});

test('duplicate rule-version identity is rejected before selection', () => {
  assert.throws(() => e.taxRuleGate([rule(), rule({ effectiveFrom: '2026-07-01' })], request('2026-08-01')), TypeError);
});

test('tax-rule registry is bounded and rejects personal-data fields', () => {
  assert.throws(() => e.taxRuleGate(Array.from({ length: 2001 }, () => rule()), request('2026-10-31')), TypeError);
  assert.throws(() => e.ruleMetadata(rule({ taxpayerName: 'SYNTHETIC ONLY' })), TypeError);
});

test('tax-rule sources reject URL credentials and non-HTTPS schemes', () => {
  for (const sourceUrl of ['http://example.org/rule', 'https://user:pass@example.org/rule', 'file:///tmp/rule']) {
    assert.throws(() => e.ruleMetadata(rule({ sourceUrl })), TypeError);
  }
});

test('tax-rule citation hosts reject localhost, private DNS and IP literals', () => {
  for (const sourceUrl of [
    'https://localhost/rule', 'https://localhost./rule', 'https://service.local/rule',
    'https://service.internal/rule', 'https://127.0.0.1/rule',
    'https://192.168.1.10/rule', 'https://[::1]/rule'
  ]) {
    assert.throws(() => e.ruleMetadata(rule({ sourceUrl })), TypeError, sourceUrl);
  }
  assert.equal(e.ruleMetadata(rule()).sourceUrl, 'https://example.org/synthetic');
});

test('tax citation URL canonicalization preserves metadata-only authority', () => {
  const normalized = e.ruleMetadata(rule({ sourceUrl: 'https://EXAMPLE.ORG:443/synthetic' }));
  assert.equal(normalized.sourceUrl, 'https://example.org/synthetic');
  const result = e.taxRuleGate([rule({ sourceUrl: normalized.sourceUrl })], request('2026-10-31'));
  assert.equal(result.calculationAuthorized, false);
  assert.equal(result.filingAuthorized, false);
});

test('tax citation host rejects localhost subdomains and alternate numeric loopback', () => {
  for (const sourceUrl of [
    'https://audit.localhost/rule',
    'https://127.1/rule',
    'https://0x7f000001/rule',
    'https://2130706433/rule',
    'https://[2001:db8::1]/rule'
  ]) {
    assert.throws(() => e.ruleMetadata(rule({ sourceUrl })), TypeError, sourceUrl);
  }
});
