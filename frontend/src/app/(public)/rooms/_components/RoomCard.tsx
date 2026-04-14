'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
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
    <Link href={`/rooms/${room.spaceId}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Image — editorial 4:5 portrait */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-surface">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
          >
            {room.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={room.thumbnailUrl}
                alt={room.name}
                className="h-full w-full object-cover transition-all duration-1000"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <span className="text-4xl font-black opacity-10 tracking-tighter uppercase">
                  {room.name}
                </span>
              </div>
            )}
          </motion.div>

          {/* Hover arrow icon */}
          <div className="pointer-events-none absolute top-6 right-6">
            <div className="flex h-10 w-10 translate-y-4 -rotate-45 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xl transition-all duration-500 group-hover:translate-y-0 group-hover:rotate-0 group-hover:opacity-100">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          {/* Hover bottom info */}
          <div className="pointer-events-none absolute right-6 bottom-6 left-6">
            <div className="flex translate-y-4 items-center justify-center rounded-2xl bg-white/90 p-4 opacity-0 shadow-lg backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="text-xs font-black tracking-widest text-foreground uppercase">
                {room.status === 'AVAILABLE'
                  ? '계약 가능'
                  : room.status === 'OCCUPIED'
                    ? '입주 중'
                    : '점검 중'}
              </span>
            </div>
          </div>
        </div>

        {/* Card info — editorial */}
        <div className="mt-8 space-y-3 px-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black tracking-tighter text-foreground transition-colors duration-500 group-hover:text-secondary">
              {room.name}
            </h3>
          </div>
          <div className="flex items-center justify-between border-t border-foreground/10 pt-4">
            <p className="text-sm font-black tracking-[0.3em] text-secondary uppercase">
              {room.roomTypeName || '—'}
            </p>
            {room.monthlyRent != null && (
              <p className="text-lg font-black text-foreground">
                ₩{room.monthlyRent.toLocaleString()}
                <span className="ml-1 text-xs opacity-30">/월</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
