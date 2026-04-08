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
  return (
    <div className="space-y-12">
      <h3 className="text-sm md:text-base font-black tracking-[0.3em] uppercase opacity-30">
        Amenities &amp; Atmosphere
      </h3>
      {(!amenities || amenities.length === 0) ? (
        <p className="text-sm font-bold opacity-40 tracking-tight">
          등록된 편의시설이 없습니다
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-foreground/10 bg-background/50 text-foreground font-bold text-xs tracking-tight"
            >
              {AMENITY_ICONS[amenity] || <Package size={14} />}
              {amenity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
