'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { fetchRoom } from '../_api/roomApi';
import type { RoomDTO } from '../_types';
import { HeroImage } from './_components/ImageCarousel';
import { SpecGrid } from './_components/SpecTable';
import { AmenityBadges } from './_components/AmenityBadges';
import { RoomGallery } from './_components/RoomGallery';

const STATUS_MAP: Record<string, { text: string; className: string }> = {
  AVAILABLE: {
    text: '계약 가능',
    className: 'bg-secondary/10 text-secondary border-secondary/20',
  },
  OCCUPIED: {
    text: '입주 중',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  MAINTENANCE: {
    text: '점검 중',
    className: 'bg-accent/20 text-accent border-accent/30',
  },
};

const formatKRW = (value?: number) => {
  if (value === undefined || value === null) return '-';
  if (value >= 10000) {
    const man = Math.floor(value / 10000);
    const remainder = value % 10000;
    return remainder > 0
      ? `₩${man.toLocaleString()}만 ${remainder.toLocaleString()}원`
      : `₩${man.toLocaleString()}만원`;
  }
  return `₩${value.toLocaleString()}`;
};

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchRoom(Number(params.id));
        setRoom(res.data);
      } catch (e) {
        console.error(e);
        setError('방 정보를 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) return <DetailSkeleton />;

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <p className="text-lg font-bold opacity-50 mb-6">{error || '방을 찾을 수 없습니다'}</p>
        <Link href="/rooms" className="text-sm font-bold text-secondary underline underline-offset-4">
          ← 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[room.status] || STATUS_MAP.AVAILABLE;
  const isPrivate = room.roomTypeId !== undefined && room.roomTypeId !== null;
  const totalMonthly = (room.monthlyRent || 0) + (room.maintenanceFee || 0);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Hero Image — Full viewport */}
      <HeroImage
        images={room.images}
        roomName={room.name}
        selectedImage={selectedImage}
        onSelectImage={setSelectedImage}
      />

      {/* Content Section */}
      <section className="px-6 py-16 md:px-12 lg:px-24 md:py-32">
        <div className="mx-auto max-w-[1200px] space-y-32">
          <div className="space-y-20">
            {/* Status Badge + Intro */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span
                  className={`inline-block px-6 py-2.5 text-xs md:text-sm font-black tracking-[0.2em] uppercase rounded-full border ${statusInfo.className}`}
                >
                  {statusInfo.text}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-foreground mb-6 md:mb-10 leading-[1.1] break-keep">
                  도시의 중심에서 누리는 진정한 휴식의 공간.
                </h2>
                {room.description && (
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-medium text-foreground/70 text-balance italic">
                    &ldquo;{room.description}&rdquo;
                  </p>
                )}
              </motion.div>
            </div>

            {/* Separator */}
            <div className="h-px bg-foreground/10" />

            {/* Room Details Grid */}
            <SpecGrid room={room} />

            {/* Separator */}
            <div className="h-px bg-foreground/10" />

            {/* Pricing + Amenities — 2-column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
              {/* Pricing Details */}
              <div className="space-y-12">
                <h3 className="text-sm md:text-base font-black tracking-[0.3em] uppercase opacity-30">
                  Pricing Details
                </h3>
                <div className="space-y-6">
                  {[
                    { label: '보증금', value: formatKRW(room.deposit) },
                    { label: '월 임대료', value: formatKRW(room.monthlyRent) },
                    { label: '관리비', value: room.maintenanceFee ? `${formatKRW(room.maintenanceFee)} / 월` : '-' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-baseline group">
                      <span className="text-base md:text-lg lg:text-xl font-bold tracking-tight text-foreground/50">
                        {item.label}
                      </span>
                      <div className="flex-1 mx-4 border-b border-dotted border-foreground/20" />
                      <span className="text-lg md:text-xl lg:text-3xl font-black text-foreground">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <AmenityBadges amenities={room.amenities} />
            </div>

            {/* Separator */}
            <div className="h-px bg-foreground/10" />

            {/* Image Gallery (내 도메인 전용 카드) */}
            {room.images && room.images.length > 0 && (
              <RoomGallery images={room.images} roomName={room.name} />
            )}
          </div>

          {/* Reserve CTA — Editorial dark card */}
          <motion.div
            className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-primary p-6 md:p-16 text-primary-foreground"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm md:text-base font-black tracking-[0.4em] uppercase opacity-50 mb-4">
                    Make it Yours
                  </h3>
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                    이 특별한 공간의<br />새로운 주인공이 되세요.
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-12 gap-y-6 pt-4">
                  <div className="space-y-1">
                    <span className="text-xs md:text-sm font-bold tracking-widest uppercase opacity-40 block">
                      Total Monthly
                    </span>
                    <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">
                      ₩{totalMonthly.toLocaleString()}
                    </p>
                  </div>
                  {room.deposit && (
                    <div className="space-y-1">
                      <span className="text-xs md:text-sm font-bold tracking-widest uppercase opacity-40 block">
                        Deposit
                      </span>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold opacity-70">
                        ₩{room.deposit.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {room.status === 'AVAILABLE' && isPrivate ? (
                <Link
                  href={`/contract-apply?spaceId=${room.spaceId}`}
                  className="group inline-flex items-center justify-center h-16 md:h-22 px-12 rounded-full bg-background text-primary hover:bg-secondary hover:text-white transition-all duration-500 font-black tracking-widest text-sm md:text-base"
                >
                  Apply Now
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : room.status === 'AVAILABLE' && !isPrivate ? (
                <Link
                  href={`/facilities?spaceId=${room.spaceId}`}
                  className="group inline-flex items-center justify-center h-16 md:h-22 px-12 rounded-full bg-background text-primary hover:bg-secondary hover:text-white transition-all duration-500 font-black tracking-widest text-sm md:text-base"
                >
                  Reserve
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <div className="inline-flex items-center justify-center h-16 md:h-22 px-12 rounded-full bg-white/10 text-white/40 font-black tracking-widest text-sm md:text-base cursor-not-allowed">
                  {room.status === 'OCCUPIED' ? 'Fully Booked' : 'Under Maintenance'}
                </div>
              )}
            </div>

            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/** 인라인 Skeleton — 클라이언트 내부 로딩 시 사용 */
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Skeleton */}
      <div className="relative h-[80vh] w-full bg-foreground/5 animate-pulse" />

      {/* Content Skeleton */}
      <div className="px-6 py-16 md:px-12 lg:px-24 md:py-32">
        <div className="mx-auto max-w-[1200px] animate-pulse space-y-20">
          <div className="h-8 w-24 bg-foreground/5 rounded-full" />
          <div className="h-16 w-3/4 bg-foreground/5 rounded-2xl" />
          <div className="h-6 w-full bg-foreground/5 rounded-xl" />
          <div className="h-px bg-foreground/10" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-20 bg-foreground/[0.02] border border-foreground/5 rounded-2xl" />
            ))}
          </div>
          <div className="h-px bg-foreground/10" />
          <div className="h-48 bg-foreground/5 rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}
