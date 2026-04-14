import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutList } from "lucide-react";
import { adminBffGet } from "./_api/admin-bff-server";
import type { AdminVocListData, ApiResponse } from "./_types/admin-vocs";
import { MotionEnter } from "./_components/MotionEnter";
import { AdminVocDashboard } from "./_components/AdminVocDashboard";
import { AdminVocFilter } from "./_components/AdminVocFilter";
import { AdminVocSearchAndSort } from "./_components/AdminVocSearchAndSort";
import { AdminVocListCard } from "./_components/AdminVocListCard";
import { AdminVocPaginationBar } from "./_components/AdminVocPaginationBar";
import {
  adminVocListNeedsDefaultRedirect,
  buildAdminVocListApiQuery,
  buildAdminVocListBaseQuery,
  parseAdminVocListScope,
  redirectToDefaultAdminVocList,
} from "./_lib/admin-voc-list-query";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata = {
  title: "민원 관리 | Admin",
};

export default async function AdminVocListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  if (adminVocListNeedsDefaultRedirect(sp)) {
    redirect(redirectToDefaultAdminVocList(sp));
  }

  const { category, status } = parseAdminVocListScope(sp);

  const res = await adminBffGet(`admin/vocs?${buildAdminVocListApiQuery(sp)}`);
  let list: AdminVocListData | null = null;
  let error: string | null = null;

  if (res.status === 401) {
    error = "관리자 로그인이 필요합니다.";
  } else if (!res.ok) {
    error = "목록을 불러오지 못했습니다.";
  } else {
    const body = (await res.json()) as ApiResponse<AdminVocListData>;
    if (body.success && body.data) list = body.data;
    else error = body.message ?? "목록을 불러오지 못했습니다.";
  }

  const baseQuery = buildAdminVocListBaseQuery(sp);

  return (
    <MotionEnter>
      <div className="max-w-5xl">
        <header className="mb-12">
          <div className="flex flex-col gap-6">
            <div className="border-b border-primary/10 pb-8 space-y-4">
              <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Admin · VoC</p>
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                ADMIN VOC <span className="underline underline-offset-4 decoration-accent">LIST.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">민원 관리</span>
              </h1>
              <p className="font-medium tracking-tight text-foreground/70 text-sm md:text-base">
                기본 화면은 미처리(접수·처리 중) 안건입니다. 답변 등록 시 해당 건은 처리 완료로 반영됩니다.
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard Stats */}
        <AdminVocDashboard />

        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/10 pb-4">
          <AdminVocFilter activeCategory={category} activeStatus={status} />
          <AdminVocSearchAndSort />
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
                  <LayoutList className="size-10 text-muted-foreground" strokeWidth={1.25} aria-hidden />
                  <p className="max-w-sm font-medium tracking-tight text-balance text-muted-foreground">
                    조건에 맞는 민원이 없습니다.
                  </p>
                </li>
              ) : (
                list.content.map((item) => (
                  <li key={item.vocId}>
                    <AdminVocListCard item={item} />
                  </li>
                ))
              )}
            </ul>
            <AdminVocPaginationBar
              page={list.page}
              totalPages={list.totalPages}
              baseQuery={baseQuery}
              pageSize={list.size}
            />
          </>
        )}
      </div>
    </MotionEnter>
  );
}
