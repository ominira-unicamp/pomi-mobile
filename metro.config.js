const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.endsWith('.js')) {
        try {
          return context.resolveRequest(context, moduleName, platform);
        } catch (err) {
          try {
            return context.resolveRequest(
              context,
              moduleName.replace(/\.js$/, '.ts'),
              platform
            );
          } catch (tsErr) {
            return context.resolveRequest(
              context,
              moduleName.replace(/\.js$/, '.tsx'),
              platform
            );
          }
        }
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
