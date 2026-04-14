"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { cn } from "@/lib/utils";

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
    <>
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      {submitError ? (
        <p
          className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-4 text-sm font-medium tracking-tight text-destructive"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}
      <div className="pt-20 flex flex-col md:flex-row justify-end gap-4 items-center">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={deletePost}
          disabled={pending}
          className={cn(
            "w-full md:w-auto px-10 py-3.5 text-sm font-semibold tracking-tight text-primary rounded-xl border-2 border-primary/10 hover:border-primary/20 hover:text-primary transition-all",
            pending && "opacity-60",
          )}
        >
          {pending && <Loader2 className="size-4 animate-spin mr-2" aria-hidden />}
          삭제
        </motion.button>
        <button
          type="button"
          onClick={() => router.push(`/community/${postId}/edit`)}
          className="w-full md:w-auto px-12 py-3.5 text-sm font-semibold tracking-tight text-white bg-primary rounded-xl shadow-lg shadow-primary/15 hover:bg-primary/90 transition-all"
        >
          수정
        </button>
      </div>
    </>
  );
}
