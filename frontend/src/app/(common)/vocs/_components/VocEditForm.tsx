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
import { LOGIN_REQUIRED_MESSAGE, VOC_MY_VOC_FORBIDDEN_MESSAGE } from "@/lib/auth-messages";
import { plainTextFromHtml } from "@/lib/post-html";
import type { ApiResponse } from "@/types/api";
import {
  VOC_BODY_HTML_MAX_LENGTH,
  VOC_TITLE_MAX_LENGTH,
  normalizeVocApiFileUrlsToBff,
  normalizeVocBffFileUrlsToApi,
} from "@/lib/vocs-html";
import {
  VOC_CATEGORIES,
  type VocCategoryCode,
  type VocAttachment,
  type VocDetail,
} from "../_types/vocs";
import { CancelModal } from "@/components/shared/CancelModal";

const VocRichTextEditor = dynamic(
  () => import("./VocRichTextEditor").then((m) => ({ default: m.VocRichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="mt-3 min-h-[220px] rounded-xl border border-dashed border-border bg-muted/15" />
    ),
  },
);

const labelClass =
  "block text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-4";

const fieldClass =
  "w-full rounded-[2rem] border border-primary/5 bg-white/40 backdrop-blur-sm p-8 font-medium tracking-tight text-xl text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-all placeholder:text-muted-foreground/30";

type Props = {
  initial: VocDetail;
};

export function VocEditForm({ initial }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<VocCategoryCode>(
    (initial.category as VocCategoryCode) ?? "OTHER",
  );
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(() => normalizeVocApiFileUrlsToBff(initial.content));
  const [attachments, setAttachments] = useState<VocAttachment[]>(initial.attachments ?? []);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

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

        const res = await fetch(`/api/vocs/${initial.vocId}`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
        if (res.status === 401) {
          setError(LOGIN_REQUIRED_MESSAGE);
          setShowLoginModal(true);
          return;
        }
        let json: ApiResponse<unknown>;
        try {
          json = await res.json();
        } catch {
          setError("서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
        if (res.status === 403) {
          setError(messageFromBffResponse(json, VOC_MY_VOC_FORBIDDEN_MESSAGE));
          return;
        }
        if (!res.ok || !json.success) {
          setError(
            messageFromBffResponse(json, "저장하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요."),
          );
          return;
        }
        router.push(`/profile/vocs/${initial.vocId}`);
        router.refresh();
      } catch {
        setError("네트워크 오류가 발생했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl space-y-16 py-12">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <Link
        href={`/profile/vocs/${initial.vocId}`}
        className="group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-accent hover:text-primary transition-all"
      >
        ← Back to Inquiry
      </Link>

      {error ? (
        <p
          role="alert"
          className="rounded-3xl border border-destructive/20 bg-destructive/5 px-8 py-4 text-sm font-black uppercase tracking-wider text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-16">
        <section className="space-y-4">
          <label htmlFor="edit-voc-category" className={labelClass}>
            01 | CATEGORY
          </label>
          <div className="relative">
            <select
              id="edit-voc-category"
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
          <label htmlFor="edit-voc-title" className={labelClass}>
            02 | VOC TITLE
          </label>
          <input
            id="edit-voc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={VOC_TITLE_MAX_LENGTH}
            required
            className={fieldClass}
          />
        </section>

        <section className="space-y-4">
          <label htmlFor="edit-voc-content" className={labelClass}>
            03 | INQUIRY NARRATIVE
          </label>
          <div className="rounded-[2.5rem] border border-primary/5 bg-white/40 backdrop-blur-sm p-4">
            <VocRichTextEditor
              key={initial.vocId}
              id="edit-voc-content"
              value={content}
              onChange={setContent}
              placeholder="Revise your inquiry message..."
            />
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-4">
            <p className={labelClass}>04 | EXISTING ASSETS</p>
            {attachments.length === 0 ? (
              <p className="px-8 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">No existing assets</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((a, i) => (
                  <li
                    key={`${a.fileUrl}-${i}`}
                    className="group flex items-center justify-between p-6 bg-white rounded-2xl border border-primary/5 shadow-sm"
                  >
                    <span className="truncate text-xs font-black tracking-tighter text-primary">{a.fileName}</span>
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
            <label htmlFor="edit-voc-new-files" className={labelClass}>
              ADD NEW EVIDENCE
            </label>
            <input
              id="edit-voc-new-files"
              type="file"
              multiple
              onChange={(e) => setNewFiles(e.target.files)}
              className={cn(
                fieldClass,
                "cursor-pointer py-8 file:mr-8 file:rounded-xl file:border-0 file:bg-accent file:px-6 file:py-3 file:text-[10px] file:font-black file:uppercase file:tracking-[0.2em] file:text-white hover:file:bg-primary transition-all",
              )}
            />
          </div>
        </section>
      </div>

      <div className="pt-20 flex flex-col md:flex-row justify-end gap-6 items-center">
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="w-full md:w-auto px-12 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors"
        >
          Discard Changes
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
          SAVE REVISIONS
        </motion.button>
      </div>
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push(`/profile/vocs/${initial.vocId}`)}
      />
    </form>
  );
}
