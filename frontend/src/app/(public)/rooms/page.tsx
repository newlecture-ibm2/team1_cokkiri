'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRooms } from './_hooks/useRooms';
import { FilterChips } from './_components/FilterChips';
import { RoomCard } from './_components/RoomCard';
import { RoomGridSkeleton } from './_components/RoomSkeleton';
import { EmptyState } from './_components/EmptyState';
import { Pagination } from './_components/Pagination';

export default function RoomsPage() {
  const {
    rooms,
    loading,
    roomTypes,
    selectedTypeId,
    setSelectedTypeId,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    sortOption,
    setSortOption,
    keyword,
    setKeyword,
  } = useRooms();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerScale = useTransform(scrollY, [0, 300], [1, 0.7]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const headerY = useTransform(scrollY, [0, 300], [0, -80]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-foreground pb-32 selection:bg-primary selection:text-primary-foreground"
    >
      {/* Page Header — Editorial Style */}
      <motion.section
        className="px-6 md:px-12 lg:px-24 pt-24 pb-4 overflow-hidden bg-background"
      >
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            style={{ scale: headerScale, opacity: headerOpacity, y: headerY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-end justify-between gap-12 border-b border-foreground/10 pb-8 md:flex-row"
          >
            <div className="max-w-2xl space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] uppercase">
                SPACES.
              </h1>
              <p className="text-sm leading-tight font-medium opacity-70 md:text-2xl">
                나만의 감각과 스마트한 일상이 공존하는 공간
              </p>
            </div>
            <div className="text-right">
              {!loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-black tracking-[0.3em] uppercase opacity-30"
                >
                  {totalElements} SPACES
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Filter Bar — Editorial */}
      <section className="bg-background px-6 md:px-12 lg:px-24 py-6 md:py-8 border-b border-foreground/5">
        <div className="mx-auto max-w-[1400px]">
          <FilterChips
            roomTypes={roomTypes}
            selectedTypeId={selectedTypeId}
            onSelectType={setSelectedTypeId}
            sortOption={sortOption}
            onSortChange={setSortOption}
            keyword={keyword}
            onSearch={setKeyword}
          />
        </div>
      </section>

      {/* Grid */}
      <section className="mt-12 md:mt-24 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          {/* Loading Skeleton */}
          {loading && <RoomGridSkeleton count={6} />}

          {/* Room Cards Grid — 3-column editorial */}
          {!loading && rooms.length > 0 && (
            <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {rooms.map((room, idx) => (
                  <RoomCard key={room.spaceId} room={room} index={idx} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {!loading && rooms.length === 0 && (
            <EmptyState onReset={() => { setSelectedTypeId(null); setKeyword(''); }} />
          )}
        </div>
      </section>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <section className="mt-16 px-6 md:px-12 lg:px-24">
          <div className="mx-auto max-w-[1400px]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      )}

      {/* Bottom CTA — Editorial Dark */}
      <section className="mt-24 md:mt-48 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px] space-y-6 md:space-y-12 rounded-[2rem] md:rounded-[4rem] bg-editorial p-8 py-12 md:p-24 text-center text-white">
          <motion.h2
            className="text-2xl md:text-8xl font-black tracking-tighter leading-none"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            READY TO{' '}
            <span className="text-secondary underline underline-offset-8 decoration-2">
              EXPERIENCE?
            </span>
          </motion.h2>
          <p className="mx-auto max-w-2xl text-sm md:text-2xl font-medium text-white/40">
            COKKIRI가 제공하는 다양한 공용 시설을 둘러보세요.
          </p>
          <Link href="/experience">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-12 md:h-24 px-8 md:px-16 rounded-xl md:rounded-2xl bg-primary text-primary-foreground hover:bg-secondary hover:text-white transition-all duration-500 text-xs md:text-xl font-black uppercase tracking-[0.2em] border-none w-full md:w-auto cursor-pointer"
            >
              시설 둘러보기
              <ArrowRight className="inline-block ml-3 h-5 w-5" />
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}
