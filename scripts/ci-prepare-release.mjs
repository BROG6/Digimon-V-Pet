import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function parseSemver(ver) {
  const clean = String(ver || '1.0.0').trim().replace(/^[vV]/, '');
  const parts = clean.split('.').map((n) => parseInt(n, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function compareSemver(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

function bumpPatch(ver) {
  let [major, minor, patch] = parseSemver(ver);
  patch += 1;
  if (patch > 9) {
    patch = 0;
    minor += 1;
  }
  return `${major}.${minor}.${patch}`;
}

function toVersionCode(ver) {
  const [major, minor, patch] = parseSemver(ver);
  return major * 100 + minor * 10 + patch;
}

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const versionJsonPath = path.join(root, 'public', 'version.json');
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const pkgVersion = pkg.version || '1.2.2';
const eventName = process.env.GITHUB_EVENT_NAME || 'push';

// Fetch remote tags if in a git repository
runGit('git fetch --tags --force');

const allTagsRaw = runGit('git tag --list "v*" --sort=-v:refname');
const allTags = allTagsRaw ? allTagsRaw.split('\n').map((t) => t.trim()).filter(Boolean) : [];
const lastTag = allTags[0] || '';
const lastTagVersion = lastTag ? lastTag.replace(/^[vV]/, '') : '';
const pkgTagExists = allTags.includes(`v${pkgVersion}`) || allTags.includes(pkgVersion);

let shouldRelease = false;
let releaseVersion = pkgVersion;
let reason = '';

if (eventName === 'workflow_dispatch') {
  shouldRelease = true;
  if (lastTagVersion && compareSemver(lastTagVersion, pkgVersion) >= 0) {
    releaseVersion = bumpPatch(lastTagVersion);
  } else if (pkgTagExists && lastTagVersion) {
    releaseVersion = bumpPatch(lastTagVersion);
  }
  reason = `Manual workflow_dispatch release v${releaseVersion}.`;
} else if (!lastTag) {
  shouldRelease = true;
  releaseVersion = pkgVersion;
  reason = `Initial GitHub release v${releaseVersion}.`;
} else if (!pkgTagExists && compareSemver(pkgVersion, lastTagVersion) > 0) {
  shouldRelease = true;
  releaseVersion = pkgVersion;
  reason = `New package.json version v${releaseVersion} (was ${lastTag}).`;
} else {
  const countStr = runGit(`git rev-list --count "${lastTag}..HEAD"`);
  const commitsSinceTag = parseInt(countStr || '0', 10) || 0;
  if (commitsSinceTag >= 2) {
    shouldRelease = true;
    const baseVer = compareSemver(lastTagVersion, pkgVersion) >= 0 ? lastTagVersion : pkgVersion;
    releaseVersion = bumpPatch(baseVer);
    reason = `${commitsSinceTag} changes since ${lastTag} — publishing every 2nd change release v${releaseVersion}.`;
  } else {
    shouldRelease = false;
    releaseVersion = lastTagVersion || pkgVersion;
    reason = `Only ${commitsSinceTag} change since ${lastTag} — skipping release until the 2nd change.`;
  }
}

const versionCode = toVersionCode(releaseVersion);

// Collect commit bullets since last tag for release notes
let commitBullets = [];
if (lastTag) {
  const logRaw = runGit(`git log "${lastTag}..HEAD" --pretty=format:"%s" --no-merges`);
  if (logRaw) {
    commitBullets = logRaw
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('Merge '))
      .slice(0, 8);
  }
}

// Synchronize package.json, public/version.json, and android/app/build.gradle for the build
if (shouldRelease) {
  if (pkg.version !== releaseVersion) {
    pkg.version = releaseVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  }

  if (fs.existsSync(versionJsonPath)) {
    const vj = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));
    vj.versionName = releaseVersion;
    vj.versionCode = versionCode;
    vj.releaseDate = new Date().toISOString().slice(0, 10);
    vj.apkFileName = `digipet-v${releaseVersion}.apk`;
    if (commitBullets.length > 0 && releaseVersion !== pkgVersion) {
      vj.releaseName = `DigiPet v${releaseVersion} Auto-Release`;
      vj.changelog = commitBullets;
    }
    fs.writeFileSync(versionJsonPath, JSON.stringify(vj, null, 2) + '\n', 'utf-8');
  }

  if (fs.existsSync(gradlePath)) {
    let gradle = fs.readFileSync(gradlePath, 'utf-8');
    gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
    gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${releaseVersion}"`);
    fs.writeFileSync(gradlePath, gradle, 'utf-8');
  }
}

let releaseNotes = '';
if (fs.existsSync(versionJsonPath)) {
  try {
    const vj = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));
    if (Array.isArray(vj.changelog) && vj.changelog.length > 0) {
      releaseNotes = vj.changelog.map((c) => `- ${c}`).join('\n');
    }
  } catch {}
}
if (!releaseNotes && commitBullets.length > 0) {
  releaseNotes = commitBullets.map((c) => `- ${c}`).join('\n');
}
if (!releaseNotes) {
  releaseNotes = `- Release v${releaseVersion} build with latest Digivice, AI chat, and mini-game updates.`;
}

console.log(`[CI Release] ${reason}`);
console.log(`[CI Release] should_release=${shouldRelease}, tag=v${releaseVersion}, versionCode=${versionCode}`);

if (process.env.GITHUB_OUTPUT) {
  const out = [
    `should_release=${shouldRelease}`,
    `version=${releaseVersion}`,
    `tag=v${releaseVersion}`,
    `version_code=${versionCode}`,
    `notes<<RELEASE_NOTES_EOF`,
    releaseNotes,
    `RELEASE_NOTES_EOF`,
  ].join('\n');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, out + '\n', 'utf-8');
}
