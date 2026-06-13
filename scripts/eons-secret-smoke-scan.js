#!/usr/bin/env node
const fs=require("fs");
const cp=require("child_process");
const patterns=["SUPABASE_SERVICE_ROLE_KEY=","database_password","JWT_SECRET=","PRIVATE KEY","BEGIN RSA PRIVATE KEY","BEGIN OPENSSH PRIVATE KEY"];
const ignoreDirs=new Set([".git","node_modules","docs","public"]);
function walk(dir,out=[]){for(const f of fs.readdirSync(dir)){const p=dir+"/"+f;if(ignoreDirs.has(f))continue;const st=fs.statSync(p);if(st.isDirectory())walk(p,out);else out.push(p)}return out}
let hits=[];
for(const f of walk(".")){if(!/\.(js|json|md|sql|txt|example|gitignore)$/i.test(f))continue;let s="";try{s=fs.readFileSync(f,"utf8")}catch(e){continue}for(const pat of patterns){if(s.includes(pat)&&!f.includes("env-templates")&&!f.includes("SECRET")&&!f.includes("DENYLIST"))hits.push(f+" :: "+pat)}}
let status=cp.execSync("git status --short",{encoding:"utf8"});
console.log("EONS_SECRET_SCAN_START");
console.log(hits.length?"FAIL potential secret patterns found:\\n"+hits.join("\\n"):"PASS no obvious secret values found");
console.log("GIT_STATUS_SHORT");
console.log(status.trim()||"clean");
console.log("EONS_SECRET_SCAN_END");
process.exit(hits.length?1:0);
