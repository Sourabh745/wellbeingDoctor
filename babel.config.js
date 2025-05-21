module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-async-generator-functions',
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    'react-native-reanimated/plugin'
  ],
};
