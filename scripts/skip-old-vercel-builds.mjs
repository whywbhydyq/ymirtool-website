const sha = process.env.VERCEL_GIT_COMMIT_SHA;
const ref = process.env.VERCEL_GIT_COMMIT_REF;
const owner = process.env.VERCEL_GIT_REPO_OWNER;
const repo = process.env.VERCEL_GIT_REPO_SLUG;

function proceed(reason) {
  console.log(`${reason} Proceeding with build.`);
  process.exit(1);
}

function skip(reason) {
  console.log(`${reason} Skipping old Vercel build.`);
  process.exit(0);
}

if (!sha || !ref || !owner || !repo) {
  proceed('Missing Vercel Git metadata.');
}

try {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'ymirtool-vercel-build-guard'
    }
  });

  if (!response.ok) {
    proceed(`GitHub latest commit check failed with HTTP ${response.status}.`);
  }

  const latest = await response.json();
  const latestSha = latest && latest.sha;

  if (!latestSha) {
    proceed('GitHub latest commit response did not include a sha.');
  }

  if (latestSha !== sha) {
    skip(`Current commit ${sha} is not latest ${latestSha} on ${ref}.`);
  }

  proceed(`Commit ${sha} is latest for ${ref}.`);
} catch (error) {
  proceed(`GitHub latest commit check errored: ${error && error.message ? error.message : error}.`);
}
