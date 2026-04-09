"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { Profile } from "../_types/profile";
import { UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { PasswordChangeModal } from "./password-change-modal";

export default function ProfileInfo() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkProfile() {
      try {
        const data = await apiFetch<Profile>("/users/me");
        if (isMounted && data.data) {
          setProfile(data.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "프로필 정보를 불러오는데 실패했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    checkProfile();
    return () => { isMounted = false; };
  }, []);

  // Loading Skeleton
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="animate-pulse space-y-8 rounded-[2rem] border border-border bg-background/50 p-8 md:p-12"
      >
        <div className="flex items-center gap-6 pb-8 border-b border-border/50">
          <div className="size-20 bg-muted/60" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
          <div className="space-y-3">
             <div className="h-8 w-40 rounded-sm bg-muted/60"></div>
             <div className="h-4 w-24 rounded-sm bg-muted/60"></div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="h-12 rounded-lg bg-muted/60"></div>
          <div className="h-12 rounded-lg bg-muted/60"></div>
        </div>
      </motion.div>
    );
  }

  // Error State
  if (error || !profile) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-red-900/20 bg-red-950/5 p-8 md:p-12 text-center"
      >
        <p className="font-black uppercase tracking-widest text-[#768064] mb-2 text-sm">Notice</p>
        <p className="text-lg font-medium text-red-800">{error || "프로필 정보가 없습니다."}</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12 rounded-[2rem] border border-border bg-background/50 p-8 md:p-12 shadow-sm backdrop-blur-md relative overflow-hidden"
    >
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-accent/5 blur-3xl" aria-hidden />

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 pb-10 border-b border-border relative z-10">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="flex size-24 shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-xl transition-colors"
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        >
          <UserRound className="size-10" strokeWidth={1.5} />
        </motion.div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-primary">
              {profile.name}
            </h2>
            <span className="inline-flex items-center border-l-2 border-accent pl-4 text-[11px] font-black uppercase tracking-[0.3em] text-accent">
               {profile.role}
            </span>
          </div>
          <p className="font-medium text-muted-foreground tracking-tight text-lg">@{profile.loginId}</p>
        </div>
      </div>

      <div className="grid gap-10 sm:grid-cols-2 relative z-10">
        <motion.div whileHover={{ x: 4 }} className="space-y-2 group">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 group-hover:text-accent transition-colors">이메일 (Email)</p>
          <p className="text-lg font-medium text-primary tracking-tight">{profile.email}</p>
        </motion.div>
        <motion.div whileHover={{ x: 4 }} className="space-y-2 group">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 group-hover:text-accent transition-colors">연락처 (Phone)</p>
          <p className="text-lg font-medium text-primary tracking-tight">{profile.phone}</p>
        </motion.div>
        <motion.div whileHover={{ x: 4 }} className="space-y-2 group">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 group-hover:text-accent transition-colors">생년월일 (Birth Date)</p>
          <p className="text-lg font-medium text-primary tracking-tight">{profile.birthDate}</p>
        </motion.div>
        <motion.div whileHover={{ x: 4 }} className="space-y-2 group">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 group-hover:text-accent transition-colors">국적 (Nationality)</p>
          <p className="text-lg font-medium text-primary tracking-tight">{profile.nationality}</p>
        </motion.div>
      </div>
      
      {/* 내 정보 수정 섹션 */}
      <div className="pt-8 relative z-10">
        <h3 className="font-black uppercase tracking-[0.25em] text-primary text-sm mb-4 inline-flex items-center">
          <span className="w-8 h-px bg-accent mr-4 inline-block"></span>
          Account Settings
        </h3>
        <p className="text-base font-medium leading-relaxed text-muted-foreground mb-8 text-balance max-w-lg">
          이름, 이메일, 연락처 등 나의 기본 정보와 비밀번호를 관리하세요. 안전한 주거 환경을 위해 항상 최신 정보로 유지해주세요.
        </p>
        <div className="flex flex-wrap gap-4">
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-none bg-primary px-8 py-4 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 text-xs font-black uppercase tracking-[0.2em]"
          >
            기본정보 수정
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPasswordModalOpen(true)}
            className="rounded-none border border-primary/20 bg-transparent px-8 py-4 text-primary transition-colors hover:bg-primary/5 hover:border-primary text-xs font-black uppercase tracking-[0.2em]"
          >
            비밀번호 변경
          </motion.button>
        </div>
      </div>

      <PasswordChangeModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </motion.div>
  );
}
