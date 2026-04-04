import Link from "next/link";
import { LayoutList } from "lucide-react";
import { adminBffGet } from "./_api/admin-bff-server";
import type { AdminVocListData, ApiResponse } from "./_types/admin-voc";
import { MotionEnter } from "./_components/MotionEnter";
import { AdminVocStatusFilter } from "./_components/AdminVocStatusFilter";
import { AdminVocListCard } from "./_components/AdminVocListCard";
import { AdminVocPaginationBar } from "./_components/AdminVocPaginationBar";

type SearchParams = Promise<{ status?: string; p?: string; s?: string }>;

export const metadata = {
  title: "민원 관리 | Admin",
};

export default async function AdminVocListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status = sp.status?.trim() ?? "";
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));

  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", "createdAt,desc");

  const res = await adminBffGet(`admin/voc?${qs.toString()}`);
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

  const baseQuery = status ? `status=${encodeURIComponent(status)}` : "";

  return (
    <MotionEnter>
      <div className="max-w-5xl">
          <header className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="space-y-6">
              <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Admin · VoC</p>
              <h1 className="whitespace-nowrap text-balance text-[11vw] font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:text-[9vw] md:text-[6vw] lg:text-[4rem]">
                민원{" "}
                <span className="underline decoration-secondary decoration-2 underline-offset-[0.18em]">관리</span>
              </h1>
              <p className="max-w-xl font-medium tracking-tight text-balance text-foreground/85 md:text-lg">
                접수·처리 중·완료 건을 조회하고 답변 및 처리 완료를 등록합니다.
              </p>
            </div>
            <Link
              href="/voc"
              className="shrink-0 rounded-xl border border-border px-5 py-3 text-center text-xs font-black uppercase tracking-wider text-foreground transition-transform hover:-translate-y-0.5 md:self-start"
            >
              입주민 민원 화면
            </Link>
          </header>

          <section className="mt-12 space-y-4">
            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">상태</p>
            <AdminVocStatusFilter activeStatus={status} />
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
                pageSize={size}
              />
            </>
          )}
      </div>
    </MotionEnter>
  );
}
