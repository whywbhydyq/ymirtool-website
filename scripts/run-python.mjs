import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/run-python.mjs <script.py> [...args]');
  process.exit(2);
}

const localCandidates = process.platform === 'win32'
  ? [path.resolve('.venv', 'Scripts', 'python.exe')]
  : [path.resolve('.venv', 'bin', 'python')];

const candidates = [
  ...localCandidates.filter((candidate) => fs.existsSync(candidate)),
  'python3',
  'python',
];

for (const executable of candidates) {
  const result = spawnSync(executable, args, { stdio: 'inherit' });
  if (result.error?.code === 'ENOENT') continue;
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

console.error('Python 3 was not found. Install Python or create .venv in the repository root.');
process.exit(127);
