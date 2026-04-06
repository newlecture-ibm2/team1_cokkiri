import { DeviceTypeManager } from "../_components/DeviceTypeManager";

export const metadata = {
  title: "기기 종류 관리",
  description: "IoT 기기 종류를 등록, 수정, 삭제합니다.",
};

export default function DeviceTypesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Device Type Management
        </p>
        <h1 className="text-3xl font-black tracking-tighter text-primary md:text-4xl">
          기기 종류 관리
        </h1>
        <p className="text-sm font-medium tracking-tight text-muted-foreground text-balance">
          기기 종류를 동적으로 추가하거나 수정할 수 있습니다. 기기 등록 시 여기서 관리하는 종류를 선택합니다.
        </p>
      </header>

      <div className="rounded-[2rem] border border-border bg-surface p-6 md:p-10">
        <DeviceTypeManager />
      </div>
    </div>
  );
}
