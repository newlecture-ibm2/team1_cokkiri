import { CommunityShell } from "./_components/CommunityShell";

export default function CommunityLoading() {
  return (
    <CommunityShell>
      <div className="mx-auto max-w-4xl animate-pulse space-y-10" aria-busy aria-label="불러오는 중">
        <div className="h-16 max-w-md rounded-xl bg-muted md:h-24" />
        <div className="h-4 max-w-lg rounded-lg bg-muted" />
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-20 rounded-full bg-muted" />
          <div className="h-10 w-24 rounded-full bg-muted" />
          <div className="h-10 w-28 rounded-full bg-muted" />
        </div>
        <div className="space-y-6">
          <div className="h-40 rounded-[2rem] bg-muted" />
          <div className="h-40 rounded-[2rem] bg-muted" />
          <div className="h-40 rounded-[2rem] bg-muted" />
        </div>
      </div>
    </CommunityShell>
  );
}
