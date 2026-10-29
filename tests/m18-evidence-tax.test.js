'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {digestEvidence,compareEvidence}=require('../src/evidence-provenance');
const {selectApprovedRule}=require('../src/tax-rule-registry');
const manifest=require('../rules/registry.json');
test('evidence digest is deterministic, nonpersistent and not external verification',()=>{
 const input=Buffer.from('synthetic-evidence');
 const a=digestEvidence(input),b=digestEvidence(input);
 assert.deepEqual(a,b);
 assert.match(a.sha256,/^[a-f0-9]{64}$/);
 assert.equal(a.verifiedByExternalSource,false);
 assert.equal(compareEvidence(input,a.sha256),true);
 assert.equal(compareEvidence(Buffer.from('different'),a.sha256),false);
});
test('evidence rejects text input, empty bytes and oversized bytes',()=>{
 assert.throws(()=>digestEvidence('personal records'),TypeError);
 assert.throws(()=>digestEvidence(Buffer.alloc(0)),RangeError);
 assert.throws(()=>digestEvidence(Buffer.alloc(20*1024*1024+1)),RangeError);
 assert.throws(()=>compareEvidence(Buffer.from('a'),'invalid'),TypeError);
});
test('tax rules default to no enabled rules',()=>{
 assert.equal(manifest.schema_version,1);
 assert.deepEqual(manifest.rules,[]);
 assert.equal(selectApprovedRule(manifest,{jurisdiction:'US',taxYear:2026,ruleId:'example'}),null);
});
test('unreviewed, duplicate and incomplete tax rules fail closed',()=>{
 const base={id:'example',jurisdiction:'US',tax_year:2026,version:'1.0.0',status:'approved',
 source_url:'https://www.irs.gov/',reviewer_id:'independent-reviewer',reviewed_at:'2026-10-29T00:00:00Z'};
 const args={jurisdiction:'US',taxYear:2026,ruleId:'example'};
 assert.equal(selectApprovedRule({schema_version:1,rules:[{...base,status:'draft'}]},args),null);
 assert.equal(selectApprovedRule({schema_version:1,rules:[{...base,reviewer_id:''}]},args),null);
 assert.equal(selectApprovedRule({schema_version:1,rules:[base,base]},args),null);
 const approved=selectApprovedRule({schema_version:1,rules:[base]},args);
 assert.equal(approved.status,'approved_metadata_only');
 assert.equal('formula' in approved,false);
 assert.throws(()=>selectApprovedRule({schema_version:2,rules:[]},args),TypeError);
});
