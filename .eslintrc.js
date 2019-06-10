module.exports = {
  root: true,
  env: {
    mocha: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 6,
  },
  plugins: ['prettier', 'jsdoc'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  rules: {
    // Only allow debugger in development
    'no-debugger': process.env.PRE_COMMIT ? 'error' : 'off',

    // Only allow `console.log` in development
    'no-console': process.env.PRE_COMMIT
      ? ['error', { allow: ['warn', 'error'] }]
      : 'off',
    'prettier/prettier': 'error',
    strict: ['error', 'global'],

    // JSDoc linting rules.
    'jsdoc/check-alignment': 1,
    'jsdoc/check-examples': 1,
    'jsdoc/check-indentation': 1,
    'jsdoc/check-param-names': 1,
    'jsdoc/check-syntax': 1,
    'jsdoc/check-tag-names': 1,
    'jsdoc/check-types': 1,
    'jsdoc/implements-on-classes': 1,
    'jsdoc/match-description': 1,
    'jsdoc/newline-after-description': 1,
    'jsdoc/no-types': 0,
    'jsdoc/no-undefined-types': 1,
    'jsdoc/require-description': 1,
    'jsdoc/require-description-complete-sentence': 1,
    'jsdoc/require-example': 0,
    'jsdoc/require-hyphen-before-param-description': 1,
    'jsdoc/require-jsdoc': 1,
    'jsdoc/require-param': 1,
    'jsdoc/require-param-description': 1,
    'jsdoc/require-param-name': 1,
    'jsdoc/require-param-type': 1,
    'jsdoc/require-returns': 1,
    'jsdoc/require-returns-check': 1,
    'jsdoc/require-returns-description': 1,
    'jsdoc/require-returns-type': 1,
    'jsdoc/valid-types': 1,
  },
};
