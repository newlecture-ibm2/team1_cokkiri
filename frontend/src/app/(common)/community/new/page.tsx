import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewPostForm } from "./_components/NewPostForm";

export const metadata = {
  title: "글쓰기 | 커뮤니티",
};

export default function CommunityNewPage() {
  return (
    <div className="pt-4 pb-32">
      <header className="mx-auto max-w-5xl mb-12">
        <div className="flex flex-col gap-6">
          <Link
            href="/community"
            className="group inline-flex items-center gap-3 text-sm font-bold tracking-tight text-primary/60 hover:text-accent transition-colors w-fit"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 group-hover:bg-accent/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </span>
            목록으로 돌아가기
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-primary/10 pb-8">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight uppercase">
                CREAT<span className="underline underline-offset-4 decoration-[var(--color-accent)]">E.</span>
                <span className="text-3xl md:text-5xl font-bold tracking-normal ml-2 align-bottom opacity-80">글쓰기</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="relative">
        <NewPostForm />
      </div>
    </div>
  );

}
