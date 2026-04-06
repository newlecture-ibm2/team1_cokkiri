"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { MessageSquare, Trash2 } from "lucide-react";
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
        setError(e instanceof Error ? e.message : "댓글 삭제에 실패했습니다.");
      }
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={`rounded-xl px-4 py-2 text-sm font-black uppercase tracking-wider ${
            tab === "posts" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          }`}
        >
          게시글
        </button>
        <button
          type="button"
          onClick={() => setTab("comments")}
          className={`rounded-xl px-4 py-2 text-sm font-black uppercase tracking-wider ${
            tab === "comments" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          }`}
        >
          댓글
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          시작일
          <input
            type="date"
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
            className="block rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
          />
        </label>
        <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          종료일
          <input
            type="date"
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
            className="block rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
          />
        </label>
        {(createdFrom || createdTo) && (
          <button
            type="button"
            onClick={() => {
              setCreatedFrom("");
              setCreatedTo("");
            }}
            className="rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted"
          >
            초기화
          </button>
        )}
      </div>

      {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      {loading ? <p className="text-sm text-muted-foreground">불러오는 중...</p> : null}

      {tab === "posts" && !loading && (
        <ul className="space-y-3">
          {posts.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">게시글이 없습니다.</li>
          ) : (
            posts.map((item) => (
              <li key={item.postId} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">{item.category}</p>
                    <p className="font-bold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      작성자 #{item.authorUserId} · 조회 {item.viewCount} · 좋아요 {item.likeCount} · 댓글 {item.commentCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeletePost(item.postId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                      삭제
                    </button>
                    <Link
                      href={`/admin/community/posts/${item.postId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-primary hover:bg-muted"
                    >
                      상세
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {tab === "comments" && !loading && (
        <ul className="space-y-3">
          {comments.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">댓글이 없습니다.</li>
          ) : (
            comments.map((item) => (
              <li key={item.commentId} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">POST #{item.postId}</p>
                    <p className="font-bold text-foreground">{item.postTitle}</p>
                    <p className="text-sm text-foreground/80">{item.content}</p>
                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                      작성자 #{item.authorUserId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteComment(item.commentId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                      삭제
                    </button>
                    <Link
                      href={`/admin/community/comments/${item.commentId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-primary hover:bg-muted"
                    >
                      상세
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
