"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageFromBffResponse } from "@/lib/bff-error-message";
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
} from "../../../_types/vocs";
import { CancelModal } from "@/components/shared/CancelModal";

const VocRichTextEditor = dynamic(
  () => import("../../../_components/VocRichTextEditor").then((m) => ({ default: m.VocRichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="mt-3 min-h-[220px] rounded-xl border border-dashed border-border bg-muted/15" />
    ),
  },
);

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
  const [content, setContent] = useState(() => normalizeVocApiFileUrlsToBff(initial.content));
  const [attachments, setAttachments] = useState<VocAttachment[]>(initial.attachments ?? []);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
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

        const res = await fetch(`/api/bff/vocs/${initial.vocId}`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
        let json: ApiResponse<unknown>;
        try {
          json = await res.json();
        } catch {
          setError("서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
        if (!res.ok || !json.success) {
          setError(
            messageFromBffResponse(json, "저장하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요."),
          );
          return;
        }
        router.push(`/vocs/${initial.vocId}`);
        router.refresh();
      } catch {
        setError("네트워크 오류가 발생했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-10">
      <Link
        href={`/vocs/${initial.vocId}`}
        className="group inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        상세로
      </Link>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}

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
          maxLength={VOC_TITLE_MAX_LENGTH}
          required
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          제목 최대 {VOC_TITLE_MAX_LENGTH}자(이모지 등은 2자로 셀 수 있음)
        </p>
      </div>

      <div>
        <label htmlFor="edit-voc-content" className={labelClass}>
          내용
        </label>
        <VocRichTextEditor
          key={initial.vocId}
          id="edit-voc-content"
          value={content}
          onChange={setContent}
          placeholder="민원 내용을 수정하세요. 이미지는 툴바에서 추가할 수 있습니다."
        />
      </div>

      <div>
        <p className={labelClass}>첨부</p>
        {attachments.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-muted-foreground">기존 첨부 없음</p>
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
        <label htmlFor="edit-voc-new-files" className={cn(labelClass, "mt-8")}>
          새 파일 추가 (선택)
        </label>
        <input
          id="edit-voc-new-files"
          type="file"
          multiple
          onChange={(e) => setNewFiles(e.target.files)}
          className={cn(
            fieldClass,
            "cursor-pointer py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-wider file:text-primary-foreground",
          )}
        />
        <p className="mt-2 text-sm font-medium tracking-tight text-muted-foreground">
          저장 시 위에서 선택한 파일이 기존 첨부 뒤에 추가됩니다. 본문 이미지는 에디터의 이미지 버튼으로도 넣을 수 있습니다.
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
          저장
        </motion.button>
      </div>
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push(`/vocs/${initial.vocId}`)}
      />
    </form>
  );
}
