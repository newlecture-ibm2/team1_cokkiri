"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

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
        login(response.data.user);
        
        // Redirect to main page after success
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        // We just display the error message. Backend currently says "아이디 또는 비밀번호를 확인하세요." for INVALID_CREDENTIALS,
        // which fulfills the prompt's requirement of not giving specific reasons.
        setError(err.message);
      } else {
        setError('An error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="mt-8 flex flex-col gap-6"
    >
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-destructive/10 text-destructive text-sm font-medium p-4 rounded-xl border border-destructive/20"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">ID</label>
        <input
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          required
          placeholder="Enter your login ID"
          className="h-12 w-full rounded-xl border border-secondary bg-transparent px-4 py-2 text-primary placeholder:text-primary/50 focus:border-primary focus:outline-none"
        />
      </motion.div>
      
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">PASSWORD</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          className="h-12 w-full rounded-xl border border-secondary bg-transparent px-4 py-2 text-primary placeholder:text-primary/50 focus:border-primary focus:outline-none"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-background font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Log In'}
        </button>
      </motion.div>
    </form>
  );
}
