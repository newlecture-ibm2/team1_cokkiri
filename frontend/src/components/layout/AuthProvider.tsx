'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // 앱 진입 시 최초 1회 인증 상태를 백엔드와 동기화
    initializeAuth();
  }, [initializeAuth]);

  // AuthProvider는 비동기 검증결과에 상관없이 children(화면)을 즉시 렌더링하도록 허용.
  // 실제 로그인 여부에 따른 UI 분기나 로딩은 개별 컴포넌트 단위에서 `isLoading`을 구독하여 처리.
  return <>{children}</>;
}
