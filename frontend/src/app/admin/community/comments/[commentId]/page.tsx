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

import { ArrowLeft } from "lucide-react";
import { MotionEnter } from "../../../vocs/_components/MotionEnter";

export default async function AdminCommunityCommentDetailPage({ params }: { params: Params }) {
  const { commentId } = await params;
  const id = parseInt(commentId, 10);
  if (Number.isNaN(id)) notFound();

  const res = await adminCommunityBffGet(`admin/comments/${id}`);
  if (res.status === 401 || res.status === 403) {
    return (
      <MotionEnter>
        <div className="mx-auto max-w-3xl space-y-4 text-center pt-20">
          <p className="font-medium text-destructive" role="alert">관리자 권한이 필요합니다.</p>
          <Link href="/login" className="inline-block font-black text-sm uppercase tracking-wider text-secondary underline underline-offset-4">로그인으로 이동</Link>
        </div>
      </MotionEnter>
    );
  }
  if (res.status === 404) notFound();
  if (!res.ok) {
    return (
      <MotionEnter>
        <p className="mx-auto max-w-3xl text-center font-medium text-destructive pt-20" role="alert">상세 정보를 불러오지 못했습니다.</p>
      </MotionEnter>
    );
  }

  const body = (await res.json()) as ApiResponse<AdminCommentDetail>;
  if (!body.success || !body.data) notFound();
  const detail = body.data;

  return (
    <div className="pt-4 pb-32">
      <MotionEnter>
        <div className="mx-auto max-w-5xl">
          {/* Header Area */}
          <header className="mb-12">
            <div className="flex flex-col gap-6">
              <Link
                href="/admin/community"
                className="group inline-flex items-center gap-3 text-sm font-bold tracking-tight text-primary/60 hover:text-accent transition-colors w-fit"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 group-hover:bg-accent/10 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </span>
                목록으로 돌아가기
              </Link>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-primary/10 pb-8">
                <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                    ADMIN COMMUNITY <span className="underline underline-offset-4 decoration-accent">COMMENT.</span>
                    <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">댓글 정보</span>
                  </h1>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-b border-primary/10 pb-6">
                <span className="text-xs font-black uppercase tracking-widest text-primary/30">원문 게시글</span>
                <h2 className="text-2xl md:text-3xl tracking-tight leading-snug text-primary font-medium">
                  {detail.postTitle}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-6">
              <span className="font-bold text-primary/80 uppercase tracking-wider">댓글 번호 #{detail.commentId}</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="font-medium text-primary/70">게시글 #{detail.postId}</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="font-medium text-primary/70">작성자 #{detail.authorUserId}</span>
              <span className="text-muted-foreground/30">·</span>
              <time className="font-medium text-primary/40" suppressHydrationWarning>{formatDateTimeKo(detail.createdAt)}</time>
            </div>
          </header>

          {/* Content Body */}
          <article className="space-y-12">
            <section className="space-y-4">
              <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-stone-900">댓글 내용</h3>
              <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-primary/5 shadow-sm">
                <p className="whitespace-pre-wrap font-normal leading-[1.8] tracking-tight text-stone-900 text-lg md:text-xl">
                  {detail.content}
                </p>
              </div>
            </section>

            <AdminCommunityCommentActions commentId={detail.commentId} />
          </article>
        </div>
      </MotionEnter>
    </div>
  );
}
