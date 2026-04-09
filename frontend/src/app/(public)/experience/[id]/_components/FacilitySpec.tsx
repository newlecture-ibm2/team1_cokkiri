import type { CommonSpaceDto } from '../../_api';

interface FacilitySpecProps {
  space: CommonSpaceDto;
}

export function FacilitySpec({ space }: FacilitySpecProps) {
  const specs = [
    { label: '시설명', value: space.name, wide: true },
    { label: '층수', value: space.floor ? (space.floor > 0 ? `${space.floor}층` : `지하 ${Math.abs(space.floor)}층`) : '-' },
    { label: '면적', value: space.area ? `${space.area}㎡` : '-' },
    { label: '수용 인원', value: space.maxCapacity ? `최대 ${space.maxCapacity}명` : '제한 없음' },
    { label: '운영 시간', value: space.operatingHours || '24시간' },
    {
      label: '이용 방식',
      value: space.isReservable ? '예약제' : '자유 이용',
    },
  ];

  return (
    <div className="space-y-12">
      <h3 className="text-sm md:text-base font-black tracking-[0.3em] uppercase opacity-30">
        Facility Information
      </h3>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {specs.map((item) => (
          <div
            key={item.label}
            className={`p-4 md:p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.05] space-y-1 md:space-y-2 ${
              item.wide ? 'col-span-2 lg:col-span-1' : 'col-span-1'
            }`}
          >
            <span className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase opacity-20 block">
              {item.label}
            </span>
            <span className="text-sm md:text-base font-bold text-foreground block leading-tight break-keep">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
