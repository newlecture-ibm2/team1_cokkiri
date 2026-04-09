import Link from "next/link";
import { notFound } from "next/navigation";
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
import { VocAccessDeniedState } from "../_components/VocAccessDeniedState";

type Params = Promise<{ vocId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { vocId } = await params;
  return { title: `민원 #${vocId} | CoKkiri` };
}

function statusPillClass(status: string) {
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

export default async function ProfileVocDetailPage({ params }: { params: Params }) {
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
    <div className="mx-auto max-w-4xl pt-10 pb-32">
      <Link
        href="/profile/vocs?tab=list"
        className="group mb-12 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-accent hover:text-primary transition-all"
      >
        ← Back to Inquiries
      </Link>

      <article className="space-y-20 relative">
        <header className="space-y-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 bg-accent/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                {vocCategoryLabel(d.category)}
              </span>
              <span
                className={cn(
                  "rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-wider",
                  statusPillClass(d.status),
                )}
              >
                {vocStatusLabel(d.status)}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] text-primary uppercase italic text-balance">
              {d.title}
            </h1>

            <div className="flex items-center gap-6 pt-8 border-t border-primary/10">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent">Status</span>
                <span className="text-xs font-black uppercase tracking-widest text-primary">{vocStatusLabel(d.status)}</span>
              </div>
              <div className="h-8 w-px bg-primary/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Submitted on</span>
                <time dateTime={d.createdAt} className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {formatDateTimeKo(d.createdAt)}
                </time>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-12">
          <section className="bg-white p-12 md:p-16 rounded-[3rem] border border-primary/5 shadow-2xl shadow-primary/5 relative overflow-hidden">
            <p className="mb-8 text-[10px] font-black uppercase tracking-[0.5em] text-accent border-b border-accent/20 pb-4 inline-block">01 | Inquiry Narrative</p>
            {isRichTextBodyHtml(d.content) ? (
              <div
                className={cn(
                  "font-medium leading-[1.8] tracking-tight text-primary text-xl opacity-80",
                  VOC_RICH_BODY_CLASSNAME,
                )}
                dangerouslySetInnerHTML={{ __html: prepareVocBodyForDisplay(d.content) }}
              />
            ) : (
              <p className="font-medium leading-[1.8] tracking-tight text-primary text-xl opacity-80 whitespace-pre-wrap">
                {d.content}
              </p>
            )}
            
            {/* Background Decoration */}
            <span className="absolute -right-10 -bottom-10 text-[20vw] font-black opacity-[0.01] pointer-events-none select-none italic text-primary">
              VOICE
            </span>
          </section>

          {d.attachments?.length ? (
            <section className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent border-b border-accent/20 pb-4 inline-block">02 | Referenced Assets</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {d.attachments.map((a, i) => (
                  <li key={`${a.fileUrl}-${i}`}>
                    <a
                      href={apiFileUrlToBffPath(a.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-2 p-8 bg-primary/5 rounded-3xl border border-transparent hover:border-accent transition-all"
                    >
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Download Resource</span>
                      <span className="text-sm font-black tracking-tighter text-primary group-hover:text-accent transition-colors truncate">{a.fileName}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(d.adminReply || d.status === "RESOLVED" || d.status === "IN_PROGRESS") && (
            <section className="bg-primary p-12 md:p-16 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-primary/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 border-b border-white/20 pb-2 inline-block">03 | Administrator Response</p>
                {d.repliedAt && (
                  <time dateTime={d.repliedAt} className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Replied: {formatDateTimeKo(d.repliedAt)}
                  </time>
                )}
              </div>
              
              {d.adminReply && isRichTextBodyHtml(d.adminReply) ? (
                <div
                  className={cn("font-medium leading-[1.8] tracking-tight text-white/90 text-xl", VOC_RICH_BODY_CLASSNAME)}
                  dangerouslySetInnerHTML={{ __html: prepareVocBodyForDisplay(d.adminReply) }}
                />
              ) : (
                <p className="font-medium leading-[1.8] tracking-tight text-white/90 text-xl whitespace-pre-wrap">
                  {d.adminReply ?? "Your inquiry is currently being reviewed by our administrative team."}
                </p>
              )}

              {/* Background Decoration */}
              <span className="absolute -left-10 -bottom-20 text-[25vw] font-black opacity-[0.05] pointer-events-none select-none italic text-white">
                REPLY
              </span>
            </section>
          )}
        </div>

        <div className="pt-12">
          <VocDetailActions vocId={d.vocId} status={d.status} />
        </div>
        
        {/* Global Watermark */}
        <span className="absolute -left-32 top-1/2 -rotate-90 text-[12vw] font-black opacity-[0.02] pointer-events-none select-none italic text-primary">
          ADMIN-VOICE
        </span>
      </article>
    </div>
  );

}
