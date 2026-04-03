'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchRooms, RoomDTO } from './_api/roomApi';
import { motion } from 'framer-motion';
import { Search, Home } from 'lucide-react';

const ROOM_TYPES = ['ALL', 'SINGLE', 'DOUBLE', 'STUDIO', 'SUITE'] as const;

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchRooms({
        roomType: selectedType === 'ALL' ? undefined : selectedType,
        page: currentPage,
        size: 12,
      });
      const pageData = res.data;
      setRooms(pageData?.content || []);
      setTotalPages(pageData?.totalPages || 0);
    } catch (e) {
      console.error(e);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, currentPage]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedType]);

  const formatKRW = (value?: number) => {
    if (!value) return '-';
    return `${(value / 10000).toLocaleString()}만원`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 lg:p-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-[10vw] md:text-[6vw] lg:text-[4vw] font-black tracking-tighter leading-[0.85] uppercase">
          ROOMS
        </h1>
      </motion.div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 mb-10">
        {ROOM_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-tight transition
              ${selectedType === type
                ? 'bg-[var(--foreground)] text-[var(--background)] shadow-lg'
                : 'bg-black/5 hover:bg-black/10'
              }`}
          >
            {type === 'ALL' ? '전체' : type}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 rounded-[2rem] bg-black/10 mb-4" />
              <div className="h-5 w-2/3 bg-black/10 rounded-lg mb-2" />
              <div className="h-4 w-1/2 bg-black/10 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Room Cards */}
      {!loading && rooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room, idx) => (
            <motion.a
              key={room.spaceId}
              href={`/rooms/${room.spaceId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx }}
              className="group block"
            >
              {/* Thumbnail */}
              <div className="h-48 rounded-[2rem] bg-black/5 overflow-hidden mb-4">
                {room.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={room.thumbnailUrl}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home size={32} className="opacity-20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-black tracking-tighter">{room.name}</h3>
                  {room.roomType && (
                    <span className="px-2.5 py-0.5 bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full">
                      {room.roomType}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold opacity-60 mb-1">
                  {room.floor ? `${room.floor}층` : ''}{room.area ? ` · ${room.area}㎡` : ''}{room.direction ? ` · ${room.direction}` : ''}
                </p>
                {room.monthlyRent !== undefined && (
                  <p className="text-lg font-black tracking-tighter">
                    월 {formatKRW(room.monthlyRent)}
                    {room.deposit ? <span className="text-xs font-bold opacity-50 ml-2">보증금 {formatKRW(room.deposit)}</span> : ''}
                  </p>
                )}
              </div>
            </motion.a>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && rooms.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <Search size={48} className="opacity-20 mb-4" />
          <p className="text-lg font-bold opacity-40 tracking-tight">조건에 맞는 방이 없습니다</p>
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-10 h-10 rounded-full text-sm font-bold transition
                ${currentPage === i
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'bg-black/5 hover:bg-black/10'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
