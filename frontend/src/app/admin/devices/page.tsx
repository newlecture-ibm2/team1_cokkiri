import Link from "next/link";
import { DeviceListTable } from "./_components/DeviceListTable";

export const metadata = {
  title: "기기 관리",
  description: "IoT 기기 등록 및 제어 관리",
};

export default function DevicesPage() {
  return (
    <div className="space-y-8">
      <header>
        <div className="mb-10">
          <p className="text-muted-foreground text-[10px] font-black tracking-[0.35em] uppercase">
            Admin · IoT Devices
          </p>
          <h1 className="text-[12vw] leading-[0.85] font-black tracking-tighter text-[#2C3424] uppercase md:text-[6vw] mt-4">
            Device <span className="text-[#768064]">Control</span>
          </h1>
          <p className="max-w-2xl text-base font-medium tracking-tight text-balance text-[#4C583E] md:text-lg mt-5">
            등록된 기기의 활성화/비활성화, 제어, 수정, 삭제를 관리합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/monitoring"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-border px-5 py-3
              text-xs font-bold uppercase tracking-[0.2em] text-primary
              transition-colors duration-200 hover:bg-muted"
          >
            📊 기기 모니터링
          </Link>
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
