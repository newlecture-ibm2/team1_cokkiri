"use client";

import dynamic from "next/dynamic";
import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Edit3, Loader2, Trash2 } from "lucide-react";
import { POST_CATEGORIES, type PostAttachment, type PostLink } from "../_types/community";
import { cn } from "@/lib/utils";
import { messageFromBffResponse } from "@/lib/bff-error-message";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import {
  POST_BODY_HTML_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  normalizePostBodyApiCommunityUrlsToBff,
  normalizePostBodyBffCommunityUrlsToApi,
  plainTextFromHtml,
} from "@/lib/post-html";
import type { ApiResponse } from "@/types/api";
const CommunityRichTextEditor = dynamic(
  () =>
    import("./CommunityRichTextEditor").then((m) => ({
      default: m.CommunityRichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[240px] rounded-xl border border-dashed border-border bg-muted/15" />
    ),
  },
);

type CurrentUser = {
  userId: number;
  role?: string | null;
};

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
  authorUserId: number;
  currentUser?: CurrentUser;
  initialCategory: string;
  initialTitle: string;
  initialContent: string;
  initialLinks?: PostLink[] | null;
  initialAttachments?: PostAttachment[] | null;
};

export function PostEditDeleteActions({
  postId,
  authorUserId,
  currentUser,
  initialCategory,
  initialTitle,
  initialContent,
  initialLinks,
  initialAttachments,
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
  const [attachments, setAttachments] = useState<EditPostAttachment[]>(() =>
    mapToEditAttachments(initialAttachments),
  );
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const [editSession, setEditSession] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (editing) return;
    setCategory(initialCategory);
    setTitle(initialTitle);
    setContent(initialContent);
    setLinksText(initialLinksText);
    setAttachments(mapToEditAttachments(initialAttachments));
  }, [postId, editing, initialCategory, initialTitle, initialContent, initialLinksText, initialAttachments]);

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function deletePost() {
    if (!canMutate) return;
    if (!confirm("이 게시글을 삭제할까요?")) return;

    startTransition(async () => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401) {
        setSubmitError(LOGIN_REQUIRED_MESSAGE);
        setShowLoginModal(true);
        return;
      }
      if (res.ok) router.push("/community");
    });
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
        setEditing(false);
        router.refresh();
      } catch {
        setSubmitError("네트워크 오류가 발생했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
      }
    });
  }

  if (!canMutate) return null;

  return (
    <section className="mt-8 rounded-[2rem] border border-border bg-background/80 p-4 backdrop-blur-sm md:p-6">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      {!editing ? (
        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSubmitError(null);
              setCategory(initialCategory);
              setTitle(initialTitle);
              setContent(normalizePostBodyApiCommunityUrlsToBff(initialContent));
              setLinksText(initialLinksText);
              setAttachments(mapToEditAttachments(initialAttachments));
              setNewFiles(null);
              setEditSession((s) => s + 1);
              setEditing(true);
            }}
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
          {submitError ? (
            <p
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}
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
                maxLength={POST_TITLE_MAX_LENGTH}
                required
                className="mt-2 w-full rounded-xl border border-input bg-surface px-4 py-3 font-medium tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                제목 최대 {POST_TITLE_MAX_LENGTH}자(이모지 등은 2자로 셀 수 있음)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`edit-content-${postId}`}
              className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground"
            >
              내용
            </label>
            <div className="mt-2">
              <CommunityRichTextEditor
                key={`edit-${postId}-${editSession}`}
                id={`edit-content-${postId}`}
                value={content}
                onChange={setContent}
                placeholder="본문을 수정하세요. 이미지는 툴바에서 추가할 수 있습니다."
              />
            </div>
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

          <div className="space-y-2">
            <p className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">첨부</p>
            {attachments.length === 0 ? (
              <p className="mt-2 text-sm font-medium text-muted-foreground">기존 첨부 없음</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {attachments.map((a, i) => (
                  <li
                    key={`${a.fileUrl}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3"
                  >
                    <span className="truncate text-sm font-medium text-foreground">{a.fileName || a.fileUrl}</span>
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
            <label
              htmlFor={`edit-post-new-files-${postId}`}
              className="mt-4 block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground"
            >
              새 파일 추가 (선택)
            </label>
            <input
              id={`edit-post-new-files-${postId}`}
              type="file"
              multiple
              onChange={(e) => setNewFiles(e.target.files)}
              className={cn(
                "mt-2 w-full rounded-xl border border-input bg-surface px-4 py-3 font-medium tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-wider file:text-primary-foreground",
              )}
            />
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              저장 시 선택한 파일이 기존 첨부 뒤에 추가됩니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitError(null);
                setEditing(false);
              }}
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

