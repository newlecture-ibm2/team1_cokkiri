import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // BFF: /api/bff/* 요청을 백엔드로 프록시 (개발 환경용)
  async rewrites() {
    return [
      {
        source: '/api/bff/:path*',
        destination: `${process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ];
  },

  // 이미지 도메인 허용 (Space 이미지 등)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
      },
    ],
  },

  // 빌드 출력 standalone 모드 (Docker 최적화)
  output: 'standalone',

  // ESLint: 빌드 시 lint 에러로 차단하지 않음 (lint는 별도 단계에서 수행)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
