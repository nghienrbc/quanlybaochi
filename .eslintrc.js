// module.exports = {
//   root: true,
//   extends: '@react-native-community',
// };
extends: ['airbnb', 'eslint-config-prettier', 'prettier/react'],
  plugins: [
    'eslint-plugin-prettier',
    'redux-saga',
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  rules: {
    'prettier/prettier': ['error'],
    indent: [
      2,
      2,
      {
        SwitchCase: 1,
      },
    ],
    'max-len': 0,