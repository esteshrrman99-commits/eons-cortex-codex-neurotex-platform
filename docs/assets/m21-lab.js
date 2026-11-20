/* EONS M21.1: synthetic-only lab controls; no network, inputs, or storage. */
(function () {
  'use strict';
  const out = document.getElementById('evidence-output');
  const taxOut = document.getElementById('tax-output');
  document.getElementById('run-evidence').addEventListener('click', async function () {
    try {
      const item = {id:'DOC-DEMO-1',sourceType:'bank_statement',sourceSha256:'a'.repeat(64),sourceRef:'SYNTHETIC-1',capturedAt:'2026-10-31T21:00:00Z'};
      const result = await window.EonsEvidence.metadataFingerprint(item);
      out.textContent = ['EVIDENCE ID: '+item.id,'METADATA SHA-256: '+result.metadataSha256,
        'SOURCE AUTHENTICITY VERIFIED: NO','CHAIN OF CUSTODY VERIFIED: NO','REVIEW REQUIRED: YES','AUTOMATIC POSTING: DISABLED'].join('\n');
    } catch (err) { out.textContent = 'Demo unavailable: '+err.message; }
  });
  document.getElementById('run-tax').addEventListener('click', function () {
    try {
      const entry = {ruleId:'SYNTHETIC-RULE',jurisdiction:'US-FED',taxYear:2026,version:'1.0.0',
        sourceUrl:'https://example.org/synthetic',retrievedAt:'2026-10-31T21:00:00Z',
        effectiveFrom:'2026-01-01',effectiveThrough:'2026-12-31',reviewStatus:'draft'};
      const result = window.EonsEvidence.taxRuleGate([entry],{jurisdiction:'US-FED',taxYear:2026,asOf:'2026-10-31'});
      taxOut.textContent = ['MODE: '+result.mode,'MATCHING VERSIONS: '+result.matches,'REVIEW: '+result.reviewStatus,
        'STATUS: '+result.reason,'TAX CALCULATION AUTHORIZED: NO','FILING AUTHORIZED: NO','LEGAL CONCLUSION: NONE'].join('\n');
    } catch (err) { taxOut.textContent = 'Demo unavailable: '+err.message; }
  });
  document.getElementById('run-audit').addEventListener('click', function () {
    const auditOut = document.getElementById('audit-output');
    try {
      const bank = [{id:'SYN-B-1',date:'2026-10-31',amount:'25.00',evidence_id:'DOC-DEMO-B'}];
      const ledger = [{id:'SYN-L-1',date:'2026-10-31',amount:'25.00',evidence_id:'DOC-DEMO-L'}];
      const evidence = [
        {id:'DOC-DEMO-B',sourceType:'bank_statement',sourceSha256:'a'.repeat(64),sourceRef:'SYNTHETIC-B',capturedAt:'2026-10-31T21:00:00Z'},
        {id:'DOC-DEMO-L',sourceType:'ledger_export',sourceSha256:'b'.repeat(64),sourceRef:'SYNTHETIC-L',capturedAt:'2026-10-31T21:00:00Z'}
      ];
      const result = window.EonsReconciliation.reconcile(bank, ledger);
      const audit = window.EonsEvidence.reconciliationConsistency(
        result, bank, ledger, evidence, window.EonsReconciliation.reconcile);
      auditOut.textContent = ['STATUS: '+audit.consistency,'CANDIDATES: '+audit.candidateCount,
        'MISSING EVIDENCE REFERENCES: '+audit.missingEvidenceCount,
        'SOURCE AUTHENTICITY VERIFIED: NO','REVIEWER APPROVAL: NO',
        'POSTING AUTHORIZED: NO','TAX CALCULATION AUTHORIZED: NO'].join('\n');
    } catch (err) { auditOut.textContent = 'Demo unavailable: '+err.message; }
  });
})();
