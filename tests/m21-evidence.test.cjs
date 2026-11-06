'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createHash } = require('node:crypto');
const e = require('../docs/assets/m21-evidence.js');
const recon = require('../docs/assets/m18-reconciliation.js');
const evidence = (id = 'DOC-B1') => ({ id, sourceType: 'bank_statement', sourceSha256: 'a'.repeat(64), sourceRef: 'SYNTHETIC-1', capturedAt: '2026-10-31T21:00:00Z' });
const rule = (changes = {}) => ({ ruleId: 'SYNTHETIC-RULE', jurisdiction: 'US-FED', taxYear: 2026, version: '1.0.0', sourceUrl: 'https://example.org/synthetic', retrievedAt: '2026-10-31T21:00:00Z', effectiveFrom: '2026-01-01', effectiveThrough: '2026-12-31', reviewStatus: 'draft', ...changes });
test('integer-cent reconciliation preserves exact decimals', () => { assert.equal(recon.cents('0.29'), 29); assert.equal(recon.cents('-0.01'), -1); assert.throws(() => recon.cents('0.001')); });
test('duplicate amount stays ambiguous', () => { const b = [{id:'B1',date:'2026-10-31',amount:'10.00'}, {id:'B2',date:'2026-10-31',amount:'10.00'}]; const l=[{id:'L1',date:'2026-10-31',amount:'10.00'}]; const r=recon.reconcile(b,l); assert.equal(r.counts.candidates,0); assert.equal(r.counts.ambiguousBank,2); });
test('metadata fingerprint is deterministic, with explicit no-verification flags', async () => { const a=await e.metadataFingerprint(evidence()); const b=await e.metadataFingerprint({...evidence()}); assert.equal(a.metadataSha256,b.metadataSha256); assert.equal(a.sourceAuthenticityVerified,false); assert.equal(a.reviewRequired,true); });
test('metadata digest binds changed source hash', async () => { const a=await e.metadataFingerprint(evidence()); const b=await e.metadataFingerprint({...evidence(),sourceSha256:'b'.repeat(64)}); assert.notEqual(a.metadataSha256,b.metadataSha256); });
test('metadata digest is domain-separated SHA-256 of canonical fields', async () => { const value=evidence(); const expected=createHash('sha256').update('EONS-EVIDENCE-METADATA-V1\n'+JSON.stringify(value)).digest('hex'); assert.equal((await e.metadataFingerprint(value)).metadataSha256,expected); });
test('reject unknown evidence keys including sensitive data', () => assert.throws(() => e.evidenceMetadata({...evidence(), taxpayerName:'DO NOT STORE'})));
test('reject invalid evidence hash and timestamp', () => { assert.throws(() => e.evidenceMetadata({...evidence(),sourceSha256:'bad'})); assert.throws(() => e.evidenceMetadata({...evidence(),capturedAt:'2026-02-30T21:00:00Z'})); });
test('reject duplicate evidence references', () => assert.throws(() => e.evidenceRegistry([evidence(),evidence()])));
test('candidate references do not confer approval or posting permission', () => { const b=[{id:'B1',date:'2026-10-31',amount:'-1.00',evidence_id:'DOC-B1'}]; const l=[{id:'L1',date:'2026-10-31',amount:'-1.00',evidence_id:'DOC-L1'}]; const r=recon.reconcile(b,l); const refs=e.candidateEvidence(r,b,l,[evidence(), {...evidence('DOC-L1'),sourceType:'ledger_export'}]); assert.equal(refs[0].evidenceStatus,'metadata_references_present_not_verified'); assert.equal(refs[0].postingAuthorized,false); });
test('missing registry metadata stays explicitly missing', () => { const b=[{id:'B1',date:'2026-10-31',amount:'1.00',evidence_id:'DOC-B1'}]; const l=[{id:'L1',date:'2026-10-31',amount:'1.00',evidence_id:'DOC-L1'}]; const r=recon.reconcile(b,l); assert.equal(e.candidateEvidence(r,b,l,[evidence()])[0].evidenceStatus,'missing_evidence_metadata'); });
test('tax metadata gate never authorizes calculations even when reviewed', () => { const x=e.taxRuleGate([rule({reviewStatus:'reviewed'})],{jurisdiction:'US-FED',taxYear:2026,asOf:'2026-10-31'}); assert.equal(x.reviewStatus,'reviewed'); assert.equal(x.calculationAuthorized,false); assert.equal(x.filingAuthorized,false); });
test('missing, expired, and ambiguous tax versions fail closed', () => { const q={jurisdiction:'US-FED',taxYear:2026,asOf:'2026-10-31'}; assert.equal(e.taxRuleGate([],q).reason,'no_applicable_version'); assert.equal(e.taxRuleGate([rule({effectiveThrough:'2026-01-31'})],q).matches,0); assert.equal(e.taxRuleGate([rule(),rule({version:'2.0.0'})],q).reason,'ambiguous_versions'); });
test('reject duplicate rule versions and invalid effective dates', () => { const q={jurisdiction:'US-FED',taxYear:2026,asOf:'2026-10-31'}; assert.throws(() => e.taxRuleGate([rule(),rule()],q)); assert.throws(() => e.ruleMetadata(rule({effectiveFrom:'2026-02-30'}))); assert.throws(() => e.ruleMetadata(rule({effectiveFrom:'2026-12-31',effectiveThrough:'2026-01-01'}))); });
test('reject HTTP and credentialed tax source URLs', () => { assert.throws(() => e.ruleMetadata(rule({sourceUrl:'http://example.org'}))); assert.throws(() => e.ruleMetadata(rule({sourceUrl:'https://user:password@example.org'}))); });
test('reject unknown tax metadata fields', () => assert.throws(() => e.ruleMetadata(rule({taxRate:0.75}))));

