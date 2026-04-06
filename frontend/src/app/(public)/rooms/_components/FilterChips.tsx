'use client';

import { motion } from 'framer-motion';
import type { RoomTypeOption } from '../_types';

interface FilterChipsProps {
  roomTypes: RoomTypeOption[];
  selectedTypeId: number | null;
  onSelectType: (typeId: number | null) => void;
}

export function FilterChips({ roomTypes, selectedTypeId, onSelectType }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-10">
      {/* 전체 칩 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectType(null)}
        className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-tight transition-all duration-200
          ${selectedTypeId === null
            ? 'bg-[var(--foreground)] text-[var(--background)] shadow-lg'
            : 'bg-[var(--color-muted)] hover:bg-[var(--color-border)]'
          }`}
      >
        전체
      </motion.button>

      {/* 동적 유형 칩 */}
      {roomTypes.map((rt) => (
        <motion.button
          key={rt.roomTypeId}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectType(rt.roomTypeId)}
          className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-tight transition-all duration-200
            ${selectedTypeId === rt.roomTypeId
              ? 'bg-[var(--foreground)] text-[var(--background)] shadow-lg'
              : 'bg-[var(--color-muted)] hover:bg-[var(--color-border)]'
            }`}
        >
          {rt.name}
        </motion.button>
      ))}
    </div>
  );
}
