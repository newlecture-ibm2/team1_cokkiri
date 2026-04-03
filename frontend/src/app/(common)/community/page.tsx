import Link from "next/link";
import { Search } from "lucide-react";
import { bffGet } from "./_api/bff-server";
import type { ApiResponse, PostListData } from "./_types/community";
import { CommunityShell } from "./_components/CommunityShell";
import { MotionEnter } from "./_components/MotionEnter";
import { CategoryFilter } from "./_components/CategoryFilter";
import { PostCard } from "./_components/PostCard";
import { PaginationBar } from "./_components/PaginationBar";

type SearchParams = Promise<{ category?: string; page?: string; size?: string }>;

export const metadata = {
  title: "커뮤니티",
};

export default async function CommunityPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = sp.category?.trim() || "";
  const page = Math.max(0, parseInt(sp.page ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.size ?? "20", 10) || 20));

  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  qs.set("page", String(page));
  qs.set("size", String(size));
  qs.set("sort", "createdAt,desc");

  const res = await bffGet(`posts?${qs.toString()}`);
  let list: PostListData | null = null;
  let error: string | null = null;

  if (res.status === 401) {
    error = "로그인이 필요합니다.";
  } else if (!res.ok) {
    error = "목록을 불러오지 못했습니다.";
  } else {
    const body = (await res.json()) as ApiResponse<PostListData>;
    if (body.success && body.data) list = body.data;
    else error = body.message ?? "목록을 불러오지 못했습니다.";
  }

  const baseQuery = category ? `category=${encodeURIComponent(category)}` : "";

  return (
    <CommunityShell>
      <MotionEnter>
        <div className="mx-auto max-w-4xl">
          <header className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <div className="space-y-6">
              <h1 className="text-[12vw] font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:text-[10vw] md:text-[7vw] lg:text-[4.5rem]">
                커뮤
                <span className="underline decoration-secondary decoration-2 underline-offset-[0.18em]">
                  니티
                </span>
              </h1>
              <p className="max-w-xl font-medium tracking-tight text-balance text-foreground/85 md:text-lg">
                공지·질문·모임 — 입주자들이 모이는{" "}
                <span className="text-secondary">함께</span>의 공간입니다.
              </p>
            </div>
            <Link
              href="/community/new"
              className="shrink-0 rounded-xl bg-primary px-6 py-3 text-center text-sm font-black uppercase tracking-wider text-primary-foreground transition-transform duration-200 hover:scale-[1.02] md:self-start"
            >
              글쓰기
            </Link>
          </header>

          <section className="mt-12 space-y-6">
            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              카테고리
            </p>
            <CategoryFilter active={category || undefined} />
          </section>

          {error && (
            <div
              className="mt-12 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          {list && (
            <>
              <ul className="mt-12 space-y-6">
                {list.content.length === 0 ? (
                  <li className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-border bg-muted/25 px-6 py-16 text-center">
                    <Search className="size-10 text-muted-foreground" strokeWidth={1.25} aria-hidden />
                    <p className="max-w-sm font-medium tracking-tight text-balance text-muted-foreground">
                      아직 게시글이 없습니다. 첫 글을 남겨 커뮤니티를 채워 보세요.
                    </p>
                  </li>
                ) : (
                  list.content.map((post) => (
                    <li key={post.postId}>
                      <PostCard post={post} />
                    </li>
                  ))
                )}
              </ul>
              <PaginationBar page={list.page} totalPages={list.totalPages} baseQuery={baseQuery} />
            </>
          )}
        </div>
      </MotionEnter>
    </CommunityShell>
  );
}
