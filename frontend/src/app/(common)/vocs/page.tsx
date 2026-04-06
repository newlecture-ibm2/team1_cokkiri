import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { bffGet } from "./_api/bff-server";
import type { ApiResponse, VocListData } from "./_types/voc";
import { VocShell } from "./_components/VocShell";
import { MotionEnter } from "../community/_components/MotionEnter";
import { VocCard } from "./_components/VocCard";
import { PaginationBar } from "../community/_components/PaginationBar";

type SearchParams = Promise<{ p?: string; s?: string }>;

export const metadata = {
  title: "민원 | CoKkiri",
};

export default async function VocPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));

  const qs = new URLSearchParams();
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", "createdAt,desc");

  const res = await bffGet(`vocs/my?${qs.toString()}`);
  let list: VocListData | null = null;
  let error: string | null = null;

  if (res.status === 401) {
    error = "로그인이 필요합니다.";
  } else if (!res.ok) {
    error = "목록을 불러오지 못했습니다.";
  } else {
    const body = (await res.json()) as ApiResponse<VocListData>;
    if (body.success && body.data) list = body.data;
    else error = body.message ?? "목록을 불러오지 못했습니다.";
  }

  return (
    <VocShell>
      <MotionEnter>
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <div className="space-y-6">
              <h1 className="whitespace-nowrap text-balance text-[12vw] font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:text-[10vw] md:text-[7vw] lg:text-[4.5rem]">
                민
                <span className="underline decoration-secondary decoration-2 underline-offset-[0.18em]">원</span>
              </h1>
              <p className="max-w-xl font-medium tracking-tight text-balance text-foreground/85 md:text-lg">
                시설·소음·기기 관련 문의를 남기면{" "}
                <span className="text-secondary">운영팀</span>이 확인합니다.
              </p>
            </div>
            <Link
              href="/vocs/new"
              className="shrink-0 rounded-xl bg-primary px-6 py-3 text-center text-sm font-black uppercase tracking-wider text-primary-foreground transition-transform duration-200 hover:scale-[1.02] md:self-start"
            >
              민원 등록
            </Link>
          </header>

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
                    <ClipboardList className="size-10 text-muted-foreground" strokeWidth={1.25} aria-hidden />
                    <p className="max-w-sm font-medium tracking-tight text-balance text-muted-foreground">
                      등록된 민원이 없습니다. 문제가 있으면 민원 등록으로 알려 주세요.
                    </p>
                  </li>
                ) : (
                  list.content.map((item) => (
                    <li key={item.vocId}>
                      <VocCard item={item} />
                    </li>
                  ))
                )}
              </ul>
              <PaginationBar
                page={list.page}
                totalPages={list.totalPages}
                baseQuery=""
                pageSize={size}
                hrefBase="/vocs"
              />
            </>
          )}
        </div>
      </MotionEnter>
    </VocShell>
  );
}
