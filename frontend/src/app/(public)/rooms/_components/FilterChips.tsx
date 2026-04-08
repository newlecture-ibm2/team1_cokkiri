'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import type { RoomTypeOption } from '../_types';

interface FilterChipsProps {
  roomTypes: RoomTypeOption[];
  selectedTypeId: number | null;
  onSelectType: (typeId: number | null) => void;
}

export function FilterChips({ roomTypes, selectedTypeId, onSelectType }: FilterChipsProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
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
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
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

        <button className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest hover:opacity-60 transition-opacity cursor-pointer">
          <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Sort
        </button>
      </div>
    </div>
  );
}
