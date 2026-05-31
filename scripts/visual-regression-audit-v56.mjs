import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const htmlFiles = [];
function walk(dir){ for(const item of fs.readdirSync(dir,{withFileTypes:true})){ const p=path.join(dir,item.name); if(item.isDirectory()){ if(['.git','node_modules','.next'].includes(item.name)) continue; walk(p);} else if(item.name.endsWith('.html')) htmlFiles.push(p);} }
walk(root);
let failures=[];
let toolPages=0, v56Css=0, themeBefore=0, actions=0, privacySections=0, unsafeText=0;
for(const file of htmlFiles){ const html=fs.readFileSync(file,'utf8'); const rel=path.relative(root,file); const isTool=/<main\b[^>]*data-ymir-tool=/.test(html); if(/ymir-developer-aesthetics-v56\.css/.test(html)) v56Css++; else failures.push(`${rel}: missing v56 css`); if(new RegExp('ymir-' + 'privacy' + '-note').test(html)) { privacySections++; failures.push(`${rel}: privacy note class present`);} if(new RegExp('Safe use ' + 'note|' + '安全使用' + '提示').test(html)) { unsafeText++; failures.push(`${rel}: obsolete safety heading present`);} if(/ymir-topbar-actions/.test(html)) actions++; else failures.push(`${rel}: missing topbar actions`); const themeIdx=html.indexOf('ymir-theme.js'); const cssIdx=html.search(/<link\b(?=[^>]*rel=["']stylesheet["'])/); if(themeIdx>-1 && cssIdx>-1 && themeIdx<cssIdx) themeBefore++; else failures.push(`${rel}: theme script not before first stylesheet`); if(isTool){ toolPages++; if(/<section\b[^>]*ymir-hero/.test(html)) failures.push(`${rel}: tool hero present`); } }
const report={pass:failures.length===0, htmlFiles:htmlFiles.length, toolPages, v56Css, themeBefore, topbarActions:actions, privacySections, unsafeText, failures:failures.slice(0,50)};
fs.writeFileSync(path.join(root,'V56_VISUAL_RESET_AUDIT_REPORT.json'), JSON.stringify(report,null,2));
if(!report.pass){ console.error(JSON.stringify(report,null,2)); process.exit(1); }
console.log(JSON.stringify(report,null,2));
