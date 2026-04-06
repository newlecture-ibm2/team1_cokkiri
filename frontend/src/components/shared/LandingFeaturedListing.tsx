"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Listing } from "@/data/landingListings";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";

type Size = "large" | "medium" | "small";

export function LandingFeaturedListing({ listing, size }: { listing: Listing; size: Size }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, isMobile ? 0 : size === "small" ? -100 : size === "large" ? 100 : -50],
  );

  return (
    <motion.div ref={ref} style={{ y }} className="group">
      <Link href={`/rooms/${listing.id}`} className="block focus:outline-none">
        {/* Image Display */}
        <div className="relative mb-6 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageWithFallback
              src={listing.images[0]}
              alt={listing.title}
              className={`w-full object-cover transition-all duration-700 ${
                size === "large" ? "aspect-[16/10]" : size === "medium" ? "aspect-[4/5]" : "aspect-square"
              }`}
            />
          </motion.div>
        </div>

        {/* Text Container Below Image */}
        <div className="flex flex-col gap-3 font-sans pb-4">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-primary uppercase transition-colors group-hover:text-accent">
              {listing.title}
            </h3>
            <span className="text-sm md:text-base font-bold tracking-widest text-secondary">
              / {listing.id.padStart(2, "0")}
            </span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] md:text-xs font-bold tracking-[0.15em] text-primary uppercase">
              <span>
                {listing.roomType === "Private Suite"
                  ? "개인 전용 공간"
                  : listing.roomType === "Entire Space"
                    ? "전체 독립형"
                    : "공유 아틀리에"}
              </span>
              <span>보증금 상담 가능</span>
            </div>
            <div className="flex items-end justify-between text-primary uppercase mt-2">
              <span className="text-[11px] md:text-xs font-bold tracking-[0.15em] mb-1">IoT 스마트 보안 포함</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[13px] font-semibold opacity-50 tracking-normal">월</span>
                <span className="text-2xl md:text-3xl font-extrabold tracking-tighter [font-family:var(--font-manrope),_var(--font-pretendard),_sans-serif]">
                  {listing.price.toLocaleString()}
                </span>
                <span className="text-[13px] font-semibold opacity-50 tracking-normal">원</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
