import { create } from 'zustand';
import { apiFetch } from '@/lib/api';
import { User } from '@/types/user';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  isLoading: true, // 초기 로딩 상태: 하이드레이션 깜빡임 방지용

  login: (user: User) => set({ isLoggedIn: true, user }),

  logout: async () => {
    try {
      // 프록시를 통해 백엔드의 로그아웃 API 호출 (Refresh Token 만료 등 처리)
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    } finally {
      // 서버 상태와 관계없이 클라이언트 상태(Zustand) 초기화
      set({ isLoggedIn: false, user: null });
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      // BFF 프록시 -> 백엔드 GET /api/users/me 호출
      const response = await apiFetch<User>('/users/me');
      
      if (response.success && response.data) {
        set({
          isLoggedIn: true,
          user: response.data,
          isLoading: false,
        });
      } else {
        set({ isLoggedIn: false, user: null, isLoading: false });
      }
    } catch (error) {
      // 토큰 없음(401), 만료, 서버 다운 등 어떠한 예외라도 UI 블로킹 없이 로그아웃 상태 부여
      set({ isLoggedIn: false, user: null, isLoading: false });
    }
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('auth:expired', () => {
    useAuthStore.getState().logout();
  });
}
