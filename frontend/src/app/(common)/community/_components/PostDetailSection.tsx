import Link from "next/link";
import { ArrowLeft, Eye, MessageCircle } from "lucide-react";
import type { PostDetail } from "../_types/community";
import { POST_CATEGORIES } from "../_types/community";
import { LikeToggle } from "./LikeToggle";
import { PostEditDeleteActions } from "./PostEditDeleteActions";
import { CommentComposer } from "../../comment/_components/CommentComposer";
import { CommentItem } from "../../comment/_components/CommentItem";
import { formatDateTimeKo } from "@/lib/format-date";

function categoryLabel(code: string) {
  return POST_CATEGORIES.find((c) => c.value === code)?.label ?? code;
}

function normalizeLiked(d: PostDetail & { isLikedByMe?: boolean }) {
  if (typeof d.likedByMe === "boolean") return d.likedByMe;
  if (typeof d.isLikedByMe === "boolean") return d.isLikedByMe;
  return false;
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
  const liked = normalizeLiked(detail as PostDetail & { isLikedByMe?: boolean });
  const comments = detail.comments ?? [];

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/community"
        className="group mb-10 inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        목록으로
      </Link>

      <header className="border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-black text-[10px] uppercase tracking-[0.28em] text-secondary">
            {categoryLabel(detail.category)}
          </span>
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {formatDateTimeKo(detail.createdAt)}
          </span>
        </div>
        <h1 className="mt-6 text-balance font-black uppercase leading-[0.92] tracking-tighter text-foreground text-[min(8vw,2.75rem)] md:text-4xl lg:text-[2.85rem]">
          {detail.title}
        </h1>
        <p className="mt-4 font-medium tracking-tight text-balance text-muted-foreground md:text-base">
          {detail.author?.name ?? "작성자"} · 조회 {detail.viewCount}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <LikeToggle
            postId={detail.postId}
            initialLiked={liked}
            initialCount={detail.likeCount}
          />
          <span className="inline-flex items-center gap-1.5 font-medium text-sm text-muted-foreground">
            <MessageCircle className="size-4" aria-hidden />
            댓글 {detail.commentCount}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-sm text-muted-foreground">
            <Eye className="size-4" aria-hidden />
            {detail.viewCount}
          </span>
        </div>
      </header>

      <PostEditDeleteActions
        postId={detail.postId}
        authorUserId={detail.author.userId}
        currentUser={currentUser}
        initialCategory={detail.category}
        initialTitle={detail.title}
        initialContent={detail.content}
        initialLinks={detail.links}
      />

      <div className="mt-10 font-medium leading-relaxed tracking-tight text-balance text-foreground md:text-lg">
        <div className="whitespace-pre-wrap">{detail.content}</div>
      </div>

      {detail.links && detail.links.length > 0 && (
        <section className="mt-12">
          <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            링크
          </h2>
          <ul className="mt-4 space-y-3">
            {detail.links.map((l, i) =>
              l.url ? (
                <li key={i}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm font-medium text-secondary underline decoration-secondary/50 underline-offset-4 transition-colors hover:decoration-secondary"
                  >
                    {l.url}
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      )}

      {detail.attachments && detail.attachments.length > 0 && (
        <section className="mt-10">
          <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            첨부
          </h2>
          <ul className="mt-4 space-y-2 font-medium text-sm text-secondary">
            {detail.attachments.map((a, i) =>
              a.fileUrl ? (
                <li key={i}>
                  <a
                    href={a.fileUrl}
                    className="break-all underline decoration-secondary/50 underline-offset-4 hover:decoration-secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {a.fileName ?? a.fileUrl}
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      )}

      <section className="mt-14 border-t border-border pt-12">
        <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          댓글
        </h2>
        {comments.length === 0 ? (
          <div
            className="mt-8 flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-border bg-background/60 px-8 py-14 text-center backdrop-blur-sm md:px-12"
            aria-live="polite"
          >
            <MessageCircle
              className="size-10 text-muted-foreground opacity-80"
              strokeWidth={1.25}
              aria-hidden
            />
            <p className="max-w-sm font-medium tracking-tight text-balance text-muted-foreground md:text-base">
              아직 댓글이 없습니다. 첫 댓글을 남겨 대화를 시작해 보세요.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-6">
            {comments.map((c) => (
              <CommentItem
                key={c.commentId}
                commentId={c.commentId}
                content={c.content}
                authorUserId={c.author.userId}
                authorName={c.author.name}
                createdAt={c.createdAt}
                currentUser={currentUser}
              />
            ))}
          </ul>
        )}
        <CommentComposer postId={detail.postId} />
      </section>
    </article>
  );
}
