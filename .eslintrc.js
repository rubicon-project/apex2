module.exports = {
  extends: ['airbnb-base'],
  ignorePatterns: ['build/**/*.js', 'dist/**/*.js', 'doc/**/*.js'],
  parserOptions: {
    ecmaVersion: 11
  },
  settings: {
    'import/resolver': {
      node: {},
      webpack: {
        config: 'webpack.config.babel.js'
      }
    }
  },
  rules: {

    // indentation with 2 spaces
    indent: ['error', 2],

    // disallow trailing commas -- make object notation JSON-compatible
    'comma-dangle': ['error', 'never'],

    // always space before function parentheses
    'space-before-function-paren': ['error', 'always'],

    // don't prefer default export
    'import/prefer-default-export': 'off',

    // don't require newline on object definition
    'object-curly-newline': 'off'
  }
};
