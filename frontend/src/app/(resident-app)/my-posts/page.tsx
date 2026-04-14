import Link from "next/link";
import { Plus, ArrowRight, MessageSquare } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE, ACCESS_DENIED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "@/app/(common)/community/_api/bff-server";
import type { ApiResponse, PostListData } from "@/app/(common)/community/_types/community";
import { PostCard } from "@/app/(common)/community/_components/PostCard";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";
import { MyPostCategoryFilter } from "./_components/MyPostCategoryFilter";
import { MyPostSearchAndSort } from "./_components/MyPostSearchAndSort";

import type { Metadata } from "next";

type PageProps = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<{ p?: string; s?: string; category?: string; q?: string; sort?: string }>;
};

export const metadata: Metadata = {
  title: "나의 게시글 | CoKkiri",
};

export default async function MyPostsPage({ params, searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));
  const category = sp.category ?? "";
  const query = sp.q ?? "";
  const sort = sp.sort ?? "createdAt,desc";

  const qs = new URLSearchParams();
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", sort);
  if (category) qs.set("category", category);
  if (query) qs.set("q", query);

  const res = await bffGet(`posts/my?${qs.toString()}`);
  let list: PostListData | null = null;
  let error: string | null = null;

  if (res.status === 401) {
    error = LOGIN_REQUIRED_MESSAGE;
  } else if (res.status === 403) {
    error = ACCESS_DENIED_MESSAGE;
  } else if (!res.ok) {
    error = "등록하신 게시글 목록을 불러오지 못했습니다.";
  } else {
    const body = (await res.json()) as ApiResponse<PostListData>;
    if (body.success && body.data) list = body.data;
    else error = body.message ?? "목록을 불러오지 못했습니다.";
  }

  // Build baseQuery for pagination
  const baseQueryParts: string[] = [];
  if (category) baseQueryParts.push(`category=${category}`);
  if (query) baseQueryParts.push(`q=${encodeURIComponent(query)}`);
  if (sort !== "createdAt,desc") baseQueryParts.push(`sort=${sort}`);
  const listBaseQuery = baseQueryParts.join("&");

  return (
    <div className="mx-auto max-w-5xl">
      {/* Editorial Header */}
      <header className="mb-16">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0 space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                MY POS<span className="underline underline-offset-4 decoration-[var(--color-accent)]">TS.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">나의 게시글</span>
              </h1>
            </div>
            <div className="flex items-center shrink-0 self-end pb-1">
              <Link
                href="/community/new"
                className="inline-flex shrink-0 h-14 px-10 bg-primary text-white rounded-xl items-center gap-3 text-base font-bold tracking-tight transition-all hover:bg-primary/95 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                <Plus className="w-5 h-5" />
                글쓰기
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Error / Login Required */}
      {error && (
        <div className="space-y-6">
          {error === LOGIN_REQUIRED_MESSAGE ? <LoginRequiredGate /> : null}
          <div className="rounded-[2rem] bg-destructive/5 border border-destructive/10 p-10 text-center">
            <p className="text-destructive font-black uppercase tracking-widest text-sm mb-4">Error Detected</p>
            <p className="text-2xl font-bold tracking-tight text-primary underline decoration-destructive/30 underline-offset-8">
              {error}
            </p>
            {error === LOGIN_REQUIRED_MESSAGE && (
              <Link href="/login" className="mt-8 inline-flex h-12 bg-primary text-white px-8 rounded-xl items-center gap-2 text-sm font-black uppercase tracking-[0.2em] hover:bg-accent transition-all animate-pulse">
                Go to Login <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Filter & List Area */}
      {list && (
        <div className="space-y-12">
          {/* Filter & Search */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/10 pb-4">
            <MyPostCategoryFilter activeCategory={category} />
            <MyPostSearchAndSort />
          </section>

          <ul className="grid grid-cols-1 gap-8">
            {list.content.length === 0 ? (
              <li className="flex flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-primary/10 bg-primary/2 px-6 py-32 text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/5 flex items-center justify-center text-primary/50">
                  <MessageSquare className="size-8" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold tracking-tight text-primary">아직 작성한 게시글이 없습니다</p>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/80">
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
              baseQuery={listBaseQuery}
              pageSize={size}
              hrefBase="/my-posts"
            />
          </div>
        </div>
      )}
    </div>
  );
}
