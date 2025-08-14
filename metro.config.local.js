/**
 * Metro configuration for React Native - Local Development
 * https://github.com/facebook/react-native
 *
 * @format
 */

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
    platformExts: ['android', 'ios', 'native'],
    resolverMainFields: ['react-native', 'browser', 'main'],
    // Thêm resolver cho các module đặc biệt
    alias: {
      // Có thể thêm alias ở đây nếu cần
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    // Cấu hình babel
    babelTransformerPath: require.resolve('@react-native/metro-babel-transformer'),
  },
  // Cấu hình cache
  cacheStores: [
    {
      name: 'metro-cache',
      type: 'file',
      options: {
        maxAge: 1000 * 60 * 60 * 24, // 24 giờ
      },
    },
  ],
  // Tăng timeout cho Metro
  maxWorkers: 2,
  // Cấu hình watchman
  watchFolders: [],
  // Cấu hình server
  server: {
    port: 8081,
    enhanceMiddleware: (middleware, server) => {
      // Thêm middleware tùy chỉnh nếu cần
      return middleware;
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config); 