import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'static/script/ymir-adsense-page-policy.json'), 'utf8'));
const approvedToolSlugs = new Set(policy.approvedToolSlugs || []);
const reportPath = path.join(root, 'ADSENSE_CONTENT_QUALITY_AUDIT_REPORT.json');

function collectHtml(dir = root) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.next') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(abs));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path.relative(root, abs).replace(/\\/g, '/'));
  }
  return files;
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(text) {
  return (text.match(/[A-Za-z0-9_]+|[\u4e00-\u9fff]/g) || []).length;
}

const issues = [];
const pages = [];

for (const rel of collectHtml()) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const text = visibleText(html);
  const words = wordCount(text);
  const toolMatch = rel.match(/^([^/]+)\/index\.html$/);
  const isApprovedTool = !!toolMatch && approvedToolSlugs.has(toolMatch[1]);
  const hasAdScript = /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/.test(html);
  const hasNoindex = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*noindex,\s*follow)[^>]*>/i.test(html);
  const genericCopy = [
    'Paste input, load the sample if needed, choose an action, review the output, and copy the result.',
    'Runs quickly.'
  ].filter((needle) => html.includes(needle));

  pages.push({ page: rel, words, isApprovedTool, hasAdScript, hasNoindex, genericCopy });

  if (rel === '404.html' && hasAdScript) issues.push({ page: rel, issue: '404-loads-adsense-script' });
  if (isApprovedTool && words < 260) issues.push({ page: rel, issue: 'approved-tool-too-thin', words });
  if (isApprovedTool && genericCopy.length) issues.push({ page: rel, issue: 'approved-tool-generic-copy', genericCopy });
  if (toolMatch && !isApprovedTool && !hasNoindex) issues.push({ page: rel, issue: 'non-approved-tool-indexable' });
  if (toolMatch && !isApprovedTool && hasAdScript) issues.push({ page: rel, issue: 'non-approved-tool-loads-adsense-script' });
}

const approved = pages.filter((page) => page.isApprovedTool);
const report = {
  checkedAt: new Date().toISOString(),
  approvedToolCount: approved.length,
  approvedToolMinWords: approved.length ? Math.min(...approved.map((page) => page.words)) : 0,
  htmlFiles: pages.length,
  issues,
  pass: issues.length === 0
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.pass ? 0 : 1;
