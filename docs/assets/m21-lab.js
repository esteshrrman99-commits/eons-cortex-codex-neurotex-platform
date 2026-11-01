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
})();
