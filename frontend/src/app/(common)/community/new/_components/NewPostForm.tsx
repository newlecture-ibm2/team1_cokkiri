"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageFromBffResponse } from "@/lib/bff-error-message";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { AccessDeniedModal } from "@/components/shared/AccessDeniedModal";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import {
  POST_BODY_HTML_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  normalizePostBodyBffCommunityUrlsToApi,
  plainTextFromHtml,
} from "@/lib/post-html";
import type { ApiResponse } from "@/types/api";
import { POST_CATEGORIES } from "../../_types/community";
import { CancelModal } from "@/components/shared/CancelModal";
const CommunityRichTextEditor = dynamic(
  () =>
    import("../../_components/CommunityRichTextEditor").then((m) => ({
      default: m.CommunityRichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mt-3 min-h-[280px] rounded-xl border border-dashed border-border bg-muted/15" />
    ),
  },
);

const labelClass =
  "flex items-baseline gap-2 mb-4";

const fieldClass =
  "w-full rounded-xl border border-primary/10 bg-white px-6 py-4 font-medium tracking-tight text-base text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-all placeholder:text-primary/30";

export function NewPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState("FREE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const categoryFromQuery = searchParams.get("category")?.trim();
    if (!categoryFromQuery) return;
    const exists = POST_CATEGORIES.some((item) => item.value === categoryFromQuery);
    if (!exists) return;
    setCategory(categoryFromQuery);
  }, [searchParams]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!title.trim() || !plainTextFromHtml(content) || pending) return;

    const titleTrim = title.trim();
    if (titleTrim.length > POST_TITLE_MAX_LENGTH) {
      setSubmitError(
        `제목은 ${POST_TITLE_MAX_LENGTH.toLocaleString()}자(UTF-16 코드 유닛) 이내로 입력해 주세요.`,
      );
      return;
    }

    const body = normalizePostBodyBffCommunityUrlsToApi(content.trim());
    if (body.length > POST_BODY_HTML_MAX_LENGTH) {
      setSubmitError(
        `본문은 ${POST_BODY_HTML_MAX_LENGTH.toLocaleString()}자(UTF-16 코드 유닛) 이내로 줄여 주세요.`,
      );
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("category", category);
        formData.append("title", titleTrim);
        formData.append("content", body);
        if (files.length > 0) {
          for (const file of files) {
            formData.append("files", file);
          }
        }

        const res = await fetch("/api/posts", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (res.status === 401) {
          setSubmitError(LOGIN_REQUIRED_MESSAGE);
          setShowLoginModal(true);
          return;
        }
        if (res.status === 403) {
          setShowAccessDenied(true);
          return;
        }
        let json: ApiResponse<{ postId: number } | null>;
        try {
          json = await res.json();
        } catch {
          setSubmitError("서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
        if (!res.ok || !json.success) {
          setSubmitError(messageFromBffResponse(json, "등록하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요."));
          return;
        }
        const id = json.data?.postId;
        if (id == null) {
          setSubmitError("등록은 되었지만 글 번호를 받지 못했습니다. 목록에서 확인해 주세요.");
          return;
        }
        router.push(`/community/${id}`);
        router.refresh();
      } catch {
        setSubmitError("네트워크 오류가 발생했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <AccessDeniedModal isOpen={showAccessDenied} onClose={() => setShowAccessDenied(false)} />

      {submitError ? (
        <p
          className="rounded-3xl border border-destructive/20 bg-destructive/5 px-8 py-4 text-sm font-black uppercase tracking-wider text-destructive"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <div className="space-y-8">
        <CategoryDropdown
          value={category}
          onChange={setCategory}
          labelClass={labelClass}
          fieldClass={fieldClass}
        />

        <section className="space-y-4">
          <label htmlFor="title" className={labelClass}>
            <span className="text-lg font-black uppercase tracking-tight text-primary">TITLE.</span>
            <span className="text-sm font-medium text-primary/80">제목</span>
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요."
            maxLength={POST_TITLE_MAX_LENGTH}
            required
            className={fieldClass}
          />
          <p className="px-8 text-xs font-medium tracking-tight text-primary/40">
            최대 {POST_TITLE_MAX_LENGTH.toLocaleString()}자까지 입력 가능합니다.
          </p>
        </section>

        <section className="space-y-4">
          <label htmlFor="content" className={labelClass}>
            <span className="text-lg font-black uppercase tracking-tight text-primary">CONTENT.</span>
            <span className="text-sm font-medium text-primary/80">내용</span>
          </label>
          <div className="rounded-[2rem] border border-primary/10 bg-white p-4 h-full">
            <CommunityRichTextEditor
              id="content"
              value={content}
              onChange={setContent}
              placeholder="내용을 입력하세요."
            />
          </div>
        </section>

        <section className="space-y-4">
          <label className={labelClass}>
            <span className="text-lg font-black uppercase tracking-tight text-primary">FILES.</span>
            <span className="text-sm font-medium text-primary/80">첨부파일</span>
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label
                htmlFor="post-files"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-primary/10 bg-primary/5 px-6 py-3 text-sm font-semibold tracking-tight text-primary/70 transition-all hover:bg-primary/10 hover:border-primary/20 hover:text-primary"
              >
                파일 첨부
              </label>
              <input
                id="post-files"
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const selected = Array.from(e.target.files);
                    setFiles((prev) => [...prev, ...selected]);
                    e.target.value = "";
                  }
                }}
                className="sr-only"
              />
              {files.length === 0 && (
                <span className="text-xs font-medium tracking-tight text-primary/30">
                  선택된 파일 없음
                </span>
              )}
            </div>
            {files.length > 0 && (
              <ul className="space-y-1.5 pl-1">
                {files.map((file, i) => (
                  <li key={`${file.name}-${i}`} className="flex items-center gap-2 text-sm font-semibold tracking-tight text-primary">
                    <span className="text-primary/40">•</span>
                    <a
                      href={URL.createObjectURL(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 decoration-primary/30 hover:text-accent transition-colors truncate max-w-md"
                    >
                      {file.name}
                    </a>
                    <span className="text-xs text-primary/50 shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-xs font-semibold text-destructive/70 hover:text-destructive transition-colors shrink-0"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs font-medium tracking-tight text-primary/40">
            여러 파일을 첨부할 수 있습니다. (파일당 최대 15MB, 총 50MB)
          </p>
        </section>
      </div>

      <div className="pt-10 flex flex-col md:flex-row justify-end gap-4 items-center">
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="w-full md:w-auto px-10 py-3.5 text-sm font-semibold tracking-tight text-primary rounded-xl border-2 border-primary/10 hover:border-primary/20 hover:text-primary transition-all"
        >
          취소
        </button>
        <motion.button
          type="submit"
          disabled={pending}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-12 py-3.5 text-sm font-semibold tracking-tight text-white shadow-lg shadow-primary/15 hover:bg-primary/90 transition-all",
            pending && "opacity-60",
          )}
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          게시하기
        </motion.button>
      </div>
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push("/community")}
      />
    </form>
  );
}

/* ── Custom Category Dropdown ── */
function CategoryDropdown({
  value,
  onChange,
  labelClass,
  fieldClass,
}: {
  value: string;
  onChange: (v: string) => void;
  labelClass: string;
  fieldClass: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = POST_CATEGORIES.find((c) => c.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <section className="space-y-4">
      <label className={labelClass}>
        <span className="text-lg font-black uppercase tracking-tight text-primary">CATEGORY.</span>
        <span className="text-sm font-medium text-primary/80">유형선택</span>
      </label>
      <div className="flex items-center gap-4">
        <div ref={ref} className="relative w-56">
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            className={cn(
              fieldClass,
              "flex items-center justify-between pr-12 h-12 cursor-pointer rounded-xl text-left",
            )}
          >
            <span className="font-semibold text-sm tracking-tight">
              {selected?.label ?? "선택"}
            </span>
            <ChevronDown
              className={cn(
                "absolute right-5 top-1/2 -translate-y-1/2 size-[1.125rem] opacity-60 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          <AnimatePresence>
            {open && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                style={{ transformOrigin: "top center" }}
                className="absolute z-50 mt-2 w-full flex flex-col gap-1.5 rounded-3xl border-2 border-stone-200/70 bg-stone-50/98 p-3 shadow-md backdrop-blur-md dark:border-stone-600/50 dark:bg-stone-900/95"
              >
                {POST_CATEGORIES.map((c, i) => (
                  <motion.li
                    key={c.value}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.34, delay: 0.1 + i * 0.055, ease: [0.33, 1, 0.68, 1] }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onChange(c.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-center rounded-md py-2.5 text-sm font-semibold tracking-tight transition-colors",
                        c.value === value
                          ? "bg-primary/10 text-primary"
                          : "text-primary/70 hover:bg-primary/5 hover:text-primary",
                      )}
                    >
                      {c.label}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        <p className="text-xs font-medium tracking-tight text-primary/40">
          공지 카테고리는 관리자만 선택 가능합니다.
        </p>
      </div>
    </section>
  );
}
