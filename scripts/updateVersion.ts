import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

function incrementPatchVersion(version: string): string {
  const [major, minor, patch] = version.split('.');
  return `${major}.${minor}.${parseInt(patch) + 1}`;
}

async function updateVersion(): Promise<void> {
  try {
    // Read package.json
    const packagePath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(await fs.promises.readFile(packagePath, 'utf8')) as PackageJson;

    // Increment patch version
    pkg.version = incrementPatchVersion(pkg.version);

    // Write updated package.json
    await fs.promises.writeFile(packagePath, JSON.stringify(pkg, null, 2) + '\n');

    console.log(`Version updated to ${pkg.version}`);
  } catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
  }
}

updateVersion();
