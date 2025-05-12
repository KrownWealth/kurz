const withImages = require("next-images");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              publicPath: "/_next",
              name: "static/media/[name].[hash].[ext]",
            },
          },
        ],
      });
    }

    config.externals.push("canvas");

    return config;
  },
};

module.exports = withImages(nextConfig);
