import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "@/app/(common)/vocs/_api/bff-server";
import type { ApiResponse, VocListData } from "@/app/(common)/vocs/_types/vocs";
import { VocShell } from "@/app/(common)/vocs/_components/VocShell";
import { MotionEnter } from "@/app/(common)/community/_components/MotionEnter";
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

  if (showList) {
    const res = await bffGet(`vocs/my?${qs.toString()}`);
    if (res.status === 401) {
      listError = LOGIN_REQUIRED_MESSAGE;
    } else if (!res.ok) {
      listError = "목록을 불러오지 못했습니다.";
    } else {
      const body = (await res.json()) as ApiResponse<VocListData>;
      if (body.success && body.data) list = body.data;
      else listError = body.message ?? "목록을 불러오지 못했습니다.";
    }
  }

  const listBaseQuery = "tab=list";

  return (
    <VocShell>
      <MotionEnter>
        <div className="mx-auto max-w-5xl">
          <header className="mb-10 space-y-4">
            <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              My · Profile
            </p>
            <h1 className="whitespace-nowrap text-balance text-[11vw] font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:text-[9vw] md:text-[5.5vw] lg:text-[3.25rem]">
              나의{" "}
              <span className="underline decoration-secondary decoration-2 underline-offset-[0.18em]">
                민원
              </span>
            </h1>
            <p className="max-w-xl font-medium tracking-tight text-balance text-foreground/85 md:text-lg">
              로그인한 회원만 이용할 수 있으며, 본인이 등록한 민원만 조회·수정할 수 있습니다.
            </p>
          </header>

          <MyVocTabLinks active={showList ? "list" : "register"} />

          {!showList ? (
            <div className="mx-auto max-w-4xl">
              <p className="mb-8 max-w-xl font-medium tracking-tight text-balance text-muted-foreground md:text-base">
                시설·소음·기기 관련 문의를 남기면 운영팀이 확인합니다.
              </p>
              <NewVocForm />
            </div>
          ) : (
            <>
              {listError && (
                <>
                  {listError === LOGIN_REQUIRED_MESSAGE ? <LoginRequiredGate /> : null}
                  <div
                    className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
                    role="alert"
                  >
                    <p>{listError}</p>
                    {listError === LOGIN_REQUIRED_MESSAGE ? (
                      <p className="mt-2 text-sm">
                        <Link
                          href="/login"
                          className="font-black text-secondary underline underline-offset-4"
                        >
                          로그인 페이지로 이동
                        </Link>
                      </p>
                    ) : null}
                  </div>
                </>
              )}

              {list && (
                <>
                  <ul className="mt-4 space-y-6">
                    {list.content.length === 0 ? (
                      <li className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-border bg-muted/25 px-6 py-16 text-center">
                        <ClipboardList
                          className="size-10 text-muted-foreground"
                          strokeWidth={1.25}
                          aria-hidden
                        />
                        <p className="max-w-sm font-medium tracking-tight text-balance text-muted-foreground">
                          등록된 민원이 없습니다. 민원 등록 탭에서 새 민원을 남겨 주세요.
                        </p>
                        <Link
                          href="/profile/vocs"
                          className="rounded-xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-wider text-primary-foreground"
                        >
                          민원 등록하기
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
                  <PaginationBar
                    page={list.page}
                    totalPages={list.totalPages}
                    baseQuery={listBaseQuery}
                    pageSize={size}
                    hrefBase="/profile/vocs"
                  />
                </>
              )}
            </>
          )}
        </div>
      </MotionEnter>
    </VocShell>
  );
}
