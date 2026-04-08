import Link from "next/link";
import { ArrowLeft, Eye, MessageCircle } from "lucide-react";
import type { PostDetail } from "../_types/community";
import { POST_CATEGORIES } from "../_types/community";
import { LikeToggle } from "./LikeToggle";
import { PostEditDeleteActions } from "./PostEditDeleteActions";
import { CommentThreadSection } from "../../comment/_components/CommentThreadSection";
import { formatDateTimeKo } from "@/lib/format-date";
import { apiFileUrlToBffPath } from "@/lib/bff-file-url";
import { isRichTextBodyHtml, prepareCommunityPostBodyForDisplay } from "@/lib/post-html";

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
    <div className="mx-auto max-w-4xl pt-10 pb-32">
      <div className="mb-20">
        <Link
          href="/community"
          className="group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-accent hover:text-primary transition-all"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
          Back to Community
        </Link>
      </div>

      <article className="space-y-20">
        <header className="space-y-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
               <span className="px-4 py-1.5 bg-accent/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                 {categoryLabel(detail.category)}
               </span>
               <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
                 POST-00{detail.postId}
               </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] text-primary uppercase italic text-balance">
              {detail.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-primary/10">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1">
                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent">Published by</span>
                     <span className="text-sm font-black uppercase tracking-tighter text-primary">{detail.author?.name ?? "Unknown Resident"}</span>
                  </div>
                  <div className="h-8 w-px bg-primary/10 hidden md:block" />
                  <div className="flex flex-col gap-1">
                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Posted on</span>
                     <time className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        {new Date(detail.createdAt).toLocaleDateString()}
                     </time>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-6 h-12 bg-primary/5 rounded-2xl">
                     <Eye className="size-3 text-accent" strokeWidth={3} />
                     <span className="text-[10px] font-black tracking-tighter text-primary">{detail.viewCount.toLocaleString()} VIEWS</span>
                  </div>
                  <LikeToggle
                    postId={detail.postId}
                    initialLiked={liked}
                    initialCount={detail.likeCount}
                  />
               </div>
            </div>
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
          initialAttachments={detail.attachments ?? []}
        />

        <div className="bg-white p-12 md:p-20 rounded-[4rem] border border-primary/5 shadow-2xl shadow-primary/5 relative overflow-hidden min-h-[400px]">
          <div className="post-html font-medium leading-[1.8] tracking-tight text-primary text-xl relative z-10 opacity-80 lg:px-10">
            {isRichTextBodyHtml(detail.content) ? (
              <div
                className="[&_img]:my-8 [&_img]:max-h-[min(70vh,520px)] [&_img]:w-full [&_img]:rounded-[3rem] [&_img]:object-cover [&_img]:shadow-2xl [&_p]:mb-6 [&_a]:break-all [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/30 [&_a]:underline-offset-8 [&_ul]:my-8 [&_ul]:list-disc [&_ul]:pl-10 [&_ol]:my-8 [&_ol]:list-decimal [&_ol]:pl-10 [&_blockquote]:my-10 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-10 [&_blockquote]:italic [&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-3xl [&_pre]:border [&_pre]:border-primary/5 [&_pre]:bg-primary/5 [&_pre]:p-10 [&_code]:text-base"
                dangerouslySetInnerHTML={{ __html: prepareCommunityPostBodyForDisplay(detail.content) }}
              />
            ) : (
              <div className="whitespace-pre-wrap">{detail.content}</div>
            )}
          </div>
          
          {/* Editorial Watermark */}
          <span className="absolute -right-20 -bottom-20 text-[35vw] font-black opacity-[0.01] pointer-events-none select-none italic text-primary">
            BODY
          </span>
        </div>

        {(detail.links?.length ?? 0) > 0 && (
          <section className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent border-b border-accent/20 pb-4 inline-block">
              External References
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {detail.links?.map((l, i) =>
                l.url ? (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-8 bg-white rounded-3xl border border-primary/5 hover:border-accent/40 transition-all shadow-lg shadow-primary/5"
                    >
                      <span className="text-sm font-black tracking-tighter text-primary group-hover:text-accent transition-colors truncate max-w-xs">{l.url}</span>
                      <ArrowRight className="size-4 text-accent transition-transform group-hover:translate-x-2" />
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        )}

        {(detail.attachments?.length ?? 0) > 0 && (
          <section className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent border-b border-accent/20 pb-4 inline-block">
              Document Assets
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {detail.attachments?.map((a, i) =>
                a.fileUrl ? (
                  <li key={i}>
                    <a
                      href={apiFileUrlToBffPath(a.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-2 p-8 bg-primary/5 rounded-3xl border border-transparent hover:border-accent transition-all"
                    >
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Download File</span>
                      <span className="text-sm font-black tracking-tighter text-primary group-hover:text-accent transition-colors truncate">{a.fileName ?? a.fileUrl}</span>
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        )}

        <div className="pt-20 border-t border-primary/10">
           <div className="mb-12 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Join the conversation</span>
              <h3 className="text-5xl font-black tracking-tighter text-primary uppercase italic">REPLIES ({detail.commentCount})</h3>
           </div>
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
