import {
  Wind, Refrigerator, WashingMachine, Wifi, Tv,
  ParkingSquare, Dumbbell, Utensils, Package,
} from 'lucide-react';
import type { JSX } from 'react';

interface AmenityBadgesProps {
  amenities: string[];
}

const AMENITY_ICONS: Record<string, JSX.Element> = {
  '에어컨': <Wind size={14} />,
  '냉장고': <Refrigerator size={14} />,
  '세탁기': <WashingMachine size={14} />,
  '와이파이': <Wifi size={14} />,
  'Wi-Fi': <Wifi size={14} />,
  'TV': <Tv size={14} />,
  '주차': <ParkingSquare size={14} />,
  '헬스장': <Dumbbell size={14} />,
  '주방': <Utensils size={14} />,
};

export function AmenityBadges({ amenities }: AmenityBadgesProps) {
  if (!amenities || amenities.length === 0) {
    return (
      <div>
        <h2 className="font-black tracking-tighter text-lg uppercase mb-4">편의시설</h2>
        <p className="text-sm font-bold opacity-40 tracking-tight">
          등록된 편의시설이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-black tracking-tighter text-lg uppercase mb-4">편의시설</h2>
      <div className="flex flex-wrap gap-2">
        {amenities.map((amenity) => (
          <span
            key={amenity}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/15 text-accent-foreground text-sm font-bold tracking-tight border border-accent/20"
          >
            {AMENITY_ICONS[amenity] || <Package size={14} />}
            {amenity}
          </span>
        ))}
      </div>
    </div>
  );
}
