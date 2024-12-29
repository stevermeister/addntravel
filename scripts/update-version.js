import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// Get base version without timestamp
const baseVersion = packageJson.version.split('-')[0];

// Add timestamp in format YYYYMMDD.HHmm
const now = new Date();
const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/T/, '.').slice(0, 13);

packageJson.version = `${baseVersion}-${timestamp}`;

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Updated version to: ${packageJson.version}`);
