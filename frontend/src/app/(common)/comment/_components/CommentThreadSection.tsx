"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, CornerDownRight, ChevronDown } from "lucide-react";
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
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
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
        <div key={node.commentId} className={cn(depth > 0 && "ml-5 pl-4 md:ml-8 md:pl-6")}>
          <CommentItem
            commentId={node.commentId}
            content={node.content}
            authorUserId={node.author.userId}
            authorName={node.author.name}
            createdAt={node.createdAt}
            currentUser={currentUser}
            footerSlot={
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setOpenReplyForId(openReply ? null : node.commentId)}
                  className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
                >
                  <CornerDownRight className="size-3" aria-hidden />
                  답글 쓰기
                </button>
                {openReply ? (
                  currentUser?.role === "USER" ? (
                    <p className="text-xs text-muted-foreground/60 pl-4">입주민 전용 기능입니다.</p>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addComment(node.commentId, replyDraft);
                      }}
                      className="pl-4"
                    >
                      <textarea
                        value={replyDraft}
                        onChange={(e) => setReplyDraftById((prev) => ({ ...prev, [node.commentId]: e.target.value }))}
                        rows={2}
                        placeholder="답글을 입력하세요"
                        className="w-full resize-y rounded-lg border border-primary/10 bg-surface px-3 py-2 text-sm font-medium tracking-tight text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setOpenReplyForId(null)}
                          className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          disabled={pending || !replyDraft.trim()}
                          className="rounded-lg bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground hover:bg-accent transition-colors disabled:opacity-40"
                        >
                          등록
                        </button>
                      </div>
                    </form>
                  )
                ) : null}
              </div>
            }
          />
          {node.children.length > 0 && (
            <div className="mt-2 ml-5 pl-4 md:ml-8 md:pl-6">
              <button
                type="button"
                onClick={() => {
                  setExpandedReplies((prev) => {
                    const next = new Set(prev);
                    if (next.has(node.commentId)) next.delete(node.commentId);
                    else next.add(node.commentId);
                    return next;
                  });
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-primary transition-colors mb-2"
              >
                <ChevronDown className={cn("size-3.5 transition-transform", expandedReplies.has(node.commentId) && "rotate-180")} />
                답글 {node.children.length}개
              </button>
              {expandedReplies.has(node.commentId) && (
                <div className="space-y-2">{renderNodes(node.children, depth + 1)}</div>
              )}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <section>
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {tree.length === 0 ? (
        <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground" aria-live="polite">
          <MessageCircle className="size-4 opacity-50" strokeWidth={1.5} aria-hidden />
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
        </div>
      ) : (
        <div className="space-y-3">{renderNodes(tree, 0)}</div>
      )}

      {submitError ? (
        <p role="alert" className="mt-4 text-xs font-medium text-destructive">{submitError}</p>
      ) : null}

      {currentUser?.role === "USER" ? (
        <div className="mt-3 rounded-lg border border-dashed border-primary/15 bg-primary/5 px-4 py-5 text-center">
          <p className="text-xs font-semibold text-primary/70">입주민 전용 기능입니다</p>
          <p className="mt-1 text-xs text-muted-foreground/60">댓글 작성을 위해선 거주민 권한이 필요합니다.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addComment(null, rootDraft);
          }}
          className="mt-3"
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
            className="w-full resize-y rounded-lg border border-primary/10 bg-surface px-4 py-3 text-sm font-medium tracking-tight text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={pending || !rootDraft.trim()}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-accent transition-colors disabled:opacity-40"
            >
              등록
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

