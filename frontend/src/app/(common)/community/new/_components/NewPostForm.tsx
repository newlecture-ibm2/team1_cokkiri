"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageFromBffResponse } from "@/lib/bff-error-message";
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
  "block font-black text-sm uppercase tracking-[0.3em] text-muted-foreground";

const fieldClass =
  "mt-3 w-full rounded-xl border border-input bg-surface px-4 py-4 font-medium tracking-tight text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function NewPostForm() {
  const router = useRouter();
  const [category, setCategory] = useState("FREE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linksText, setLinksText] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

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

    const linkLines = linksText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("category", category);
        formData.append("title", titleTrim);
        formData.append("content", body);
        // backend spec: links: String[] (multipart/form-data)
        linkLines.forEach((url) => formData.append("links", url));
        if (files?.length) {
          for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
          }
        }

        const res = await fetch("/api/bff/posts", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
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
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-10">
      <Link
        href="/community"
        className="group inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        목록으로
      </Link>

      {submitError ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

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
          maxLength={POST_TITLE_MAX_LENGTH}
          required
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          제목 최대 {POST_TITLE_MAX_LENGTH.toLocaleString()}자(이모지 등은 2자로 셀 수 있음)
        </p>
      </div>

      <div>
        <label htmlFor="content" className={labelClass}>
          내용
        </label>
        <CommunityRichTextEditor
          id="content"
          value={content}
          onChange={setContent}
          placeholder="본문을 입력하고 이미지는 툴바 이미지 버튼으로 넣을 수 있습니다."
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

      <div>
        <label htmlFor="post-files" className={labelClass}>
          첨부 파일 (선택)
        </label>
        <input
          id="post-files"
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className={cn(
            fieldClass,
            "cursor-pointer py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-wider file:text-primary-foreground",
          )}
        />
        <p className="mt-2 text-sm font-medium tracking-tight text-muted-foreground">
          여러 파일을 선택할 수 있습니다. 본문 이미지는 에디터 툴바에서도 추가할 수 있습니다.
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="rounded-xl border border-border px-6 py-3 text-sm font-black uppercase tracking-wider text-foreground transition-transform duration-200 hover:-translate-y-0.5"
        >
          취소
        </button>
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
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push("/community")}
      />
    </form>
  );
}
