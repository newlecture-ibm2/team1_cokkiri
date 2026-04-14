"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter } from "lucide-react";

const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "최신순" },
  { value: "createdAt,asc", label: "오래된순" },
] as const;

export function VocSearchAndSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const currentSort = searchParams.get("sort") ?? "createdAt,desc";

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("p");
      for (const [key, val] of Object.entries(overrides)) {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      if (!params.has("tab")) params.set("tab", "list");
      return `/vocs?${params.toString()}`;
    },
    [searchParams],
  );

  const handleSearch = () => {
    router.push(buildUrl({ q: searchQuery || null }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(buildUrl({ q: null }));
  };

  const handleSort = (sortValue: string) => {
    setIsSortOpen(false);
    router.push(buildUrl({ sort: sortValue }));
  };

  return (
    <div className="relative flex items-center justify-end gap-6 self-end md:self-auto">
      <AnimatePresence mode="wait">
        {isSearchOpen ? (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2 border-b border-foreground pb-2"
          >
            <input
              autoFocus
              placeholder="민원 검색..."
              className="bg-transparent text-sm md:text-base font-bold uppercase tracking-wider focus:outline-none min-w-[140px] md:min-w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleClearSearch} className="cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-wider hover:opacity-60 transition-opacity cursor-pointer pb-2"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        )}
      </AnimatePresence>

      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-wider hover:opacity-60 transition-opacity cursor-pointer pb-2"
        >
          <Filter className="h-4 w-4" />
          Sort
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
                      currentSort === opt.value
                        ? "bg-primary/10 text-primary"
                        : "text-primary/70 hover:bg-primary/5 hover:text-primary"
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
