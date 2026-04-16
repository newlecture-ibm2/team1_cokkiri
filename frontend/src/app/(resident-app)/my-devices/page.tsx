import { DeviceGrid } from "./_components/DeviceGrid";

export const metadata = {
  title: "내 기기 제어",
  description: "거주 공간의 스마트 기기를 확인하고 제어합니다",
};

export default function MyDevicesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-[clamp(2rem,5vw,5rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0 space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap text-primary">
                DEVICE<span className="underline underline-offset-4 decoration-[var(--color-accent)]">S.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">내 기기 제어</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <DeviceGrid />
    </div>
  );
}
