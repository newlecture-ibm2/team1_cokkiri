import Link from "next/link";
import { Bell, ClipboardList } from "lucide-react";
import ProfileInfo from "./_components/profile-info";

export const metadata = {
  title: "내 프로필 | CoKkiri",
};

const cardClass =
  "group flex flex-col gap-3 rounded-[2rem] border border-border bg-background/80 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-secondary/45 hover:shadow-lg md:p-10";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-[1400px] lg:px-24 space-y-16 py-12 md:py-24">
      <header className="space-y-4">
        <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground/80">
          My · Profile
        </p>
        <h1 className="text-[10vw] md:text-[5vw] font-black tracking-tighter uppercase leading-[0.85] text-foreground">
          <span className="underline underline-offset-[1vw] decoration-accent">내</span> 프로필
        </h1>

        <div className="mt-12 border-l-2 border-accent pl-5 md:pl-8 py-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3">
            Identity & Residency
          </p>
          <p className="text-lg md:text-xl font-medium tracking-tight text-muted-foreground leading-relaxed text-balance max-w-2xl">
            안전하고 프리미엄한 코리빙 라이프를 위한 <br className="hidden sm:block" />
            <strong className="text-foreground font-bold">개인 정보 및 입주민 권한 관리</strong> 공간입니다.
          </p>
        </div>
      </header>

      {/* 내 정보 조회 및 편집 지원 섹션 */}
      <section>
        <ProfileInfo />
      </section>

    </div>
  );
}
