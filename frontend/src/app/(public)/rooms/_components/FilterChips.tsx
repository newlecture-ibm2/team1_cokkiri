'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUpDown, Check } from 'lucide-react';
import type { RoomTypeOption, PriceRangePreset } from '../_types';
import type { SortOption } from '../_hooks/useRooms';

interface FilterChipsProps {
  roomTypes: RoomTypeOption[];
  selectedTypeId: number | null;
  onSelectType: (typeId: number | null) => void;
  priceRanges: PriceRangePreset[];
  selectedPriceRangeId: number | null;
  onSelectPriceRange: (id: number | null) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  keyword: string;
  onSearch: (keyword: string) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name,asc', label: '이름순 (ㄱ→ㅎ)' },
  { value: 'name,desc', label: '이름순 (ㅎ→ㄱ)' },
  { value: 'spaceId,desc', label: '최신 등록순' },
  { value: 'monthlyRent,asc', label: '월세 낮은순' },
  { value: 'monthlyRent,desc', label: '월세 높은순' },
];

export function FilterChips({ 
  roomTypes, selectedTypeId, onSelectType, 
  priceRanges, selectedPriceRangeId, onSelectPriceRange,
  sortOption, onSortChange, keyword, onSearch 
}: FilterChipsProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(!!keyword);
  const [searchQuery, setSearchQuery] = useState(keyword || '');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // 외부 키워드 변경 시 로컬 상태 동기화
  useEffect(() => {
    setSearchQuery(keyword || '');
  }, [keyword]);

  // 바깥 클릭 시 정렬 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
        {/* Filter Chips — editorial uppercase */}
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-3">
        {/* All 칩 */}
        <button
          onClick={() => onSelectType(null)}
          className={`px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 border cursor-pointer ${
            selectedTypeId === null
              ? 'bg-foreground text-background border-foreground'
              : 'bg-transparent text-foreground/70 border-foreground/20 hover:border-foreground/40'
          }`}
        >
          All
        </button>

        {/* Dynamic type chips */}
        {roomTypes.map((rt) => (
          <button
            key={rt.roomTypeId}
            onClick={() => onSelectType(rt.roomTypeId)}
            className={`px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 border cursor-pointer ${
              selectedTypeId === rt.roomTypeId
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-foreground/70 border-foreground/20 hover:border-foreground/40'
            }`}
          >
            {rt.name}
          </button>
        ))}
      </div>

      {/* Search & Sort — editorial */}
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
                placeholder="Search spaces..."
                className="bg-transparent text-[10px] md:text-xs font-bold uppercase tracking-widest focus:outline-none min-w-[140px] md:min-w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch(searchQuery);
                  }
                }}
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                  onSearch('');
                }}
                className="cursor-pointer"
              >
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

        {/* Sort dropdown */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest hover:opacity-60 transition-opacity cursor-pointer"
          >
            <ArrowUpDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Sort
          </button>

          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-3 w-48 bg-[var(--background)] border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSortChange(opt.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold tracking-tight hover:bg-black/5 transition cursor-pointer ${
                      sortOption === opt.value ? 'text-[var(--color-accent)]' : ''
                    }`}
                  >
                    {opt.label}
                    {sortOption === opt.value && <Check size={14} className="text-[var(--color-accent)]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>

      {/* Price Range Chips */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        <button
          onClick={() => onSelectPriceRange(null)}
          className={`px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black tracking-widest transition-all duration-500 border cursor-pointer ${
            selectedPriceRangeId === null
              ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
              : 'bg-transparent text-foreground/70 border-foreground/20 hover:border-foreground/40'
          }`}
        >
          가격 전체
        </button>
        {priceRanges.map((pr) => (
          <button
            key={pr.priceRangePresetId}
            onClick={() => onSelectPriceRange(pr.priceRangePresetId)}
            className={`px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black tracking-widest transition-all duration-500 border cursor-pointer ${
              selectedPriceRangeId === pr.priceRangePresetId
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-transparent text-foreground/70 border-foreground/20 hover:border-foreground/40'
            }`}
          >
            {pr.label}
          </button>
        ))}
      </div>
    </div>
  );
}
