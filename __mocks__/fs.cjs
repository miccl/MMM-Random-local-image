// __mocks__/fs.cjs
// Redirect Node's `fs` to an in-memory filesystem provided by memfs.
// This makes all file operations happen in memory during tests.
const { fs, vol } = require('memfs');

// Export fs so ESM default import works (import fs from 'fs')
module.exports = fs;
// Expose vol for tests to reset/populate the FS
module.exports.vol = vol;
