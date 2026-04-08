"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, Pencil, Ban } from "lucide-react";
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
      <div className="mt-10 flex flex-wrap items-center justify-end gap-3 border-t border-primary/10 pt-10">
        <Link
          href={`/profile/vocs/${vocId}/edit`}
          className="inline-flex items-center gap-2 rounded-full border border-secondary bg-secondary/15 px-5 py-2.5 text-xs font-black uppercase tracking-[0.24em] text-secondary transition-transform hover:-translate-y-0.5"
        >
          <Pencil className="size-4" aria-hidden />
          수정
        </Link>
        <motion.button
          type="button"
          disabled={pending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={cancelVoc}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.24em] text-destructive",
            pending && "opacity-60",
          )}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Ban className="size-4" aria-hidden />}
          민원 취소
        </motion.button>
      </div>
    </>
  );
}
