import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function assert(condition, message) { if (!condition) { throw new Error(message); } }

const tool = read('static/script/tool.js');
const toolsLib = read('static/script/tools-lib.js');
const json2yaml = read('static/script/pcjs/json2yaml.js');
const tool2java = read('static/script/pcjs/tool2java.js');
const pcjsPinyin = read('static/script/pcjs/pinyin.js');
const pcjsRandom = read('static/script/pcjs/random.js');
const pcjsHtmltable = read('static/script/pcjs/htmltable.js');
const messageJs = read('static/script/json/message.js');

const ymirTools = read('static/script/ymir-tools.js');
const reloadJs = read('static/script/pcjs/reload.js');
const worldtimeInline = read('static/script/page-inline/worldtime-index-01-cf41bb61.js');

const hightout = read('static/script/hightout.js');
const markdown = read('static/script/pcjs/markdown.min.js');
const prettify = read('static/script/pcjs/prettify.js');
const yaml = read('static/script/pcjs/yaml.js');
const cjson = read('static/script/json/cjson.js');
const jsonsrc = read('static/script/json/jsonsrc.js');
const password = read('static/script/pcjs/password.js');
const subnet = read('static/script/pcjs/subnetmask.js');
const htmlFiles = fs.readdirSync('.', { recursive: true })
  .filter((path) => path.endsWith('.html'))
  .map((path) => read(path));

assert(tool.includes('function ymirSafeSetText'), 'safe text helper must exist');
assert(tool.includes("frame.setAttribute('sandbox', 'allow-scripts')"), 'runjs preview must use a sandboxed iframe');
assert(!toolsLib.includes("win.document.write($('#content').val())"), 'legacy HTML preview must not document.write user input into same-origin windows');
assert(!htmlFiles.some((html) => html.includes('win.document.write($("#content").val())')), 'RunJS inline preview must not document.write user input into same-origin windows');
assert(htmlFiles.some((html) => html.includes('ymir-runjs-preview') && html.includes('sandbox')), 'RunJS page must render previews in a sandboxed iframe');
assert(!htmlFiles.some((html) => html.includes('https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css')), 'pages must use local Bootstrap CSS instead of third-party CDN CSS');
assert(!json2yaml.includes("$('#format-message').removeClass('alert-danger').addClass('alert-success').html"), 'JSON/YAML status must not use .html() for parser messages');
assert(tool2java.includes('appendJavaResult(v.name, beanText'), 'JSON to Java output must render generated code with DOM text nodes');
assert(!tool2java.includes('<code class="java">' + beanText), 'JSON to Java output must not concatenate generated code into HTML');
assert(pcjsPinyin.includes('function pinyinEscapeHtml'), 'Pinyin output must encode user text before adding controlled markup');
assert(!pcjsRandom.includes("$('#randomNumbers').html($('#randomNumbers').html()"), 'Random number output must not rebuild result with .html()');
assert(pcjsHtmltable.includes("frame.setAttribute('sandbox','')"), 'HTML table preview must render in a sandboxed iframe');
assert(!messageJs.includes('$(container).html(msgContent)'), 'legacy message overlay must not render caller content as HTML');
assert(!messageJs.includes('window.set' + 'Interval("addDot"'), 'legacy message overlay must not use string setInterval');

assert(hightout.includes('textContent = String(Bd1'), 'global hightout must render generated code as inert text');
assert(!markdown.includes('new Function') && !markdown.includes('ev' + 'al('), 'Markdown converter must not use eval/new Function');
assert(prettify.includes('compatibility shim') && !prettify.includes('innerHTML'), 'legacy prettify must remain a no-op shim without HTML parsing');
assert(!yaml.includes('new Function'), 'YAML bundle must not use new Function global fallback');
assert(cjson.includes('ReplaceJsonMarkup') && !cjson.includes('Canvas").innerHTML'), 'classic JSON view must not write result through innerHTML');
assert(jsonsrc.includes('replaceJsonTargetMarkup') && !jsonsrc.includes("$('#json-target').html"), 'JSON source view must not write result through jQuery .html()');
assert(password.includes('createTextNode(password)'), 'password output must render generated values as text nodes');
assert(subnet.includes('renderSubnetList(str)') && !subnet.includes('append("<script'), 'subnet list must not inject inline script strings');

