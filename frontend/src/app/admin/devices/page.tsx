import Link from "next/link";

export const metadata = {
  title: "기기 관리",
  description: "IoT 기기 등록 및 제어 관리",
};

export default function DevicesPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">
            IoT Devices
          </p>
          <h1 className="text-3xl font-black tracking-tighter text-primary md:text-4xl">
            기기 관리
          </h1>
          <p className="text-sm font-medium tracking-tight text-muted-foreground text-balance">
            기기 등록 및 제어 관리 페이지입니다.
          </p>
        </div>
        <Link
          href="/admin/devices/register"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 py-3
            text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground
            transition-colors duration-200 hover:bg-secondary"
        >
          + 기기 등록
        </Link>
      </header>

      {/* TODO: 기기 목록 테이블 */}
      <div className="rounded-[2rem] border border-border bg-surface p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          등록된 기기가 없습니다. 새 기기를 등록해 보세요.
        </p>
      </div>
    </div>
  );
}
