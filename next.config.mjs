import { env } from "./src/lib/env.mjs";

/** @type {import('next').NextConfig} */
const config = {
  // ffmpeg has a weird error that doing this hides it
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
        },
      };
    }
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    return config;
  },
  headers() {
    return [
      {
        source: "/_next/:path*",
        // These headers are to allow multi-threading ffmpeg
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
      {
        source: "/",
        // These headers are to allow multi-threading ffmpeg
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/t/:id",
        destination: `${env.AWS_PUBLIC_ENDPOINT}/:id.webp`,
      },
      {
        source: "/api/v/:id",
        destination: `${env.AWS_PUBLIC_ENDPOINT}/:id.mp4`,
      },
    ];
  },
};

export default config;
