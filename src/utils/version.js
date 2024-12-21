import pkg from '../../package.json';

// Get build timestamp
const buildTimestamp = new Date().toISOString();

// Combine version info
export const versionInfo = {
  version: pkg.version,
  buildTimestamp,
  // You can add more version-related info here
  get formatted() {
    return `v${this.version} (${new Date(this.buildTimestamp).toLocaleDateString()})`;
  }
};
