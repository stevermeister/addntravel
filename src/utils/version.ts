interface PackageJson {
  version: string;
  [key: string]: unknown;
}

interface VersionInfo {
  version: string;
  buildTimestamp: string;
  formatted: string;
}

// Import package.json
import pkg from '../../package.json';

// Get build timestamp
const buildTimestamp = new Date().toISOString();

// Combine version info
export const versionInfo: VersionInfo = {
  version: (pkg as PackageJson).version,
  buildTimestamp,
  // You can add more version-related info here
  get formatted() {
    return `v${this.version}`;
  },
};
