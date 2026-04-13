"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit3, Loader2, Trash2 } from "lucide-react";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";

type CurrentUser = {
  userId: number;
  role?: string | null;
};

type Props = {
  postId: number;
  authorUserId: number;
  currentUser?: CurrentUser;
};

export function PostEditDeleteActions({
  postId,
  authorUserId,
  currentUser,
}: Props) {
  const router = useRouter();
  const canMutate = Boolean(
    currentUser &&
      (currentUser.role === "ADMIN" || currentUser.userId === authorUserId),
  );

  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  function deletePost() {
    if (!canMutate) return;
    if (!confirm("이 게시글을 삭제할까요?")) return;

    startTransition(async () => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401) {
        setSubmitError(LOGIN_REQUIRED_MESSAGE);
        setShowLoginModal(true);
        return;
      }
      if (res.ok) router.push("/community");
    });
  }

  if (!canMutate) return null;

  return (
    <section className="mt-8">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      {submitError ? (
        <p
          className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-4 text-sm font-medium tracking-tight text-destructive"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/community/${postId}/edit`)}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/10 bg-primary/5 px-5 py-2.5 text-sm font-semibold tracking-tight text-primary/70 hover:border-primary/20 hover:text-primary transition-all"
        >
          <Edit3 className="size-4" aria-hidden />
          수정
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={deletePost}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-destructive/20 bg-destructive/5 px-5 py-2.5 text-sm font-semibold tracking-tight text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
          삭제
        </motion.button>
      </div>
    </section>
  );
}
