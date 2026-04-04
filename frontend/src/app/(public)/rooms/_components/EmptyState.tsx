'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="w-20 h-20 rounded-full bg-[var(--color-muted)] flex items-center justify-center mb-6">
        <Search size={32} className="opacity-30" />
      </div>
      <p className="text-lg font-bold opacity-40 tracking-tight mb-2">
        조건에 맞는 방이 없습니다
      </p>
      <p className="text-sm opacity-30">
        다른 필터 조건으로 검색해 보세요
      </p>
    </motion.div>
  );
}
