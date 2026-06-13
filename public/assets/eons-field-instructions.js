
(function(){
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn)}
  const helpMap=[
    {sel:'textarea',text:'Use this box to type or paste the record, note, receipt description, payment details, service details, or case facts. Keep it simple. Include who, what, when, amount, source, and what proof you have.'},
    {sel:'input[type=file]',text:'Use this upload button to choose screenshots, PDFs, documents, spreadsheets, images, or other files from your phone or computer. Static mode reads locally in your browser. Permanent storage requires the future encrypted vault.'},
    {sel:'input:not([type=file])',text:'Use this field for short information like a name, date, amount, year, title, category, or status. Do not enter passwords, tokens, or secrets.'},
    {sel:'button',text:'Tap this button to create a local draft, checklist, packet, preview, or gate status. It does not submit anything outside the platform.'},
    {sel:'pre',text:'This output area shows the system draft result. Review it carefully. Anything shown here is a placeholder until verified and professionally reviewed.'}
  ];
  function makeHelp(text){
    const p=document.createElement('p');
    p.className='eons-field-help';
    p.textContent=text;
    return p;
  }
  function addHelp(){
    helpMap.forEach(item=>{
      document.querySelectorAll(item.sel).forEach(el=>{
        if(el.dataset.eonsHelpAdded==='yes') return;
        el.dataset.eonsHelpAdded='yes';
        el.insertAdjacentElement('afterend',makeHelp(item.text));
      });
    });
    document.querySelectorAll('.card h2,.hero h1').forEach(h=>{
      if(h.dataset.eonsHeaderHelp==='yes') return;
      h.dataset.eonsHeaderHelp='yes';
      const t=(h.textContent||'').toLowerCase();
      let msg='';
      if(t.includes('evidence')) msg='This section is for organizing proof. Add real records only when you have them. Missing proof should stay marked as missing.';
      else if(t.includes('review')) msg='This section is for professional review status. Do not treat a draft as approved until CPA, EA, tax attorney, or proper reviewer signs off.';
      else if(t.includes('gate')) msg='This section blocks unsafe action. If proof, approval, or review is missing, the answer should remain blocked.';
      else if(t.includes('upload')) msg='This section lets you import files locally. It does not create permanent secure storage yet.';
      else if(t.includes('intake')) msg='This section is where new records start. Enter facts plainly, then classify them before relying on them.';
      else if(t.includes('packet')) msg='This section prepares a review packet draft. It is not a final filing, claim, or legal conclusion.';
      else if(t.includes('console')) msg='This section is the owner control area. Use it to review, organize, and decide what needs more proof.';
      if(msg) h.insertAdjacentElement('afterend',makeHelp(msg));
    });
  }
  ready(addHelp);
})();
