import Link from "next/link";
import { Bell, ClipboardList, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "내 프로필 | CoKkiri",
};

const cardClass =
  "group flex flex-col gap-3 rounded-[1.75rem] border border-border bg-background/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/45 hover:shadow-md md:p-8";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="space-y-3">
        <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">My · Profile</p>
        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">내 프로필</h1>
        <p className="max-w-lg text-muted-foreground">
          개인정보·비밀번호 관리와 입주민 전용 메뉴로 이동할 수 있습니다.
        </p>
      </header>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        <li>
          <Link href="/profile/vocs" className={cardClass}>
            <ClipboardList
              className="size-9 text-secondary transition-transform duration-300 group-hover:scale-105"
              strokeWidth={1.35}
              aria-hidden
            />
            <span className="font-black uppercase tracking-[0.2em] text-foreground">My VOC</span>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              민원 등록과 나의 민원 내역은 로그인 후 이용할 수 있습니다.
            </p>
          </Link>
        </li>
        <li>
          <Link href="/notifications" className={cardClass}>
            <Bell
              className="size-9 text-secondary transition-transform duration-300 group-hover:scale-105"
              strokeWidth={1.35}
              aria-hidden
            />
            <span className="font-black uppercase tracking-[0.2em] text-foreground">알림</span>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              민원 답변 등 알림을 확인합니다.
            </p>
          </Link>
        </li>
        <li className="sm:col-span-2">
          <div
            className={cn(
              cardClass,
              "cursor-default border-dashed opacity-90 hover:translate-y-0 hover:shadow-none",
            )}
          >
            <UserRound className="size-9 text-muted-foreground" strokeWidth={1.35} aria-hidden />
            <span className="font-black uppercase tracking-[0.2em] text-foreground">계정 설정</span>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              개인정보 수정·비밀번호 변경 화면은 곧 연결됩니다.
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
}
