import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 디렉터리의 package-lock.json과 충돌하지 않도록 트레이싱 루트를 앱 디렉터리로 고정
  outputFileTracingRoot: path.join(__dirname),
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
};

export default nextConfig;
