import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { adminBffGet } from "../_api/admin-bff-server";
import type { AdminVocDetail, ApiResponse } from "../_types/admin-vocs";
import { adminVocCategoryLabel, adminVocStatusLabel } from "../_types/admin-vocs";
import { MotionEnter } from "../_components/MotionEnter";
import { AdminVocActions } from "./_components/AdminVocActions";
import { formatDateTimeKo } from "@/lib/format-date";
import { apiFileUrlToBffPath } from "@/lib/bff-file-url";
import { isRichTextBodyHtml } from "@/lib/post-html";
import { prepareVocBodyForDisplay, VOC_RICH_BODY_CLASSNAME } from "@/lib/vocs-html";
import { cn } from "@/lib/utils";

type Params = Promise<{ vocId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { vocId } = await params;
  return { title: `민원 #${vocId} | Admin` };
}

function statusPillClass(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-[#7F1D1D]/5 text-[#7F1D1D] border-[#7F1D1D]/20";
    case "IN_PROGRESS":
      return "bg-blue-600/5 text-blue-600/80 border-blue-600/20";
    case "RESOLVED":
      return "bg-[#4A7C6F]/5 text-[#4A7C6F]/80 border-[#4A7C6F]/20";
    default:
      return "bg-stone-50 text-stone-400 border-stone-200";
  }
}

export default async function AdminVocDetailPage({ params }: { params: Params }) {
  const { vocId } = await params;
  const id = parseInt(vocId, 10);
  if (Number.isNaN(id)) notFound();

  const res = await adminBffGet(`admin/vocs/${id}`);

  if (res.status === 404) notFound();
  if (res.status === 401) {
    return (
      <MotionEnter>
        <div className="mx-auto max-w-3xl space-y-4 text-center pt-20">
          <p className="font-medium text-destructive" role="alert">관리자 로그인이 필요합니다.</p>
          <Link href="/login" className="inline-block font-black text-sm uppercase tracking-wider text-secondary underline underline-offset-4">로그인으로 이동</Link>
        </div>
      </MotionEnter>
    );
  }
  
  if (!res.ok) {
    return (
      <MotionEnter>
        <p className="mx-auto max-w-3xl text-center font-medium text-destructive pt-20" role="alert">민원을 불러오지 못했습니다.</p>
      </MotionEnter>
    );
  }

  const body = (await res.json()) as ApiResponse<AdminVocDetail>;
  if (!body.success || !body.data) notFound();

  const d = body.data;

  return (
    <div className="pt-4 pb-32">
      <MotionEnter>
        <div className="mx-auto max-w-5xl">
          {/* Header Area */}
          <header className="mb-12">
            <div className="flex flex-col gap-6">
              <Link
                href="/admin/vocs"
                className="group inline-flex items-center gap-3 text-sm font-bold tracking-tight text-primary/60 hover:text-accent transition-colors w-fit"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 group-hover:bg-accent/10 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </span>
                민원 목록으로 돌아가기
              </Link>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-primary/10 pb-8">
                <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                    ADMIN <span className="underline underline-offset-4 decoration-accent">VOC.</span>
                    <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">민원 관리</span>
                  </h1>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-primary/10 pb-6">
                <h2 className="text-3xl md:text-5xl tracking-tight leading-snug text-primary min-w-0">
                  <span className="font-medium">{d.title}</span>
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-primary/50 mt-6">
              <span className={cn("rounded-full border px-3 py-1 text-xs font-bold tracking-tight", statusPillClass(d.status))}>
                {adminVocStatusLabel(d.status)}
              </span>
              <span className="text-primary/20">·</span>
              <span className="font-bold text-primary/80 uppercase tracking-wider">{adminVocCategoryLabel(d.category)}</span>
              <span className="text-primary/20">·</span>
              <span className="font-medium text-primary/70">{d.userName || `회원 #${d.userId}`}</span>
              <span className="text-primary/20">·</span>
              <time className="font-medium text-primary/40" suppressHydrationWarning>{formatDateTimeKo(d.createdAt)}</time>
            </div>
          </header>

          {/* Content Body */}
          <article className="space-y-12">
            <section className="space-y-4">
              <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-stone-900">민원 내용</h3>
              <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-primary/5 shadow-sm">
                <div className={cn("post-html font-normal leading-[1.8] tracking-tight text-stone-900 text-lg md:text-xl", VOC_RICH_BODY_CLASSNAME)}>
                  {isRichTextBodyHtml(d.content) ? (
                    <div dangerouslySetInnerHTML={{ __html: prepareVocBodyForDisplay(d.content) }} />
                  ) : (
                    <div className="whitespace-pre-wrap">{d.content}</div>
                  )}
                </div>
              </div>
            </section>

            {/* Attachments */}
            {d.attachments && d.attachments.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-stone-900">첨부 파일</h3>
                <ul className="space-y-3">
                  {d.attachments.map((a, i) => (
                    <li key={`${a.fileUrl}-${i}`}>
                      <a
                        href={apiFileUrlToBffPath(a.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-base font-medium text-stone-800 hover:text-accent transition-colors"
                      >
                        <ArrowRight className="size-4 shrink-0" />
                        <span className="underline underline-offset-4 decoration-accent/30">{a.fileName}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Answer Section */}
            {d.adminReply && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-stone-900">작성된 답변</h3>
                  {d.repliedAt && (
                    <time className="text-xs font-medium text-stone-400">{formatDateTimeKo(d.repliedAt)}</time>
                  )}
                </div>
                <div className="bg-stone-50 p-8 md:p-12 rounded-[2rem] border border-stone-200">
                  {isRichTextBodyHtml(d.adminReply) ? (
                    <div
                      className={cn("font-normal leading-[1.8] tracking-tight text-stone-900 text-lg md:text-xl", VOC_RICH_BODY_CLASSNAME)}
                      dangerouslySetInnerHTML={{ __html: prepareVocBodyForDisplay(d.adminReply) }}
                    />
                  ) : (
                    <p className="font-normal leading-[1.8] tracking-tight text-stone-900 text-lg md:text-xl whitespace-pre-wrap">{d.adminReply}</p>
                  )}
                </div>
              </section>
            )}

            {/* Actions */}
            <AdminVocActions vocId={d.vocId} status={d.status} />
          </article>
        </div>
      </MotionEnter>
    </div>
  );
}
