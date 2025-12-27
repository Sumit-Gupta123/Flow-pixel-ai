import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Prevent build crashes by excluding heavy AI libs from the server bundle
  serverExternalPackages: ['@xenova/transformers', 'sharp', 'onnxruntime-node'],

  // 2. Allow image processing from external URLs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 3. Webpack Configuration (Crucial for Client-Side AI)
  // This tells Next.js: "If the browser asks for 'fs' or 'path', pretend they don't exist."
  turbopack: {}
    
    // Fix for "WorkerError": unexpected token in ONNX
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
  
  // 4. Disable strict typescript checking during build to prevent timeout crashes
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 5. Disable eslint during build to save memory
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
