'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  onReset?: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 py-48 text-center"
    >
      <div className="mx-auto w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center mb-6">
        <Search size={32} className="opacity-20" />
      </div>
      <h3 className="text-4xl font-bold tracking-tight opacity-20 uppercase">
        No Spaces Found
      </h3>
      <p className="text-sm font-medium opacity-30">
        다른 필터 조건으로 검색해 보세요
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="text-sm font-black tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          Reset Filter
        </button>
      )}
    </motion.div>
  );
}
