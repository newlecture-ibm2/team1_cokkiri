import Link from "next/link";
import { notFound } from "next/navigation";
import { adminCommunityBffGet } from "../../_api/admin-bff-server";
import type { AdminCommentDetail, ApiResponse } from "../../_types/community-admin";
import { formatDateTimeKo } from "@/lib/format-date";
import { AdminCommunityCommentActions } from "./_components/AdminCommunityCommentActions";

type Params = Promise<{ commentId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { commentId } = await params;
  return { title: `댓글 #${commentId} | 커뮤니티 관리` };
}

export default async function AdminCommunityCommentDetailPage({ params }: { params: Params }) {
  const { commentId } = await params;
  const id = parseInt(commentId, 10);
  if (Number.isNaN(id)) notFound();

  const res = await adminCommunityBffGet(`admin/comments/${id}`);
  if (!res.ok) notFound();
  const body = (await res.json()) as ApiResponse<AdminCommentDetail>;
  if (!body.success || !body.data) notFound();
  const detail = body.data;

  return (
    <article className="max-w-3xl">
      <Link
        href="/admin/community"
        className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em] text-secondary transition-colors hover:text-foreground"
      >
        ← 목록
      </Link>

      <header className="mt-8 space-y-3 border-b border-border pb-8">
        <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Admin · Community · Comment #{detail.commentId}
        </p>
        <p className="text-sm font-bold text-foreground">원문 게시글: {detail.postTitle}</p>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          POST #{detail.postId} · 작성자 #{detail.authorUserId}
        </p>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          생성 {formatDateTimeKo(detail.createdAt)} · 수정 {formatDateTimeKo(detail.updatedAt)}
        </p>
      </header>

      <section className="mt-8">
        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">댓글 내용</p>
        <p className="mt-4 whitespace-pre-wrap font-medium tracking-tight text-foreground">{detail.content}</p>
      </section>

      <AdminCommunityCommentActions commentId={detail.commentId} />
    </article>
  );
}
