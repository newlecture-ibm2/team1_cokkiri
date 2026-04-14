import Link from "next/link";
import { Search, FileText, Layout, MessageSquare, Plus, ArrowRight } from "lucide-react";
import { ACCESS_DENIED_MESSAGE, LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "./_api/bff-server";
import type { ApiResponse, PostListData } from "./_types/community";
import { CommunityShell } from "./_components/CommunityShell";
import { MotionEnter } from "./_components/MotionEnter";
import { CategoryFilter } from "./_components/CategoryFilter";
import { PostCard } from "./_components/PostCard";
import { PaginationBar } from "./_components/PaginationBar";
import { SearchAndSort } from "./_components/SearchAndSort";

type SearchParams = Promise<{ category?: string; p?: string; s?: string; q?: string; sort?: string }>;

export const metadata = {
  title: "커뮤니티",
};

export default async function CommunityPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = sp.category?.trim() || "";
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));

  const keyword = sp.q?.trim() || "";
  const sort = sp.sort?.trim() || "createdAt,desc";

  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (keyword) qs.set("q", keyword);
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", sort);

  const res = await bffGet(`posts?${qs.toString()}`);
  let list: PostListData | null = null;
  let error: string | null = null;

  if (res.status === 401) {
    error = LOGIN_REQUIRED_MESSAGE;
  } else if (res.status === 403) {
    error = ACCESS_DENIED_MESSAGE;
  } else if (!res.ok) {
    error = "목록을 불러오지 못했습니다.";
  } else {
    const body = (await res.json()) as ApiResponse<PostListData>;
    if (body.success && body.data) list = body.data;
    else error = body.message ?? "목록을 불러오지 못했습니다.";
  }

  // Fetch my post count
  let myPostCount = 0;
  try {
    const myRes = await bffGet('posts/my?p=0&s=1');
    if (myRes.ok) {
      const myBody = (await myRes.json()) as ApiResponse<PostListData>;
      if (myBody.success && myBody.data) myPostCount = myBody.data.totalElements;
    }
  } catch { /* ignore — user may not be logged in */ }

  const baseQuery = category ? `category=${encodeURIComponent(category)}` : "";

  return (
    <div className="mx-auto max-w-6xl">
      {/* Editorial Header */}
      <header className="mb-[clamp(2rem,5vw,5rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0 space-y-4">
              <h1 className="text-[clamp(1.7rem,7.2vw,9rem)] font-black leading-[0.85] tracking-tighter uppercase whitespace-nowrap">
                COMMUNI<span className="underline underline-offset-[1vw] decoration-[var(--color-accent)]">TY.</span>
                <span className="text-[clamp(1rem,2.25vw,2.7rem)] font-bold tracking-normal ml-[clamp(0.25rem,0.5vw,0.5rem)] align-bottom opacity-80">게시판</span>
              </h1>
              <p className="text-[clamp(0.75rem,1.5vw,1.5rem)] leading-tight font-medium opacity-70 whitespace-nowrap">
                소소한 대화부터 소중한 만남까지 이곳에서 시작됩니다.
              </p>
            </div>
            <div className="flex items-center shrink-0 self-end pb-1">
              <Link
                href="/community/new"
                className="inline-flex shrink-0 h-[clamp(2.75rem,4vw,3.5rem)] px-[clamp(1.25rem,2.5vw,2rem)] bg-primary text-white rounded-xl items-center gap-2 text-[clamp(0.8rem,1.2vw,1rem)] font-semibold tracking-tight transition-all hover:bg-primary/90 hover:-translate-y-1 shadow-lg shadow-primary/15"
              >
                <Plus className="w-4 h-4" />
                글쓰기
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="mx-auto max-w-5xl grid grid-cols-3 gap-[clamp(0.5rem,1.5vw,2rem)] mb-[clamp(2rem,5vw,5rem)]">
        {[
          { label: "TOTAL", value: list?.totalElements.toString().padStart(2, '0') ?? "00", icon: FileText, href: "/community", watermark: "TOTAL" },
          { label: "NOTICE", value: list?.content.filter(p => p.category === 'NOTICE').length.toString().padStart(2, '0') ?? "00", icon: Layout, href: "/community?category=NOTICE", watermark: "NOTICE" },
          { label: "MY POSTS", value: myPostCount.toString().padStart(2, '0'), icon: MessageSquare, href: "/my-posts", watermark: "MINE" },
        ].map((stat, i) => (
          <Link key={i} href={stat.href}>
            <div className="group relative p-[clamp(1.5rem,3vw,2.5rem)] bg-primary/5 border border-primary/10 rounded-[clamp(1rem,2vw,2rem)] overflow-hidden transition-all hover:bg-primary/10 cursor-pointer whitespace-nowrap">
              <div className="relative z-10">
                <stat.icon className="w-[clamp(1.25rem,2vw,2rem)] h-[clamp(1.25rem,2vw,2rem)] text-accent mb-[clamp(1rem,2vw,2rem)]" />
                <span className="block text-[clamp(0.6rem,0.9vw,0.75rem)] font-black tracking-[0.3em] uppercase text-primary/80 mb-2">
                  {stat.label}
                </span>
                <div className="flex items-end justify-between">
                  <h3 className="text-[clamp(2rem,5vw,3.75rem)] font-black tracking-tighter leading-none text-primary">
                    {stat.value}
                  </h3>
                </div>
              </div>
              <span className="absolute -right-4 -bottom-6 text-[clamp(4rem,10vw,8rem)] font-black opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.06] transition-opacity leading-none">
                {stat.watermark}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Filter & List Area */}
      <div className="mx-auto max-w-5xl space-y-[clamp(1.5rem,3vw,3rem)]">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-foreground/10 pb-[clamp(1rem,2vw,2rem)]">
          <div className="flex flex-col gap-4">
            <CategoryFilter active={category || undefined} />
          </div>
          <SearchAndSort />
        </section>

        {
          error && (
            <>
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
            </>
          )
        }

        {
          list && (
            <div className="space-y-12">
              <ul className="grid grid-cols-1 gap-8">
                {list.content.length === 0 ? (
                  <li className="flex flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-primary/10 bg-primary/2 px-6 py-32 text-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/5 flex items-center justify-center text-primary/50">
                      <Search className="size-8" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold tracking-tight text-primary">첫 발자국을 남겨주세요</p>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/80">
                        No posts found in this category
                      </p>
                    </div>
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
                  baseQuery={baseQuery}
                  pageSize={size}
                />
              </div>
            </div>
          )
        }
      </div>
    </div>
  );

}
