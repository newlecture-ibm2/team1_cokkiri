"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

export default function LoginForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiFetch<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ loginId, password }),
      });

      if (response.success && response.data) {
        const { role } = response.data.user;
        
        // Redirect based on role
        if (role === 'ADMIN') {
          router.push('/admin/dashboard');
          router.refresh();
        } else if (role === 'RESIDENT') {
          router.push('/my-room'); // actually resident-app logic might default to facilities or my-devices, but we can just do /
          router.refresh();
        } else {
          router.push('/rooms');
          router.refresh();
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        // We just display the error message. Backend currently says "아이디 또는 비밀번호를 확인하세요." for INVALID_CREDENTIALS,
        // which fulfills the prompt's requirement of not giving specific reasons.
        setError(err.message);
      } else {
        setError('로그인 중 문제가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm font-medium p-4 rounded-xl border border-destructive/20">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">ID</label>
        <input
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          required
          placeholder="아이디를 입력하세요"
          className="h-12 w-full rounded-xl border border-secondary bg-transparent px-4 py-2 placeholder:text-muted focus:border-primary focus:outline-none"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">PASSWORD</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="비밀번호를 입력하세요"
          className="h-12 w-full rounded-xl border border-secondary bg-transparent px-4 py-2 placeholder:text-muted focus:border-primary focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-primary text-background font-black uppercase tracking-tighter hover:scale-[1.02] transition-transform disabled:opacity-50"
      >
        {isLoading ? '로딩 중...' : '로그인'}
      </button>
    </form>
  );
}
