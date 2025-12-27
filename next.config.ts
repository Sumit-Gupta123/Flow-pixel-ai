import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Configure Server Components to ignore specific heavy AI libraries
  // This prevents build errors when using transformers.js on the server.
  serverExternalPackages: ['@xenova/transformers', 'sharp', 'onnxruntime-node'],

  // 2. Allow loading images from anywhere (useful for processing user URLs)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 3. Turbopack specific configurations
  experimental: {
    turbo: {
      // Turbopack usually reads paths from tsconfig.json automatically.
      // If you have specific aliases that AREN'T in tsconfig, add them here:
      resolveAlias: {
        // 'underscore': 'lodash', // Example replacement
      },
      // If you need to map specific file extensions:
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  },
  
  // 4. Webpack Fallback (Only used if you run 'next dev' WITHOUT --turbo)
  // This ensures transformers.js works if you switch back to standard Webpack.
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,     // Required for transformers.js
      path: false,   // Required for transformers.js
      crypto: false, // Required for transformers.js
    };
    return config;
  },
};

export default nextConfig;
