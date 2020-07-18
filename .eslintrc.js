module.exports = {
  root: true,
  env: {
    mocha: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: ['prettier', 'jsdoc', 'promise', 'sonarjs'],
  extends: [
    'plugin:jsdoc/recommended',
    'plugin:promise/recommended',
    'plugin:sonarjs/recommended',
    'eslint:recommended',
    'airbnb-base',
    'plugin:prettier/recommended',
  ],
  rules: {
    // Only allow debugger in development
    'no-debugger': process.env.PRE_COMMIT ? 'error' : 'off',

    // Only allow `console.log` in development
    'no-console': process.env.PRE_COMMIT
      ? ['error', { allow: ['warn', 'error'] }]
      : 'off',
    'prettier/prettier': 'error',
    'max-len': [
      'warn',
      {
        comments: 80,
        ignoreTrailingComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    // JSDoc linting rules.
    'jsdoc/require-returns-description': 'off',
  },
};
