const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const pkg = require('../package.json');

const sha = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : 'local';
const runNumber = process.env.GITHUB_RUN_NUMBER || '1';
const versionTag = `v${pkg.version}-build.${runNumber}`;

console.log(`Preparing deployment for version: ${versionTag} (${sha})`);

// 1. Write version-info.json into dist so the app can display its current version
const currentVersionInfo = {
  version: pkg.version,
  tag: versionTag,
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
  version: pkg.version,
  commit: sha,
  date: new Date().toISOString(),
  path: `/careslot/v/${versionTag}/`,
  isLatest: true,
};

// Mark older entries as not latest
versionsList = versionsList.map((v) => ({ ...v, isLatest: false }));
versionsList.unshift(newEntry);

// Keep last 15 versions
if (versionsList.length > 15) {
  versionsList = versionsList.slice(0, 15);
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

console.log(`Successfully prepared versioned deployment:`);
console.log(`- Latest deployed to /careslot/`);
console.log(`- Version archived to /careslot/v/${versionTag}/`);
console.log(`- versions.json updated with ${versionsList.length} version(s).`);

