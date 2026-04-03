'use client';

import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Link from 'next/link';
import type { RoomDTO } from '../_types';

interface RoomCardProps {
  room: RoomDTO;
  index: number;
}

const formatKRW = (value?: number) => {
  if (!value) return '-';
  return `${(value / 10000).toLocaleString()}만원`;
};

export function RoomCard({ room, index }: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.4 }}
    >
      <Link href={`/rooms/${room.spaceId}`} className="group block">
        {/* Thumbnail */}
        <div className="h-48 rounded-[2rem] bg-[var(--color-muted)] overflow-hidden mb-4 relative">
          {room.thumbnailUrl ? (
            <img
              src={room.thumbnailUrl}
              alt={room.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home size={32} className="opacity-20" />
            </div>
          )}
          {/* Status Badge */}
          <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--foreground)]/80 backdrop-blur-sm text-[var(--background)] text-[10px] font-bold rounded-full uppercase tracking-wider">
            {room.status === 'AVAILABLE' ? '공실' : room.status === 'OCCUPIED' ? '사용중' : '점검중'}
          </span>
        </div>

        {/* Info */}
        <div className="px-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-black tracking-tighter group-hover:text-[var(--color-secondary)] transition-colors">
              {room.name}
            </h3>
            {room.roomType && (
              <span className="px-2.5 py-0.5 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-[10px] font-bold rounded-full">
                {room.roomType}
              </span>
            )}
          </div>
          <p className="text-sm font-bold opacity-60 mb-1">
            {room.floor ? `${room.floor}층` : ''}
            {room.area ? ` · ${room.area}㎡` : ''}
            {room.direction ? ` · ${room.direction}` : ''}
          </p>
          {room.monthlyRent !== undefined && (
            <p className="text-lg font-black tracking-tighter">
              월 {formatKRW(room.monthlyRent)}
              {room.deposit ? (
                <span className="text-xs font-bold opacity-50 ml-2">
                  보증금 {formatKRW(room.deposit)}
                </span>
              ) : null}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
