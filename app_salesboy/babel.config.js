module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@app': './src/app',
          '@navigation': './src/navigation',
          '@theme': './src/theme',
          '@shared': './src/shared',
          '@features': './src/features',
          '@store': './src/store',
          '@services': './src/services',
          '@utils': './src/utils'
        }
      }
    ],
    'react-native-reanimated/plugin' // Reanimated plugin must always be last
  ]
};
