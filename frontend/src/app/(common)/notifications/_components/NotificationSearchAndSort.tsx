'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'NOTICE', label: '공지사항' },
  { value: 'COMMENT', label: '댓글' },
  { value: 'CONTRACT', label: '계약' },
  { value: 'RESERVATION', label: '예약' },
  { value: 'PAYMENT', label: '결제' },
  { value: 'VOC', label: '민원' },
] as const;

const SORT_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'false', label: '미읽음' },
  { value: 'true', label: '읽음' },
] as const;

export function NotificationSearchAndSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const currentIsRead = searchParams.get('is_read') ?? '';

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('p');
      for (const [key, val] of Object.entries(overrides)) {
        if (val === null || val === '') {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      return `/notifications?${params.toString()}`;
    },
    [searchParams],
  );

  const handleSearch = () => {
    router.push(buildUrl({ q: searchQuery || null }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    router.push(buildUrl({ q: null }));
  };

  const handleSort = (sortValue: string) => {
    setIsSortOpen(false);
    router.push(buildUrl({ is_read: sortValue || null }));
  };

  const currentSortLabel =
    currentIsRead ? (SORT_OPTIONS.find((o) => o.value === currentIsRead)?.label ?? 'Sort') : 'Sort';

  return (
    <div className="relative flex items-center justify-end gap-6 self-end md:self-auto">
      <AnimatePresence mode="wait">
        {isSearchOpen ? (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2 border-b border-foreground pb-2"
          >
            <input
              autoFocus
              placeholder="알림 검색..."
              className="bg-transparent text-[10px] md:text-xs font-bold uppercase tracking-widest focus:outline-none min-w-[140px] md:min-w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleClearSearch} className="cursor-pointer">
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest hover:opacity-60 transition-opacity cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Search
          </button>
        )}
      </AnimatePresence>

      {/* Sort Dropdown (읽음/미읽음) */}
      <div className="relative">
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest hover:opacity-60 transition-opacity cursor-pointer"
        >
          <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
          {currentSortLabel}
        </button>

        <AnimatePresence>
          {isSortOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsSortOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
                className="absolute right-0 top-full z-20 mt-3 flex flex-col gap-1.5 rounded-3xl border-2 border-stone-200/70 bg-stone-50/98 p-3 shadow-md backdrop-blur-md min-w-[140px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSort(opt.value)}
                    className={`rounded-md px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                      currentIsRead === opt.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-primary/70 hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