assert(!ymirTools.includes("Function('\"use strict\""), 'calculator must not evaluate expressions with Function(...)');
assert(ymirTools.includes('function evaluateBasicExpression'), 'calculator must use the local parser');
assert(!reloadJs.includes('set' + 'Interval("refresh()"'), 'refresh tool must not use string setInterval');
assert(reloadJs.includes('setInterval(refresh'), 'refresh tool must use a function reference timer');
assert(!worldtimeInline.includes('set' + 'Timeout("GetTime()"'), 'world time tool must not use string setTimeout');
assert(worldtimeInline.includes('setTimeout(GetTime'), 'world time tool must use a function reference timer');
assert(tool.includes('var setJS = function (jsArr, callback)'), 'dynamic loader must support serial callback loading');
assert(tool.includes('script.async = false'), 'dynamic loader should request ordered script execution');


const listenerFiles = fs.readdirSync('static/script/page-listeners')
  .filter((path) => path.endsWith('.js'));
assert(listenerFiles.length > 0, 'page listener files must exist');
for (const file of listenerFiles) {
  const listener = read(`static/script/page-listeners/${file}`);
  assert(!listener.includes('YmirCspCompat.runCode'), `${file} listener must not depend on YmirCspCompat.runCode`);
  assert(!listener.includes('var runner = window.YmirCspCompat'), `${file} listener must not use the old runCode bridge`);
  assert(listener.includes('Page-level CSP-safe direct listeners'), `${file} listener must be a page-level direct listener`);
}
assert(!fs.existsSync('static/script/csp-compat-events.js'), 'global csp compatibility guard must be removed after page-local listener migration');
assert(!htmlFiles.some((html) => html.includes('data-jsvoid="true"') || html.includes("data-jsvoid='true'")), 'legacy data-jsvoid placeholder markers must be removed from HTML');
assert(!htmlFiles.some((html) => html.includes('/static/script/csp-compat-events.js')), 'HTML pages must not load the removed csp compatibility guard');
assert(listenerFiles.every((file) => read(`static/script/page-listeners/${file}`).includes("el.getAttribute('href') === '#'") || !read(`static/script/page-listeners/${file}`).includes("eventName === 'click'")), 'click listeners for placeholder anchors must prevent default by local href checks, not global guards');



// Old-library isolation checks.
assert(!htmlFiles.some((html) => html.includes('jquery-1.7.1.min.js')), 'legacy jQuery 1.7.1 must not be loaded by any page');
assert(!fs.existsSync('static/script/jquery-1.7.1.min.js'), 'legacy jQuery 1.7.1 file should be removed after formatfilter migration');
assert(!htmlFiles.some((html) => html.includes('/static/script/huaban/zepto.min.js')), 'tuya page must not load Zepto after canvas script migration');
assert(!fs.existsSync('static/script/huaban/zepto.min.js'), 'Zepto should be removed after vanilla tuya controls migration');
assert(read('static/script/pcjs/htmlfilter.js').includes(".prop(\"checked\"") || read('static/script/pcjs/htmlfilter.js').includes(".prop('checked'"), 'formatfilter must use prop checked state with current jQuery');
assert(read('static/script/huaban/ga.js').includes('querySelectorAll') && !read('static/script/huaban/ga.js').includes('$(function'), 'tuya ga.js must use vanilla DOM controls instead of Zepto/jQuery');
assert(read('static/script/page-inline/editor-index-01-ee3ae585.js').includes('allowImageRemote: false'), 'KindEditor page must disable remote image insertion surface');
assert(!read('static/script/page-inline/editor-index-01-ee3ae585.js').includes("'flash'"), 'KindEditor toolbar must not expose flash insertion');
assert(!read('static/script/page-inline/editor-index-01-ee3ae585.js').includes("'media'"), 'KindEditor toolbar must not expose media insertion');
for (const formatter of ['formatcs-index-01-cf4651cd.js', 'formatjava-index-01-b3826779.js', 'formatperl-index-01-66b94199.js', 'formatpy-index-01-b3826779.js', 'formatruby-index-01-b5aad69e.js']) {
  const body = read(`static/script/page-inline/${formatter}`);
  assert(!body.includes('sanitytest.js'), `${formatter} must not load unused CodeMirror sanity tests`);
  assert(!body.includes('p_a_c_k_e_r_unpacker.js') && !body.includes('myobfuscate_unpacker.js') && !body.includes('javascriptobfuscator_unpacker.js'), `${formatter} must not load optional unpacker helpers by default`);
}
assert(read('hexrgb/index.html').includes('/static/style/page-hexrgb.css'), 'hexrgb page must load its migrated swatch stylesheet');
assert(!read('hexrgb/index.html').includes('style="background-color: rgb('), 'hexrgb color table swatches must not use inline background-color styles');


