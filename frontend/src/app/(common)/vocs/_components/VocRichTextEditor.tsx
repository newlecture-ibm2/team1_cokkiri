"use client";

import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import type Toolbar from "quill/modules/toolbar";
import "quill/dist/quill.snow.css";
import { apiFileUrlToBffPath } from "@/lib/bff-file-url";
import { messageFromBffResponse } from "@/lib/bff-error-message";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { VOC_BODY_HTML_MAX_LENGTH } from "@/lib/vocs-html";
import type { ApiResponse } from "@/types/api";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  id?: string;
};

function normalizeHtmlForCompare(html: string): string {
  return html.replace(/\s+/g, " ").trim();
}

export function VocRichTextEditor({ value, onChange, placeholder, id }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastEmittedRef = useRef("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const editorHost = document.createElement("div");
    if (id) editorHost.id = id;
    wrapper.appendChild(editorHost);

    const quill = new Quill(editorHost, {
      theme: "snow",
      placeholder: placeholder ?? "민원 내용을 입력하세요.",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    const toolbar = quill.getModule("toolbar") as Toolbar;
    toolbar.addHandler("image", () => {
      setUploadError(null);
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.click();
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        try {
          const res = await fetch("/api/vocs/upload-editor-image", {
            method: "POST",
            body: fd,
            credentials: "include",
          });
          if (res.status === 401) {
            setUploadError(LOGIN_REQUIRED_MESSAGE);
            setShowLoginModal(true);
            return;
          }
          let json: ApiResponse<{ url: string } | null>;
          try {
            json = await res.json();
          } catch {
            setUploadError("서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
            return;
          }
          if (!res.ok || !json.success || !json.data?.url) {
            setUploadError(
              messageFromBffResponse(json, "이미지를 올리지 못했습니다. 다시 시도해 주세요."),
            );
            return;
          }
          const uploadedUrl = json.data.url;
          const range = quill.getSelection(true);
          const index = range?.index ?? quill.getLength();
          const displayUrl = apiFileUrlToBffPath(uploadedUrl);
          quill.insertEmbed(index, "image", displayUrl);
          quill.setSelection(index + 1, 0);
        } catch {
          setUploadError("네트워크 오류로 이미지를 올리지 못했습니다.");
        }
      };
    });

    quill.on("text-change", () => {
      const html = quill.getSemanticHTML();
      lastEmittedRef.current = html;
      onChangeRef.current(html);
    });

    quillRef.current = quill;

    if (value) {
      const delta = quill.clipboard.convert({ html: value });
      quill.setContents(delta, "silent");
      lastEmittedRef.current = quill.getSemanticHTML();
    }

    return () => {
      const q = quillRef.current;
      if (q) {
        const html = q.getSemanticHTML();
        lastEmittedRef.current = html;
        onChangeRef.current(html);
      }
      quillRef.current = null;
      wrapper.innerHTML = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    if (quill.hasFocus()) return;

    const current = quill.getSemanticHTML();
    if (
      value === current ||
      normalizeHtmlForCompare(value) === normalizeHtmlForCompare(current) ||
      value === lastEmittedRef.current ||
      normalizeHtmlForCompare(value) === normalizeHtmlForCompare(lastEmittedRef.current)
    ) {
      return;
    }
    const delta = quill.clipboard.convert({ html: value });
    quill.setContents(delta, "silent");
    lastEmittedRef.current = quill.getSemanticHTML();
  }, [value]);

  return (
    <div className="space-y-2">
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <div
        className="voc-quill [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-border [&_.ql-toolbar]:bg-surface [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-border [&_.ql-container]:font-sans [&_.ql-editor]:min-h-[220px] [&_.ql-editor]:px-4 [&_.ql-editor]:py-3 [&_.ql-editor]:font-medium [&_.ql-editor]:text-base [&_.ql-editor]:text-foreground [&_.ql-stroke]:stroke-muted-foreground [&_.ql-fill]:fill-muted-foreground [&_.ql-editor.ql-blank::before]:pointer-events-none [&_.ql-editor.ql-blank::before]:text-primary/30 [&_.ql-editor.ql-blank::before]:!left-4 [&_.ql-editor.ql-blank::before]:!top-3 [&_.ql-editor:not(.ql-blank)::before]:hidden [&_.ql-editor:focus.ql-blank::before]:!opacity-0"
        ref={wrapperRef}
      />
      {uploadError ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}
