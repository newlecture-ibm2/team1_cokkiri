"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Edit3, Loader2, Trash2 } from "lucide-react";
import { POST_CATEGORIES, type PostLink } from "../_types/community";

type CurrentUser = {
  userId: number;
  role?: string | null;
};

type Props = {
  postId: number;
  authorUserId: number;
  currentUser?: CurrentUser;
  initialCategory: string;
  initialTitle: string;
  initialContent: string;
  initialLinks?: PostLink[] | null;
};

export function PostEditDeleteActions({
  postId,
  authorUserId,
  currentUser,
  initialCategory,
  initialTitle,
  initialContent,
  initialLinks,
}: Props) {
  const router = useRouter();
  const canMutate = Boolean(
    currentUser &&
      (currentUser.role === "ADMIN" || currentUser.userId === authorUserId),
  );

  const initialLinksText = useMemo(() => {
    return (initialLinks ?? [])
      .map((l) => l.url)
      .filter((u): u is string => Boolean(u))
      .slice(0, 3)
      .join("\n");
  }, [initialLinks]);

  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const [category, setCategory] = useState(initialCategory);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [linksText, setLinksText] = useState(initialLinksText);

  function deletePost() {
    if (!canMutate) return;
    if (!confirm("이 게시글을 삭제할까요?")) return;

    startTransition(async () => {
      const res = await fetch(`/api/bff/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) router.push("/community");
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (pending) return;

    const linkLines = linksText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      linkLines.forEach((url) => formData.append("links", url));

      const res = await fetch(`/api/bff/posts/${postId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    });
  }

  if (!canMutate) return null;

  return (
    <section className="mt-8 rounded-[2rem] border border-border bg-background/80 p-4 backdrop-blur-sm md:p-6">
      {!editing ? (
        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-secondary bg-secondary/15 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-secondary"
          >
            <Edit3 className="size-4" aria-hidden />
            수정
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={deletePost}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-destructive disabled:opacity-60"
          >
            <Trash2 className="size-4" aria-hidden />
            삭제
          </motion.button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor={`edit-category-${postId}`}
                className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground"
              >
                카테고리
              </label>
              <div className="relative">
                <select
                  id={`edit-category-${postId}`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full appearance-none rounded-xl border border-input bg-surface px-4 py-0 pr-10 h-12 font-medium tracking-tight text-foreground text-base leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {POST_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  aria-hidden
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`edit-title-${postId}`}
                className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground"
              >
                제목
              </label>
              <input
                id={`edit-title-${postId}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                className="mt-2 w-full rounded-xl border border-input bg-surface px-4 py-3 font-medium tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`edit-content-${postId}`}
              className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground"
            >
              내용
            </label>
            <textarea
              id={`edit-content-${postId}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
              className="mt-2 w-full resize-y rounded-xl border border-input bg-surface px-4 py-3 font-medium tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`edit-links-${postId}`}
              className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground"
            >
              링크 (선택, 한 줄에 하나, 최대 3개)
            </label>
            <textarea
              id={`edit-links-${postId}`}
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-input bg-surface px-4 py-3 font-medium tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-border px-6 py-3 text-xs font-black uppercase tracking-wider text-foreground transition-transform duration-200 hover:-translate-y-0.5"
            >
              취소
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-wider text-primary-foreground disabled:opacity-60"
            >
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              저장
            </motion.button>
          </div>
        </form>
      )}
    </section>
  );
}

