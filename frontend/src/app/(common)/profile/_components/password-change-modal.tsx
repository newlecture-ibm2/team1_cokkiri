"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const logout = useAuthStore((state) => state.logout);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== newPasswordConfirm) {
      setError("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    const pattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!pattern.test(newPassword)) {
      setError("비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
      return;
    }

    try {
      setIsLoading(true);
      await apiFetch("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
      });
      alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
      onClose();
      await logout();
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-primary/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="flex min-h-full items-center justify-center p-6">

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-[2rem] bg-background shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground z-10 transition-colors"
              aria-label="닫기"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-8 md:p-10">
              <div className="mb-6 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                  <KeyRound className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="mb-2 text-2xl font-black tracking-tighter text-foreground uppercase">
                  비밀번호 변경
                </h3>
                <p className="text-sm font-medium tracking-tight text-muted-foreground">
                  계정 보호를 위해 새로운 비밀번호를 설정해주세요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-secondary/20 bg-background px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="현재 비밀번호 입력"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-secondary/20 bg-background px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="영문, 숫자, 특수문자 조합 8자 이상"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="w-full rounded-xl border border-secondary/20 bg-background px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="새 비밀번호 다시 입력"
                    required
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm font-bold text-red-500 mt-2">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 flex flex-col gap-3 font-sans">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl bg-primary px-6 py-4 text-sm font-bold tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                  >
                    {isLoading ? "변경 중..." : "비밀번호 변경하기"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
