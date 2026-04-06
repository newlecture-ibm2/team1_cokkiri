import { DeviceRegisterForm } from "../_components/DeviceRegisterForm";

export const metadata = {
  title: "기기 등록",
  description: "관리자가 건물에 새로 설치된 스마트 기기를 전산망에 등록합니다.",
};

export default function DeviceRegisterPage() {
  return (
    <div className="space-y-8">
      {/* 페이지 타이틀 — Editorial Style */}
      <header className="space-y-2">
        <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Device Management
        </p>
        <h1 className="text-3xl font-black tracking-tighter text-primary md:text-4xl">
          새 기기 등록
        </h1>
        <p className="text-sm font-medium tracking-tight text-muted-foreground text-balance">
          건물에 새로 설치된 스마트 기기를 전산망에 등록합니다. 기기 종류, 설치 위치, 네트워크 정보를 입력하세요.
        </p>
      </header>

      {/* 등록 폼 카드 */}
      <div className="rounded-[2rem] border border-border bg-surface p-6 md:p-10">
        <DeviceRegisterForm />
      </div>
    </div>
  );
}
