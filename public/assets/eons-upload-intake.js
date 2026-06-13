
(function(){
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn)}
  function shortText(s,n){s=String(s||'');return s.length>n?s.slice(0,n)+'\n...[trimmed preview]':s}
  function saveRecord(rec){
    try{
      const key='eons_upload_imports';
      const arr=JSON.parse(localStorage.getItem(key)||'[]');
      arr.unshift(rec);
      localStorage.setItem(key,JSON.stringify(arr.slice(0,25)));
    }catch(e){}
  }
  function findOutput(){
    return document.getElementById('out') || document.querySelector('pre') || null;
  }
  function writeOutput(text){
    const out=findOutput();
    if(out){out.textContent=text;}
  }
  function buildPanel(){
    if(document.getElementById('eons-global-upload-panel')) return;
    const card=document.createElement('section');
    card.className='card eons-upload-card';
    card.id='eons-global-upload-panel';
    card.innerHTML='<h2>Universal Evidence Upload</h2><p>Upload screenshots, PDFs, documents, spreadsheets, images, text, CSV, JSON, or other files. Copy/paste boxes still work. This static GitHub Pages version reads locally in your browser and saves a local draft import record.</p><input id="eonsFileInput" type="file" multiple style="width:100%;padding:14px;border-radius:14px;background:#fff;color:#111"><button id="eonsImportBtn" type="button">Import selected file(s)</button><p class="mini">Private mode: files are not sent to a server from this static page. Full OCR/PDF/DOC parsing and permanent storage require the encrypted backend layer.</p><pre id="eonsUploadOut">Waiting for uploaded files.</pre>';
    const main=document.querySelector('main') || document.body;
    const gate=[...main.querySelectorAll('section')].find(x=>/Professional Review Gate|Boundary|Review Gate/i.test(x.textContent||''));
    if(gate){main.insertBefore(card,gate);}else{main.appendChild(card);}
    document.getElementById('eonsImportBtn').addEventListener('click',handleFiles);
  }
  function handleFiles(){
    const input=document.getElementById('eonsFileInput');
    const files=[...(input&&input.files?input.files:[])];
    const panel=document.getElementById('eonsUploadOut');
    panel.textContent='Reading '+files.length+' file(s)...';
    const jobs=files.map(file=>new Promise(resolve=>{
      const rec={name:file.name,type:file.type||'unknown',size:file.size,lastModified:file.lastModified?new Date(file.lastModified).toISOString():'unknown',timestamp:new Date().toISOString(),mode:'local_browser_import',status:'draft_review_required'};
      if(file.type.startsWith('image/')){
        const r=new FileReader();
        r.onload=()=>{rec.preview='Image/screenshot preview available locally.';rec.dataUrlPreview=String(r.result||'').slice(0,120);resolve(rec);};
        r.onerror=()=>{rec.preview='Image read failed.';resolve(rec);};
        r.readAsDataURL(file);
      }else{
        const r=new FileReader();
        r.onload=()=>{rec.textPreview=shortText(r.result,4000);resolve(rec);};
        r.onerror=()=>{rec.textPreview='Binary or protected file. Metadata captured only. Full parsing requires backend/OCR/parser layer.';resolve(rec);};
        r.readAsText(file);
      }
    }));
    Promise.all(jobs).then(records=>{
      records.forEach(saveRecord);
      const text='EONS UNIVERSAL FILE IMPORT\n\n'+records.map((r,i)=>'File '+(i+1)+': '+r.name+'\nType: '+r.type+'\nSize: '+r.size+' bytes\nStatus: draft / review required\nPreview:\n'+(r.textPreview||r.preview||'Metadata captured only.')).join('\n\n---\n\n')+'\n\nNext classification:\n- Entity/person\n- Tax year\n- Evidence tier\n- Payment/service/FM V/provider support\n- Missing items\n- Professional review status';
      panel.textContent=text;
      writeOutput(text);
    });
  }
  ready(buildPanel);
})();
