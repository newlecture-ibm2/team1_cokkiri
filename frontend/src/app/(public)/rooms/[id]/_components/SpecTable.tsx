import type { RoomDTO } from '../../_types';

interface SpecGridProps {
  room: RoomDTO;
}

export function SpecGrid({ room }: SpecGridProps) {
  const specs = [
    { label: '호실명', value: room.name, wide: true },
    { label: '방 유형', value: room.roomTypeName || '-' },
    { label: '층', value: room.floor ? `${room.floor}층` : '-' },
    { label: '면적', value: room.area ? `${room.area}㎡` : '-' },
    { label: '방 수 / 욕실 수', value: `${room.roomCount || '-'}개 / ${room.bathroomCount || '-'}개` },
    { label: '방향', value: room.direction || '-' },
    { label: '주차 가능 여부', value: room.parkingAvailable === true ? '가능' : room.parkingAvailable === false ? '불가능' : '-' },
    {
      label: '계약 상태',
      value: room.status === 'AVAILABLE'
        ? '가능'
        : room.status === 'OCCUPIED' && room.contractEndDate
          ? `사전 예약 가능 (종료: ${room.contractEndDate})`
          : room.status === 'OCCUPIED'
            ? '불가'
            : '점검 중',
    },
  ];

  return (
    <div className="space-y-12">
      <h3 className="text-sm md:text-base font-black tracking-[0.3em] uppercase opacity-30">
        Space Information
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
            <span className="text-sm md:text-base font-bold text-foreground block leading-tight">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 이전 named export 호환
export { SpecGrid as SpecTable };
