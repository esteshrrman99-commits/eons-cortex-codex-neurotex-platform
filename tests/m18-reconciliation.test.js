'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { cents, isoDay, reconcile } = require('../public/assets/m18-reconciliation.js');
const row = (id, amount, date = '2026-10-29', extra = {}) => ({ id, amount, date, ...extra });
test('decimal strings convert exactly to integer cents', () => {
  assert.equal(cents('0'), 0);
  assert.equal(cents('0.01'), 1);
  assert.equal(cents('120.5'), 12050);
  assert.equal(cents('-9.99'), -999);
  assert.equal(cents('90071992547409.91'), Number.MAX_SAFE_INTEGER);
});
test('rejects floating-point input, precision loss, malformed values and unsafe ranges', () => {
  for (const value of [0.1, '0.001', '1e3', '01.00', 'NaN', '$10.00', '90071992547409.92', '']) {
    assert.throws(() => cents(value), TypeError);
  }
});
test('validates calendar dates rather than silently normalizing them', () => {
  assert.equal(isoDay('2024-02-29') + 1, isoDay('2024-03-01'));
  for (const value of ['2026-02-29', '2026-13-01', '2026-04-31', '10/29/2026']) {
    assert.throws(() => isoDay(value), TypeError);
  }
});
test('produces a conservative one-to-one candidate with evidence status', () => {
  const r = reconcile([row('B1','-42.17','2026-10-29',{reference:'A-19',evidence_id:'B-E1'})],
    [row('L1','-42.17','2026-10-28',{reference:'a-19',evidence_id:'L-E1'})]);
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].dateDifferenceDays, 1);
  assert.equal(r.matches[0].status, 'candidate');
  assert.equal(r.matches[0].evidenceStatus, 'references_present');
  assert.equal(r.externallyVerified, false);
});
test('does not resolve ambiguous duplicate amounts automatically', () => {
  const r = reconcile([row('B1','12.00'), row('B2','12.00')],[row('L1','12.00')]);
  assert.equal(r.matches.length, 0);
  assert.deepEqual(r.ambiguousBank, ['B1','B2']);
  assert.deepEqual(r.ambiguousLedger, ['L1']);
});
test('prefers unique matching reference over other compatible rows', () => {
  const r = reconcile([row('B1','12.00',undefined,{reference:'INVOICE-7'})],
    [row('L1','12.00',undefined,{reference:'INVOICE-7'}),row('L2','12.00')]);
  assert.equal(r.matches[0].ledgerId,'L1');
  assert.deepEqual(r.unmatchedLedger,['L2']);
});
test('does not match conflicting nonempty references', () => {
  const r = reconcile([row('B1','12.00',undefined,{reference:'ABC'})],
    [row('L1','12.00',undefined,{reference:'XYZ'})]);
  assert.equal(r.matches.length,0);
  assert.deepEqual(r.unmatchedBank,['B1']);
});
test('rejects unsupported currency and duplicate identifiers', () => {
  assert.throws(() => reconcile([row('B1','1.00',undefined,{currency:'EUR'})],[]), TypeError);
  assert.throws(() => reconcile([row('B1','1.00'),row('B1','1.00')],[]), TypeError);
});
test('enforces date tolerance and reports unmatched records', () => {
  const r = reconcile([row('B1','10.00','2026-10-29')],[row('L1','10.00','2026-10-25')],{maxDays:3});
  assert.equal(r.matches.length,0);
  assert.deepEqual(r.unmatchedBank,['B1']);
  assert.deepEqual(r.unmatchedLedger,['L1']);
  assert.throws(() => reconcile([],[],{maxDays:31}),TypeError);
});
test('matching is stable across input order and never marks externally verified', () => {
  const b=[row('B2','2.00'),row('B1','1.00')],l=[row('L2','2.00'),row('L1','1.00')];
  const a=reconcile(b,l),c=reconcile([...b].reverse(),[...l].reverse());
  assert.deepEqual(a,c);
  assert.equal(a.externallyVerified,false);
});
