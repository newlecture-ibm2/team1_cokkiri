"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const logout = useAuthStore((state) => state.logout);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiFetch("/users/me", {
        method: "DELETE",
        body: JSON.stringify({ password }),
      });
      alert(res.message || "성공적으로 탈퇴 처리되었습니다. 그동안 이용해주셔서 감사합니다.");
      onClose();
      await logout();
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 bg-primary/40 backdrop-blur-md"
            onClick={isLoading ? undefined : onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-background shadow-2xl"
          >
            <button
               onClick={onClose}
               disabled={isLoading}
               className="absolute right-8 top-8 z-10 text-primary/40 hover:text-primary transition-colors disabled:opacity-50"
               aria-label="닫기"
            >
              <X className="h-8 w-8" strokeWidth={1} />
            </button>
            
            <div className="flex flex-col md:flex-row h-full">
              {/* Left visual column */}
              <div className="hidden md:flex w-[40%] flex-col justify-between bg-primary p-12 text-background">
                <div>
                  <h3 className="text-[3vw] lg:text-[2.5rem] font-black uppercase tracking-tighter leading-[0.85] mb-6">
                    FARE<br/>WELL.
                  </h3>
                  <div className="h-1 w-12 bg-accent/50" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-background/50 leading-loose">
                  Data<br/>Anonymization<br/>Notice
                </p>
              </div>

              {/* Right form column */}
              <div className="w-full md:w-[60%] p-8 md:p-14 flex flex-col justify-center">
                <div className="md:hidden mb-10">
                  <h3 className="text-5xl font-black uppercase tracking-tighter leading-[0.85] text-primary mb-4">
                    FARE<br/>WELL.
                  </h3>
                  <div className="h-1 w-12 bg-accent/50" />
                </div>

                <div className="mb-12">
                  <h4 className="text-xl font-black uppercase tracking-tight text-primary mb-3 flex items-center gap-3">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-800"></span>
                    Account Withdrawal
                  </h4>
                  <p className="text-sm font-medium text-primary/60 leading-relaxed text-balance">
                    탈퇴 시 모든 정보가 익명화 처리되며 영구적으로 복구할 수 없습니다. 활성 계약이나 미납금이 있는 경우 탈퇴가 제한될 수 있습니다.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                  <div className="relative">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">
                      CURRENT PASSWORD
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      disabled={isLoading}
                      className={`w-full border-b bg-transparent px-0 py-3 text-lg font-medium text-primary outline-none transition-colors placeholder:text-primary/30 disabled:opacity-50 ${error ? 'border-red-800 focus:border-red-800' : 'border-primary/20 focus:border-accent'}`}
                      placeholder="비밀번호를 입력하세요"
                      required
                    />
                    
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full left-0 mt-2"
                        >
                          <p className="text-xs font-bold text-red-800 tracking-tight">
                            {error}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-8 flex items-center justify-end gap-6">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isLoading}
                      className="text-xs font-black uppercase tracking-[0.2em] text-primary/40 transition-colors hover:text-primary disabled:opacity-50"
                    >
                      취소
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={!isLoading ? { scale: 1.02 } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                      className="rounded-2xl bg-red-900 border border-red-900 px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-[#e8ebe6] transition-colors hover:bg-transparent hover:text-red-900 disabled:opacity-50"
                    >
                      {isLoading ? "PROCESSING..." : "탈퇴 확정"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
