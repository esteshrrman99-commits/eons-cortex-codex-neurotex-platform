
(function(){
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn)}
  function textFromPage(){
    const parts=[];
    document.querySelectorAll('textarea,input:not([type=file]),select,pre').forEach(el=>{
      let label='';
      const h=el.closest('section')?.querySelector('h2')?.textContent || el.id || el.name || el.tagName;
      if(el.type==='file') return;
      if(el.tagName==='SELECT') label=h+': '+el.value;
      else label=h+': '+(el.value || el.textContent || '');
      if(label.trim()) parts.push(label);
    });
    return parts.join('\n---\n');
  }
  async function sha256(text){
    const data=new TextEncoder().encode(text);
    const digest=await crypto.subtle.digest('SHA-256',data);
    return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function saveRecord(rec){
    try{
      const key='eons_chain_records';
      const arr=JSON.parse(localStorage.getItem(key)||'[]');
      arr.unshift(rec);
      localStorage.setItem(key,JSON.stringify(arr.slice(0,50)));
    }catch(e){}
  }
  function show(text){
    let out=document.getElementById('eonsChainOut');
      out=document.createElement('pre');
      out.id='eonsChainOut';
      const panel=document.getElementById('eons-chain-panel') || document.querySelector('main') || document.body;
      panel.appendChild(out);
    }
    out.textContent=text;
  }
  async function generateRecord(){
    const now=new Date().toISOString();
    const page=location.pathname;
    const base=textFromPage() || 'No packet text entered yet.';
    const hash=await sha256(page+'\n'+now+'\n'+base);
    const shortHash=hash.slice(0,16).toUpperCase();
    const recordId='EONS-'+now.replace(/[-:.TZ]/g,'').slice(0,14)+'-'+shortHash;
    const rec={recordId,timestampUtc:now,page,hash,status:'draft_chain_of_custody_review_required'};
    saveRecord(rec);
    const text='EONS RECORD ID + EVIDENCE HASH\n\nRecord ID:\n'+recordId+'\n\nTimestamp UTC:\n'+now+'\n\nBrowser SHA-256 hash:\n'+hash+'\n\nPage:\n'+page+'\n\nChain-of-custody note:\nThis is a browser-local draft proof record. It records the current visible local packet fields and output text. It is not a notarized record, not official evidence by itself, and not professional approval. Preserve source documents and obtain professional review.\n\nStatus:\nDRAFT / REVIEW REQUIRED';
    show(text);
    try{navigator.clipboard.writeText(text)}catch(e){}
  }
  function buildPanel(){
    if(document.getElementById('eons-chain-panel')) return;
    const card=document.createElement('section');
    card.className='card';
    card.id='eons-chain-panel';
    card.innerHTML='<h2>Record ID + Evidence Hash</h2><p>Create a timestamped local record ID, browser SHA-256 hash, and chain-of-custody note for the current draft packet before professional review.</p><button type="button" id="eonsHashBtn">Generate record ID + hash</button><pre id="eonsChainOut">Waiting for record hash.</pre>';
    const main=document.querySelector('main') || document.body;
    const gate=[...main.querySelectorAll('section')].find(x=>/Review Gate|Professional Review|Boundary|Safe Rule/i.test(x.textContent||''));
    if(gate){main.insertBefore(card,gate);}else{main.appendChild(card);}
    document.getElementById('eonsHashBtn').addEventListener('click',generateRecord);
  }
  ready(buildPanel);
})();