test('reject duplicate normalized bank IDs instead of silently replacing evidence', () => {
  const b=[{id:'B1',evidence_id:'DOC-B1'},{id:' B1 ',evidence_id:'DOC-B2'}];
  const l=[{id:'L1',evidence_id:'DOC-L1'}];
  assert.throws(() => e.candidateEvidence({mode:'DEMONSTRATION_ONLY',matches:[]},b,l,[evidence()]), /duplicate bank row ID/);
});
test('reject malformed, orphaned, or duplicate candidate matches', () => {
  const b=[{id:'B1',evidence_id:'DOC-B1'}],l=[{id:'L1',evidence_id:'DOC-L1'}];
  const m={bankId:'B1',ledgerId:'L1',status:'candidate'};
  const run=matches=>e.candidateEvidence({mode:'DEMONSTRATION_ONLY',matches},b,l,[evidence()]);
  assert.throws(() => run([{...m,bankId:'UNKNOWN'}]), /Invalid or duplicated/);
  assert.throws(() => run([m,m]), /Invalid or duplicated/);
  assert.throws(() => run([{...m,status:'posted'}]), /Invalid or duplicated/);
});
test('reject malformed evidence references and unbounded candidate inputs', () => {
  const result={mode:'DEMONSTRATION_ONLY',matches:[]};
  assert.throws(() => e.candidateEvidence(result,[{id:'B1',evidence_id:'not-an-id'}],[],[]), /Invalid bank evidence reference/);
  assert.throws(() => e.candidateEvidence(result,new Array(2001).fill({id:'B1'}),[],[]), /bounded array/);
});
test('M18 normalized numeric row IDs remain linkable without posting authority', () => {
  const b=[{id:1,date:'2026-10-31',amount:'5.00',evidence_id:'DOC-B1'}];
  const l=[{id:2,date:'2026-10-31',amount:'5.00',evidence_id:'DOC-L1'}];
  const matches=recon.reconcile(b,l);
  const x=e.candidateEvidence(matches,b,l,[evidence(),{...evidence('DOC-L1'),sourceType:'ledger_export'}]);
  assert.equal(x.length,1);
  assert.equal(x[0].evidenceStatus,'metadata_references_present_not_verified');
  assert.equal(x[0].postingAuthorized,false);
});
test('M21 page uses restrictive CSP and external-only scripts', () => {
  const fs=require('node:fs');
  const path=require('node:path');
  const vm=require('node:vm');
  const root=path.resolve(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'docs/pages/evidence-provenance-lab.html'),'utf8');
  assert.match(html,/Content-Security-Policy/);
  assert.match(html,/connect-src 'none'/);
  assert.match(html,/script-src 'self'/);
  assert.match(html,/style-src 'self'/);
  assert.equal(html.includes('<style>'),false);
  assert.ok(html.includes('/assets/m21-lab.css'));
  assert.match(fs.readFileSync(path.join(root,'docs/assets/m21-lab.css'),'utf8'),/prefers-reduced-motion/);
  assert.equal(html.includes('<script>'),false);
  assert.match(html,/href="#main"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/name="viewport"/);
  for (const tag of ['<input','<textarea','<form']) assert.equal(html.includes(tag),false);
  for(const file of ['m21-evidence.js','m21-lab.js']){
    assert.ok(html.includes('/assets/'+file));
    new vm.Script(fs.readFileSync(path.join(root,'docs/assets',file),'utf8'),{filename:file});
  }
});
