"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VOC_CATEGORIES,
  type VocCategoryCode,
  type VocAttachment,
  type VocDetail,
} from "../../../_types/voc";

const labelClass =
  "block font-black text-sm uppercase tracking-[0.3em] text-muted-foreground";

const fieldClass =
  "mt-3 w-full rounded-xl border border-input bg-surface px-4 py-4 font-medium tracking-tight text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  initial: VocDetail;
};

export function VocEditForm({ initial }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<VocCategoryCode>(
    (initial.category as VocCategoryCode) ?? "OTHER",
  );
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [attachments, setAttachments] = useState<VocAttachment[]>(initial.attachments ?? []);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || pending) return;

    setError(null);
    startTransition(async () => {
      try {
        const body = {
          category,
          title: title.trim(),
          content: content.trim(),
          attachments: attachments.map((a) => ({
            fileUrl: a.fileUrl,
            fileName: a.fileName,
            fileSize: a.fileSize ?? undefined,
          })),
        };

        const res = await fetch(`/api/bff/voc/${initial.vocId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as { success?: boolean; message?: string };
        if (!res.ok || !json.success) {
          setError(json.message ?? "저장에 실패했습니다.");
          return;
        }
        router.push(`/voc/${initial.vocId}`);
        router.refresh();
      } catch {
        setError("연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-10">
      <Link
        href={`/voc/${initial.vocId}`}
        className="group inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        상세로
      </Link>

      <div>
        <label htmlFor="edit-voc-category" className={labelClass}>
          유형
        </label>
        <div className="relative">
          <select
            id="edit-voc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as VocCategoryCode)}
            className={cn(fieldClass, "appearance-none pr-10 leading-none py-0 h-14")}
          >
            {VOC_CATEGORIES.map((c) => (
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

      <div>
        <label htmlFor="edit-voc-title" className={labelClass}>
          제목
        </label>
        <input
          id="edit-voc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="edit-voc-content" className={labelClass}>
          내용
        </label>
        <textarea
          id="edit-voc-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <p className={labelClass}>첨부 (삭제만 가능 · 새 파일은 등록 후에는 API 미지원)</p>
        {attachments.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-muted-foreground">첨부 없음</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {attachments.map((a, i) => (
              <li
                key={`${a.fileUrl}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3"
              >
                <span className="truncate text-sm font-medium text-foreground">{a.fileName}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="shrink-0 text-[11px] font-black uppercase tracking-wider text-destructive"
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-4">
        <Link
          href={`/voc/${initial.vocId}`}
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
          저장
        </motion.button>
      </div>
    </form>
  );
}
