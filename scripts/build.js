
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
        const rel=p.includes('/pages/')?'../assets/eons-upload-intake.js':'assets/eons-upload-intake.js';
        s=s.replace('</body>','<script src="'+rel+'"></script></body>');
        fs.writeFileSync(p,s);
      }
    }
  }
}
inject('docs');
fs.writeFileSync('docs/.nojekyll','');
fs.writeFileSync('docs/robots.txt','User-agent: *\nDisallow: /\n');
console.log('Built docs/ for GitHub Pages with universal upload import.');
