// __mocks__/fs/promises.cjs
// Redirect Node's `fs/promises` to memfs promises API.
const { fs } = require('memfs');

module.exports = fs.promises;
