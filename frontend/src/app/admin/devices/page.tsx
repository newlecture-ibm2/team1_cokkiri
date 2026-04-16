import Link from "next/link";
import { Plus } from "lucide-react";
import { DeviceListTable } from "./_components/DeviceListTable";

export const metadata = {
  title: "기기 관리",
  description: "IoT 기기 등록 및 제어 관리",
};

export default function DevicesPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <header className="mb-12">
        <div className="flex flex-col gap-6">
          <div className="border-b border-primary/10 pb-8 space-y-4">
            <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Admin · IoT Devices</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                DEVICE <span className="underline underline-offset-4 decoration-accent">CONTROL.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">기기 관리</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/admin/devices/register"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 py-3
                    text-xs font-bold uppercase tracking-tight text-white
                    transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Plus className="size-4" />
                  기기 등록
                </Link>
              </div>
            </div>
            <p className="font-medium tracking-tight text-primary/70 text-sm md:text-base">
              시설 내 설치된 모든 IoT 기기(도어락, 조명, 에어컨 등)를 조회하고 원격 제어 및 상태를 모니터링합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/monitoring"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-primary/10 bg-primary/5 px-4 py-2
                text-xs font-bold uppercase tracking-tight text-primary/70
                transition-colors duration-200 hover:bg-primary/10"
            >
              📊 기기 모니터링
            </Link>
            <Link
              href="/admin/devices/types"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-primary/10 bg-primary/5 px-4 py-2
                text-xs font-bold uppercase tracking-tight text-primary/70
                transition-colors duration-200 hover:bg-primary/10"
            >
              종류 관리
            </Link>
          </div>
        </div>
      </header>

      <DeviceListTable />
    </div>
  );
}
