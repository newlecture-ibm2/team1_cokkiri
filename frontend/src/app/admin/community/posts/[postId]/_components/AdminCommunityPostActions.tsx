"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { bffErrorMessageFromResponse } from "@/lib/bff-error-message";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";

const labelClass =
  "block font-black text-sm md:text-base uppercase tracking-[0.2em] text-stone-900";

const fieldClass =
  "mt-3 w-full rounded-xl border border-input bg-surface px-4 py-4 font-normal tracking-tight text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  postId: number;
};

export function AdminCommunityPostActions({ postId }: Props) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const text = reply.trim();
    if (!text || pending) return;

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/community/posts/${postId}/comments`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        if (res.status === 401 || res.status === 403) {
          setShowAuthModal(true);
        }
        if (res.ok) {
          setReply("");
          setSuccess("댓글이 등록되었습니다.");
          router.refresh();
          return;
        }
        setError(await bffErrorMessageFromResponse(res, "댓글 등록에 실패했습니다."));
      } catch {
        setError("연결에 실패했습니다.");
      }
    });
  }

  function handleDelete() {
    if (pending) return;
    if (!confirm("이 게시글을 삭제할까요? 관련 댓글도 함께 숨김 처리됩니다.")) return;

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/posts/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.status === 401 || res.status === 403) {
          setShowAuthModal(true);
        }
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
    <div className="mt-10 space-y-8 border-t border-border pt-10">
      <LoginRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="관리자 권한이 필요합니다."
        description="관리자 계정으로 로그인 후 다시 시도해 주세요."
      />

      <form onSubmit={submitComment} className="space-y-4">
        <div>
          <label htmlFor="admin-post-comment" className={labelClass}>
            커뮤니티 댓글 작성
          </label>
          <textarea
            id="admin-post-comment"
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
              if (error) setError(null);
            }}
            rows={6}
            placeholder="관리자 권한으로 댓글을 남길 수 있습니다."
            className={fieldClass}
          />
        </div>

        {error ? <p role="alert" className="text-sm font-medium text-destructive">{error}</p> : null}
        {success ? <p className="text-sm font-medium text-primary">{success}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs font-medium text-stone-400">
            욕설이나 비방 등 부적절한 내용은 운영 원칙에 의해 제한될 수 있습니다.
          </p>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending || !reply.trim()}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl bg-stone-950 px-6 py-3 text-sm font-black uppercase tracking-wider text-white transition-all",
                (pending || !reply.trim()) && "opacity-60"
              )}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              댓글 등록
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-[#7F1D1D] bg-[#7F1D1D]/5 px-6 py-3 text-sm font-black uppercase tracking-wider text-[#7F1D1D] hover:bg-[#7F1D1D]/10 transition-all disabled:opacity-50"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              게시글 삭제
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
