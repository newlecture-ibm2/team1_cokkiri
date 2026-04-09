"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageFromBffResponse } from "@/lib/bff-error-message";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { plainTextFromHtml } from "@/lib/post-html";
import type { ApiResponse } from "@/types/api";
import {
  VOC_BODY_HTML_MAX_LENGTH,
  VOC_TITLE_MAX_LENGTH,
  normalizeVocBffFileUrlsToApi,
} from "@/lib/vocs-html";
import { VOC_CATEGORIES, type VocCategoryCode } from "../../_types/vocs";
import { CancelModal } from "@/components/shared/CancelModal";

const VocRichTextEditor = dynamic(
  () => import("../../_components/VocRichTextEditor").then((m) => ({ default: m.VocRichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="mt-3 min-h-[260px] rounded-xl border border-dashed border-border bg-muted/15" />
    ),
  },
);

const labelClass =
  "block text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-4";

const fieldClass =
  "w-full rounded-[2rem] border border-primary/5 bg-white/40 backdrop-blur-sm p-8 font-medium tracking-tight text-xl text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-all placeholder:text-muted-foreground/30";

export function NewVocForm() {
  const router = useRouter();
  const [category, setCategory] = useState<VocCategoryCode>("FACILITY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !plainTextFromHtml(content) || pending) return;

    const titleTrim = title.trim();
    if (titleTrim.length > VOC_TITLE_MAX_LENGTH) {
      setError(
        `제목은 ${VOC_TITLE_MAX_LENGTH.toLocaleString()}자(UTF-16 코드 유닛) 이내로 입력해 주세요.`,
      );
      return;
    }

    const body = normalizeVocBffFileUrlsToApi(content.trim());
    if (body.length > VOC_BODY_HTML_MAX_LENGTH) {
      setError(
        `본문은 ${VOC_BODY_HTML_MAX_LENGTH.toLocaleString()}자(UTF-16 코드 유닛) 이내로 줄여 주세요.`,
      );
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("category", category);
        formData.append("title", titleTrim);
        formData.append("content", body);
        if (files?.length) {
          for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
          }
        }

        const res = await fetch("/api/vocs", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (res.status === 401) {
          setError(LOGIN_REQUIRED_MESSAGE);
          setShowLoginModal(true);
          return;
        }
        let json: ApiResponse<{ vocId: number } | null>;
        try {
          json = await res.json();
        } catch {
          setError("서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
        if (!res.ok || !json.success) {
          setError(
            messageFromBffResponse(json, "등록하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요."),
          );
          return;
        }
        const vid = json.data?.vocId;
        if (vid == null) {
          setError("등록은 되었지만 민원 번호를 받지 못했습니다. 나의 민원 내역에서 확인해 주세요.");
          return;
        }
        router.push(`/profile/vocs/${vid}`);
        router.refresh();
      } catch {
        setError("네트워크 오류가 발생했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-10">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <Link
        href="/profile/vocs?tab=list"
        className="group inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        내역으로
      </Link>

      {error ? (
        <p
          className="rounded-3xl border border-destructive/20 bg-destructive/5 px-8 py-4 text-sm font-black uppercase tracking-wider text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-16">
        <section className="space-y-4">
          <label htmlFor="category" className={labelClass}>
            01 | CATEGORY
          </label>
          <div className="relative">
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as VocCategoryCode)}
              className={cn(fieldClass, "appearance-none pr-12 leading-none py-0 h-24 cursor-pointer")}
            >
              {VOC_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 size-5 text-accent"
              aria-hidden
            />
          </div>
        </section>

        <section className="space-y-4">
          <label htmlFor="title" className={labelClass}>
            02 | VOC TITLE
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your inquiry..."
            maxLength={VOC_TITLE_MAX_LENGTH}
            required
            className={fieldClass}
          />
        </section>

        <section className="space-y-4">
          <label htmlFor="content" className={labelClass}>
            03 | INQUIRY NARRATIVE
          </label>
          <div className="rounded-[2.5rem] border border-primary/5 bg-white/40 backdrop-blur-sm p-4 h-full">
            <VocRichTextEditor
              id="content"
              value={content}
              onChange={setContent}
              placeholder="Provide detailed information regarding your request..."
            />
          </div>
        </section>

        <section className="space-y-4">
          <label htmlFor="voc-files" className={labelClass}>
            04 | SUPPORTING EVIDENCE (SELECTIVE)
          </label>
          <input
            id="voc-files"
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className={cn(
              fieldClass,
              "cursor-pointer py-8 file:mr-8 file:rounded-xl file:border-0 file:bg-accent file:px-6 file:py-3 file:text-[10px] file:font-black file:uppercase file:tracking-[0.2em] file:text-white hover:file:bg-primary transition-all",
            )}
          />
          <p className="px-8 text-[10px] font-black tracking-widest text-muted-foreground/50 uppercase">
            Up to 5 files (Max 15MB each). Images preferred for clarity.
          </p>
        </section>
      </div>

      <div className="pt-20 flex flex-col md:flex-row justify-end gap-6 items-center">
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="w-full md:w-auto px-12 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors"
        >
          Discard
        </button>
        <motion.button
          type="submit"
          disabled={pending}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-full md:w-auto inline-flex items-center justify-center gap-4 rounded-full bg-primary px-24 py-8 text-xs font-black uppercase tracking-[0.5em] text-white shadow-2xl shadow-primary/20",
            pending && "opacity-60",
          )}
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          SUBMIT INQUIRY
        </motion.button>
      </div>
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push("/profile/vocs")}
      />
    </form>
  );
}
