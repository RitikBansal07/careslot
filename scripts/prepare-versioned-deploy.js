const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const sha = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : 'local';
const runNumber = process.env.GITHUB_RUN_NUMBER || '1';
const commitMsg = (process.env.COMMIT_MESSAGE || '').toLowerCase();
const bumpInput = (process.env.BUMP_TYPE || 'auto').toLowerCase();

// Parse current semver (major.minor.patch)
const [majorStr, minorStr, patchStr] = (pkg.version || '1.0.0').split('.');
let major = parseInt(majorStr, 10) || 1;
let minor = parseInt(minorStr, 10) || 0;
let patch = parseInt(patchStr, 10) || 0;

let isMajorBump = false;
let isMinorBump = false;

// 1. Check if user requested a MAJOR version bump
if (
  bumpInput === 'major' ||
  commitMsg.includes('[major]') ||
  commitMsg.includes('bump: major') ||
  commitMsg.includes('release: major')
) {
  major += 1;
  minor = 0;
  patch = 0;
  isMajorBump = true;
  console.log(`🚀 User requested MAJOR version bump -> ${major}.${minor}.${patch}`);
} else if (
  bumpInput === 'minor' ||
  commitMsg.includes('[minor]') ||
  commitMsg.includes('bump: minor')
) {
  minor += 1;
  patch = 0;
  isMinorBump = true;
  console.log(`📦 User requested MINOR version bump -> ${major}.${minor}.${patch}`);
}

const effectiveVersion = `${major}.${minor}.${patch}`;
// Automatically updates version on every build while preserving user major/minor choice
const versionTag = `v${effectiveVersion}-build.${runNumber}`;

console.log(`Preparing deployment for: ${versionTag} (Commit: ${sha})`);

// Update package.json version if a major or minor bump occurred
if (isMajorBump || isMinorBump) {
  pkg.version = effectiveVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

// 1. Write version-info.json into dist so the app displays its active version
const currentVersionInfo = {
  version: effectiveVersion,
  tag: versionTag,
  major,
  minor,
  patch,
  isMajorBump,
  commit: sha,
  builtAt: new Date().toISOString(),
};
fs.writeFileSync(
  path.join(distDir, 'version-info.json'),
  JSON.stringify(currentVersionInfo, null, 2)
);

// 2. Read or initialize versions.json
const versionsFile = path.join(distDir, 'versions.json');
let versionsList = [];

if (fs.existsSync(versionsFile)) {
  try {
    versionsList = JSON.parse(fs.readFileSync(versionsFile, 'utf8'));
  } catch (e) {
    versionsList = [];
  }
}

// Prepend current version entry
const newEntry = {
  tag: versionTag,
  version: effectiveVersion,
  commit: sha,
  isMajor: isMajorBump,
  date: new Date().toISOString(),
  path: `/careslot/v/${versionTag}/`,
  isLatest: true,
};

// Mark older entries as not latest
versionsList = versionsList.map((v) => ({ ...v, isLatest: false }));
versionsList.unshift(newEntry);

// Keep last 20 version snapshots
if (versionsList.length > 20) {
  versionsList = versionsList.slice(0, 20);
}

fs.writeFileSync(versionsFile, JSON.stringify(versionsList, null, 2));

// 3. Create versioned subfolder: dist/v/<versionTag>/
const versionedDir = path.join(distDir, 'v', versionTag);
fs.mkdirSync(versionedDir, { recursive: true });

// Copy index.html and metadata to versionedDir
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(versionedDir, 'index.html'));
if (fs.existsSync(path.join(distDir, 'metadata.json'))) {
  fs.copyFileSync(path.join(distDir, 'metadata.json'), path.join(versionedDir, 'metadata.json'));
}

console.log(`✅ Versioned deployment prepared:`);
console.log(`   - Latest served at: /careslot/`);
console.log(`   - Historical snapshot archived at: /careslot/v/${versionTag}/`);
console.log(`   - versions.json updated with ${versionsList.length} total releases.`);
