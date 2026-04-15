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

import { ArrowLeft, ArrowRight } from "lucide-react";
import { MotionEnter } from "../../../vocs/_components/MotionEnter";
import { cn } from "@/lib/utils";

export default async function AdminCommunityPostDetailPage({ params }: { params: Params }) {
  const { postId } = await params;
  const id = parseInt(postId, 10);
  if (Number.isNaN(id)) notFound();

  const res = await adminCommunityBffGet(`admin/posts/${id}`);
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

  const body = (await res.json()) as ApiResponse<AdminPostDetail>;
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
                    ADMIN COMMUNITY <span className="underline underline-offset-4 decoration-accent">POST.</span>
                    <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">게시글 정보</span>
                  </h1>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-primary/10 pb-6">
                <h2 className="text-3xl md:text-5xl tracking-tight leading-snug text-primary min-w-0">
                  <span className="font-medium">{detail.title}</span>
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-6">
              <span className="font-bold text-primary/80 uppercase tracking-wider">{detail.category}</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="font-medium text-primary/70">번호 #{detail.postId}</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="font-medium text-primary/70">작성자 #{detail.authorUserId}</span>
              <span className="text-muted-foreground/30">·</span>
              <time className="font-medium text-primary/40" suppressHydrationWarning>{formatDateTimeKo(detail.createdAt)}</time>
            </div>
          </header>

          {/* Content Body */}
          <article className="space-y-12">
            <section className="space-y-4">
              <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-stone-900">본문 내용</h3>
              <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-primary/5 shadow-sm">
                <p className="whitespace-pre-wrap font-normal leading-[1.8] tracking-tight text-stone-900 text-lg md:text-xl">
                  {detail.content}
                </p>
              </div>
            </section>

            {/* Links */}
            {detail.links && detail.links.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-stone-900">참조 링크</h3>
                <ul className="space-y-3">
                  {detail.links.map((link, idx) => (
                    <li key={`${link.url}-${idx}`}>
                      <a
                        href={link.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-base font-medium text-stone-800 hover:text-accent transition-colors"
                      >
                        <ArrowRight className="size-4 shrink-0" />
                        <span className="underline underline-offset-4 decoration-accent/30">{link.url}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Stats Summary */}
            <section className="flex flex-wrap gap-8 py-6 border-t border-primary/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Views</span>
                <span className="text-xl font-bold text-primary/80">{detail.viewCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Likes</span>
                <span className="text-xl font-bold text-primary/80">{detail.likeCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Comments</span>
                <span className="text-xl font-bold text-primary/80">{detail.commentCount}</span>
              </div>
            </section>

            <AdminCommunityPostActions postId={detail.postId} />
          </article>
        </div>
      </MotionEnter>
    </div>
  );
}
