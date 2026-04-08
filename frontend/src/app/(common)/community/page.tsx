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

type SearchParams = Promise<{ category?: string; p?: string; s?: string }>;

export const metadata = {
  title: "커뮤니티",
};

export default async function CommunityPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = sp.category?.trim() || "";
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));

  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", "createdAt,desc");

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

  const baseQuery = category ? `category=${encodeURIComponent(category)}` : "";

  return (
    <CommunityShell>
      <MotionEnter>
        <div className="mx-auto max-w-[1400px]">
          {/* Editorial Header */}
          <header className="mb-20">
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
                FORUM / 01
              </span>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                <h1 className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase whitespace-nowrap">
                  COMM<br />UNITY
                </h1>
                <div className="max-w-md pb-4">
                  <p className="text-xl font-medium tracking-tight text-balance border-l-2 border-accent pl-8 opacity-60">
                    입주자들이 함께 만들어가는 잡지 같은 공간. 소소한 대화부터 소중한 만남까지 이곳에서 시작됩니다.
                  </p>
                  <div className="mt-10 flex items-center gap-6">
                    <Link
                      href="/community/new"
                      className="inline-flex h-16 px-10 bg-primary text-white rounded-2xl items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-accent hover:-translate-y-1 shadow-xl shadow-primary/20"
                    >
                      <Plus className="w-4 h-4" />
                      Create Post
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { label: "TOTAL", value: list?.totalElements.toString().padStart(2, '0') ?? "00", icon: FileText, desc: "전체 게시글" },
              { label: "NOTICE", value: "05", icon: Layout, desc: "주요 공지사항" }, // Dummy or should fetch
              { label: "FORUM", value: list?.totalElements.toString().padStart(2, '0') ?? "00", icon: MessageSquare, desc: "활발한 소통 중" }
            ].map((stat, i) => (
              <div key={i} className="group bg-white p-10 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 hover:border-accent/30 transition-all">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest opacity-20 group-hover:opacity-100 transition-opacity">0{i+1}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">{stat.label}</p>
                  <p className="text-5xl font-black tracking-tighter italic">{stat.value}</p>
                  <p className="pt-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-40">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter & List Area */}
          <div className="space-y-12">
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-primary/10 pb-8">
               <div className="flex flex-col gap-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent">Categorize</span>
                  <CategoryFilter active={category || undefined} />
               </div>
               <div className="relative w-full max-w-md group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-accent transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search the forum..."
                   className="w-full h-16 pl-14 pr-8 bg-white rounded-2xl border border-primary/5 outline-none focus:border-accent/40 shadow-xl shadow-primary/5 transition-all text-sm font-medium"
                 />
               </div>
            </section>

            {error && (
              <>
                {error === LOGIN_REQUIRED_MESSAGE ? <LoginRequiredGate /> : null}
                <div className="rounded-[2rem] bg-destructive/5 border border-destructive/10 p-10 text-center">
                  <p className="text-destructive font-black uppercase tracking-widest text-[10px] mb-4">Error Detected</p>
                  <p className="text-xl font-bold tracking-tight text-primary underline decoration-destructive/30 underline-offset-8">
                    {error}
                  </p>
                  {error === LOGIN_REQUIRED_MESSAGE && (
                    <Link href="/login" className="mt-8 inline-flex h-12 bg-primary text-white px-8 rounded-xl items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all animate-pulse">
                      Go to Login <ArrowRight className="size-3" />
                    </Link>
                  )}
                </div>
              </>
            )}

            {list && (
              <div className="space-y-12">
                <ul className="grid grid-cols-1 gap-8">
                  {list.content.length === 0 ? (
                    <li className="flex flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-primary/10 bg-primary/2 px-6 py-32 text-center">
                      <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/5 flex items-center justify-center text-primary/20">
                        <Search className="size-8" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold tracking-tight text-primary">첫 발자국을 남겨주세요</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
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
            )}
          </div>
        </div>
      </MotionEnter>
    </CommunityShell>
  );
}
