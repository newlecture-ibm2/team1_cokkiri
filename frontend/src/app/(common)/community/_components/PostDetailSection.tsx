import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, Heart, MessageCircle, Megaphone, HelpCircle, Lightbulb, Users, PenLine, type LucideIcon } from "lucide-react";
import type { PostDetail } from "../_types/community";
import { POST_CATEGORIES } from "../_types/community";

import { PostEditDeleteActions } from "./PostEditDeleteActions";
import { CommentThreadSection } from "./CommentThreadSection";
import { formatDateTimeKo } from "@/lib/format-date";
import { apiFileUrlToBffPath } from "@/lib/bff-file-url";
import { isRichTextBodyHtml, prepareCommunityPostBodyForDisplay } from "@/lib/post-html";

function categoryLabel(code: string) {
  return POST_CATEGORIES.find((c) => c.value === code)?.label ?? code;
}

function categoryEnglish(code: string) {
  switch (code) {
    case "NOTICE": return "Notice";
    case "QUESTION": return "Question";
    case "SUGGESTION": return "Suggestion";
    case "MEETUP": return "Meetup";
    case "FREE": return "Free";
    default: return "Post";
  }
}

function categoryIcon(code: string): LucideIcon {
  switch (code) {
    case "NOTICE": return Megaphone;
    case "QUESTION": return HelpCircle;
    case "SUGGESTION": return Lightbulb;
    case "MEETUP": return Users;
    default: return PenLine;
  }
}



type CurrentUser = {
  userId: number;
  role?: string | null;
};

export function PostDetailSection({
  detail,
  currentUser,
}: {
  detail: PostDetail;
  currentUser?: CurrentUser;
}) {
  const comments = detail.comments ?? [];
  const WatermarkIcon = categoryIcon(detail.category);

  return (
    <div className="pt-4 pb-32">
      {/* Back link + Header */}
      <header className="mx-auto max-w-5xl mb-12">
        <div className="flex flex-col gap-6">
          <Link
            href="/community"
            className="group inline-flex items-center gap-3 text-sm font-bold tracking-tight text-primary/60 hover:text-accent transition-colors w-fit"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 group-hover:bg-accent/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </span>
            목록으로 돌아가기
          </Link>

          {/* Badge + Title with edit/delete on the right */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-primary/10 pb-6">
            <h1 className="text-3xl md:text-5xl tracking-tight leading-snug text-primary min-w-0">
              <span className={`font-bold ${detail.category === "NOTICE" ? "text-[#5B6E2D]" : "text-[#4A7C6F]"}`}>
                {categoryLabel(detail.category)}
              </span>
              <span className={`text-2xl font-medium align-middle ${detail.category === "NOTICE" ? "text-[#5B6E2D]/50" : "text-[#4A7C6F]/50"}`}>
                .{categoryEnglish(detail.category).toLowerCase()}
              </span>
              <span className="mx-1.5 text-muted-foreground/30 font-light">|</span>
              <span className="font-medium">{detail.title}</span>
            </h1>
            <div className="shrink-0 self-end pb-1">
              <PostEditDeleteActions
                postId={detail.postId}
                authorUserId={detail.author.userId}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>

        {/* Meta info — below header line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-4">
          <span className="font-medium text-primary/70">{detail.author?.name ?? "Unknown"}</span>
          <span className="text-muted-foreground/30">·</span>
          <time className="font-medium text-primary/70">{formatDateTimeKo(detail.createdAt)}</time>
          <span className="text-muted-foreground/30">·</span>
          <span className="inline-flex items-center gap-1 text-primary/50">
            <Eye className="size-3" />
            {detail.viewCount.toLocaleString()}
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="inline-flex items-center gap-1 text-primary/50">
            <Heart className="size-3" />
            {detail.likeCount.toLocaleString()}
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="inline-flex items-center gap-1 text-primary/50">
            <MessageCircle className="size-3" />
            {detail.commentCount.toLocaleString()}
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-5xl space-y-12 mt-10">

        {/* Content Body */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-primary/50">
            내용
          </h2>
          <div className="bg-surface p-8 md:p-12 rounded-lg border border-primary/5 shadow-sm relative overflow-hidden">
            <div className="post-html font-medium leading-[1.8] tracking-tight text-primary text-base relative z-10 opacity-90">
              {isRichTextBodyHtml(detail.content) ? (
                <div
                  className="[&_img]:my-6 [&_img]:max-h-[min(70vh,520px)] [&_img]:w-full [&_img]:rounded-xl [&_img]:object-cover [&_img]:shadow-md [&_p]:mb-4 [&_a]:break-all [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/30 [&_a]:underline-offset-4 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-8 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-8 [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-6 [&_blockquote]:italic [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-primary/5 [&_pre]:bg-primary/5 [&_pre]:p-6 [&_code]:text-sm"
                  dangerouslySetInnerHTML={{ __html: prepareCommunityPostBodyForDisplay(detail.content) }}
                />
              ) : (
                <div className="whitespace-pre-wrap">{detail.content}</div>
              )}
            </div>
          </div>
        </section>

        {/* Links */}
        {(detail.links?.length ?? 0) > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-tight text-primary/50">
              외부 링크
            </h2>
            <ul className="space-y-1.5">
              {detail.links?.map((l, i) =>
                l.url ? (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-primary transition-colors"
                    >
                      <ArrowRight className="size-3 shrink-0" />
                      <span className="underline underline-offset-2 decoration-accent/30 truncate">{l.url}</span>
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        )}

        {/* Attachments */}
        {(detail.attachments?.length ?? 0) > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-tight text-primary/50">
              첨부파일
            </h2>
            <ul className="space-y-1.5">
              {detail.attachments?.map((a, i) =>
                a.fileUrl ? (
                  <li key={i}>
                    <a
                      href={apiFileUrlToBffPath(a.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-primary transition-colors"
                    >
                      <ArrowRight className="size-3 shrink-0" />
                      <span className="underline underline-offset-2 decoration-accent/30 truncate">{a.fileName ?? a.fileUrl}</span>
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        )}

        {/* Comments */}
        <div className="pt-8 border-t border-primary/10">
          <h3 className="text-sm font-semibold tracking-tight text-primary/50 mb-3">
            댓글 ({detail.commentCount})
          </h3>
          <CommentThreadSection
            postId={detail.postId}
            initialComments={comments}
            currentUser={currentUser}
          />
        </div>
      </article>
    </div>
  );
}
