"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { bffErrorMessageFromResponse } from "@/lib/bff-error-message";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { cn } from "@/lib/utils";

export function CommentComposer({ postId }: { postId: number }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || pending) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/bff/posts/${postId}/comments`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        if (res.status === 401) {
          setShowLoginModal(true);
          return;
        }
        if (res.ok) {
          setContent("");
          router.refresh();
          return;
        }
        setError(await bffErrorMessageFromResponse(res));
      } catch {
        setError("연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 rounded-[2rem] border border-border bg-background/80 p-6 backdrop-blur-sm md:p-8"
    >
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <label htmlFor={`comment-${postId}`} className="sr-only">
        댓글 작성
      </label>
      <textarea
        id={`comment-${postId}`}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError(null);
        }}
        rows={3}
        placeholder="댓글을 입력하세요"
        className="w-full resize-y rounded-xl border border-input bg-surface px-4 py-3 font-medium tracking-tight text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium tracking-tight text-destructive"
        >
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <motion.button
          type="submit"
          disabled={pending || !content.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground",
            "disabled:opacity-50",
          )}
        >
          <Send className="size-4" aria-hidden />
          등록
        </motion.button>
      </div>
    </form>
  );
}
