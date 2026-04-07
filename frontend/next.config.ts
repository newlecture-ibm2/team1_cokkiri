import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * [hotfix] rewrites 제거
   *
   * 문제: rewrites의 destination은 Docker standalone 빌드 시점에 평가됨.
   *      빌드 시 INTERNAL_BACKEND_URL 미설정 → 'http://localhost:8080' 하드코딩
   *      → 컨테이너 런타임에서 ECONNREFUSED → 502 Bad Gateway
   *
   * 해결: rewrites 제거. /api/bff/* 는 Route Handler가 전담.
   *      src/app/api/bff/[...path]/route.ts 는 런타임에 INTERNAL_BACKEND_URL을 읽음.
   */

  // 이미지 도메인 허용
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'backend', // Docker 내부 컨테이너명
        port: '8080',
      },
      {
        protocol: 'http',
        hostname: 'localhost', // 로컬 개발용
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

