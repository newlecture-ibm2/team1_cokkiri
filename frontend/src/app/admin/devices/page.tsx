import Link from "next/link";
import { DeviceListTable } from "./_components/DeviceListTable";

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
            등록된 기기의 상태 변경, 활성화/비활성화, 삭제를 관리합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/devices/types"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-border px-5 py-3
              text-xs font-bold uppercase tracking-[0.2em] text-primary
              transition-colors duration-200 hover:bg-muted"
          >
            종류 관리
          </Link>
          <Link
            href="/admin/devices/register"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 py-3
              text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground
              transition-colors duration-200 hover:bg-secondary"
          >
            + 기기 등록
          </Link>
        </div>
      </header>

      <DeviceListTable />
    </div>
  );
}
