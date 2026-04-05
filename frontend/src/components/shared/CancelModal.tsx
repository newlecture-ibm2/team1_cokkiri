"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
}

export function CancelModal({
  isOpen,
  onClose,
  onConfirm,
  title = "정말 취소하시겠습니까?",
  description = "작성하신 내용은 모두 사라지며 복구할 수 없습니다. 계속하시겠습니까?",
  cancelText = "돌아가기",
  confirmText = "취소하기",
}: CancelModalProps) {
  // 모달 활성화 시 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl"
          >
            <div className="p-8">
              <div className="mb-6 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle className="h-8 w-8 text-red-500" strokeWidth={2.5} />
                </div>
              </div>

              <div className="text-center">
                <h3 className="mb-3 text-2xl font-black tracking-tighter text-gray-900">
                  {title}
                </h3>
                <p className="text-balance text-sm font-medium tracking-tight text-gray-500">
                  {description}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 font-sans">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="w-full rounded-xl bg-red-500 px-6 py-4 text-sm font-bold tracking-widest text-white transition-colors hover:bg-red-600"
                >
                  {confirmText}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full rounded-xl bg-gray-100 px-6 py-4 text-sm font-bold tracking-widest text-gray-700 transition-colors hover:bg-gray-200"
                >
                  {cancelText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
