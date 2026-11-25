(function(){
'use strict';
const output=document.getElementById('result');
document.getElementById('run').addEventListener('click',function(){
try{
const bank=[
{id:'BANK-A',date:'2026-10-29',amount:'-42.17',reference:'INV-101',evidence_id:'DOC-B1'},
{id:'BANK-B',date:'2026-10-29',amount:'-10.00'},
{id:'BANK-C',date:'2026-10-29',amount:'-10.00'}];
const ledger=[
{id:'LEDGER-A',date:'2026-10-28',amount:'-42.17',reference:'INV-101',evidence_id:'DOC-L1'},
{id:'LEDGER-B',date:'2026-10-29',amount:'-10.00'}];
const r=window.EonsReconciliation.reconcile(bank,ledger);
output.textContent=[
'MODE: '+r.mode,'EXTERNALLY VERIFIED: NO','',
'CANDIDATE MATCHES: '+r.counts.candidates,
...r.matches.map(m=>'  '+m.bankId+' ↔ '+m.ledgerId+' / '+m.evidenceStatus),
'AMBIGUOUS BANK IDS: '+(r.ambiguousBank.join(', ')||'none'),
'AMBIGUOUS LEDGER IDS: '+(r.ambiguousLedger.join(', ')||'none'),
'UNMATCHED BANK IDS: '+(r.unmatchedBank.join(', ')||'none'),
'UNMATCHED LEDGER IDS: '+(r.unmatchedLedger.join(', ')||'none'),
'','REVIEW REQUIRED: YES','AUTOMATIC POSTING: DISABLED'
].join('\n');
}catch(e){output.textContent='Cannot process sample: '+e.message;}
});
document.getElementById('reset').addEventListener('click',function(){output.textContent='Ready. No records processed.';});
})();
