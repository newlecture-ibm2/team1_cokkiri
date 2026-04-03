"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function CommentComposer({ postId }: { postId: number }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || pending) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/bff/posts/${postId}/comments`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        if (res.ok) {
          setContent("");
          router.refresh();
        }
      } catch {
        /* ignore */
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 rounded-[2rem] border border-border bg-background/80 p-6 backdrop-blur-sm md:p-8"
    >
      <label htmlFor={`comment-${postId}`} className="sr-only">
        댓글 작성
      </label>
      <textarea
        id={`comment-${postId}`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="댓글을 입력하세요"
        className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 font-medium tracking-tight text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
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
