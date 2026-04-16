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
          <div className="flex items-end justify-between gap-4 border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0">
              <h1 className="text-[clamp(2.25rem,7vw,5.5rem)] font-black leading-none tracking-tight uppercase whitespace-nowrap text-primary">
                DEVICE<span className="underline underline-offset-4 decoration-[var(--color-accent)]">S.</span>
                <span className="text-[clamp(1rem,3vw,2.5rem)] font-bold tracking-normal ml-3 align-baseline opacity-80">내 기기 제어</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <DeviceGrid />
    </div>
  );
}
