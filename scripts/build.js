
const fs=require('fs');
fs.rmSync('docs',{recursive:true,force:true});
fs.cpSync('public','docs',{recursive:true});
function inject(dir){
  for(const name of fs.readdirSync(dir)){
    const p=dir+'/'+name;
    const st=fs.statSync(p);
    if(st.isDirectory()) inject(p);
    if(st.isFile() && p.endsWith('.html')){
      let s=fs.readFileSync(p,'utf8');
      const scripts=[];
      if(scripts.length){
        s=s.replace('</body>',scripts.map(x=>'<script src="'+x+'"></script>').join('')+'</body>');
        fs.writeFileSync(p,s);
      }
    }
  }
}
inject('docs');
fs.writeFileSync('docs/.nojekyll','');
fs.writeFileSync('docs/robots.txt','User-agent: *\nDisallow: /\n');
console.log('Built docs/ with upload, instructions, record hash, and full packet export layer.');
