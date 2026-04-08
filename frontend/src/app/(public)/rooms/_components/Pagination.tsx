'use client';

import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-12">
      {Array.from({ length: totalPages }).map((_, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 border cursor-pointer ${
            currentPage === i
              ? 'bg-foreground text-background border-foreground shadow-lg'
              : 'bg-transparent text-foreground/50 border-foreground/20 hover:border-foreground/40'
          }`}
        >
          {i + 1}
        </motion.button>
      ))}
    </div>
  );
}
