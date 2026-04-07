import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "@/app/(common)/vocs/_api/bff-server";
import type { ApiResponse, VocDetail } from "@/app/(common)/vocs/_types/vocs";
import { VocShell } from "@/app/(common)/vocs/_components/VocShell";
import { MotionEnter } from "@/app/(common)/community/_components/MotionEnter";
import { VocEditForm } from "@/app/(common)/vocs/_components/VocEditForm";

type Params = Promise<{ vocId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { vocId } = await params;
  return { title: `민원 수정 #${vocId} | CoKkiri` };
}

export default async function ProfileVocEditPage({ params }: { params: Params }) {
  const { vocId } = await params;
  const id = parseInt(vocId, 10);
  if (Number.isNaN(id)) notFound();

  const res = await bffGet(`vocs/${id}`);
  if (res.status === 401) {
    return (
      <VocShell>
        <MotionEnter>
          <div className="mx-auto max-w-3xl text-center">
            <LoginRequiredGate />
            <p className="font-medium text-destructive">{LOGIN_REQUIRED_MESSAGE}</p>
          </div>
        </MotionEnter>
      </VocShell>
    );
  }
  if (!res.ok) notFound();

  const body = (await res.json()) as ApiResponse<VocDetail>;
  if (!body.success || !body.data) notFound();

  if (body.data.status !== "OPEN") {
    redirect(`/profile/vocs/${id}`);
  }

  return (
    <VocShell>
      <MotionEnter>
        <div className="mx-auto max-w-4xl">
          <header className="space-y-4">
            <Link
              href={`/profile/vocs/${id}`}
              className="inline-flex font-black text-xs uppercase tracking-[0.3em] text-secondary hover:text-foreground"
            >
              ← 상세
            </Link>
            <h1 className="text-[8vw] font-black uppercase leading-[0.85] tracking-tighter text-foreground md:text-[3rem]">
              민원{" "}
              <span className="underline decoration-secondary decoration-2 underline-offset-[0.18em]">수정</span>
            </h1>
            <p className="max-w-xl text-sm font-medium text-muted-foreground">
              접수 상태(OPEN)에서만 수정할 수 있습니다.
            </p>
          </header>
          <div className="mt-12">
            <VocEditForm initial={body.data} />
          </div>
        </div>
      </MotionEnter>
    </VocShell>
  );
}
