import Link from "next/link";
import { VocShell } from "@/app/(common)/vocs/_components/VocShell";
import { MotionEnter } from "@/app/(common)/community/_components/MotionEnter";
import { VOC_MY_VOC_FORBIDDEN_MESSAGE } from "@/lib/auth-messages";

export function VocAccessDeniedState({
  message = VOC_MY_VOC_FORBIDDEN_MESSAGE,
}: {
  message?: string;
}) {
  return (
    <VocShell>
      <MotionEnter>
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <p className="font-medium text-destructive" role="alert">
            {message}
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            다른 회원의 민원은 조회할 수 없습니다. URL을 직접 입력한 경우 나의 민원 내역으로 돌아가 주세요.
          </p>
          <Link
            href="/profile/vocs?tab=list"
            className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-wider text-primary-foreground"
          >
            나의 민원 내역
          </Link>
        </div>
      </MotionEnter>
    </VocShell>
  );
}
