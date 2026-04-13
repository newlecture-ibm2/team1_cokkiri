'use client';

import { motion } from 'framer-motion';

interface FloorSelectorProps {
  floors: number[];
  selectedFloor: number | null;
  onSelectFloor: (floor: number) => void;
}

export function FloorSelector({ floors, selectedFloor, onSelectFloor }: FloorSelectorProps) {
  if (floors.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mr-2">
        FLOOR
      </span>
      {floors.map((floor) => (
        <motion.button
          key={floor}
          onClick={() => onSelectFloor(floor)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-4 py-2 rounded-full text-sm font-bold tracking-tight transition-all duration-200
            ${selectedFloor === floor
              ? 'bg-[var(--foreground)] text-[var(--background)] shadow-lg'
              : 'bg-black/5 hover:bg-black/10'
            }
          `}
        >
          {floor}층
        </motion.button>
      ))}
    </div>
  );
}
