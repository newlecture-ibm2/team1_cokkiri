import { CommunityShell } from "../_components/CommunityShell";
import { MotionEnter } from "../_components/MotionEnter";
import { NewPostForm } from "./_components/NewPostForm";

export const metadata = {
  title: "글쓰기 | 커뮤니티",
};

export default function CommunityNewPage() {
  return (
    <CommunityShell>
      <MotionEnter>
        <div className="mx-auto max-w-4xl pt-10 pb-32">
          <header className="mb-20 space-y-12">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">New Story</span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-primary uppercase italic">
                CREATE <br />
                <span className="text-accent underline underline-offset-[0.1em] decoration-accent/30">NEW POST</span>
              </h1>
            </div>
            <p className="max-w-2xl text-xl font-medium tracking-tight text-balance text-muted-foreground leading-relaxed">
              Share your thoughts, questions, or updates with the community. Every story builds our home.
            </p>
          </header>

          <div className="relative">
            <NewPostForm />
            
            {/* Background Decoration */}
            <span className="absolute -left-20 -top-20 text-[20vw] font-black opacity-[0.02] pointer-events-none select-none italic text-primary">
              COM-UN
            </span>
          </div>
        </div>
      </MotionEnter>
    </CommunityShell>
  );
}
