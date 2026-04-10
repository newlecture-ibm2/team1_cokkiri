"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, CornerDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { CommentItem } from "./CommentItem";
import type { PostAuthor, PostComment } from "../../community/_types/community";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { bffErrorMessageFromResponse } from "@/lib/bff-error-message";
import { cn } from "@/lib/utils";

type CurrentUser = {
  userId: number;
  role?: string | null;
};

type CommentNode = PostComment & { children: CommentNode[] };

function sortById(a: PostComment, b: PostComment) {
  return a.commentId - b.commentId;
}

function buildTree(flatComments: PostComment[]): CommentNode[] {
  const ordered = [...flatComments].sort(sortById);
  const byId = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  for (const c of ordered) {
    byId.set(c.commentId, { ...c, children: [] });
  }

  for (const c of ordered) {
    const node = byId.get(c.commentId);
    if (!node) continue;
    const parentId = c.parentCommentId ?? null;
    if (!parentId) {
      roots.push(node);
      continue;
    }
    const parent = byId.get(parentId);
    if (!parent) roots.push(node);
    else parent.children.push(node);
  }

  return roots;
}

export function CommentThreadSection({
  postId,
  initialComments,
  currentUser,
}: {
  postId: number;
  initialComments: PostComment[];
  currentUser?: CurrentUser;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [rootDraft, setRootDraft] = useState("");
  const [replyDraftById, setReplyDraftById] = useState<Record<number, string>>({});
  const [openReplyForId, setOpenReplyForId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const tree = useMemo(() => buildTree(comments), [comments]);

  function optimisticAuthor(): PostAuthor {
    if (currentUser) {
      return { userId: currentUser.userId, name: "나" };
    }
    return { userId: 0, name: "회원" };
  }

  function addComment(parentCommentId: number | null, content: string) {
    const text = content.trim();
    if (!text || pending) return;
    setSubmitError(null);

    startTransition(async () => {
      const tempId = Date.now();
      const optimistic: PostComment = {
        commentId: tempId,
        parentCommentId,
        content: text,
        author: optimisticAuthor(),
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, optimistic]);

      if (parentCommentId == null) setRootDraft("");
      else setReplyDraftById((prev) => ({ ...prev, [parentCommentId]: "" }));

      try {
        const res = await fetch(`/api/bff/posts/${postId}/comments`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, parentCommentId }),
        });

        if (res.status === 401) {
          setShowLoginModal(true);
          setComments((prev) => prev.filter((c) => c.commentId !== tempId));
          return;
        }

        if (!res.ok) {
          setSubmitError(await bffErrorMessageFromResponse(res));
          setComments((prev) => prev.filter((c) => c.commentId !== tempId));
          return;
        }

        // 서버 정렬/권한 결과를 기준으로 정확히 동기화
        setOpenReplyForId(null);
        router.refresh();
      } catch {
        setSubmitError("연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        setComments((prev) => prev.filter((c) => c.commentId !== tempId));
      }
    });
  }

  function renderNodes(nodes: CommentNode[], depth: number): React.ReactNode {
    return nodes.map((node) => {
      const replyDraft = replyDraftById[node.commentId] ?? "";
      const openReply = openReplyForId === node.commentId;

      return (
        <div key={node.commentId} className={cn(depth > 0 && "ml-5 border-l border-border pl-4 md:ml-8 md:pl-6")}>
          <ul className="space-y-4">
            <CommentItem
              commentId={node.commentId}
              content={node.content}
              authorUserId={node.author.userId}
              authorName={node.author.name}
              createdAt={node.createdAt}
              currentUser={currentUser}
              footerSlot={
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenReplyForId(openReply ? null : node.commentId)}
                    className="inline-flex w-fit items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground"
                  >
                    <CornerDownRight className="size-3.5" aria-hidden />
                    답글
                  </button>
                  {openReply ? (
                    currentUser?.role === "USER" ? (
                      <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-6 text-center">
                        <p className="font-bold text-[11px] text-primary tracking-tight">입주민 전용 기능입니다</p>
                        <p className="mt-1 text-[9px] font-medium text-muted-foreground opacity-60">답글 작성 권한이 없습니다.</p>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          addComment(node.commentId, replyDraft);
                        }}
                        className="rounded-2xl border border-primary/10 bg-background p-4 shadow-sm"
                      >
                        <textarea
                          value={replyDraft}
                          onChange={(e) => setReplyDraftById((prev) => ({ ...prev, [node.commentId]: e.target.value }))}
                          rows={2}
                          placeholder="답글을 입력하세요"
                          className="w-full resize-y rounded-xl border border-input bg-surface px-3 py-2 text-sm font-medium tracking-tight text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setOpenReplyForId(null)}
                            className="rounded-full border border-border px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-foreground"
                          >
                            취소
                          </button>
                          <motion.button
                            type="submit"
                            disabled={pending || !replyDraft.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-primary-foreground disabled:opacity-50"
                          >
                            등록
                          </motion.button>
                        </div>
                      </form>
                    )
                  ) : null}
                </div>
              }
            />
          </ul>
          {node.children.length > 0 ? <div className="mt-4 space-y-4">{renderNodes(node.children, depth + 1)}</div> : null}
        </div>
      );
    });
  }

  return (
    <section className="mt-14 border-t border-border pt-12">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">댓글</h2>

      {tree.length === 0 ? (
        <div
          className="mt-8 flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-primary/20 bg-background px-8 py-14 text-center md:px-12"
          aria-live="polite"
        >
          <MessageCircle className="size-10 text-muted-foreground opacity-80" strokeWidth={1.25} aria-hidden />
          <p className="max-w-sm font-medium tracking-tight text-balance text-muted-foreground md:text-base">
            아직 댓글이 없습니다. 첫 댓글을 남겨 대화를 시작해 보세요.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">{renderNodes(tree, 0)}</div>
      )}

      {submitError ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium tracking-tight text-destructive"
        >
          {submitError}
        </p>
      ) : null}

      {currentUser?.role === "USER" ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-primary/20 bg-primary/5 p-12 text-center">
          <p className="font-black text-xs uppercase tracking-[0.4em] text-destructive mb-3">Resident Only</p>
          <p className="font-bold text-primary tracking-tight">입주민 전용 기능입니다</p>
          <p className="mt-2 text-[10px] font-medium text-muted-foreground opacity-60">
            댓글 작성을 위해선 실제 입주가 확인된 거주민 권한이 필요합니다.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addComment(null, rootDraft);
          }}
          className="mt-8 rounded-[2rem] border border-primary/10 bg-background p-6 shadow-2xl shadow-primary/5 md:p-8"
        >
          <label htmlFor={`comment-root-${postId}`} className="sr-only">
            댓글 작성
          </label>
          <textarea
            id={`comment-root-${postId}`}
            value={rootDraft}
            onChange={(e) => setRootDraft(e.target.value)}
            rows={3}
            placeholder="댓글을 입력하세요"
            className="w-full resize-y rounded-xl border border-input bg-surface px-4 py-3 font-medium tracking-tight text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-4 flex justify-end">
            <motion.button
              type="submit"
              disabled={pending || !rootDraft.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-[0.24em] text-primary-foreground disabled:opacity-50"
            >
              등록
            </motion.button>
          </div>
        </form>
      )}
    </section>
  );
}

