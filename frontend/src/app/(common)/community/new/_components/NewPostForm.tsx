"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { POST_CATEGORIES } from "../../_types/community";

const labelClass =
  "block font-black text-sm uppercase tracking-[0.3em] text-muted-foreground";

const fieldClass =
  "mt-3 w-full rounded-xl border border-input bg-surface px-4 py-4 font-medium tracking-tight text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function NewPostForm() {
  const router = useRouter();
  const [category, setCategory] = useState("FREE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linksText, setLinksText] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || pending) return;

    const linkLines = linksText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("category", category);
        formData.append("title", title.trim());
        formData.append("content", content.trim());
        // backend spec: links: String[] (multipart/form-data)
        linkLines.forEach((url) => formData.append("links", url));

        const res = await fetch("/api/bff/posts", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.success) return;
        const id = (json.data as { postId: number }).postId;
        router.push(`/community/${id}`);
        router.refresh();
      } catch {
        /* ignore */
      }
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-10">
      <Link
        href="/community"
        className="group inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        목록으로
      </Link>

      <div>
        <label htmlFor="category" className={labelClass}>
          카테고리
        </label>
        <div className="relative">
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={cn(fieldClass, "appearance-none pr-10 leading-none py-0 h-14")}
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
        <p className="mt-2 text-sm font-medium tracking-tight text-muted-foreground">
          공지(NOTICE)는 관리자만 등록할 수 있습니다.
        </p>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          제목
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="content" className={labelClass}>
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="links" className={labelClass}>
          링크 (선택, 한 줄에 하나, 최대 3개)
        </label>
        <textarea
          id="links"
          value={linksText}
          onChange={(e) => setLinksText(e.target.value)}
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Link
          href="/community"
          className="rounded-xl border border-border px-6 py-3 text-sm font-black uppercase tracking-wider text-foreground transition-transform duration-200 hover:-translate-y-0.5"
        >
          취소
        </Link>
        <motion.button
          type="submit"
          disabled={pending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-wider text-primary-foreground",
            pending && "opacity-60",
          )}
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          등록
        </motion.button>
      </div>
    </form>
  );
}
