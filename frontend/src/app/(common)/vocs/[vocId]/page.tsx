import Link from "next/link";
import { notFound } from "next/navigation";
import { bffGet } from "../_api/bff-server";
import type { ApiResponse, VocDetail } from "../_types/vocs";
import { VocShell } from "../_components/VocShell";
import { MotionEnter } from "../../community/_components/MotionEnter";
import { VocDetailActions } from "../_components/VocDetailActions";
import { vocCategoryLabel, vocStatusLabel } from "../_types/vocs";
import { formatDateTimeKo } from "@/lib/format-date";
import { apiFileUrlToBffPath } from "@/lib/bff-file-url";
import { isRichTextBodyHtml } from "@/lib/post-html";
import { prepareVocBodyForDisplay, VOC_RICH_BODY_CLASSNAME } from "@/lib/vocs-html";
import { cn } from "@/lib/utils";

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
          <p className="mx-auto max-w-3xl text-center font-medium text-destructive">로그인이 필요합니다.</p>
        </MotionEnter>
      </VocShell>
    );
  }
  if (!res.ok) notFound();

  const body = (await res.json()) as ApiResponse<VocDetail>;
  if (!body.success || !body.data) notFound();

  const d = body.data;

  return (
    <VocShell>
      <MotionEnter>
        <article className="mx-auto max-w-3xl">
          <Link
            href="/vocs"
            className="group inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
          >
            ← 목록
          </Link>

          <header className="mt-8 space-y-4 border-b border-border pb-10">
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
            <h1 className="text-3xl font-black tracking-tight text-balance text-foreground md:text-4xl">{d.title}</h1>
            <time dateTime={d.createdAt} className="block font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              접수 {formatDateTimeKo(d.createdAt)}
            </time>
          </header>

          <div className="mt-10">
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
            <div className="mt-10">
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
            <section className="mt-12 rounded-[2rem] border border-border bg-muted/20 p-6 md:p-8">
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
