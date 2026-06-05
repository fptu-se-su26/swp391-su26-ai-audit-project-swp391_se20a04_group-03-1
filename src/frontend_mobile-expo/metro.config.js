const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib") {
    return {
      type: "sourceFile",
      filePath: require.resolve("tslib/tslib.es6.js"),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
