#!/bin/bash

# Check if npm_token is provided as an argument
if [ $# -eq 0 ]
  then
    echo "No npm_token provided"
    exit 1
fi

# Create .npmrc file

echo "@rize-labs:registry=https://registry.npmjs.org/" > .npmrc
echo "//registry.npmjs.org/:_authToken=$1" >> .npmrc

echo "************************** Created npm config file **************************"

# Install react-app-rewired
npm install react-app-rewired

# Create config-overrides.js file
cat <<EOT >> config-overrides.js
const { ProvidePlugin }= require("webpack")

module.exports = {
  webpack: function (config, env) {
    config.module.rules = config.module.rules.map(rule => {
      if (rule.oneOf instanceof Array) {
        rule.oneOf[rule.oneOf.length - 1].exclude = [/\.(js|mjs|jsx|cjs|ts|tsx)$/, /\.html$/, /\.json$/];
      }
      return rule;
    });
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      crypto: require.resolve("crypto-browserify"),
      process: require.resolve("process"),
      os: require.resolve("os-browserify"),
      path: require.resolve("path-browserify"),
      constants: require.resolve("constants-browserify"), 
      fs: false
    }
    config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
    config.plugins = [
      ...config.plugins,
      new ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      new ProvidePlugin({
          process: ["process"]
      }),
    ]
    return config;
  },
}
EOT

echo "************************** Created configurations file **************************"


# Install required packages
npm install stream-browserify constants-browserify crypto-browserify os-browserify path-browserify process stream-browserify antd axios webpack buffer ethers@^5.7.2 react-icons@^4.7.1 react-copy-to-clipboard react-hot-toast

echo "************************** Installed necessary packages **************************"

npm install @rize-labs/banana-wallet-sdk

echo "************************** Installed Banana Wallet SDK Lets gooo! **************************"

