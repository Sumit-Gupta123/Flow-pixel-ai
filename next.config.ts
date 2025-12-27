import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Configure Server Components to ignore specific heavy AI libraries
  serverExternalPackages: ['@xenova/transformers', 'sharp', 'onnxruntime-node'],

  // 2. Allow loading images from anywhere
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 3. Turbopack Configuration (MOVED TO ROOT)
  // Note: Most alias resolution is handled automatically by tsconfig.json.
  // You only need this block if you are manually mapping specific extensions or aliases
  // that do not exist in your tsconfig.
  turbo: {
    resolveAlias: {
      // 'underscore': 'lodash', 
    },
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
  
  // 4. Webpack Fallback (Crucial for transformers.js compatibility in standard build)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,     
      path: false,   
      crypto: false, 
    };
    return config;
  },
};

export default nextConfig;
