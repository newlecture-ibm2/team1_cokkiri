"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { apiFetch } from '@/lib/api';

function OAuth2SuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const processLogin = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (!accessToken || !refreshToken) {
        console.error("Missing tokens");
        router.replace('/login?error=missing_tokens');
        return;
      }

      try {
        // 1. Establish session_id cookies
        const sessionRes = await fetch('/api/auth/oauth2-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, refreshToken }),
        });

        if (!sessionRes.ok) throw new Error('Session establishment failed');

        // 2. Fetch user profile
        const userRes = await apiFetch<any>('/users/me', { method: 'GET' });
        
        if (userRes.success && userRes.data) {
          login(userRes.data);
          
          // 3. Check for missing profile data (e.g. phone)
          if (!userRes.data.phone) {
            // New user missing phone. Naturally routing.
            router.replace('/profile/edit?from=social_login');
          } else {
            router.replace('/');
          }
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (err) {
        console.error("OAuth2 success error", err);
        router.replace('/login?error=oauth2_failure');
      }
    };

    processLogin();
  }, [router, searchParams, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-primary font-black uppercase tracking-[0.2em] text-sm">Completing login...</p>
      </div>
    </div>
  );
}

export default function OAuth2SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex justify-center items-center">Loading...</div>}>
      <OAuth2SuccessHandler />
    </Suspense>
  );
}
