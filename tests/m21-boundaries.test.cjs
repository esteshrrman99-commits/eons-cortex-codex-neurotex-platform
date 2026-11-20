'use strict';
// M21.3: synthetic-only boundary and tax-version regression tests.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const evidence = require('../docs/assets/m21-evidence.js');
const recon = require('../docs/assets/m18-reconciliation.js');

const doc = (id='DOC-1') => ({id,sourceType:'receipt',sourceSha256:'a'.repeat(64),sourceRef:'SYN-1',capturedAt:'2026-11-03T12:00:00Z'});
const rule = (version='1.0.0') => ({
  ruleId:'RULE-DEMO',jurisdiction:'US-FED',taxYear:2026,version,
  sourceUrl:'https://example.org/synthetic-rule',retrievedAt:'2026-11-03T12:00:00Z',
  effectiveFrom:'2026-01-01',effectiveThrough:'2026-12-31',reviewStatus:'reviewed'
});
const query = {jurisdiction:'US-FED',taxYear:2026,asOf:'2026-11-03'};

test('evidence registry rejects more than 2000 entries before hashing', () => {
  assert.throws(()=>evidence.evidenceRegistry(Array.from({length:2001},(_,i)=>doc('DOC-'+i))),/limit/);
});
test('evidence rejects a leap-day calendar forgery', () => {
  assert.throws(()=>evidence.evidenceMetadata({...doc(),capturedAt:'2025-02-29T12:00:00Z'}),/UTC timestamp/);
});
test('evidence rejects a SHA-256 with uppercase hex', () => {
  assert.throws(()=>evidence.evidenceMetadata({...doc(),sourceSha256:'A'.repeat(64)}),/SHA-256/);
});
test('tax rules reject duplicate versions even when review status differs', () => {
  assert.throws(()=>evidence.taxRuleGate([rule(),{...rule(),reviewStatus:'draft'}],query),/Duplicate tax rule version/);
});
test('tax rules reject overlapping distinct versions as ambiguous', () => {
  const result=evidence.taxRuleGate([rule(),rule('1.1.0')],query);
  assert.equal(result.reason,'ambiguous_versions');
  assert.equal(result.calculationAuthorized,false);
  assert.equal(result.filingAuthorized,false);
});
test('tax rules at effective interval boundaries remain metadata-only', () => {
  for(const asOf of ['2026-01-01','2026-12-31']) {
    const result=evidence.taxRuleGate([rule()],{...query,asOf});
    assert.equal(result.matches,1);
    assert.equal(result.calculationAuthorized,false);
  }
});
test('tax rules reject impossible leap dates and unsafe credential URLs', () => {
  assert.throws(()=>evidence.ruleMetadata({...rule(),effectiveThrough:'2026-02-29'}),/calendar date/);
  assert.throws(()=>evidence.ruleMetadata({...rule(),sourceUrl:'https://user:pass@example.org/'}),/credentials/);
});
test('reconciliation consistency never confers financial authorization', () => {
  const bank=[{id:'SYN-B',date:'2026-11-03',amount:'0.29',evidence_id:'DOC-1'}];
  const ledger=[{id:'SYN-L',date:'2026-11-03',amount:'0.29',evidence_id:'DOC-2'}];
  const submitted=recon.reconcile(bank,ledger);
  const result=evidence.reconciliationConsistency(submitted,bank,ledger,[doc(),doc('DOC-2')],recon.reconcile);
  assert.equal(result.candidateCount,1);
  assert.equal(result.postingAuthorized,false);
  assert.equal(result.taxCalculationAuthorized,false);
  assert.equal(result.sourceAuthenticityVerified,false);
});
test('reconciliation rejects a fabricated authorization field', () => {
  const bank=[{id:'B',date:'2026-11-03',amount:'1.00'}];
  const ledger=[{id:'L',date:'2026-11-03',amount:'1.00'}];
  const submitted={...recon.reconcile(bank,ledger),filingAuthorized:true};
  assert.throws(()=>evidence.reconciliationConsistency(submitted,bank,ledger,[],recon.reconcile),/differs from recomputed/);
});
