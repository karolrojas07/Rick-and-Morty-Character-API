require('ts-node/register');

const tsConfig = require('./database.ts');
const config = tsConfig.default || tsConfig;

module.exports = config;