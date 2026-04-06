import { CommunityModerationPanel } from "./_components/CommunityModerationPanel";

export const metadata = {
  title: "커뮤니티 관리",
  description: "게시글 및 댓글 검수/삭제 관리",
};

export default function AdminCommunityPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">Community Moderation</p>
        <h1 className="text-3xl font-black tracking-tighter text-primary md:text-4xl">커뮤니티 관리</h1>
        <p className="text-sm font-medium tracking-tight text-muted-foreground">
          관리자 권한으로 커뮤니티 게시글/댓글을 검수하고 삭제할 수 있습니다.
        </p>
      </header>

      <CommunityModerationPanel />
    </div>
  );
}
