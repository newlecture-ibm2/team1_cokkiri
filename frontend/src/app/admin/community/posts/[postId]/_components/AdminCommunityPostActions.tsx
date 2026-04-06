"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { bffErrorMessageFromResponse } from "@/lib/bff-error-message";

type Props = {
  postId: number;
};

export function AdminCommunityPostActions({ postId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);

  function handleDelete() {
    if (pending) return;
    if (!confirm("이 게시글을 삭제할까요? 관련 댓글도 함께 숨김 처리됩니다.")) return;

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/bff/admin/posts/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          setError(await bffErrorMessageFromResponse(res, "게시글 삭제에 실패했습니다."));
          return;
        }
        setSuccess("게시글이 삭제되었습니다. 목록으로 이동합니다.");
        setTimeout(() => router.push("/admin/community"), 500);
      } catch {
        setError("연결에 실패했습니다.");
      }
    });
  }

  return (
    <div className="mt-8 space-y-3 border-t border-border pt-6">
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-primary">{success}</p> : null}
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-destructive hover:bg-destructive/10 disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
        게시글 삭제
      </button>
    </div>
  );
}