// Inline style cleanup checks.
assert(htmlFiles.every((html) => !/<[A-Za-z][^>]*\sstyle\s*=/.test(html)), 'HTML pages must not use inline style attributes after style migration');
assert(htmlFiles.every((html) => !/<style(?:\s+[^>]*)?>/i.test(html)), 'HTML pages must not contain inline style blocks after style migration');
assert(htmlFiles.some((html) => html.includes('/static/style/inline-style-migration.css')), 'migrated legacy pages must load the generated inline-style migration stylesheet');
assert(read('404.html').includes('/static/style/page-404.css'), '404 page must load its external stylesheet');
assert(read('bootstrapicon/index.html').includes('/static/style/page-bootstrapicon.css'), 'Bootstrap icon page must load its external stylesheet');
assert(read('tuya/index.html').includes('/static/style/page-tuya.css'), 'Tuya page must load its external stylesheet');
assert(!read('htmltable/index.html').includes('<style type="text/css">table.tftable'), 'HTML table page must not ship a live inline preview style block');


// CSP report-only rollout checks.
const vercelConfig = read('vercel.json');
const netlifyConfig = read('netlify.toml');
assert(fs.existsSync('api/csp-report.js'), 'Vercel CSP report endpoint must exist');
assert(fs.existsSync('netlify/functions/csp-report.js'), 'Netlify CSP report fallback must exist');
assert(fs.existsSync('scripts/csp-policy.mjs'), 'shared CSP observation policy must exist');
assert(fs.existsSync('scripts/csp-observe-server.mjs'), 'local CSP observation server must exist');
assert(fs.existsSync('scripts/csp-browser-observe.mjs'), 'local browser CSP observer must exist');
assert(fs.existsSync('tests/csp-observation.spec.mjs'), 'Playwright CSP observation spec must exist');
assert(fs.existsSync('CSP_ROLLOUT_PLAN.md'), 'CSP rollout plan must exist');
assert(vercelConfig.includes('Content-Security-Policy-Report-Only'), 'Vercel must remain report-only during observation phase');
assert(!vercelConfig.includes('"key": "Content-Security-Policy"'), 'Vercel must not switch to enforced CSP yet');
assert(vercelConfig.includes('report-uri /api/csp-report'), 'Vercel report-only CSP must send report-uri reports');
assert(vercelConfig.includes('report-to ymir-csp-report'), 'Vercel report-only CSP must include report-to group');
assert(vercelConfig.includes('Reporting-Endpoints'), 'Vercel must define Reporting-Endpoints for CSP observation');
assert(vercelConfig.includes('Report-To'), 'Vercel must define legacy Report-To for CSP observation');
assert(!vercelConfig.includes("style-src 'self' 'unsafe-inline'"), 'Report-only CSP should observe style-src without unsafe-inline');
assert(netlifyConfig.includes('Content-Security-Policy-Report-Only'), 'Netlify must remain report-only during observation phase');
assert(netlifyConfig.includes('from = "/api/csp-report"'), 'Netlify must route /api/csp-report to its function fallback');
assert(read('api/csp-report.js').includes('sanitizeReport'), 'CSP report endpoint must sanitize logged payloads');
assert(read('scripts/csp-browser-observe.mjs').includes('securitypolicyviolation'), 'browser observer must collect securitypolicyviolation events');

console.log('security regression checks passed');
