import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "@/app/(common)/vocs/_api/bff-server";
import type { ApiResponse, VocDetail } from "@/app/(common)/vocs/_types/vocs";
import { VocEditForm } from "@/app/(common)/vocs/_components/VocEditForm";
import { VocAccessDeniedState } from "@/app/(common)/vocs/_components/VocAccessDeniedState";

type Params = Promise<{ vocId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { vocId } = await params;
  return { title: `민원 수정 #${vocId} | CoKkiri` };
}

export default async function VocEditPage({ params }: { params: Params }) {
  const { vocId } = await params;
  const id = parseInt(vocId, 10);
  if (Number.isNaN(id)) notFound();

  const res = await bffGet(`vocs/${id}`);
  if (res.status === 404) notFound();
  if (res.status === 401) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <LoginRequiredGate />
        <p className="font-medium text-destructive">{LOGIN_REQUIRED_MESSAGE}</p>
      </div>
    );
  }
  if (res.status === 403) {
    return <VocAccessDeniedState />;
  }
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-medium text-destructive" role="alert">
          민원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const body = (await res.json()) as ApiResponse<VocDetail>;
  if (!body.success || !body.data) notFound();

  if (body.data.status !== "OPEN") {
    redirect(`/vocs/${id}`);
  }

  return (
    <div className="pt-4 pb-32">
      <header className="mx-auto max-w-5xl mb-12">
        <div className="flex flex-col gap-6">
          <Link
            href={`/vocs/${id}`}
            className="group inline-flex items-center gap-3 text-sm font-bold tracking-tight text-primary/60 hover:text-accent transition-colors w-fit"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 group-hover:bg-accent/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </span>
            민원 상세로 돌아가기
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-primary/10 pb-8">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight uppercase">
                EDI<span className="underline underline-offset-4 decoration-[var(--color-accent)]">T.</span>
                <span className="text-3xl md:text-5xl font-bold tracking-normal ml-2 align-bottom opacity-80">수정하기</span>
              </h1>
              <p className="text-sm leading-tight font-medium opacity-70 md:text-base">
                접수 상태(OPEN)에서만 수정할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative">
        <VocEditForm initial={body.data} />
      </div>
    </div>
  );
}
