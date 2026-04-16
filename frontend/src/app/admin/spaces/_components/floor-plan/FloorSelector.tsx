'use client';

import { motion } from 'framer-motion';

interface FloorSelectorProps {
  floors: number[];
  selectedFloor: number | null;
  onSelectFloor: (floor: number) => void;
}

export function FloorSelector({ floors, selectedFloor, onSelectFloor }: FloorSelectorProps) {
  if (floors.length === 0) {
    return (
      <p className="text-sm font-bold opacity-40 tracking-tight">
        등록된 공간이 없습니다
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 mb-6"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mr-2">
        FLOOR
      </span>
      {floors.map((floor) => (
        <button
          key={floor}
          onClick={() => onSelectFloor(floor)}
          className={`
            px-4 py-2 rounded-full text-sm font-bold tracking-tight transition-all duration-200
            ${selectedFloor === floor
              ? 'bg-primary text-white shadow-lg scale-105'
              : 'bg-primary/[0.05] text-primary/60 hover:bg-primary/[0.08]'
            }
          `}
        >
          {floor}층
        </button>
      ))}
    </motion.div>
  );
}
