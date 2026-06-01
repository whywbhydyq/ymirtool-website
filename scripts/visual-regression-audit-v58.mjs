import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const htmlFiles = [];
function walk(dir){ for(const item of fs.readdirSync(dir,{withFileTypes:true})){ const p=path.join(dir,item.name); if(item.isDirectory()){ if(['.git','node_modules','.next'].includes(item.name)) continue; walk(p);} else if(item.name.endsWith('.html')) htmlFiles.push(p);} }
walk(root);
const css = fs.readFileSync(path.join(root,'static/style/ymir-developer-aesthetics-v58.css'),'utf8');
const render = fs.readFileSync(path.join(root,'static/script/ymir-vue-render-helpers.js'),'utf8');
let failures=[];
let toolPages=0, v58Css=0, themeBefore=0, actions=0, privacySections=0, unsafeText=0;
for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8');
  const rel=path.relative(root,file).replace(/\\/g,'/');
  const isTool=/<main\b[^>]*data-ymir-tool=/.test(html);
  if(/ymir-developer-aesthetics-v58\.css/.test(html)) v58Css++; else failures.push(`${rel}: missing v58 css`);
  if(new RegExp('ymir-' + 'privacy' + '-note').test(html)) { privacySections++; failures.push(`${rel}: privacy note class present`); }
  if(new RegExp('Safe use ' + 'note|' + '安全使用' + '提示').test(html)) { unsafeText++; failures.push(`${rel}: obsolete safety heading present`); }
  if(/ymir-topbar-actions/.test(html)) actions++; else failures.push(`${rel}: missing topbar actions`);
  const themeIdx=html.indexOf('ymir-theme.js');
  const cssIdx=html.search(/<link\b(?=[^>]*rel=["']stylesheet["'])/i);
  if(themeIdx>-1 && cssIdx>-1 && themeIdx<cssIdx) themeBefore++; else failures.push(`${rel}: theme script not before first stylesheet`);
  if(isTool){
    toolPages++;
    if(/<section\b[^>]*ymir-hero/.test(html)) failures.push(`${rel}: tool hero present`);
  }
}
const cssChecks={
  hasActualLineGutterCss:/\.ymir-vue-line-gutter/.test(css),
  hasEditorInputCss:/\.ymir-vue-editor-input/.test(css),
  hasEditorStatusbarCss:/\.ymir-vue-editor-statusbar/.test(css),
  hasStrictActionDock:/v58 strict tool page visual interaction control/.test(css) && /\.ymir-vue-actions/.test(css),
  noWrongLineRailOnly: !/ymir-vue-line-rail/.test(css) || /ymir-vue-line-gutter/.test(css),
  hasPrimaryContrast:/--ymir-v58-primary:\s*#0f172a/.test(css)
};
for(const [key, ok] of Object.entries(cssChecks)) if(!ok) failures.push(`css check failed: ${key}`);
const renderChecks={
  editorResizeNone:/resize:\s*'none'/.test(render),
  localizedEditable:/可编辑/.test(render) && /Readonly/.test(render),
  statusbarTokenClass:/ymir-vue-editor-token/.test(render)
};
for(const [key, ok] of Object.entries(renderChecks)) if(!ok) failures.push(`render helper check failed: ${key}`);
const report={pass:failures.length===0, htmlFiles:htmlFiles.length, toolPages, v58Css, themeBefore, topbarActions:actions, privacySections, unsafeText, cssChecks, renderChecks, failures:failures.slice(0,80)};
fs.writeFileSync(path.join(root,'V58_STRICT_TOOL_VISUAL_AUDIT_REPORT.json'), JSON.stringify(report,null,2)+'\n');
if(!report.pass){ console.error(JSON.stringify(report,null,2)); process.exit(1); }
console.log(JSON.stringify(report,null,2));
