import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "./_api/bff-server";
import type { ApiResponse, VocListData } from "./_types/vocs";
import { VocCard } from "./_components/VocCard";
import { VocCategoryFilter } from "./_components/VocCategoryFilter";
import { VocSearchAndSort } from "./_components/VocSearchAndSort";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";
import { NewVocForm } from "./new/_components/NewVocForm";

type SearchParams = Promise<{
  tab?: string;
  p?: string;
  s?: string;
  category?: string;
  status?: string;
  q?: string;
  sort?: string;
}>;

export const metadata = {
  title: "나의 민원 | CoKkiri",
};

export default async function VocsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const showList = sp.tab === "list";
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));
  const category = sp.category ?? "";
  const status = sp.status ?? "";
  const query = sp.q ?? "";
  const sort = sp.sort ?? "createdAt,desc";

  const qs = new URLSearchParams();
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", sort);

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

  // Client-side filtering
  let filteredContent = list?.content ?? [];
  if (category) {
    filteredContent = filteredContent.filter(
      (item) => item.category.toUpperCase() === category.toUpperCase(),
    );
  }
  if (status) {
    filteredContent = filteredContent.filter(
      (item) => item.status.toUpperCase() === status.toUpperCase(),
    );
  }
  if (query) {
    const q = query.toLowerCase();
    filteredContent = filteredContent.filter((item) =>
      item.title.toLowerCase().includes(q),
    );
  }

  // Build baseQuery for pagination
  const baseQueryParts: string[] = ["tab=list"];
  if (category) baseQueryParts.push(`category=${category}`);
  if (status) baseQueryParts.push(`status=${status}`);
  if (query) baseQueryParts.push(`q=${encodeURIComponent(query)}`);
  if (sort !== "createdAt,desc") baseQueryParts.push(`sort=${sort}`);
  const listBaseQuery = baseQueryParts.join("&");

  return (
    <div className="mx-auto max-w-5xl">
      {/* Editorial Header */}
      <header className="mb-16">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary/10 pb-6">
            <div className="min-w-0">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                RESIDENTS&apos; <span className="underline underline-offset-4 decoration-[var(--color-accent)]">VOICE.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">민원</span>
              </h1>
            </div>
            <div className="flex items-center shrink-0 self-end pb-0.5">
              {showList ? (
                <Link
                  href="/vocs"
                  className="inline-flex shrink-0 h-14 px-10 bg-primary text-white rounded-xl items-center gap-3 text-base font-bold tracking-tight transition-all hover:bg-primary/95 hover:-translate-y-1 shadow-xl shadow-primary/20"
                >
                  <Plus className="w-5 h-5" />
                  민원 등록
                </Link>
              ) : (
                <Link
                  href="/vocs?tab=list"
                  className="inline-flex shrink-0 h-14 px-10 bg-primary text-white rounded-xl items-center gap-3 text-base font-bold tracking-tight transition-all hover:bg-primary/95 hover:-translate-y-1 shadow-xl shadow-primary/20"
                >
                  <ClipboardList className="w-5 h-5" />
                  나의 민원보기
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {authError === LOGIN_REQUIRED_MESSAGE ? <LoginRequiredGate /> : null}

      {!showList ? (
        <div className="space-y-6">
          <NewVocForm />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter & Search */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/10 pb-4">
            <VocCategoryFilter
              activeCategory={category || undefined}
              activeStatus={status || undefined}
            />
            <VocSearchAndSort />
          </section>

          {listError && (
            <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-8 text-center">
              <p className="text-destructive font-bold tracking-tight text-sm mb-2">오류 발생</p>
              <p className="text-lg font-bold tracking-tight text-primary">
                {listError}
              </p>
            </div>
          )}

          {list && (
            <div className="space-y-6">
              <ul className="grid grid-cols-1 gap-4">
                {filteredContent.length === 0 ? (
                  <li className="flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-primary/10 bg-primary/2 px-6 py-24 text-center">
                    <div className="w-16 h-16 rounded-xl bg-background border border-primary/5 flex items-center justify-center text-primary/50">
                      <ClipboardList className="size-7" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold tracking-tight text-primary">등록된 민원이 없습니다</p>
                      <p className="text-xs font-semibold tracking-tight text-primary/50">
                        Your voice matters!
                      </p>
                    </div>
                    <Link
                      href="/vocs"
                      className="mt-2 inline-flex h-10 px-6 bg-primary text-white rounded-xl items-center gap-2 text-sm font-semibold tracking-tight transition-all hover:bg-primary/90 shadow-lg shadow-primary/15"
                    >
                      <Plus className="w-4 h-4" />
                      민원 등록
                    </Link>
                  </li>
                ) : (
                  filteredContent.map((item) => (
                    <li key={item.vocId}>
                      <VocCard item={item} />
                    </li>
                  ))
                )}
              </ul>
              <div className="pt-6 border-t border-primary/5 flex justify-center">
                <PaginationBar
                  page={list.page}
                  totalPages={list.totalPages}
                  baseQuery={listBaseQuery}
                  pageSize={size}
                  hrefBase="/vocs"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
