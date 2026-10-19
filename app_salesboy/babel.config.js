const fs = require('fs');
const path = require('path');

let envApiBaseUrl = 'https://api.stenna.in/api/v1';
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^API_BASE_URL=(.+)$/m);
    if (match && match[1].trim()) {
      envApiBaseUrl = match[1].trim();
    }
  }
} catch (e) {}

function inlineEnvPlugin({ types: t }) {
  return {
    name: 'inline-env-plugin',
    visitor: {
      MemberExpression(p) {
        if (p.matchesPattern('process.env.API_BASE_URL')) {
          p.replaceWith(t.stringLiteral(envApiBaseUrl));
        }
      }
    }
  };
}

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    inlineEnvPlugin,
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

