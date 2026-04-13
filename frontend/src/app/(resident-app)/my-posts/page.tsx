import Link from "next/link";
import { Search, Plus, ArrowRight, MessageSquare } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE, ACCESS_DENIED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "@/app/(common)/community/_api/bff-server";
import type { ApiResponse, PostListData } from "@/app/(common)/community/_types/community";
import { PostCard } from "@/app/(common)/community/_components/PostCard";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";

import type { Metadata } from "next";

type PageProps = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<{ p?: string; s?: string }>;
};

export const metadata: Metadata = {
  title: "나의 게시글 | CoKkiri",
};

export default async function MyPostsPage({ params, searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));

  const qs = new URLSearchParams();
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", "createdAt,desc");

  // /api/posts/my 엔드포인트가 있다고 가정 (VOCs/Contracts 패턴 기반)
  const res = await bffGet(`posts/my?${qs.toString()}`);
  let list: PostListData | null = null;
  let error: string | null = null;

  if (res.status === 401) {
    error = LOGIN_REQUIRED_MESSAGE;
  } else if (res.status === 403) {
    error = ACCESS_DENIED_MESSAGE;
  } else if (!res.ok) {
    // 만약 /posts/my가 없다면 빈 리스트 또는 에러 메시지
    error = "등록하신 게시글 목록을 불러오지 못했습니다.";
  } else {
    const body = (await res.json()) as ApiResponse<PostListData>;
    if (body.success && body.data) list = body.data;
    else error = body.message ?? "목록을 불러오지 못했습니다.";
  }

  return (
    <div className="space-y-12 px-6 pt-16 md:px-12 md:pt-32">
      <header className="space-y-2">
        <p className="font-black text-xs uppercase tracking-[0.3em] text-accent">
          My Forum Tracks
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="text-3xl font-black tracking-tighter text-primary md:text-5xl uppercase italic">
            나의 게시글
          </h1>
          <Link
            href="/community/new"
            className="inline-flex h-12 px-6 bg-primary text-white rounded-xl items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>
        <p className="text-sm font-medium tracking-tight text-muted-foreground text-balance max-w-2xl">
          직접 작성하신 커뮤니티 게시글들을 한눈에 확인하세요. 코끼리 소통의 주인공으로 남겨주신 소중한 기록들입니다.
        </p>
      </header>

      {error && (
        <div className="space-y-6">
          {error === LOGIN_REQUIRED_MESSAGE ? <LoginRequiredGate /> : null}
          <div className="rounded-[3rem] bg-destructive/5 border border-destructive/10 p-12 text-center">
            <p className="text-destructive font-black uppercase tracking-widest text-[10px] mb-4">Notification</p>
            <p className="text-xl font-bold tracking-tight text-primary">
              {error}
            </p>
            {error === LOGIN_REQUIRED_MESSAGE && (
              <Link href="/login" className="mt-8 inline-flex h-12 bg-primary text-white px-8 rounded-xl items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all animate-pulse">
                Go to Login <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {list && (
        <div className="space-y-12">
          <ul className="grid grid-cols-1 gap-8">
            {list.content.length === 0 ? (
              <li className="flex flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-primary/10 bg-primary/2 px-6 py-32 text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/5 flex items-center justify-center text-primary/20">
                  <MessageSquare className="size-8" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold tracking-tight text-primary">아직 작성한 게시글이 없습니다</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                    Share your story with fellow residents!
                  </p>
                </div>
                <Link
                  href="/community/new"
                  className="mt-6 inline-flex h-14 px-8 bg-primary text-white rounded-2xl items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all shadow-xl shadow-primary/10"
                >
                  <Plus className="w-4 h-4" />
                  Create First Post
                </Link>
              </li>
            ) : (
              list.content.map((post) => (
                <li key={post.postId}>
                  <PostCard post={post} />
                </li>
              ))
            )}
          </ul>
          
          <div className="pt-10 border-t border-primary/5 flex justify-center">
            <PaginationBar
              page={list.page}
              totalPages={list.totalPages}
              baseQuery=""
              pageSize={size}
              hrefBase="/my-posts"
            />
          </div>
        </div>
      )}
    </div>
  );
}
