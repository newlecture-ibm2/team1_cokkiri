'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { fetchCommonSpace, CommonSpaceDto } from '../_api';
import { FacilityHero } from './_components/FacilityHero';
import { FacilitySpec } from './_components/FacilitySpec';
import { FacilityGallery } from './_components/FacilityGallery';
import { AmenityBadges } from '../../rooms/[id]/_components/AmenityBadges';

const formatKRW = (value?: number) => {
  if (value === undefined || value === null || value === 0) return '무료';
  if (value >= 10000) {
    const man = Math.floor(value / 10000);
    const remainder = value % 10000;
    return remainder > 0
      ? `₩${man.toLocaleString()}만 ${remainder.toLocaleString()}원`
      : `₩${man.toLocaleString()}만원`;
  }
  return `₩${value.toLocaleString()}`;
};

export default function ExperienceDetailPage() {
  const params = useParams<{ id: string }>();
  const [space, setSpace] = useState<CommonSpaceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCommonSpace(Number(params.id));
        setSpace(res);
      } catch (e) {
        console.error(e);
        setError('시설 정보를 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) return <DetailSkeleton />;

  if (error || !space) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <p className="text-lg font-bold opacity-50 mb-6">{error || '시설을 찾을 수 없습니다'}</p>
        <Link href="/experience" className="text-sm font-bold text-[var(--color-accent)] underline underline-offset-4">
          ← 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Hero Image */}
      <FacilityHero
        images={space.images}
        spaceName={space.name}
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
                  className={`inline-block px-6 py-2.5 text-xs md:text-sm font-black tracking-[0.2em] uppercase rounded-full border ${space.isReservable
                      ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20'
                      : 'bg-black/5 text-foreground border-foreground/10'
                    }`}
                >
                  {space.isReservable ? '예약제 공간' : '자유 이용 공간'}
                </span>
                {space.status === 'MAINTENANCE' && (
                  <span className="ml-3 inline-block px-6 py-2.5 text-xs md:text-sm font-black tracking-[0.2em] uppercase rounded-full border bg-destructive/10 text-destructive border-destructive/20">
                    점검 중
                  </span>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-foreground mb-6 md:mb-10 leading-[1.1] break-keep">
                  공유와 소통, 진정한 코리빙의 경험.
                </h2>
                {space.description && (
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-medium text-foreground/70 text-balance italic">
                    &ldquo;{space.description}&rdquo;
                  </p>
                )}
              </motion.div>
            </div>

            {/* Separator */}
            <div className="h-px bg-foreground/10" />

            {/* Room Details Grid */}
            <FacilitySpec space={space} />

            {/* Separator */}
            <div className="h-px bg-foreground/10" />

            {/* Pricing + Amenities — 2-column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
              {/* Pricing Details */}
              <div className="space-y-12">
                <h3 className="text-sm md:text-base font-black tracking-[0.3em] uppercase opacity-30">
                  Usage Fee
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-baseline group">
                    <span className="text-base md:text-lg lg:text-xl font-bold tracking-tight text-foreground/50">
                      시간당 이용료
                    </span>
                    <div className="flex-1 mx-4 border-b border-dotted border-foreground/20" />
                    <span className="text-lg md:text-xl lg:text-3xl font-black text-foreground">
                      {formatKRW(space.usageFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <AmenityBadges amenities={space.amenities} />
            </div>

            {/* Separator */}
            <div className="h-px bg-foreground/10" />

            {/* Image Gallery (내 도메인 전용 카드) */}
            {space.images && space.images.length > 0 && (
              <FacilityGallery images={space.images} />
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
                    Experience Together
                  </h3>
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                    {space.isReservable ? '입주하고 편리하게 예약하세요.' : '입주자라면 누구나, 언제든지.'}
                  </p>
                </div>
              </div>

              {space.isReservable ? (
                <Link
                  href={`/facilities?spaceId=${space.spaceId}`}
                  className="group inline-flex items-center justify-center h-16 md:h-22 px-12 rounded-full bg-background text-primary hover:bg-secondary hover:text-white transition-all duration-500 font-black tracking-widest text-sm md:text-base shrink-0"
                >
                  Reserve Facility
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <div className="inline-flex items-center justify-center h-16 md:h-22 px-12 rounded-full bg-white/10 text-white/90 border border-white/20 font-black tracking-widest text-sm md:text-base shrink-0">
                  자유 이용 시설
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
          <div className="h-8 w-32 bg-foreground/5 rounded-full" />
          <div className="h-16 w-3/4 bg-foreground/5 rounded-2xl" />
          <div className="h-6 w-full bg-foreground/5 rounded-xl" />
          <div className="h-px bg-foreground/10" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
