"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    <li className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-primary/5 shadow-2xl shadow-primary/5 transition-all group relative overflow-hidden">
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between pb-4 border-b border-primary/5">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent">Author</span>
            <span className="text-sm font-black uppercase tracking-tighter text-primary">{authorName}</span>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Posted on</span>
             <time className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               {new Date(createdAt).toLocaleDateString()} · {new Date(createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </time>
          </div>
        </div>

        <div className="py-2">
          {!editing ? (
            <div className="space-y-6">
              <p className="whitespace-pre-wrap text-lg font-medium tracking-tight text-primary leading-relaxed opacity-80">
                {content}
              </p>
              
              {error && (
                <div role="alert" className="rounded-2xl bg-destructive/5 border border-destructive/10 p-4 text-[10px] font-black uppercase tracking-widest text-destructive">
                   {error}
                </div>
              )}

              {canMutate && (
                <div className="flex items-center justify-end gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startEdit}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent hover:text-primary transition-colors"
                  >
                    <Edit3 className="size-3" />
                    Edit
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={deleteComment}
                    disabled={pending}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-destructive/60 hover:text-destructive transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </motion.button>
                </div>
              )}
            </div>
          ) : (
            <form
              className="space-y-6"
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
                autoFocus
                className="w-full resize-none rounded-3xl bg-primary/5 border-none p-8 font-medium tracking-tight text-primary focus:ring-2 focus:ring-accent outline-none text-lg leading-relaxed h-[200px]"
              />
              
              {error && (
                <div role="alert" className="rounded-2xl bg-destructive/5 border border-destructive/10 p-4 text-[10px] font-black uppercase tracking-widest text-destructive">
                   {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-6">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all"
                >
                  CANCEL
                </button>
                <motion.button
                  type="submit"
                  disabled={pending || !draft.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-14 px-10 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-accent transition-all disabled:opacity-30"
                >
                  {pending ? "SAVING..." : "SAVE CHANGES"}
                </motion.button>
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
      {footerSlot && <div className="mt-8 pt-8 border-t border-primary/5">{footerSlot}</div>}
      
      {/* Background decoration */}
      <span className="absolute -right-10 -bottom-10 text-[20vw] font-black opacity-[0.01] pointer-events-none select-none italic tracking-tighter">
        CMNT
      </span>
    </li>
  );
}
