"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VOC_CATEGORIES, type VocCategoryCode } from "../../_types/voc";

const labelClass =
  "block font-black text-sm uppercase tracking-[0.3em] text-muted-foreground";

const fieldClass =
  "mt-3 w-full rounded-xl border border-input bg-surface px-4 py-4 font-medium tracking-tight text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function NewVocForm() {
  const router = useRouter();
  const [category, setCategory] = useState<VocCategoryCode>("FACILITY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || pending) return;

    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("category", category);
        formData.append("title", title.trim());
        formData.append("content", content.trim());
        if (files?.length) {
          for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
          }
        }

        const res = await fetch("/api/bff/voc", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const json = (await res.json()) as { success?: boolean; data?: { vocId: number }; message?: string };
        if (!res.ok || !json.success || !json.data?.vocId) {
          setError(json.message ?? "등록에 실패했습니다.");
          return;
        }
        router.push(`/voc/${json.data.vocId}`);
        router.refresh();
      } catch {
        setError("연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-10">
      <Link
        href="/voc"
        className="group inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        목록으로
      </Link>

      <div>
        <label htmlFor="voc-category" className={labelClass}>
          유형
        </label>
        <div className="relative">
          <select
            id="voc-category"
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
        <label htmlFor="voc-title" className={labelClass}>
          제목
        </label>
        <input
          id="voc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="voc-content" className={labelClass}>
          내용
        </label>
        <textarea
          id="voc-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="voc-files" className={labelClass}>
          첨부 파일 (선택)
        </label>
        <input
          id="voc-files"
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className={cn(
            fieldClass,
            "cursor-pointer py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-wider file:text-primary-foreground",
          )}
        />
        <p className="mt-2 text-sm font-medium tracking-tight text-muted-foreground">
          여러 파일을 선택할 수 있습니다.
        </p>
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
          href="/voc"
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
