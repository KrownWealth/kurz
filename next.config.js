const withImages = require('next-images');
const path = require('path');

module.exports = withImages({
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Rule for handling font files using file-loader
      config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/_next',
              name: 'static/media/[name].[hash].[ext]',
            },
          },
        ],
      });
    }

    return config;
  },
});

// Additional webpack configuration
module.exports.webpack = (config) => {
  // Exclude 'canvas' from being processed by Webpack
  config.externals.push('canvas');

  return config;
};
