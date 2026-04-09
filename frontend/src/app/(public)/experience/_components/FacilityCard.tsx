'use client';

import { motion } from 'framer-motion';
import { Clock, Users, CalendarCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CommonSpaceDto } from '../_api';

export function FacilityCard({ space, index }: { space: CommonSpaceDto; index: number }) {
  const fallbackImage = `https://picsum.photos/seed/space${space.spaceId}/800/600`;

  return (
    <Link href={`/experience/${space.spaceId}`} className="block">
      <motion.article
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="group relative overflow-hidden rounded-[2rem] bg-[var(--color-muted)]/30 border border-foreground/5 transition-all duration-500 hover:shadow-xl hover:border-foreground/10"
      >
      {/* 이미지 */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={space.thumbnailUrl || fallbackImage}
          alt={space.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* 오버레이 배지 */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${
            space.isReservable
              ? 'bg-[var(--color-accent)]/90 text-white'
              : 'bg-white/90 text-foreground'
          }`}>
            {space.isReservable ? '예약제' : '자유 이용'}
          </span>
        </div>
        {space.floor && (
          <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-foreground/80 text-background backdrop-blur-md">
            {space.floor > 0 ? `${space.floor}F` : `B${Math.abs(space.floor)}`}
          </span>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-black tracking-tighter leading-tight">
            {space.name}
          </h3>
          {space.usageFee > 0 && (
            <span className="shrink-0 text-sm font-black text-[var(--color-accent)]">
              ₩{space.usageFee?.toLocaleString()}<span className="text-[10px] opacity-60">/시간</span>
            </span>
          )}
        </div>

        {space.description && (
          <p className="text-sm font-medium leading-relaxed opacity-60 line-clamp-2">
            {space.description}
          </p>
        )}

        {/* 메타 정보 */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-foreground/5">
          {space.operatingHours && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-tight opacity-50">
              <Clock size={13} />
              <span>{space.operatingHours}</span>
            </div>
          )}
          {space.maxCapacity && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-tight opacity-50">
              <Users size={13} />
              <span>최대 {space.maxCapacity}인</span>
            </div>
          )}
          {space.isReservable ? (
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-tight text-[var(--color-accent)]">
              <CalendarCheck size={13} />
              <span>예약 후 이용</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-tight text-[var(--color-accent)]">
              <Sparkles size={13} />
              <span>자유 이용 가능</span>
            </div>
          )}
        </div>

        {/* 부대시설 태그 */}
        {space.amenities && space.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {space.amenities.map((amenity, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full bg-foreground/5 text-[10px] font-bold tracking-tight"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
    </Link>
  );
}
