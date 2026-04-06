import type { RoomDTO } from '../../_types';

interface SpecTableProps {
  room: RoomDTO;
}

const formatKRW = (value?: number) => {
  if (value === undefined || value === null) return '-';
  if (value >= 10000) {
    const man = Math.floor(value / 10000);
    const remainder = value % 10000;
    return remainder > 0
      ? `${man.toLocaleString()}만 ${remainder.toLocaleString()}원`
      : `${man.toLocaleString()}만원`;
  }
  return `${value.toLocaleString()}원`;
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: '싱글룸',
  DOUBLE: '더블룸',
  STUDIO: '스튜디오',
  SUITE: '스위트',
};

export function SpecTable({ room }: SpecTableProps) {
  const specs = [
    { label: '방 타입', value: room.roomType ? ROOM_TYPE_LABELS[room.roomType] || room.roomType : '-' },
    { label: '면적', value: room.area ? `${room.area}㎡` : '-' },
    { label: '층', value: room.floor ? `${room.floor}층` : '-' },
    { label: '방향', value: room.direction || '-' },
    { label: '방 수', value: room.roomCount ? `${room.roomCount}개` : '-' },
    { label: '욕실 수', value: room.bathroomCount ? `${room.bathroomCount}개` : '-' },
    { label: '보증금', value: formatKRW(room.deposit) },
    { label: '월세', value: formatKRW(room.monthlyRent) },
    { label: '관리비', value: formatKRW(room.maintenanceFee) },
    { label: '주차', value: room.parkingAvailable === true ? '가능' : room.parkingAvailable === false ? '불가' : '-' },
  ];

  return (
    <div className="rounded-[2rem] bg-muted/30 border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-black tracking-tighter text-lg uppercase">상세 정보</h2>
      </div>
      <div className="divide-y divide-border">
        {specs.map((spec) => (
          <div key={spec.label} className="flex items-center justify-between px-6 py-3.5">
            <span className="text-sm font-bold opacity-50 tracking-tight">{spec.label}</span>
            <span className="text-sm font-black tracking-tight">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
