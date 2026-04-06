'use client';

import { motion } from 'framer-motion';
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
  } = useRooms();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 lg:p-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-[10vw] md:text-[6vw] lg:text-[4vw] font-black tracking-tighter leading-[0.85] uppercase">
          ROOMS
        </h1>
        {!loading && (
          <p className="mt-3 text-sm font-bold opacity-50">
            {totalElements}개의 방이 있습니다
          </p>
        )}
      </motion.div>

      {/* Filter Chips (동적) */}
      <FilterChips
        roomTypes={roomTypes}
        selectedTypeId={selectedTypeId}
        onSelectType={setSelectedTypeId}
      />

      {/* Loading Skeleton */}
      {loading && <RoomGridSkeleton count={8} />}

      {/* Room Cards Grid */}
      {!loading && rooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room, idx) => (
            <RoomCard key={room.spaceId} room={room} index={idx} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && rooms.length === 0 && <EmptyState />}

      {/* Pagination */}
      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
