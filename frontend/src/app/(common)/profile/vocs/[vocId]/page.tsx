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
    <VocShell>
      <MotionEnter>
        <article className="mx-auto max-w-3xl">
          <Link
            href="/profile/vocs?tab=list"
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-5 font-black text-[10px] uppercase tracking-[0.24em] text-secondary transition-colors hover:border-secondary/70"
          >
            ← 나의 민원 내역
          </Link>

          <header className="mt-8 space-y-4 border-b border-primary/10 pb-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {vocCategoryLabel(d.category)}
              </span>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                  statusPillClass(d.status),
                )}
              >
                {vocStatusLabel(d.status)}
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-balance text-foreground md:text-4xl">{d.title}</h1>
            <time
              dateTime={d.createdAt}
              className="block font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              접수 {formatDateTimeKo(d.createdAt)}
            </time>
          </header>

          <div className="mt-10 rounded-[2rem] border border-primary/10 bg-background p-6 shadow-2xl shadow-primary/5 md:p-8">
            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">내용</p>
            {isRichTextBodyHtml(d.content) ? (
              <div
                className={cn(
                  "mt-4 font-medium leading-relaxed tracking-tight text-balance text-foreground md:text-lg",
                  VOC_RICH_BODY_CLASSNAME,
                )}
                dangerouslySetInnerHTML={{ __html: prepareVocBodyForDisplay(d.content) }}
              />
            ) : (
              <p className="mt-4 whitespace-pre-wrap font-medium tracking-tight text-balance text-foreground md:text-lg">
                {d.content}
              </p>
            )}
          </div>

          {d.attachments?.length ? (
            <div className="mt-10 rounded-[2rem] border border-primary/10 bg-background p-6 shadow-2xl shadow-primary/5 md:p-8">
              <p className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">첨부</p>
              <ul className="mt-4 space-y-2">
                {d.attachments.map((a, i) => (
                  <li key={`${a.fileUrl}-${i}`}>
                    <a
                      href={apiFileUrlToBffPath(a.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-secondary underline-offset-4 hover:underline"
                    >
                      {a.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {(d.adminReply || d.status === "RESOLVED" || d.status === "IN_PROGRESS") && (
            <section className="mt-12 rounded-[2rem] border border-primary/10 bg-primary/5 p-6 md:p-8">
              <p className="font-black text-[10px] uppercase tracking-[0.3em] text-secondary">운영 답변</p>
              {d.repliedAt ? (
                <time
                  dateTime={d.repliedAt}
                  className="mt-2 block font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {formatDateTimeKo(d.repliedAt)}
                </time>
              ) : null}
              {d.adminReply && isRichTextBodyHtml(d.adminReply) ? (
                <div
                  className={cn("mt-4 font-medium tracking-tight text-foreground", VOC_RICH_BODY_CLASSNAME)}
                  dangerouslySetInnerHTML={{ __html: prepareVocBodyForDisplay(d.adminReply) }}
                />
              ) : (
                <p className="mt-4 whitespace-pre-wrap font-medium tracking-tight text-foreground">
                  {d.adminReply ?? "답변 준비 중입니다."}
                </p>
              )}
            </section>
          )}

          <VocDetailActions vocId={d.vocId} status={d.status} />
        </article>
      </MotionEnter>
    </VocShell>
  );
}
