'use client';

import { motion } from 'framer-motion';

const ROOM_TYPES = ['ALL', 'SINGLE', 'DOUBLE', 'STUDIO', 'SUITE'] as const;

const TYPE_LABELS: Record<string, string> = {
  ALL: '전체',
  SINGLE: '싱글',
  DOUBLE: '더블',
  STUDIO: '스튜디오',
  SUITE: '스위트',
};

interface FilterChipsProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function FilterChips({ selectedType, onSelectType }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-10">
      {ROOM_TYPES.map((type) => (
        <motion.button
          key={type}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectType(type)}
          className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-tight transition-all duration-200
            ${selectedType === type
              ? 'bg-[var(--foreground)] text-[var(--background)] shadow-lg'
              : 'bg-[var(--color-muted)] hover:bg-[var(--color-border)]'
            }`}
        >
          {TYPE_LABELS[type] || type}
        </motion.button>
      ))}
    </div>
  );
}
