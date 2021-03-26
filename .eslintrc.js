module.exports = {
  plugins: [
    '@typescript-eslint',
    'eslint-comments',
    'promise',
    'import',
    'packages',
    'react-hooks',
    'react',
    'jest',
  ],
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
    'plugin:jest/recommended',
  ],
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'unicorn/prefer-flat-map': 'off',
    'no-console': 'off',
    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    'no-prototype-builtins': 'off',
    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    // Too restrictive: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md
    'react/destructuring-assignment': 'off',
    // No jsx extension: https://github.com/facebook/create-react-app/issues/87#issuecomment-234627904
    'react/jsx-filename-extension': 'off',
    // Use function hoisting to improve code readability
    'no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true },
    ],
    // Makes no sense to allow type inferrence for expression parameters, but require typing the response
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true, typedefs: true },
    ],

    // Common abbreviations are known and readable
    'unicorn/no-for-loop': 'off',
    'no-continue': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/consistent-function-scoping': 'off',
    'import/first': 'off',
    'import/newline-after-import': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'no-underscore-dangle': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'consistent-return': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to', 'as'],
      },
    ],
    'packages/module-boundary': [
      2,
      { namespace: '@app', packagesDir: './src' },
    ],
    'react-hooks/rules-of-hooks': 'error',
    curly: ['error', 'multi-line'],
    'import/no-extraneous-dependencies': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'no-await-in-loop': 'off',
    'import/no-default-export': 'off',
    'react/require-default-props': 'off',
  },
};
