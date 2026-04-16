'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FloorMapViewer } from './_components/FloorMapViewer';

export default function FloorPage() {
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
      <motion.section className="px-6 md:px-12 lg:px-24 pt-24 pb-4 overflow-hidden bg-background">
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
                FLOOR.
              </h1>
              <p className="text-sm leading-tight font-medium opacity-70 md:text-2xl">
                건물 구조를 한눈에 확인하세요
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black tracking-[0.3em] uppercase opacity-30">
                INTERACTIVE MAP
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Floor Map Viewer */}
      <section className="mt-12 md:mt-24 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <FloorMapViewer />
        </div>
      </section>

      {/* Bottom CTA — Editorial Dark */}
      <section className="mt-24 md:mt-48 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px] space-y-6 md:space-y-12 rounded-[2rem] md:rounded-[4rem] bg-editorial p-8 py-12 md:p-24 text-center text-white">
          <motion.h2
            className="text-2xl md:text-8xl font-black tracking-tighter leading-none"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            EXPLORE YOUR{' '}
            <span className="text-secondary underline underline-offset-8 decoration-2">
              SPACE.
            </span>
          </motion.h2>
          <p className="mx-auto max-w-2xl text-sm md:text-2xl font-medium text-white/40">
            관심 있는 공간을 클릭해 상세 정보를 확인하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rooms">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-12 md:h-24 px-8 md:px-16 rounded-xl md:rounded-2xl bg-primary text-primary-foreground hover:bg-secondary hover:text-white transition-all duration-500 text-xs md:text-xl font-black uppercase tracking-[0.2em] border-none w-full md:w-auto cursor-pointer"
              >
                Living
                <ArrowRight className="inline-block ml-3 h-5 w-5" />
              </motion.button>
            </Link>
            <Link href="/experience">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-12 md:h-24 px-8 md:px-16 rounded-xl md:rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all duration-500 text-xs md:text-xl font-black uppercase tracking-[0.2em] border border-white/20 w-full md:w-auto cursor-pointer"
              >
                Experience
                <ArrowRight className="inline-block ml-3 h-5 w-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
