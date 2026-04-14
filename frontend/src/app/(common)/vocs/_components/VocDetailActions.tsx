"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { bffErrorMessageFromResponse } from "@/lib/bff-error-message";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { VOC_MY_VOC_FORBIDDEN_MESSAGE } from "@/lib/auth-messages";

export function VocDetailActions({ vocId, status }: { vocId: number; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const canMutate = status === "OPEN";

  function cancelVoc() {
    if (!canMutate || pending) return;
    if (!confirm("이 민원을 취소할까요? 취소 후에는 수정할 수 없습니다.")) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/vocs/${vocId}/cancel`, {
          method: "POST",
          credentials: "include",
        });
        if (res.status === 401) {
          setShowLoginModal(true);
          return;
        }
        if (res.status === 403) {
          alert(await bffErrorMessageFromResponse(res, VOC_MY_VOC_FORBIDDEN_MESSAGE));
          return;
        }
        if (res.ok) {
          router.refresh();
          return;
        }
        alert(await bffErrorMessageFromResponse(res));
      } catch {
        alert("연결에 실패했습니다.");
      }
    });
  }

  if (!canMutate) return null;

  return (
    <>
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <div className="pt-20 flex flex-col md:flex-row justify-end gap-4 items-center">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={cancelVoc}
          disabled={pending}
          className={cn(
            "w-full md:w-auto px-10 py-3.5 text-sm font-semibold tracking-tight text-primary rounded-xl border-2 border-primary/10 hover:border-primary/20 hover:text-primary transition-all",
            pending && "opacity-60",
          )}
        >
          {pending && <Loader2 className="size-4 animate-spin mr-2" aria-hidden />}
          민원 취소
        </motion.button>
        <button
          type="button"
          onClick={() => router.push(`/vocs/${vocId}/edit`)}
          className="w-full md:w-auto px-12 py-3.5 text-sm font-semibold tracking-tight text-white bg-primary rounded-xl shadow-lg shadow-primary/15 hover:bg-primary/90 transition-all"
        >
          수정
        </button>
      </div>
    </>
  );
}
