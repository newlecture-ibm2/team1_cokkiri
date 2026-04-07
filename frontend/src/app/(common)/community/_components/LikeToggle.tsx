"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { cn } from "@/lib/utils";

type Props = {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeToggle({ postId, initialLiked, initialCount }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const [showLoginModal, setShowLoginModal] = useState(false);

  function toggle() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/like`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.status === 401 || res.status === 403) {
          setShowLoginModal(true);
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.success) return;
        const d = json.data as { liked: boolean; likeCount: number };
        setLiked(d.liked);
        setCount(d.likeCount);
        router.refresh();
      } catch {
        /* ignore */
      }
    });
  }

  return (
    <>
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <motion.button
        type="button"
        onClick={toggle}
        disabled={pending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-black uppercase tracking-wider",
          liked
            ? "border-secondary bg-secondary/15 text-secondary"
            : "border-border bg-background text-foreground hover:border-secondary/50",
          pending && "opacity-60",
        )}
      >
        <Heart className={cn("size-4", liked && "fill-current")} aria-hidden />
        좋아요 {count}
      </motion.button>
    </>
  );
}
