import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "@/app/(common)/vocs/_api/bff-server";
import type { ApiResponse, VocDetail } from "@/app/(common)/vocs/_types/vocs";
import { VocShell } from "@/app/(common)/vocs/_components/VocShell";
import { MotionEnter } from "@/app/(common)/community/_components/MotionEnter";
import { VocDetailActions } from "@/app/(common)/vocs/_components/VocDetailActions";
import { vocCategoryLabel, vocStatusLabel } from "@/app/(common)/vocs/_types/vocs";
import { formatDateTimeKo } from "@/lib/format-date";
import { apiFileUrlToBffPath } from "@/lib/bff-file-url";
import { isRichTextBodyHtml } from "@/lib/post-html";
import { prepareVocBodyForDisplay, VOC_RICH_BODY_CLASSNAME } from "@/lib/vocs-html";
import { cn } from "@/lib/utils";
import { VocAccessDeniedState } from "@/app/(common)/vocs/_components/VocAccessDeniedState";

type Params = Promise<{ vocId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { vocId } = await params;
  return { title: `민원 #${vocId} | CoKkiri` };
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "OPEN":
      return "border-secondary/50 bg-secondary/10 text-secondary";
    case "IN_PROGRESS":
      return "border-primary/30 bg-primary/10 text-primary";
    case "RESOLVED":
      return "border-border bg-muted/40 text-muted-foreground";
    case "CANCELLED":
      return "border-muted text-muted-foreground opacity-80";
    default:
      return "border-border bg-muted/30 text-foreground";
  }
}

export default async function VocDetailPage({ params }: { params: Params }) {
  const { vocId } = await params;
  const id = parseInt(vocId, 10);
  if (Number.isNaN(id)) notFound();

  const res = await bffGet(`vocs/${id}`);

  if (res.status === 404) notFound();
  if (res.status === 401) {
    return (
      <VocShell>
        <MotionEnter>
          <div className="mx-auto max-w-3xl text-center">
            <LoginRequiredGate />
            <p className="font-medium text-destructive">{LOGIN_REQUIRED_MESSAGE}</p>
          </div>
        </MotionEnter>
      </VocShell>
    );
  }
  if (res.status === 403) {
    return <VocAccessDeniedState />;
  }
  if (!res.ok) {
    return (
      <VocShell>
        <MotionEnter>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-medium text-destructive" role="alert">
              민원을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          </div>
        </MotionEnter>
      </VocShell>
    );
  }

  const body = (await res.json()) as ApiResponse<VocDetail>;
  if (!body.success || !body.data) notFound();

  const d = body.data;

  return (
    <div className="pt-4 pb-32">
      {/* Back link + Header */}
      <header className="mx-auto max-w-5xl mb-12">
        <div className="flex flex-col gap-6">
          <Link
            href="/vocs?tab=list"
            className="group inline-flex items-center gap-3 text-sm font-bold tracking-tight text-primary/60 hover:text-accent transition-colors w-fit"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 group-hover:bg-accent/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </span>
            목록으로 돌아가기
          </Link>

          {/* Badge + Title */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-primary/10 pb-6">
            <h1 className="text-3xl md:text-5xl tracking-tight leading-snug text-primary min-w-0">
              <span className="font-bold text-[#4A7C6F]">
                {vocCategoryLabel(d.category)}
              </span>
              <span className="mx-1.5 text-muted-foreground/30 font-light">|</span>
              <span className="font-medium">{d.title}</span>
            </h1>
            <div className="shrink-0 self-end pb-1">
              <VocDetailActions vocId={d.vocId} status={d.status} />
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-4">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold tracking-tight",
              statusBadgeClass(d.status),
            )}
          >
            {vocStatusLabel(d.status)}
          </span>
          <span className="text-muted-foreground/30">·</span>
          <time className="font-medium text-primary/70">{formatDateTimeKo(d.createdAt)}</time>
        </div>
      </header>

      <article className="mx-auto max-w-5xl space-y-12 mt-10">

        {/* Content Body */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-primary">
            내용
          </h2>
          <div className="bg-surface p-8 md:p-12 rounded-lg border border-primary/5 shadow-sm relative overflow-hidden">
            <div className={cn("post-html font-medium leading-[1.8] tracking-tight text-primary text-base relative z-10", VOC_RICH_BODY_CLASSNAME)}>
              {isRichTextBodyHtml(d.content) ? (
                <div
                  className="[&_img]:my-6 [&_img]:max-h-[min(70vh,520px)] [&_img]:w-full [&_img]:rounded-xl [&_img]:object-cover [&_img]:shadow-md [&_p]:mb-4 [&_a]:break-all [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/30 [&_a]:underline-offset-4 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-8 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-8 [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-6 [&_blockquote]:italic [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-primary/5 [&_pre]:bg-primary/5 [&_pre]:p-6 [&_code]:text-sm"
                  dangerouslySetInnerHTML={{ __html: prepareVocBodyForDisplay(d.content) }}
                />
              ) : (
                <div className="whitespace-pre-wrap">{d.content}</div>
              )}
            </div>
          </div>
        </section>

        {/* Attachments */}
        {(d.attachments?.length ?? 0) > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-tight text-primary">
              첨부파일
            </h2>
            <ul className="space-y-1.5">
              {d.attachments?.map((a, i) =>
                a.fileUrl ? (
                  <li key={`${a.fileUrl}-${i}`}>
                    <a
                      href={apiFileUrlToBffPath(a.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors"
                    >
                      <ArrowRight className="size-3 shrink-0" />
                      <span className="underline underline-offset-2 decoration-accent/30 truncate">{a.fileName}</span>
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        )}

        {/* Admin Reply */}
        {(d.adminReply || d.status === "RESOLVED" || d.status === "IN_PROGRESS") && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-primary">
                관리자 답변
              </h2>
              {d.repliedAt && (
                <time className="text-xs font-medium text-primary/50">
                  {formatDateTimeKo(d.repliedAt)}
                </time>
              )}
            </div>
            <div className="bg-primary/5 p-8 md:p-12 rounded-lg border border-primary/10 shadow-sm">
              {d.adminReply && isRichTextBodyHtml(d.adminReply) ? (
                <div
                  className={cn("font-medium leading-[1.8] tracking-tight text-primary text-base", VOC_RICH_BODY_CLASSNAME)}
                  dangerouslySetInnerHTML={{ __html: prepareVocBodyForDisplay(d.adminReply) }}
                />
              ) : (
                <p className="font-medium leading-[1.8] tracking-tight text-primary text-base whitespace-pre-wrap">
                  {d.adminReply ?? "관리자 답변을 준비 중입니다."}
                </p>
              )}
            </div>
          </section>
        )}
      </article>
    </div>
  );

}
