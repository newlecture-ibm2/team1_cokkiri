"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { cn } from "@/lib/utils";

type Props = {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
  variant?: "default" | "minimal";
};

export function LikeToggle({ postId, initialLiked, initialCount, variant = "default" }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Sync with other instances on the same page
  useEffect(() => {
    const handleSync = (e: CustomEvent<{ postId: number; liked: boolean; count: number }>) => {
      if (e.detail.postId === postId) {
        setLiked(e.detail.liked);
        setCount(e.detail.count);
      }
    };
    window.addEventListener("post-like-sync" as any, handleSync);
    return () => window.removeEventListener("post-like-sync" as any, handleSync);
  }, [postId]);

  function toggle() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/like`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.status === 401) {
          setShowLoginModal(true);
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.success) return;
        const d = json.data as { liked: boolean; likeCount: number };
        
        setLiked(d.liked);
        setCount(d.likeCount);

        window.dispatchEvent(new CustomEvent("post-like-sync", {
          detail: { postId, liked: d.liked, count: d.likeCount }
        }));

        router.refresh();
      } catch {
        /* ignore */
      }
    });
  }

  if (variant === "minimal") {
    return (
      <>
        <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className={cn(
            "group inline-flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50",
            liked ? "text-secondary" : "text-primary/70 hover:text-secondary/80",
          )}
        >
          <Heart className={cn("size-4 transition-transform group-hover:scale-110", liked && "fill-current")} aria-hidden />
          <span className="text-sm font-semibold tracking-tight">{count.toLocaleString()}</span>
        </button>
      </>
    );
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
          "inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300",
          liked
            ? "border-secondary bg-secondary/10 text-secondary shadow-sm"
            : "border-primary/10 bg-white text-primary/60 hover:border-secondary/30 hover:text-secondary hover:bg-secondary/5",
          pending && "opacity-60",
        )}
      >
        <Heart className={cn("size-5", liked && "fill-current")} aria-hidden />
        <span className="translate-y-[0.5px]">좋아요 {count}</span>
      </motion.button>
    </>
  );
}
