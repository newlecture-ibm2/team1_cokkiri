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
        <div className="mx-auto max-w-4xl">
          <header className="space-y-6 border-b border-primary/10 pb-10">
            <h1 className="text-[10vw] font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:text-[8vw] md:text-[5vw] lg:text-[3.25rem]">
              새 글{" "}
              <span className="underline decoration-secondary decoration-2 underline-offset-[0.18em]">
                작성
              </span>
            </h1>
            <p className="max-w-xl font-medium tracking-tight text-balance text-foreground/85 md:text-lg">
              입주자 커뮤니티에 남기는 이야기는 모두에게 열립니다.
            </p>
          </header>
          <div className="mt-12">
            <NewPostForm />
          </div>
        </div>
      </MotionEnter>
    </CommunityShell>
  );
}
