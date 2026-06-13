
(function(){
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn)}
  function getText(sel){const el=document.querySelector(sel);return el?(el.value||el.textContent||'').trim():''}
  function allOutputs(){return Array.from(document.querySelectorAll('pre')).map((p,i)=>'OUTPUT '+(i+1)+'\n'+(p.textContent||'').trim()).filter(Boolean).join('\n\n---\n\n')}
  function uploadSummary(){
    let arr=[];
    try{arr=JSON.parse(localStorage.getItem('eons_upload_imports')||'[]')}catch(e){}
    return arr.slice(0,25).map((r,i)=>'Upload '+(i+1)+'\nName: '+r.name+'\nType: '+r.type+'\nSize: '+r.size+' bytes\nImported: '+r.timestamp+'\nStatus: '+r.status).join('\n\n---\n\n')
  }
  function chainSummary(){
    let arr=[];
    try{arr=JSON.parse(localStorage.getItem('eons_chain_records')||'[]')}catch(e){}
    return arr.slice(0,10).map((r,i)=>'Chain Record '+(i+1)+'\nRecord ID: '+r.recordId+'\nTimestamp UTC: '+r.timestampUtc+'\nPage: '+r.page+'\nHash: '+r.hash+'\nStatus: '+r.status).join('\n\n---\n\n')
  }
  function missingProof(){
    const checked=Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(x=>{
      const label=x.closest('label');
      return label?(label.textContent||'').trim():(x.id||'checked item');
    });
    return checked.length?checked.map(x=>'- '+x).join('\n'):'No missing-proof boxes checked on this page. Reviewer should still verify completeness.';
  }
  function fieldSummary(){
    const fields=[];
    document.querySelectorAll('textarea,input:not([type=file]):not([type=checkbox]),select').forEach(el=>{
      const title=el.closest('section')?.querySelector('h2')?.textContent || el.id || el.name || el.tagName;
      const value=(el.value||'').trim();
      if(value) fields.push(title+'\n'+value);
    });
    return fields.length?fields.join('\n\n---\n\n'):'No filled fields found on this page.';
  }
  function makePacket(){
    const now=new Date().toISOString();
    const title=(document.querySelector('h1')?.textContent||'EONS Evidence Packet').trim();
    return 'EONS FULL EVIDENCE PACKET\n\nGenerated UTC:\n'+now+'\n\nSource page:\n'+location.href+'\n\nPage title:\n'+title+'\n\n==============================\nFIELD / OWNER NOTE SUMMARY\n==============================\n'+fieldSummary()+'\n\n==============================\nLOCAL UPLOAD HISTORY\n==============================\n'+uploadSummary()+'\n\n==============================\nRECORD ID / EVIDENCE HASH HISTORY\n==============================\n'+chainSummary()+'\n\n==============================\nMISSING-PROOF CHECKLIST\n==============================\n'+missingProof()+'\n\n==============================\nCHECKLIST / OUTPUT AREAS\n==============================\n'+allOutputs()+'\n\n==============================\nPROFESSIONAL REVIEW STATUS\n==============================\nDraft packet only. CPA/EA/tax-attorney or proper professional review remains required before reliance. No filing, claim, credit, deduction, submission, or legal conclusion is approved by this export.\n\n==============================\nCHAIN-OF-CUSTODY NOTE\n==============================\nThis is a browser-local export created from the current visible page fields, local upload history, local hash history, selected checkboxes, and output areas. Preserve original source documents. This export is not notarization, not IRS acceptance, not court filing proof by itself, and not professional signoff.'
  }
  function downloadPacket(){
    const packet=makePacket();
    const out=document.getElementById('eonsFullPacketOut');
    if(out) out.textContent=packet;
    const blob=new Blob([packet],{type:'text/plain'});
    const a=document.createElement('a');
    const stamp=new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14);
    a.href=URL.createObjectURL(blob);
    a.download='EONS-full-evidence-packet-'+stamp+'.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function buildPanel(){
    if(document.getElementById('eons-full-packet-panel')) return;
    const card=document.createElement('section');
    card.className='card';
    card.id='eons-full-packet-panel';
    card.innerHTML='<h2>Download Full Evidence Packet</h2><p>Combine owner notes, visible checklist outputs, local upload history, Record ID/hash history, missing-proof checklist, and review status into one downloadable text packet.</p><button type="button" id="eonsFullPacketBtn">Download full evidence packet</button><pre id="eonsFullPacketOut">Waiting for full evidence packet export.</pre>';
    const main=document.querySelector('main') || document.body;
    const gate=[...main.querySelectorAll('section')].find(x=>/Review Gate|Professional Review|Boundary|Safe Rule/i.test(x.textContent||''));
    if(gate){main.insertBefore(card,gate);}else{main.appendChild(card);}
    document.getElementById('eonsFullPacketBtn').addEventListener('click',downloadPacket);
  }
  ready(buildPanel);
})();
