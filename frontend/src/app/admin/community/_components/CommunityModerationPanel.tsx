"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { ApiError } from "@/lib/api";
import {
  deleteAdminComment,
  deleteAdminPost,
  fetchAdminComments,
  fetchAdminPosts,
} from "../_api/communityAdminApi";
import type { AdminCommentItem, AdminPostItem } from "../_types/community-admin";

type TabKey = "posts" | "comments";

export function CommunityModerationPanel() {
  const [tab, setTab] = useState<TabKey>("posts");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [posts, setPosts] = useState<AdminPostItem[]>([]);
  const [comments, setComments] = useState<AdminCommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        if (createdFrom && createdTo && createdFrom > createdTo) {
          setError("기간 설정이 올바르지 않습니다. 시작일은 종료일보다 이후일 수 없습니다.");
          setLoading(false);
          return;
        }
        const from = createdFrom || undefined;
        const to = createdTo || undefined;
        if (tab === "posts") {
          const res = await fetchAdminPosts({ createdFrom: from, createdTo: to });
          if (mounted) setPosts(res.data?.content ?? []);
        } else {
          const res = await fetchAdminComments({ createdFrom: from, createdTo: to });
          if (mounted) setComments(res.data?.content ?? []);
        }
      } catch (e) {
        if (e instanceof ApiError && (e.errorCode === "UNAUTHORIZED" || e.errorCode === "FORBIDDEN")) {
          setShowAuthModal(true);
        }
        if (mounted) setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [tab, createdFrom, createdTo]);

  function handleDeletePost(postId: number) {
    startTransition(async () => {
      try {
        await deleteAdminPost(postId);
        setPosts((prev) => prev.filter((p) => p.postId !== postId));
      } catch (e) {
        if (e instanceof ApiError && (e.errorCode === "UNAUTHORIZED" || e.errorCode === "FORBIDDEN")) {
          setShowAuthModal(true);
        }
        setError(e instanceof Error ? e.message : "게시글 삭제에 실패했습니다.");
      }
    });
  }

  function handleDeleteComment(commentId: number) {
    startTransition(async () => {
      try {
        await deleteAdminComment(commentId);
        setComments((prev) => prev.filter((c) => c.commentId !== commentId));
      } catch (e) {
        if (e instanceof ApiError && (e.errorCode === "UNAUTHORIZED" || e.errorCode === "FORBIDDEN")) {
          setShowAuthModal(true);
        }
        setError(e instanceof Error ? e.message : "댓글 삭제에 실패했습니다.");
      }
    });
  }

  return (
    <section className="space-y-12">
      <LoginRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="관리자 권한이 필요합니다."
        description="관리자 계정으로 로그인 후 다시 시도해 주세요."
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-200 pb-8">
        {/* Tabs */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTab("posts")}
            className={cn(
              "text-lg font-bold tracking-tight transition-colors",
              tab === "posts" ? "text-primary" : "text-stone-400 hover:text-stone-600"
            )}
          >
            게시글
          </button>
          <span className="text-stone-200 font-light">|</span>
          <button
            type="button"
            onClick={() => setTab("comments")}
            className={cn(
              "text-lg font-bold tracking-tight transition-colors",
              tab === "comments" ? "text-primary" : "text-stone-400 hover:text-stone-600"
            )}
          >
            댓글
          </button>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 py-1.5 border border-stone-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">기간</span>
            <input
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none text-stone-700"
            />
            <span className="text-stone-300">~</span>
            <input
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none text-stone-700"
            />
          </div>
          {(createdFrom || createdTo) && (
            <button
              type="button"
              onClick={() => {
                setCreatedFrom("");
                setCreatedTo("");
              }}
              className="text-xs font-bold text-stone-400 hover:text-accent underline underline-offset-4"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="py-20 text-center">
          <p className="text-sm font-medium text-stone-400 animate-pulse">불러오는 중...</p>
        </div>
      ) : null}

      {tab === "posts" && !loading && (
        <ul className="space-y-6">
          {posts.length === 0 ? (
            <li className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-dashed border-stone-200 bg-stone-50/50 px-6 py-16 text-center text-sm text-stone-400 font-medium">
              게시글이 없습니다.
            </li>
          ) : (
            posts.map((item) => (
              <li key={item.postId} className="group relative rounded-[2.5rem] border border-stone-200 bg-white p-8 transition-all duration-300 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/5">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex min-w-0 flex-1 items-start gap-6">
                    <div className="mt-1 bg-stone-100 rounded-2xl p-3.5 shrink-0 group-hover:bg-stone-200 transition-colors text-stone-900">
                      <MessageSquare className="size-6" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 space-y-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-xs uppercase tracking-widest text-stone-400">
                          {item.category}
                        </span>
                        <span className="text-stone-200 text-xs font-light">·</span>
                        <span className="font-bold text-xs text-stone-500">
                          작성자 #{item.authorUserId}
                        </span>
                      </div>
                      <div className="font-normal text-xl tracking-wide text-stone-900 md:text-2xl line-clamp-1">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-stone-400">
                        <span>조회 {item.viewCount}</span>
                        <span>좋아요 {item.likeCount}</span>
                        <span>댓글 {item.commentCount}</span>
                        <span className="text-stone-200 font-light">·</span>
                        <time>{item.createdAt.split("T")[0]}</time>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (confirm("정격 이 게시글을 삭제하시겠습니까?")) {
                          handleDeletePost(item.postId);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#7F1D1D]/20 bg-[#7F1D1D]/5 px-4 py-1.5 text-xs font-black text-[#7F1D1D] hover:bg-[#7F1D1D]/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                      삭제
                    </button>
                    <Link
                      href={`/admin/community/posts/${item.postId}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-black text-stone-900 hover:bg-stone-50 transition-colors"
                    >
                      상세 보기
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {tab === "comments" && !loading && (
        <ul className="space-y-6">
          {comments.length === 0 ? (
            <li className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-dashed border-stone-200 bg-stone-50/50 px-6 py-16 text-center text-sm text-stone-400 font-medium">
              댓글이 없습니다.
            </li>
          ) : (
            comments.map((item) => (
              <li key={item.commentId} className="group relative rounded-[2.5rem] border border-stone-200 bg-white p-8 transition-all duration-300 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/5">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex min-w-0 flex-1 items-start gap-6">
                    <div className="mt-1 bg-stone-100 rounded-2xl p-3.5 shrink-0 group-hover:bg-stone-200 transition-colors text-stone-900">
                      <MessageSquare className="size-6" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 space-y-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-xs uppercase tracking-widest text-stone-400">
                          POST #{item.postId}
                        </span>
                        <span className="text-stone-200 text-xs font-light">·</span>
                        <span className="font-bold text-xs text-stone-500 line-clamp-1">
                          {item.postTitle}
                        </span>
                      </div>
                      <div className="font-normal text-xl tracking-wide text-stone-900 md:text-2xl line-clamp-2">
                        {item.content}
                      </div>
                      <p className="text-xs font-bold text-stone-400">
                        작성자 #{item.authorUserId} · {item.createdAt.split("T")[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (confirm("정말 이 댓글을 삭제하시겠습니까?")) {
                          handleDeleteComment(item.commentId);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#7F1D1D]/20 bg-[#7F1D1D]/5 px-4 py-1.5 text-xs font-black text-[#7F1D1D] hover:bg-[#7F1D1D]/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                      삭제
                    </button>
                    <Link
                      href={`/admin/community/comments/${item.commentId}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-black text-stone-900 hover:bg-stone-50 transition-colors"
                    >
                      상세 보기
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
