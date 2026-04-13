import Link from "next/link";
import { ClipboardList, Plus, FileText, ArrowRight } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "@/app/(common)/vocs/_api/bff-server";
import type { ApiResponse, VocListData } from "@/app/(common)/vocs/_types/vocs";
import { VocCard } from "@/app/(common)/vocs/_components/VocCard";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";
import { NewVocForm } from "@/app/(common)/vocs/new/_components/NewVocForm";
import { MyVocTabLinks } from "./_components/MyVocTabLinks";
import { VocAccessDeniedState } from "@/app/(common)/vocs/_components/VocAccessDeniedState";

type SearchParams = Promise<{ tab?: string; p?: string; s?: string }>;

export const metadata = {
  title: "나의 민원 | CoKkiri",
};

export default async function ProfileVocsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const showList = sp.tab === "list";
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));

  const qs = new URLSearchParams();
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", "createdAt,desc");

  let list: VocListData | null = null;
  let listError: string | null = null;
  let authError: string | null = null;
  let isNotResident = false;

  // 1. 현재 사용자 정보 로드 (Role 체크)
  const meRes = await bffGet("users/me");
  if (meRes.status === 401) {
    authError = LOGIN_REQUIRED_MESSAGE;
  } else if (meRes.ok) {
    const meBody = await meRes.json();
    if (meBody.success && meBody.data?.role === "USER") {
      isNotResident = true;
    }
  }

  // 2. 민원 목록 로드 (Resident인 경우만)
  if (!isNotResident && !authError) {
    const res = await bffGet(`vocs/my?${qs.toString()}`);
    if (res.status === 401) {
      authError = LOGIN_REQUIRED_MESSAGE;
    } else if (res.status === 403) {
      listError = "권한이 없습니다.";
    } else if (showList && !res.ok) {
      listError = "목록을 불러오지 못했습니다.";
    } else if (showList) {
      const body = (await res.json()) as ApiResponse<VocListData>;
      if (body.success && body.data) list = body.data;
      else listError = body.message ?? "목록을 불러오지 못했습니다.";
    }
  }

  const listBaseQuery = "tab=list";

  return (
    <>
      {/* Editorial Header */}
      <header className="mb-20">
        <div className="flex flex-col gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
            FEEDBACK / 01
          </span>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <h1 className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase whitespace-nowrap">
              VOICE OF<br />RESIDENT
            </h1>
            <div className="max-w-md pb-4">
              <p className="text-xl font-medium tracking-tight text-balance border-l-2 border-accent pl-8 opacity-60">
                더 나은 주거 환경을 위해 입주민 여러분의 소중한 의견을 들려주세요. 모든 민원은 시간순으로 정성껏 검토됩니다.
              </p>
              <div className="mt-10">
                <MyVocTabLinks active={showList ? "list" : "register"} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {authError === LOGIN_REQUIRED_MESSAGE ? <LoginRequiredGate /> : null}

      {isNotResident ? (
        <VocAccessDeniedState />
      ) : !showList ? (
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="bg-white p-12 rounded-[3rem] border border-primary/5 shadow-2xl shadow-primary/5">
            <div className="mb-12 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent">New Inquiry</span>
              <h2 className="text-4xl font-black tracking-tighter uppercase">새 민원 등록</h2>
            </div>
            <NewVocForm />
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {listError && (
            <div className="rounded-[2rem] bg-destructive/5 border border-destructive/10 p-10 text-center">
              <p className="text-destructive font-black uppercase tracking-widest text-[10px] mb-4">Error Detected</p>
              <p className="text-xl font-bold tracking-tight text-primary underline decoration-destructive/30 underline-offset-8">
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
                      href="/profile/vocs"
                      className="mt-6 inline-flex h-14 px-8 bg-primary text-white rounded-2xl items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all"
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
                  baseQuery={listBaseQuery}
                  pageSize={size}
                  hrefBase="/profile/vocs"
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );

}
