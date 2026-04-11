import Link from "next/link";
import { ClipboardList, Plus, ArrowRight } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "@/app/(common)/vocs/_api/bff-server";
import type { ApiResponse, VocListData } from "@/app/(common)/vocs/_types/vocs";
import { VocCard } from "@/app/(common)/vocs/_components/VocCard";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";

import type { Metadata } from "next";

type PageProps = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<{ page?: string; size?: string }>;
};

export const metadata: Metadata = {
  title: "나의 민원 | CoKkiri",
};

export default async function MyVocsPage({ params, searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.page ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.size ?? "20", 10) || 20));

  const qs = new URLSearchParams();
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", "createdAt,desc");

  let list: VocListData | null = null;
  let listError: string | null = null;
  let authError: string | null = null;

  const res = await bffGet(`vocs/my?${qs.toString()}`);
  if (res.status === 401) {
    authError = LOGIN_REQUIRED_MESSAGE;
  } else if (!res.ok) {
    listError = "목록을 불러오지 못했습니다.";
  } else {
    const body = (await res.json()) as ApiResponse<VocListData>;
    if (body.success && body.data) list = body.data;
    else listError = body.message ?? "목록을 불러오지 못했습니다.";
  }

  return (
    <div className="space-y-12 px-6 pt-16 md:px-12 md:pt-32">
      <header className="space-y-2">
        <p className="font-black text-xs uppercase tracking-[0.3em] text-accent">
          My Inquiries
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="text-3xl font-black tracking-tighter text-primary md:text-5xl uppercase italic">
            나의 민원 내역
          </h1>
          <Link
            href="/vocs/new"
            className="inline-flex h-12 px-6 bg-primary text-white rounded-xl items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New VOC
          </Link>
        </div>
        <p className="text-sm font-medium tracking-tight text-muted-foreground text-balance max-w-2xl">
          접수하신 민원과 답변을 확인하실 수 있습니다. 입주민 여러분의 소중한 의견은 더 나은 주거 환경을 만드는데 소중하게 쓰입니다.
        </p>
      </header>

      {authError === LOGIN_REQUIRED_MESSAGE && <LoginRequiredGate />}

      <div className="space-y-12">
        {listError && (
          <div className="rounded-[3rem] bg-destructive/5 border border-destructive/10 p-12 text-center">
            <p className="text-destructive font-black uppercase tracking-widest text-[10px] mb-4">Error Detected</p>
            <p className="text-xl font-bold tracking-tight text-primary">
              {listError}
            </p>
            {authError === LOGIN_REQUIRED_MESSAGE && (
              <Link href="/login" className="mt-8 inline-flex h-12 bg-primary text-white px-8 rounded-xl items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all animate-pulse underline decoration-transparent">
                Go to Login <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        )}

        {list && (
          <>
            <ul className="grid grid-cols-1 gap-8">
              {list.content.length === 0 ? (
                <li className="flex flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-primary/10 bg-primary/2 px-6 py-32 text-center">
                  <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/5 flex items-center justify-center text-primary/20">
                    <ClipboardList className="size-8" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold tracking-tight text-primary">등록된 민원이 없습니다</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                      Your voice matters! Share your feedback with us.
                    </p>
                  </div>
                  <Link
                    href="/vocs/new"
                    className="mt-6 inline-flex h-14 px-8 bg-primary text-white rounded-2xl items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all shadow-xl shadow-primary/10"
                  >
                    <Plus className="w-4 h-4" />
                    File New VOC
                  </Link>
                </li>
              ) : (
                list.content.map((item) => (
                  <li key={item.vocId}>
                    <VocCard item={item} />
                  </li>
                ))
              )}
            </ul>
            <div className="pt-10 flex justify-center">
              <PaginationBar
                page={list.page}
                totalPages={list.totalPages}
                baseQuery=""
                pageSize={size}
                hrefBase="/my-vocs"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
