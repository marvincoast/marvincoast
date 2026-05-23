/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['@felix/eslint-config'],
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    '.next',
    '.turbo',
    'coverage',
    'playwright-report',
    'test-results',
    '*.cjs',
  ],
};
