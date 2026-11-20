'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const evidence = require('../docs/assets/m21-evidence.js');
const recon = require('../docs/assets/m18-reconciliation.js');
const bank = () => [{id:'SYN-B-1',date:'2026-10-31',amount:'25.00',evidence_id:'DOC-DEMO-B'}];
const ledger = () => [{id:'SYN-L-1',date:'2026-10-31',amount:'25.00',evidence_id:'DOC-DEMO-L'}];
const documents = () => [
  {id:'DOC-DEMO-B',sourceType:'bank_statement',sourceSha256:'a'.repeat(64),sourceRef:'SYNTHETIC-B',capturedAt:'2026-10-31T21:00:00Z'},
  {id:'DOC-DEMO-L',sourceType:'ledger_export',sourceSha256:'b'.repeat(64),sourceRef:'SYNTHETIC-L',capturedAt:'2026-10-31T21:00:00Z'}
];
function audit(result, b=bank(), l=ledger(), docs=documents(), fn=recon.reconcile) {
  return evidence.reconciliationConsistency(result,b,l,docs,fn);
}
test('exact-cent synthetic candidate can be recomputed without granting approval', () => {
  const r=audit(recon.reconcile(bank(),ledger()));
  assert.equal(r.candidateCount,1);
  assert.equal(r.missingEvidenceCount,0);
  assert.equal(r.consistency,'algorithmically_consistent_unverified');
  assert.equal(r.sourceAuthenticityVerified,false);
  assert.equal(r.postingAuthorized,false);
  assert.equal(r.taxCalculationAuthorized,false);
});
test('tampered amount cents in candidate is rejected', () => {
  const r=recon.reconcile(bank(),ledger());
  r.matches[0].amountCents=2501;
  assert.throws(() => audit(r),/differs from recomputed/);
});
test('fabricated extra candidate is rejected', () => {
  const r=recon.reconcile(bank(),ledger());
  r.matches.push({...r.matches[0],bankId:'SYN-B-FAKE'});
  assert.throws(() => audit(r),/differs from recomputed/);
});
test('injected approval flag is rejected, not silently ignored', () => {
  const r=recon.reconcile(bank(),ledger());
  r.postingAuthorized=true;
  assert.throws(() => audit(r),/differs from recomputed/);
});
test('missing evidence metadata is disclosed without authorizing posting', () => {
  const r=audit(recon.reconcile(bank(),ledger()),bank(),ledger(),documents().slice(0,1));
  assert.equal(r.missingEvidenceCount,1);
  assert.equal(r.postingAuthorized,false);
});
test('missing trusted reconciliation function fails closed', () => {
  assert.throws(() => audit(recon.reconcile(bank(),ledger()),bank(),ledger(),documents(),null),/trusted reconciliation/);
});
test('changed input after reconciliation is detected', () => {
  const r=recon.reconcile(bank(),ledger());
  const altered=bank();
  altered[0].amount='26.00';
  assert.throws(() => audit(r,altered),/differs from recomputed/);
});
test('audit card is keyboard accessible, live-announced, and uses no form inputs', () => {
  const root=path.resolve(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'docs/pages/evidence-provenance-lab.html'),'utf8');
  const js=fs.readFileSync(path.join(root,'docs/assets/m21-lab.js'),'utf8');
  assert.match(html,/id="run-audit"/);
  assert.match(html,/id="audit-output" role="status" aria-live="polite"/);
  assert.match(html,/m18-reconciliation\.js/);
  assert.ok(html.indexOf('m18-reconciliation.js')<html.indexOf('m21-evidence.js'));
  assert.match(js,/reconciliationConsistency/);
  assert.match(js,/run-audit/);
  assert.equal(/<(?:form|input|textarea)\b/i.test(html),false);
});
