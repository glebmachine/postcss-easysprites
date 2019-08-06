module.exports = {
  root: true,
  env: {
    mocha: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
  },
  plugins: ['prettier', 'jsdoc', 'promise', 'sonarjs'],
  extends: [
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
    'jsdoc/check-alignment': 'warn',
    'jsdoc/check-examples': 'warn',
    'jsdoc/check-indentation': 'warn',
    'jsdoc/check-param-names': 'warn',
    'jsdoc/check-syntax': 'warn',
    'jsdoc/check-tag-names': 'warn',
    'jsdoc/check-types': 'warn',
    'jsdoc/implements-on-classes': 'warn',
    'jsdoc/match-description': 'warn',
    'jsdoc/newline-after-description': 'warn',
    'jsdoc/no-types': 'off',
    'jsdoc/no-undefined-types': [
      'warn',
      {
        definedTypes: ['Promise'],
      },
    ],
    'jsdoc/require-description': 'off',
    'jsdoc/require-description-complete-sentence': 'warn',
    'jsdoc/require-example': 'off',
    'jsdoc/require-hyphen-before-param-description': 'warn',
    'jsdoc/require-jsdoc': 'warn',
    'jsdoc/require-param': 'warn',
    'jsdoc/require-param-description': 'warn',
    'jsdoc/require-param-name': 'warn',
    'jsdoc/require-param-type': 'warn',
    'jsdoc/require-returns': 'warn',
    'jsdoc/require-returns-check': 'warn',
    'jsdoc/require-returns-description': 'off',
    'jsdoc/require-returns-type': 'warn',
    'jsdoc/valid-types': 'warn',
    'promise/prefer-await-to-then': 'warn',
    'promise/prefer-await-to-callbacks': 'warn',
  },
};
