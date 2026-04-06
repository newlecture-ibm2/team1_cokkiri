import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE:
  // /api/bff/*는 App Router Route Handler(src/app/api/bff/[...path]/route.ts)에서 프록시한다.
  // rewrites로 동일 경로를 다시 프록시하면 배포 빌드 시점 값(localhost)으로 고정되어
  // 컨테이너 환경에서 ECONNREFUSED를 유발할 수 있어 제거한다.

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
