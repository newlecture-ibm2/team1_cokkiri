import Link from "next/link";
import { notFound } from "next/navigation";
import { adminCommunityBffGet } from "../../_api/admin-bff-server";
import type { AdminPostDetail, ApiResponse } from "../../_types/community-admin";
import { formatDateTimeKo } from "@/lib/format-date";
import { AdminCommunityPostActions } from "./_components/AdminCommunityPostActions";

type Params = Promise<{ postId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { postId } = await params;
  return { title: `게시글 #${postId} | 커뮤니티 관리` };
}

export default async function AdminCommunityPostDetailPage({ params }: { params: Params }) {
  const { postId } = await params;
  const id = parseInt(postId, 10);
  if (Number.isNaN(id)) notFound();

  const res = await adminCommunityBffGet(`admin/posts/${id}`);
  if (!res.ok) notFound();
  const body = (await res.json()) as ApiResponse<AdminPostDetail>;
  if (!body.success || !body.data) notFound();
  const detail = body.data;

  return (
    <article className="max-w-4xl">
      <Link
        href="/admin/community"
        className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
      >
        ← 목록
      </Link>

      <header className="mt-8 space-y-3 border-b border-border pb-8">
        <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Admin · Community · Post #{detail.postId}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{detail.category}</span>
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">작성자 #{detail.authorUserId}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">{detail.title}</h1>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          생성 {formatDateTimeKo(detail.createdAt)} · 수정 {formatDateTimeKo(detail.updatedAt)}
        </p>
      </header>

      <section className="mt-8 space-y-6">
        <div>
          <p className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">본문</p>
          <p className="mt-4 whitespace-pre-wrap font-medium tracking-tight text-foreground">{detail.content}</p>
        </div>

        {detail.links?.length ? (
          <div>
            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">링크</p>
            <ul className="mt-3 space-y-2">
              {detail.links.map((link, idx) => (
                <li key={`${link.url}-${idx}`}>
                  <a href={link.url ?? "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline">
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>조회 {detail.viewCount}</span>
          <span>좋아요 {detail.likeCount}</span>
          <span>댓글 {detail.commentCount}</span>
        </div>
      </section>

      <AdminCommunityPostActions postId={detail.postId} />
    </article>
  );
}
