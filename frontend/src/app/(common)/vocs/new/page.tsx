import { VocShell } from "../_components/VocShell";
import { MotionEnter } from "../../community/_components/MotionEnter";
import { NewVocForm } from "./_components/NewVocForm";

export const metadata = {
  title: "민원 등록 | CoKkiri",
};

export default function VocNewPage() {
  return (
    <VocShell>
      <MotionEnter>
        <div className="mx-auto max-w-4xl">
          <header className="space-y-6">
            <h1 className="text-[10vw] font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:text-[8vw] md:text-[5vw] lg:text-[3.25rem]">
              민원{" "}
              <span className="underline decoration-secondary decoration-2 underline-offset-[0.18em]">등록</span>
            </h1>
            <p className="max-w-xl font-medium tracking-tight text-balance text-foreground/85 md:text-lg">
              내용과 첨부를 남겨 주시면 순차적으로 답변 드립니다.
            </p>
          </header>
          <div className="mt-12">
            <NewVocForm />
          </div>
        </div>
      </MotionEnter>
    </VocShell>
  );
}
