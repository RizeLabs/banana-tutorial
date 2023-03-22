#!/bin/bash

spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    local i=0
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf "[%c] " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
        i=$(( (i+1) %4 ))
    done
    printf "    \b\b\b\b"
}
echo "******************************** Installing react-app-rewired *******************************************"
npm install react-app-rewired & spinner $!

echo "Creating config-overrides.js file..."
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

echo "******************************************* Configurations file created ***********************************"

echo "******************************************* Installing necessary packages **********************************"
npm install stream-browserify constants-browserify crypto-browserify os-browserify path-browserify process stream-browserify antd axios webpack buffer ethers@^5.7.2 react-icons@^4.7.1 react-copy-to-clipboard react-hot-toast & spinner $!

echo "**********************************Installing Banana Wallet SDK **********************************"
npm install @rize-labs/banana-wallet-sdk@0.1.12 & spinner $!

echo "Installation complete done ✨".
