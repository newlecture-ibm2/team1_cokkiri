import Link from "next/link";
import { ClipboardList, Plus, ArrowRight } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "@/app/(common)/vocs/_api/bff-server";
import type { ApiResponse, VocListData } from "@/app/(common)/vocs/_types/vocs";
import { VocCard } from "@/app/(common)/vocs/_components/VocCard";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";
import { NewVocForm } from "@/app/(common)/vocs/new/_components/NewVocForm";
import { MyVocTabLinks } from "./_components/MyVocTabLinks";

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

  const res = await bffGet(`vocs/my?${qs.toString()}`);
  if (res.status === 401) {
    authError = LOGIN_REQUIRED_MESSAGE;
  } else if (res.status === 403) {
    const meRes = await bffGet("users/me");
    if (meRes.status === 401 || meRes.status === 403) {
      authError = LOGIN_REQUIRED_MESSAGE;
    } else if (showList) {
      listError = "목록을 불러오지 못했습니다.";
    }
  } else if (showList && !res.ok) {
    listError = "목록을 불러오지 못했습니다.";
  } else if (showList) {
    const body = (await res.json()) as ApiResponse<VocListData>;
    if (body.success && body.data) list = body.data;
    else listError = body.message ?? "목록을 불러오지 못했습니다.";
  }

  const listBaseQuery = "tab=list";

  return (
    <>
      {/* Editorial Header */}
      <header className="mb-[clamp(2rem,5vw,5rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0 space-y-4">
              <h1 className="text-[clamp(1.5rem,6vw,7.5rem)] font-black leading-[0.85] tracking-tighter uppercase whitespace-nowrap">
                RESIDENTS&apos; <span className="underline underline-offset-[1vw] decoration-[var(--color-accent)]">VOICE.</span>
                <span className="text-[clamp(1rem,2vw,2.5rem)] font-bold tracking-normal ml-[clamp(0.25rem,0.5vw,0.5rem)] align-bottom opacity-80">민원</span>
              </h1>
              <p className="text-[clamp(0.75rem,1.5vw,1.5rem)] leading-tight font-medium opacity-70 whitespace-nowrap">
                더 나은 주거 환경을 위해 소중한 의견을 들려주세요.
              </p>
            </div>
            <div className="flex items-center shrink-0 self-end pb-1">
              <Link
                href="/profile/vocs?tab=list"
                className="inline-flex shrink-0 h-[clamp(2.75rem,4vw,3.5rem)] px-[clamp(1.25rem,2.5vw,2rem)] bg-primary/5 border-2 border-primary/15 text-primary rounded-xl items-center gap-2 text-[clamp(0.8rem,1.2vw,1rem)] font-semibold tracking-tight transition-all hover:bg-primary/10 hover:border-primary/25"
              >
                내역
              </Link>
            </div>
          </div>
        </div>
      </header>

      {authError === LOGIN_REQUIRED_MESSAGE ? <LoginRequiredGate /> : null}

      {!showList ? (
        <div className="space-y-[clamp(1.5rem,3vw,3rem)]">
          <NewVocForm />
        </div>
      ) : (
        <div className="space-y-[clamp(1.5rem,3vw,3rem)]">
          {listError && (
            <div className="rounded-[2rem] bg-destructive/5 border border-destructive/10 p-10 text-center">
              <p className="text-destructive font-black uppercase tracking-widest text-sm mb-4">Error Detected</p>
              <p className="text-2xl font-bold tracking-tight text-primary underline decoration-destructive/30 underline-offset-8">
                {listError}
              </p>
              {authError === LOGIN_REQUIRED_MESSAGE && (
                 <Link href="/login" className="mt-8 inline-flex h-12 bg-primary text-white px-8 rounded-xl items-center gap-2 text-sm font-black uppercase tracking-[0.2em] hover:bg-accent transition-all animate-pulse">
                   Go to Login <ArrowRight className="size-3" />
                 </Link>
              )}
            </div>
          )}

          {list && (
            <>
              <ul className="grid grid-cols-1 gap-[clamp(1rem,2vw,2rem)]">
                {list.content.length === 0 ? (
                  <li className="flex flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-primary/10 bg-primary/2 px-6 py-32 text-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/5 flex items-center justify-center text-primary/50">
                      <ClipboardList className="size-8" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold tracking-tight text-primary">등록된 민원이 없습니다</p>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/80">
                        Your voice matters!
                      </p>
                    </div>
                    <Link
                      href="/profile/vocs"
                      className="mt-4 inline-flex shrink-0 h-[clamp(2.75rem,4vw,3.5rem)] px-[clamp(1.25rem,2.5vw,2rem)] bg-primary text-white rounded-xl items-center gap-2 text-[clamp(0.8rem,1.2vw,1rem)] font-semibold tracking-tight transition-all hover:bg-primary/90 hover:-translate-y-1 shadow-lg shadow-primary/15"
                    >
                      <Plus className="w-4 h-4" />
                      민원 등록
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
              <div className="pt-[clamp(1rem,2.5vw,2.5rem)] border-t border-primary/5 flex justify-center">
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
