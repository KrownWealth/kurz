const withImages = require("next-images");
const path = require("path");

module.exports = withImages({
  // Next.js config options
  reactStrictMode: true,

  // Custom webpack configuration
  webpack: (config, { isServer, nextRuntime }) => {
    // Handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next",
            name: "static/media/[name].[hash].[ext]",
            esModule: false, // Add this for better compatibility
          },
        },
      ],
    });

    // Exclude 'canvas' from being processed by Webpack
    if (!isServer) {
      config.externals.push("canvas");
    }
    if (nextRuntime === "nodejs") {
      config.resolve.alias.canvas = false;
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@wxflows/sdk"],
  },
  // Other Next.js configurations can go here
  images: {
    disableStaticImages: true, // Since we're using next-images
  },
});
