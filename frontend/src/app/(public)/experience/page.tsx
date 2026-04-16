'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCommonSpaces } from './_hooks/useCommonSpaces';
import { FacilityCard } from './_components/FacilityCard';

export default function ExperiencePage() {
  const { spaces, loading } = useCommonSpaces();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerScale = useTransform(scrollY, [0, 300], [1, 0.7]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const headerY = useTransform(scrollY, [0, 300], [0, -80]);

  const reservableCount = spaces.filter(s => s.isReservable).length;
  const freeCount = spaces.filter(s => !s.isReservable).length;

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
            className="flex flex-col items-start justify-between gap-12 border-b border-foreground/10 pb-8 md:flex-row md:items-end"
          >
            <div className="max-w-2xl space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] uppercase">
                EXPERI
                <span className="underline underline-offset-[1vw] decoration-[var(--color-accent)]">ENCE.</span>
              </h1>
              <p className="text-sm leading-tight font-medium opacity-70 md:text-2xl">
                함께 누리는 공간, 특별한 일상의 시작
              </p>
            </div>
            <div className="text-right">
              {!loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-black tracking-[0.3em] uppercase opacity-40"
                >
                  {spaces.length} Facilities
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Bar */}
      {!loading && spaces.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="px-6 md:px-12 lg:px-24 py-6 md:py-8 border-b border-foreground/5"
        >
          <div className="mx-auto max-w-[1400px] flex flex-wrap items-center gap-4 md:gap-8">
            <span className="px-5 py-2.5 rounded-full bg-foreground text-background text-[10px] md:text-xs font-black uppercase tracking-widest">
              전체 {spaces.length}개 시설
            </span>
            {reservableCount > 0 && (
              <span className="px-5 py-2.5 rounded-full border border-[var(--color-accent)] text-[var(--color-accent)] text-[10px] md:text-xs font-black uppercase tracking-widest">
                예약제 {reservableCount}
              </span>
            )}
            {freeCount > 0 && (
              <span className="px-5 py-2.5 rounded-full border border-foreground/20 text-foreground/70 text-[10px] md:text-xs font-black uppercase tracking-widest">
                자유이용 {freeCount}
              </span>
            )}
          </div>
        </motion.section>
      )}

      {/* Grid */}
      <section className="mt-12 md:mt-24 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-[2rem] bg-foreground/5 aspect-[4/3]" />
              ))}
            </div>
          ) : spaces.length === 0 ? (
            <div className="space-y-8 py-48 text-center">
              <h3 className="text-4xl font-bold tracking-tight opacity-20">NO FACILITIES FOUND</h3>
              <p className="text-sm opacity-40 font-medium">
                아직 등록된 공용 시설이 없습니다.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {spaces.map((space, index) => (
                  <FacilityCard key={space.spaceId} space={space} index={index} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-24 md:mt-48 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px] space-y-6 md:space-y-12 rounded-[2rem] md:rounded-[4rem] bg-[#030213] p-8 py-8 md:p-24 text-center text-white">
          <h2 className="text-2xl md:text-8xl font-black tracking-tighter leading-none">
            READY TO <span className="text-[var(--color-accent)] underline underline-offset-8">STAY?</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm md:text-2xl font-medium text-white/40">
            예약이 필요한 시설은 입주 후 STAY 메뉴에서 간편하게 예약하세요.
          </p>
          <Link
            href="/facilities"
            className="inline-flex items-center gap-3 h-12 md:h-24 px-8 md:px-16 rounded-xl md:rounded-2xl bg-[#2C3424] text-white hover:bg-[#768064] transition-all duration-500 text-xs md:text-xl font-black uppercase tracking-[0.2em]"
          >
            시설 예약하기
            <ArrowRight className="h-4 w-4 md:h-6 md:w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
