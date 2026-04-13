"use client";

import dynamic from "next/dynamic";
import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { POST_CATEGORIES, type PostAttachment, type PostLink } from "../../../_types/community";
import { cn } from "@/lib/utils";
import { messageFromBffResponse } from "@/lib/bff-error-message";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { CancelModal } from "@/components/shared/CancelModal";
import {
  POST_BODY_HTML_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  normalizePostBodyBffCommunityUrlsToApi,
  plainTextFromHtml,
} from "@/lib/post-html";
import type { ApiResponse } from "@/types/api";

const CommunityRichTextEditor = dynamic(
  () =>
    import("../../../_components/CommunityRichTextEditor").then((m) => ({
      default: m.CommunityRichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[240px] rounded-xl border border-dashed border-border bg-muted/15" />
    ),
  },
);

type EditPostAttachment = {
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
};

function mapToEditAttachments(list: PostAttachment[] | null | undefined): EditPostAttachment[] {
  return (list ?? [])
    .filter((a): a is PostAttachment & { fileUrl: string } => Boolean(a?.fileUrl))
    .map((a) => ({
      fileUrl: a.fileUrl,
      fileName: a.fileName ?? "",
      fileSize: a.fileSize ?? null,
    }));
}

type Props = {
  postId: number;
  initialCategory: string;
  initialTitle: string;
  initialContent: string;
  initialLinks?: PostLink[] | null;
  initialAttachments?: PostAttachment[] | null;
};

const fieldClass =
  "w-full rounded-xl border border-primary/10 bg-white px-6 py-4 font-medium tracking-tight text-base text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-all placeholder:text-primary/30";

export function EditPostForm({
  postId,
  initialCategory,
  initialTitle,
  initialContent,
  initialLinks,
  initialAttachments,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initialLinksText = useMemo(() => {
    return (initialLinks ?? [])
      .map((l) => l.url)
      .filter((u): u is string => Boolean(u))
      .slice(0, 3)
      .join("\n");
  }, [initialLinks]);

  const [category, setCategory] = useState(initialCategory);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [linksText, setLinksText] = useState(initialLinksText);
  const [attachments, setAttachments] = useState<EditPostAttachment[]>(() =>
    mapToEditAttachments(initialAttachments),
  );
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!title.trim() || !plainTextFromHtml(content)) return;
    if (pending) return;

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
        linkLines.forEach((url) => formData.append("links", url));
        formData.append(
          "attachmentsJson",
          JSON.stringify(
            attachments.map((a) => ({
              fileUrl: a.fileUrl,
              fileName: a.fileName,
              fileSize: a.fileSize ?? undefined,
            })),
          ),
        );
        if (newFiles?.length) {
          for (let i = 0; i < newFiles.length; i++) {
            formData.append("files", newFiles[i]);
          }
        }

        const res = await fetch(`/api/posts/${postId}`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
        if (res.status === 401) {
          setSubmitError(LOGIN_REQUIRED_MESSAGE);
          setShowLoginModal(true);
          return;
        }
        let json: ApiResponse<unknown>;
        try {
          json = await res.json();
        } catch {
          setSubmitError("서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
        if (!res.ok || !json.success) {
          setSubmitError(
            messageFromBffResponse(json, "저장하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요."),
          );
          return;
        }
        router.push(`/community/${postId}`);
        router.refresh();
      } catch {
        setSubmitError("네트워크 오류가 발생했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-16">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {submitError ? (
        <p
          className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-4 text-sm font-medium tracking-tight text-destructive"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <section className="space-y-4">
        <label
          htmlFor="edit-category"
          className="flex items-baseline gap-2 mb-4"
        >
          <span className="text-lg font-black uppercase tracking-tight text-primary">CATEGORY.</span>
          <span className="text-sm font-medium text-primary/80">카테고리</span>
        </label>
        <div className="relative">
          <select
            id="edit-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={cn(fieldClass, "appearance-none cursor-pointer")}
          >
            {POST_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 size-4 text-primary/40"
            aria-hidden
          />
        </div>
      </section>

      <section className="space-y-4">
        <label
          htmlFor="edit-title"
          className="flex items-baseline gap-2 mb-4"
        >
          <span className="text-lg font-black uppercase tracking-tight text-primary">TITLE.</span>
          <span className="text-sm font-medium text-primary/80">제목</span>
        </label>
        <input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={POST_TITLE_MAX_LENGTH}
          required
          placeholder="제목을 입력하세요."
          className={fieldClass}
        />
        <p className="px-8 text-xs font-medium tracking-tight text-primary/40">
          최대 {POST_TITLE_MAX_LENGTH.toLocaleString()}자까지 입력 가능합니다.
        </p>
      </section>

      <section className="space-y-4">
        <label
          htmlFor="edit-content"
          className="flex items-baseline gap-2 mb-4"
        >
          <span className="text-lg font-black uppercase tracking-tight text-primary">CONTENT.</span>
          <span className="text-sm font-medium text-primary/80">내용</span>
        </label>
        <CommunityRichTextEditor
          id="edit-content"
          value={content}
          onChange={setContent}
          placeholder="내용을 입력하세요."
        />
      </section>

      <section className="space-y-4">
        <label
          htmlFor="edit-links"
          className="flex items-baseline gap-2 mb-4"
        >
          <span className="text-lg font-black uppercase tracking-tight text-primary">LINKS.</span>
          <span className="text-sm font-medium text-primary/80">참고 링크</span>
        </label>
        <textarea
          id="edit-links"
          value={linksText}
          onChange={(e) => setLinksText(e.target.value)}
          rows={3}
          placeholder="URL을 한 줄에 하나씩 입력하세요. (최대 3개)"
          className={cn(fieldClass, "resize-none")}
        />
      </section>

      <section className="space-y-8">
        <div className="space-y-4">
          <label className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-black uppercase tracking-tight text-primary">FILES.</span>
            <span className="text-sm font-medium text-primary/80">첨부파일</span>
          </label>
          {attachments.length === 0 ? (
            <p className="text-xs font-medium tracking-tight text-primary/30">기존 첨부파일 없음</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attachments.map((a, i) => (
                <li
                  key={`${a.fileUrl}-${i}`}
                  className="flex items-center justify-between px-5 py-3 bg-primary/5 rounded-xl"
                >
                  <span className="truncate text-sm font-medium tracking-tight text-primary/70">{a.fileName || a.fileUrl}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="shrink-0 ml-3 text-xs font-semibold tracking-tight text-destructive hover:text-destructive/80 transition-colors"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="edit-new-files"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-primary/10 bg-primary/5 px-6 py-3 text-sm font-semibold tracking-tight text-primary/70 transition-all hover:bg-primary/10 hover:border-primary/20 hover:text-primary"
            >
              파일 첨부
            </label>
            <input
              id="edit-new-files"
              type="file"
              multiple
              onChange={(e) => setNewFiles(e.target.files)}
              className="hidden"
            />
            {newFiles && newFiles.length > 0 ? (
              <span className="text-sm font-medium tracking-tight text-primary/60">
                {newFiles.length}개 파일 선택됨
              </span>
            ) : (
              <span className="text-xs font-medium tracking-tight text-primary/30">
                선택된 파일 없음
              </span>
            )}
          </div>
          <p className="text-xs font-medium tracking-tight text-primary/40">
            여러 파일을 첨부할 수 있습니다. 이미지는 에디터 툴바에서도 추가할 수 있습니다.
          </p>
        </div>
      </section>

      <div className="pt-20 flex flex-col md:flex-row justify-end gap-4 items-center">
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="w-full md:w-auto px-10 py-3.5 text-sm font-semibold tracking-tight text-primary/60 rounded-xl border-2 border-primary/10 hover:border-primary/20 hover:text-primary transition-all"
        >
          취소
        </button>
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={pending}
          className={cn(
            "w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-12 py-3.5 text-sm font-semibold tracking-tight text-white shadow-lg shadow-primary/15 hover:bg-primary/90 transition-all",
            pending && "opacity-60",
          )}
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          수정하기
        </motion.button>
      </div>
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push(`/community/${postId}`)}
      />
    </form>
  );
}
