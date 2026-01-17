const fs = require('fs');
const path = require('path');

const basePath = process.argv[2];
const distDir = process.argv[3] || 'dist';

if (!basePath || !basePath.startsWith('/')) {
  console.error('Usage: node scripts/patch-expo-web-base.js /base-path [dist]');
  process.exit(1);
}

const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
const distPath = path.resolve(distDir);

const replacements = [
  { from: '"/_expo/', to: `"${normalizedBase}/_expo/` },
  { from: '"/assets/', to: `"${normalizedBase}/assets/` },
  { from: '"/favicon.ico', to: `"${normalizedBase}/favicon.ico` },
];

const shouldPatch = (filePath) => filePath.endsWith('.html') || filePath.endsWith('.js');

const patchFile = (filePath) => {
  if (!shouldPatch(filePath)) return;
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = original;
  for (const { from, to } of replacements) {
    updated = updated.split(from).join(to);
  }
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
};

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else {
      patchFile(fullPath);
    }
  }
};

walk(distPath);

const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');
if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
}
