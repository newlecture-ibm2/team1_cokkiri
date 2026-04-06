"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit3, Trash2 } from "lucide-react";
import { bffErrorMessageFromResponse } from "@/lib/bff-error-message";
import { formatDateTimeKo } from "@/lib/format-date";
import { CancelModal } from "@/components/shared/CancelModal";

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
}: {
  commentId: number;
  content: string;
  authorUserId: number;
  authorName: string;
  createdAt: string;
  currentUser?: CurrentUser;
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
        const res = await fetch(`/api/bff/comments/${commentId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
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
        const res = await fetch(`/api/bff/comments/${commentId}`, {
          method: "DELETE",
          credentials: "include",
        });
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
    <li className="rounded-[2rem] border border-border bg-background/80 p-6 backdrop-blur-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground">
          {authorName}
        </span>
        <time
          dateTime={createdAt}
          className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          {formatDateTimeKo(createdAt)}
        </time>
      </div>

      {!editing ? (
        <>
          <p className="mt-3 whitespace-pre-wrap font-medium tracking-tight text-balance text-foreground">
            {content}
          </p>
          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium tracking-tight text-destructive"
            >
              {error}
            </p>
          ) : null}
          {canMutate && (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-secondary bg-secondary/15 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-secondary"
              >
                <Edit3 className="size-4" aria-hidden />
                수정
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={deleteComment}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-destructive disabled:opacity-60"
              >
                <Trash2 className="size-4" aria-hidden />
                삭제
              </motion.button>
            </div>
          )}
        </>
      ) : (
        <form
          className="mt-4 space-y-4"
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
            rows={4}
            className="w-full resize-y rounded-xl border border-input bg-surface px-4 py-3 font-medium tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium tracking-tight text-destructive"
            >
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="rounded-xl border border-border px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-foreground transition-transform duration-200 hover:-translate-y-0.5"
            >
              취소
            </button>
            <motion.button
              type="submit"
              disabled={pending || !draft.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-primary-foreground disabled:opacity-60"
            >
              저장
            </motion.button>
          </div>
        </form>
      )}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          setShowCancelModal(false);
          cancelEdit();
        }}
      />
    </li>
  );
}
