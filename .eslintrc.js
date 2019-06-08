module.exports = {
  root: true,
  env: {
    node: true,
    mocha: true,
  },
  extends: ['eslint:recommended'],
  rules: {
    // Only allow debugger in development
    'no-debugger': process.env.PRE_COMMIT ? 'error' : 'off',
    // Only allow `console.log` in development
    'no-console': process.env.PRE_COMMIT
      ? ['error', { allow: ['warn', 'error'] }]
      : 'off',
    strict: ['error', 'global'],
  },
};
