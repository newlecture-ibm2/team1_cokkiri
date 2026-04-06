import { DeviceGrid } from "./_components/DeviceGrid";

export const metadata = {
  title: "내 기기 제어",
  description: "거주 공간의 스마트 기기를 확인하고 제어합니다",
};

export default function MyDevicesPage() {
  return (
    <div className="space-y-8 px-6 pt-16 md:px-12 md:pt-32">
      <header className="space-y-2">
        <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">
          My Devices
        </p>
        <h1 className="text-3xl font-black tracking-tighter text-primary md:text-4xl">
          내 기기 제어
        </h1>
        <p className="text-sm font-medium tracking-tight text-muted-foreground text-balance">
          방에 설치된 스마트 기기를 확인하고 제어하세요.
        </p>
      </header>

      <DeviceGrid />
    </div>
  );
}
