import { CommunityModerationPanel } from "./_components/CommunityModerationPanel";
import { MotionEnter } from "../vocs/_components/MotionEnter";

export const metadata = {
  title: "커뮤니티 관리 | Admin",
  description: "게시글 및 댓글 검수/삭제 관리",
};

export default function AdminCommunityPage() {
  return (
    <MotionEnter>
      <div className="max-w-5xl">
        <header className="mb-12">
          <div className="flex flex-col gap-6">
            <div className="border-b border-primary/10 pb-8 space-y-4">
              <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Admin · Community</p>
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                ADMIN COMMUNITY <span className="underline underline-offset-4 decoration-accent">LIST.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">커뮤니티 관리</span>
              </h1>
              <p className="font-medium tracking-tight text-foreground/70 text-sm md:text-base">
                관리자 권한으로 커뮤니티 게시글과 댓글을 검수할 수 있습니다. 부적절한 콘텐츠는 즉시 삭제 처리가 가능합니다.
              </p>
            </div>
          </div>
        </header>

        <CommunityModerationPanel />
      </div>
    </MotionEnter>
  );
}
