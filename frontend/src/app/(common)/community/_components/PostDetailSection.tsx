import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, Heart, MessageCircle, Megaphone, HelpCircle, Lightbulb, Users, PenLine, type LucideIcon } from "lucide-react";
import type { PostDetail } from "../_types/community";
import { POST_CATEGORIES } from "../_types/community";

import { PostEditDeleteActions } from "./PostEditDeleteActions";
import { LikeToggle } from "./LikeToggle";
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

          {/* Header Title */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-primary/10 pb-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                COMMUNITY REVIE<span className="underline underline-offset-4 decoration-[var(--color-accent)]">W.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">게시글</span>
              </h1>
            </div>
          </div>

          {/* Badge + Title with edit/delete on the right */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-primary/10 pb-6 mt-12">
            <h2 className="text-2xl md:text-4xl tracking-tight leading-snug text-primary min-w-0">
              <span className={`font-bold ${detail.category === "NOTICE" ? "text-[#7F1D1D]" : "text-[#4A7C6F]"}`}>
                {categoryLabel(detail.category)}
              </span>
              <span className={`text-xl font-medium align-middle ${detail.category === "NOTICE" ? "text-[#7F1D1D]/50" : "text-[#4A7C6F]/50"}`}>
                .{categoryEnglish(detail.category).toLowerCase()}
              </span>
              <span className="mx-1.5 text-muted-foreground/30 font-light">|</span>
              <span className="font-medium">{detail.title}</span>
            </h2>
          </div>
        </div>

        {/* Meta info — below header line */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mt-4">
          <div className="flex items-center gap-x-3 text-xs text-muted-foreground">
            <span className="font-bold text-primary/80">{detail.author?.name ?? `사용자${detail.author?.userId}`}</span>
            <span className="text-muted-foreground/30">·</span>
            <time className="font-medium text-primary/70" suppressHydrationWarning>{formatDateTimeKo(detail.createdAt)}</time>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-primary/70">
              <Eye className="size-4" />
              {detail.viewCount.toLocaleString()}
            </span>
            <span className="text-muted-foreground/20">|</span>
            <LikeToggle 
              variant="minimal"
              postId={detail.postId} 
              initialLiked={detail.isLikedByMe || detail.likedByMe || false} 
              initialCount={detail.likeCount} 
            />
            <span className="text-muted-foreground/20">|</span>
            <span className="inline-flex items-center gap-1.5 text-primary/70">
              <MessageCircle className="size-4" />
              {detail.commentCount.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-5xl space-y-12 mt-10">

        {/* Content Body */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-primary">
            내용
          </h2>
          <div className="bg-surface p-8 md:p-12 rounded-lg border border-primary/5 shadow-sm relative overflow-hidden">
            <div className="post-html font-medium leading-[1.8] tracking-tight text-primary text-base relative z-10">
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
            <h2 className="text-sm font-semibold tracking-tight text-primary">
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
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors"
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

        {/* Large Heart Toggle - Centered beneath content and attachments */}
        <div className="flex flex-col items-center justify-center py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/20 mb-3 select-none">Was this post helpful?</p>
            <LikeToggle 
              postId={detail.postId} 
              initialLiked={detail.isLikedByMe || detail.likedByMe || false} 
              initialCount={detail.likeCount} 
            />
        </div>

        {/* Comments */}
        <div className="pt-8 border-t border-primary/10">
          <h3 className="text-sm font-semibold tracking-tight text-primary mb-3">
            댓글 ({detail.commentCount})
          </h3>
          <CommentThreadSection
            postId={detail.postId}
            initialComments={comments}
            currentUser={currentUser}
          />
        </div>

        {/* Edit / Delete Actions (bottom) */}
        <PostEditDeleteActions
          postId={detail.postId}
          authorUserId={detail.author.userId}
          currentUser={currentUser}
        />
      </article>
    </div>
  );
}
