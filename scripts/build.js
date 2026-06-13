
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
        const tags=scripts.map(x=>'<script src="'+x+'"></script>').join('');
        s=s.replace('</body>',tags+'</body>');
        fs.writeFileSync(p,s);
      }
    }
  }
}
inject('docs');
fs.writeFileSync('docs/.nojekyll','');
fs.writeFileSync('docs/robots.txt','User-agent: *\nDisallow: /\n');
console.log('Built docs/ with upload layer and simple field instructions.');
