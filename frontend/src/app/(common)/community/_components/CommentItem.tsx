"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Trash2 } from "lucide-react";
import { bffErrorMessageFromResponse } from "@/lib/bff-error-message";
import { formatDateTimeKo } from "@/lib/format-date";
import { CancelModal } from "@/components/shared/CancelModal";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";

type CurrentUser = {
  userId: number;
  role?: string | null;
};

export function CommentItem({
  commentId,
  content,
  authorUserId,
  authorName,
  createdAt,
  currentUser,
  footerSlot,
}: {
  commentId: number;
  content: string;
  authorUserId: number;
  authorName: string;
  createdAt: string;
  currentUser?: CurrentUser;
  footerSlot?: React.ReactNode;
}) {
  const router = useRouter();
  const canMutate =
    Boolean(currentUser) &&
    (currentUser!.userId === authorUserId ||
      Boolean(currentUser!.role?.toUpperCase().includes("ADMIN")));

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(content);
  }, [content, editing]);

  function startEdit() {
    setError(null);
    setDraft(content);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraft(content);
    setError(null);
  }

  function save() {
    if (!canMutate) return;
    const text = draft.trim();
    if (!text || pending) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/comments/${commentId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        if (res.status === 401) {
          setShowLoginModal(true);
          return;
        }
        if (res.ok) {
          setEditing(false);
          router.refresh();
          return;
        }
        setError(await bffErrorMessageFromResponse(res));
      } catch {
        setError("연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  function deleteComment() {
    if (!canMutate) return;
    if (!confirm("이 댓글을 삭제할까요?")) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.status === 401) {
          setShowLoginModal(true);
          return;
        }
        if (res.ok) {
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
    <div className="rounded-lg bg-background border border-primary/15 p-5 md:p-6">
      <div className="flex flex-col gap-3">
        {/* Author + Date inline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center size-6 rounded-full bg-accent/15 text-[10px] font-bold text-accent">
              {(authorName ?? "?").charAt(0)}
            </span>
            <span className="text-sm font-bold text-primary">{authorName ?? "익명"}</span>
          </div>
          <time className="text-xs text-muted-foreground/60" suppressHydrationWarning>
            {formatDateTimeKo(createdAt)}
          </time>
        </div>

        {/* Content */}
        <div>
          {!editing ? (
            <div className="space-y-3">
              <p className="whitespace-pre-wrap text-sm font-medium tracking-tight text-primary leading-relaxed">
                {content}
              </p>

              {error && (
                <p role="alert" className="text-xs font-medium text-destructive">{error}</p>
              )}

              {canMutate && (
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Edit3 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={deleteComment}
                    disabled={pending}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (error) setError(null);
                }}
                rows={3}
                autoFocus
                className="w-full resize-none rounded-lg bg-surface border border-primary/10 px-4 py-3 text-sm font-medium tracking-tight text-primary focus:ring-2 focus:ring-accent outline-none leading-relaxed"
              />

              {error && (
                <p role="alert" className="text-xs font-medium text-destructive">{error}</p>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={pending || !draft.trim()}
                  className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-accent transition-colors disabled:opacity-30"
                >
                  {pending ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          setShowCancelModal(false);
          cancelEdit();
        }}
      />
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      {footerSlot && <div className="mt-2 pt-2 border-t border-primary/5">{footerSlot}</div>}
    </div>
  );
}
