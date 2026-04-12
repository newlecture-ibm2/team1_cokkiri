"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageFromBffResponse } from "@/lib/bff-error-message";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { AccessDeniedModal } from "@/components/shared/AccessDeniedModal";
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
  "flex items-baseline gap-2 mb-4";

const fieldClass =
  "w-full rounded-xl border border-primary/10 bg-white px-6 py-4 font-medium tracking-tight text-base text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-all placeholder:text-primary/30";

export function NewVocForm() {
  const router = useRouter();
  const [category, setCategory] = useState<VocCategoryCode>("FACILITY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
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
        if (res.status === 403) {
          setShowAccessDenied(true);
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
    <form onSubmit={submit} className="mx-auto max-w-5xl space-y-10">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <AccessDeniedModal isOpen={showAccessDenied} onClose={() => setShowAccessDenied(false)} />

      {error ? (
        <p
          className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-4 text-sm font-medium tracking-tight text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-16">
        <VocCategoryDropdown
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
            maxLength={VOC_TITLE_MAX_LENGTH}
            required
            className={fieldClass}
          />
          <p className="px-6 text-xs font-medium tracking-tight text-primary/40">
            최대 {VOC_TITLE_MAX_LENGTH.toLocaleString()}자까지 입력 가능합니다.
          </p>
        </section>

        <section className="space-y-4">
          <label htmlFor="content" className={labelClass}>
            <span className="text-lg font-black uppercase tracking-tight text-primary">CONTENT.</span>
            <span className="text-sm font-medium text-primary/80">내용</span>
          </label>
          <div className="rounded-[2rem] border border-primary/10 bg-white p-4 h-full">
            <VocRichTextEditor
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
          <div className="flex items-center gap-4">
            <label
              htmlFor="voc-files"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-primary/10 bg-primary/5 px-6 py-3 text-sm font-semibold tracking-tight text-primary/70 transition-all hover:bg-primary/10 hover:border-primary/20 hover:text-primary"
            >
              파일 첨부
            </label>
            <input
              id="voc-files"
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
            />
            {files && files.length > 0 ? (
              <span className="text-sm font-medium tracking-tight text-primary/60">
                {files.length}개 파일 선택됨
              </span>
            ) : (
              <span className="text-xs font-medium tracking-tight text-primary/30">
                선택된 파일 없음
              </span>
            )}
          </div>
          <p className="text-xs font-medium tracking-tight text-primary/40">
            최대 5개, 각 15MB까지 첨부 가능합니다. 이미지 파일을 권장합니다.
          </p>
        </section>
      </div>

      <div className="pt-20 flex flex-col md:flex-row justify-end gap-4 items-center">
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="w-full md:w-auto px-10 py-3.5 text-sm font-semibold tracking-tight text-primary/60 rounded-xl border-2 border-primary/10 hover:border-primary/20 hover:text-primary transition-all"
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
          등록하기
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

/* ── Custom Category Dropdown (matches community CategoryDropdown) ── */
function VocCategoryDropdown({
  value,
  onChange,
  labelClass,
  fieldClass,
}: {
  value: VocCategoryCode;
  onChange: (v: VocCategoryCode) => void;
  labelClass: string;
  fieldClass: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = VOC_CATEGORIES.find((c) => c.value === value);

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
                {VOC_CATEGORIES.map((c, i) => (
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
      </div>
    </section>
  );
}
