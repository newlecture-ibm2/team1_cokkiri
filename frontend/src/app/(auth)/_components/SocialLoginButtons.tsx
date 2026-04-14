"use client";

import { motion } from 'framer-motion';

export default function SocialLoginButtons() {
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/oauth2/authorization/${provider}`;
  };

  return (
    <motion.div variants={itemVariants} className="mt-6 flex flex-col gap-3">
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-secondary/30"></div>
        <span className="flex-shrink-0 mx-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary/50">
          Or continue with
        </span>
        <div className="flex-grow border-t border-secondary/30"></div>
      </div>
      
      <div className="flex flex-row gap-3">
        {/* Google Logout / Login */}
        <button
          onClick={() => handleSocialLogin('google')}
          className="flex-1 flex h-14 items-center justify-center rounded-xl border border-primary/20 bg-white hover:bg-gray-50 transition-colors"
          title="Continue with Google"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </button>

        {/* Naver */}
        <button
          onClick={() => handleSocialLogin('naver')}
          className="flex-1 flex h-14 items-center justify-center rounded-xl bg-[#03C75A] text-white hover:brightness-105 transition-all"
          title="Continue with Naver"
        >
          <span className="font-extrabold text-2xl">N</span>
        </button>

        {/* Kakao */}
        <button
          onClick={() => handleSocialLogin('kakao')}
          className="flex-1 flex h-14 items-center justify-center rounded-xl bg-[#FEE500] text-[#000000] hover:brightness-105 transition-all"
          title="Continue with Kakao"
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.51 2 10.84c0 2.768 1.765 5.2 4.47 6.545-.192.709-.702 2.628-.733 2.75 0 0-.012.062.036.09.049.027.112.02.112.02 1.488-.168 3.5-1.127 4.05-1.41.67.126 1.365.195 2.065.195 5.523 0 10-3.51 10-7.84S17.523 3 12 3z"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
