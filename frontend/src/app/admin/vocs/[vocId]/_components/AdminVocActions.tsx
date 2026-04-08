"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { bffErrorMessageFromResponse } from "@/lib/bff-error-message";

const labelClass =
  "block font-black text-sm uppercase tracking-[0.3em] text-muted-foreground";

const fieldClass =
  "mt-3 w-full rounded-xl border border-input bg-surface px-4 py-4 font-medium tracking-tight text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  vocId: number;
  status: string;
};

export function AdminVocActions({ vocId, status }: Props) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canReply = status === "OPEN" || status === "IN_PROGRESS";
  const canResolve = status === "OPEN" || status === "IN_PROGRESS";

  function submitReply(e: React.FormEvent) {
    e.preventDefault();
    const text = reply.trim();
    if (!text || !canReply || pending) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/vocs/${vocId}/reply`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reply: text }),
        });
        if (res.ok) {
          setReply("");
          router.refresh();
          return;
        }
        setError(await bffErrorMessageFromResponse(res));
      } catch {
        setError("연결에 실패했습니다.");
      }
    });
  }

  function resolveVoc() {
    if (!canResolve || pending) return;
    if (!confirm("이 민원을 처리 완료(RESOLVED)로 표시할까요?")) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/vocs/${vocId}/resolve`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          router.refresh();
          return;
        }
        setError(await bffErrorMessageFromResponse(res));
      } catch {
        setError("연결에 실패했습니다.");
      }
    });
  }

  if (!canReply && !canResolve) {
    return (
      <p className="mt-8 font-medium tracking-tight text-muted-foreground">
        취소되었거나 이미 처리 완료된 민원입니다. 답변·처리완료 작업을 할 수 없습니다.
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-8 border-t border-border pt-10">
      {canReply && (
        <form onSubmit={submitReply} className="space-y-4">
          <div>
            <label htmlFor="admin-voc-reply" className={labelClass}>
              관리자 답변
            </label>
            <textarea
              id="admin-voc-reply"
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                if (error) setError(null);
              }}
              rows={6}
              placeholder="입주민에게 전달할 답변을 입력하세요."
              className={fieldClass}
            />
            <p className="mt-2 text-sm font-medium tracking-tight text-muted-foreground">
              등록 시 입주민에게 알림이 발송되며, 해당 민원은 처리 완료(RESOLVED)로 반영됩니다.
            </p>
          </div>
          {error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            <motion.button
              type="submit"
              disabled={pending || !reply.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-wider text-primary-foreground",
                (pending || !reply.trim()) && "opacity-60",
              )}
            >
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
              답변 등록
            </motion.button>
          </div>
        </form>
      )}

      {canResolve && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-border bg-muted/15 p-6">
          <p className="max-w-md text-sm font-medium tracking-tight text-foreground/90">
            답변 없이 바로 종료하거나, 답변 후 최종 완료 처리할 때 사용합니다.
          </p>
          <motion.button
            type="button"
            disabled={pending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resolveVoc}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-secondary bg-secondary/15 px-6 py-3 text-sm font-black uppercase tracking-wider text-secondary",
              pending && "opacity-60",
            )}
          >
            <CheckCircle2 className="size-4" aria-hidden />
            처리 완료
          </motion.button>
        </div>
      )}
    </div>
  );
}
