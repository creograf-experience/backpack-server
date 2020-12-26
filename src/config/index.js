const production = require('./production');
const dev = require('./dev');
const test = require('./test');
const common = require('./common');

const env = process.env.NODE_ENV || 'dev';
const config = {
  production,
  dev,
  test
};

module.exports = {
  ...common,
  ...config[env]
};
