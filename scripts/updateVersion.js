import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Increment patch version
const [major, minor, patch] = pkg.version.split('.');
pkg.version = `${major}.${minor}.${parseInt(patch) + 1}`;

// Write updated package.json
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`Version updated to ${pkg.version}`);
