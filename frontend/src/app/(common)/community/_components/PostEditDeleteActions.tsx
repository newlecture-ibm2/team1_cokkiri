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
    <section className="mt-8 rounded-[2rem] border border-primary/10 bg-background p-4 shadow-2xl shadow-primary/5 md:p-6">
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
            className="inline-flex items-center gap-2 rounded-full border border-secondary bg-secondary/15 px-5 py-2.5 text-xs font-black uppercase tracking-[0.24em] text-secondary"
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
            className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.24em] text-destructive disabled:opacity-60"
          >
            <Trash2 className="size-4" aria-hidden />
            삭제
          </motion.button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-12">
          {submitError ? (
            <p
              className="rounded-3xl border border-destructive/20 bg-destructive/5 px-8 py-4 text-sm font-black uppercase tracking-wider text-destructive"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}
          
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <label
                htmlFor={`edit-category-${postId}`}
                className="block text-[10px] font-black uppercase tracking-[0.5em] text-accent"
              >
                01 | CATEGORY
              </label>
              <div className="relative">
                <select
                  id={`edit-category-${postId}`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-16 appearance-none rounded-3xl border border-primary/5 bg-white/40 backdrop-blur-sm px-8 font-medium tracking-tight text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-all cursor-pointer"
                >
                  {POST_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 size-4 text-accent"
                  aria-hidden
                />
              </div>
            </div>

            <div className="space-y-4">
              <label
                htmlFor={`edit-title-${postId}`}
                className="block text-[10px] font-black uppercase tracking-[0.5em] text-accent"
              >
                02 | DISCOURSE TITLE
              </label>
              <input
                id={`edit-title-${postId}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={POST_TITLE_MAX_LENGTH}
                required
                className="w-full h-16 rounded-3xl border border-primary/5 bg-white/40 backdrop-blur-sm px-8 font-medium tracking-tight text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-all"
              />
              <p className="px-4 text-[9px] font-black tracking-widest text-muted-foreground/50 uppercase">
                Max {POST_TITLE_MAX_LENGTH} characters.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label
              htmlFor={`edit-content-${postId}`}
              className="block text-[10px] font-black uppercase tracking-[0.5em] text-accent"
            >
              03 | NARRATIVE CONTENT
            </label>
            <div className="rounded-[2.5rem] border border-primary/5 bg-white/40 backdrop-blur-sm p-4">
              <CommunityRichTextEditor
                key={`edit-${postId}-${editSession}`}
                id={`edit-content-${postId}`}
                value={content}
                onChange={setContent}
                placeholder="Revise your story..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <label
              htmlFor={`edit-links-${postId}`}
              className="block text-[10px] font-black uppercase tracking-[0.5em] text-accent"
            >
              04 | EXTERNAL REFERENCES
            </label>
            <textarea
              id={`edit-links-${postId}`}
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-[2rem] border border-primary/5 bg-white/40 backdrop-blur-sm p-8 font-medium tracking-tight text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-all placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.5em] text-accent">05 | DOCUMENT ASSETS</label>
              {attachments.length === 0 ? (
                <p className="px-8 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">No existing assets</p>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachments.map((a, i) => (
                    <li
                      key={`${a.fileUrl}-${i}`}
                      className="group flex items-center justify-between p-6 bg-white rounded-2xl border border-primary/5 shadow-sm"
                    >
                      <span className="truncate text-xs font-black tracking-tighter text-primary">{a.fileName || a.fileUrl}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="shrink-0 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        REMOVE
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="space-y-4">
              <label
                htmlFor={`edit-post-new-files-${postId}`}
                className="block text-[10px] font-black uppercase tracking-[0.5em] text-accent"
              >
                ADD NEW ASSETS
              </label>
              <input
                id={`edit-post-new-files-${postId}`}
                type="file"
                multiple
                onChange={(e) => setNewFiles(e.target.files)}
                className="w-full rounded-[2rem] border border-primary/5 bg-white/40 backdrop-blur-sm p-6 font-medium tracking-tight text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-all cursor-pointer file:mr-6 file:rounded-xl file:border-0 file:bg-accent file:px-4 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:text-white"
              />
            </div>
          </div>

          <div className="pt-12 flex flex-col md:flex-row items-center justify-end gap-6">
            <button
              type="button"
              onClick={() => {
                setSubmitError(null);
                setEditing(false);
              }}
              className="w-full md:w-auto px-12 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors"
            >
              Discard Changes
            </button>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={pending}
              className="w-full md:w-auto inline-flex items-center justify-center gap-4 rounded-full bg-primary px-16 py-8 text-xs font-black uppercase tracking-[0.5em] text-white shadow-2xl shadow-primary/20"
            >
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              SAVE REVISIONS
            </motion.button>
          </div>
        </form>
      )}
    </section>
  );
}

