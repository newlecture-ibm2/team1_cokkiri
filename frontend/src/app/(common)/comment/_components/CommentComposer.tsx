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
        const res = await fetch(`/api/posts/${postId}/comments`, {
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
      className="bg-primary/5 rounded-[3rem] p-10 md:p-14 border border-primary/5 shadow-2xl shadow-primary/5 relative overflow-hidden"
    >
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Write Comment</span>
          <h3 className="text-2xl font-black tracking-tighter uppercase italic">당신의 생각을 들려주세요</h3>
        </div>

        <div className="relative group">
           <textarea
            id={`comment-${postId}`}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            rows={4}
            placeholder="ADD YOUR THOUGHTS..."
            className="w-full resize-none rounded-[2rem] bg-white border-primary/5 border p-10 font-medium tracking-tight text-primary placeholder:text-muted-foreground focus:ring-2 focus:ring-accent outline-none text-lg leading-relaxed shadow-lg shadow-primary/5"
          />
        </div>

        {error && (
          <div role="alert" className="rounded-2xl bg-destructive/5 border border-destructive/10 p-4 text-[10px] font-black uppercase tracking-widest text-destructive">
             {error}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <motion.button
            type="submit"
            disabled={pending || !content.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-16 px-12 bg-primary text-white rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-accent transition-all disabled:opacity-30 disabled:grayscale"
          >
            <Send className="size-4" />
            {pending ? "POSTING..." : "POST COMMENT"}
          </motion.button>
        </div>
      </div>

      {/* Editorial decoration */}
      <span className="absolute -left-10 -bottom-10 text-[15vw] font-black opacity-[0.02] pointer-events-none select-none italic text-primary">
        WRITE
      </span>
    </form>
  );
}
