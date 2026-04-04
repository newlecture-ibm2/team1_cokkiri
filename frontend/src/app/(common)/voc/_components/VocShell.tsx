import { CommunityShell } from "../../community/_components/CommunityShell";

/** 커뮤니티와 동일한 헤더·푸터 레이아웃(Co-living 플랫폼 UI 일관성). */
export function VocShell({ children }: { children: React.ReactNode }) {
  return <CommunityShell>{children}</CommunityShell>;
}
