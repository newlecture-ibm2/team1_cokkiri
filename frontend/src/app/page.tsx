"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowRight, Globe, LifeBuoy, Zap, Home as HomeIcon, Clock, Users } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { LandingFeaturedListing } from "@/components/shared/LandingFeaturedListing";
import type { LandingRoom } from "@/components/shared/LandingFeaturedListing";

interface CommonSpaceSummary {
  spaceId: number;
  name: string;
  description: string;
  operatingHours: string;
  maxCapacity: number;
  isReservable: boolean;
  thumbnailUrl: string | null;
}

/** Fisher-Yates 셔플 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const containerRef = useRef(null);
  const [featuredRooms, setFeaturedRooms] = useState<LandingRoom[]>([]);
  const [facilities, setFacilities] = useState<CommonSpaceSummary[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const fetchFeaturedRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/rooms?size=20");
      if (!res.ok) throw new Error("rooms fetch failed");
      const json = await res.json();
      const rooms: LandingRoom[] = json.data?.content ?? [];
      setFeaturedRooms(shuffle(rooms).slice(0, 3));
    } catch (e) {
      console.error("[Landing] Failed to fetch rooms:", e);
      setFeaturedRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  const fetchFacilities = useCallback(async () => {
    try {
      const res = await fetch("/api/experience");
      if (!res.ok) throw new Error("experience fetch failed");
      const json = await res.json();
      setFacilities(json.data ?? []);
    } catch (e) {
      console.error("[Landing] Failed to fetch facilities:", e);
      setFacilities([]);
    } finally {
      setFacilitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedRooms();
    fetchFacilities();
  }, [fetchFeaturedRooms, fetchFacilities]);

  const sizeMap: ("large" | "small" | "medium")[] = ["large", "small", "medium"];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
    >
      <Header />

      {/* ═══════════════════════════════════════════
          ① HERO SECTION (유지)
      ═══════════════════════════════════════════ */}
      <section className="relative flex h-screen flex-col justify-center overflow-hidden px-6 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-[1400px] pt-20">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mb-12 text-[14vw] font-black leading-[0.85] tracking-tighter md:text-[12vw] lg:text-[10vw]">
              CO-LIVING
              <br />
              <motion.span
                className="inline-block translate-x-0 font-light italic decoration-secondary underline-offset-[2vw] md:translate-x-[10vw]"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: {
                      delayChildren: 1.2,
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {"REDEFINED.".split("").map((char, index) => (
                  <motion.span
                    key={`${char}-${index}`}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 },
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
                <motion.span
                  className="ml-2 inline-block h-[10.5vw] w-[1vw] align-middle bg-secondary/40"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: [0, 1, 0],
                      transition: {
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    },
                  }}
                />
              </motion.span>
            </h1>
          </motion.div>

          <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
            <motion.p
              className="max-w-2xl text-xl leading-tight font-medium opacity-80 md:text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              More than just a place to stay.
            </motion.p>

            <motion.div
              className="self-end md:self-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link href="/rooms" className="group relative inline-block">
                <motion.div
                  className="relative flex h-32 w-32 flex-col items-center justify-center overflow-hidden border border-primary/20 p-0 md:h-44 md:w-44"
                  animate={{
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover="hover"
                >
                  <motion.div
                    className="absolute inset-0 origin-bottom bg-primary"
                    initial={{ scaleY: 0 }}
                    variants={{
                      hover: { scaleY: 1 },
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />

                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <motion.span
                      className="mb-2 text-sm font-black tracking-[0.3em] uppercase"
                      variants={{
                        hover: { color: "#FFFFFF" },
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      EXPLORE
                    </motion.span>
                    <motion.div
                      variants={{
                        hover: { color: "#FFFFFF", y: -2 },
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      <ArrowRight className="h-6 w-6 opacity-50" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute top-1/4 -right-20 -z-10 h-[40vw] w-[40vw] rounded-full bg-muted"
          style={{ y: useTransform(smoothProgress, [0, 1], [0, -200]) }}
        />
      </section>

      {/* ═══════════════════════════════════════════
          ② OUR SPACES — 실제 AVAILABLE 방 3개 (셔플)
      ═══════════════════════════════════════════ */}
      <section className="px-6 py-20 md:px-12 md:py-32 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            className="mb-24 flex flex-col items-baseline justify-between border-b border-primary/10 pb-8 md:flex-row"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black tracking-tighter md:text-7xl">OUR SPACES</h2>
            <Link
              href="/rooms"
              className="mt-4 text-sm font-bold tracking-[0.15em] uppercase text-accent transition-colors hover:text-primary md:mt-0"
            >
              전체 보기 →
            </Link>
          </motion.div>

          {roomsLoading ? (
            /* 스켈레톤 로딩 */
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-24">
              {[8, 4, 6].map((span, i) => (
                <div key={i} className={`md:col-span-${span} ${i === 1 ? "md:mt-48" : ""} ${i === 2 ? "md:col-start-4" : ""}`}>
                  <div className={`w-full animate-pulse bg-muted/40 rounded-lg ${
                    i === 0 ? "aspect-[16/10]" : i === 2 ? "aspect-[4/5]" : "aspect-square"
                  }`} />
                  <div className="mt-6 space-y-3">
                    <div className="h-8 w-3/4 animate-pulse rounded bg-muted/30" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted/20" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredRooms.length === 0 ? (
            /* Empty State */
            <motion.div
              className="flex flex-col items-center justify-center py-32 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <HomeIcon className="mb-6 h-16 w-16 opacity-20" />
              <h3 className="mb-3 text-2xl font-black tracking-tighter md:text-3xl">
                곧 새로운 공간이 열립니다
              </h3>
              <p className="max-w-md text-sm font-medium opacity-50">
                현재 준비 중인 공간이 있습니다. 조금만 기다려 주세요.
              </p>
            </motion.div>
          ) : (
            /* 실제 방 카드 */
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-24">
              {featuredRooms[0] && (
                <div className="md:col-span-8">
                  <LandingFeaturedListing room={featuredRooms[0]} size={sizeMap[0]} />
                </div>
              )}
              {featuredRooms[1] && (
                <div className="md:col-span-4 md:mt-48">
                  <LandingFeaturedListing room={featuredRooms[1]} size={sizeMap[1]} />
                </div>
              )}
              {featuredRooms[2] && (
                <div className="md:col-span-6 md:col-start-4">
                  <LandingFeaturedListing room={featuredRooms[2]} size={sizeMap[2]} />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ③ FACILITIES — 공용시설 소개
      ═══════════════════════════════════════════ */}
      <section className="bg-muted/20 px-6 py-20 md:px-12 md:py-32 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            className="mb-16 flex flex-col items-baseline justify-between border-b border-primary/10 pb-8 md:flex-row"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black tracking-tighter md:text-7xl">FACILITIES</h2>
            <Link
              href="/experience"
              className="mt-4 text-sm font-bold tracking-[0.15em] uppercase text-accent transition-colors hover:text-primary md:mt-0"
            >
              자세히 보기 →
            </Link>
          </motion.div>

          {facilitiesLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-[2rem] bg-muted/30 aspect-[4/3]" />
              ))}
            </div>
          ) : facilities.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm font-medium opacity-50">공용시설 정보가 준비 중입니다.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {facilities.map((space, i) => (
                <motion.div
                  key={space.spaceId}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/experience/${space.spaceId}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] mb-5">
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}>
                        <ImageWithFallback
                          src={space.thumbnailUrl || `https://picsum.photos/seed/fac${space.spaceId}/600/450`}
                          alt={space.name}
                          className="h-full w-full object-cover transition-all duration-700"
                        />
                      </motion.div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${
                          space.isReservable
                            ? "bg-accent/90 text-white"
                            : "bg-white/90 text-foreground"
                        }`}>
                          {space.isReservable ? "예약제" : "자유 이용"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 px-1">
                      <h3 className="text-lg font-black tracking-tighter transition-colors group-hover:text-accent">
                        {space.name}
                      </h3>
                      {space.description && (
                        <p className="text-xs font-medium leading-relaxed opacity-50 line-clamp-2">
                          {space.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 pt-1">
                        {space.operatingHours && (
                          <span className="flex items-center gap-1 text-[10px] font-bold opacity-40">
                            <Clock size={11} /> {space.operatingHours}
                          </span>
                        )}
                        {space.maxCapacity > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold opacity-40">
                            <Users size={11} /> 최대 {space.maxCapacity}인
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ④ SMART LIVING — IoT 특장점 (유지)
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#030213] py-24 text-white md:py-48">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 items-center gap-24 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-12 md:mb-20">
                <h2 className="text-6xl font-black leading-[0.9] tracking-tighter md:text-8xl lg:text-9xl">
                  SMART
                  <br />
                  <span className="text-accent underline decoration-2 underline-offset-[1vw]">LIVING.</span>
                </h2>
              </div>

              <div className="max-w-xl space-y-12 border-t border-white/10 pt-12 md:pt-20">
                <div className="group flex gap-8">
                  <Globe className="h-8 w-8 shrink-0 text-white/20 transition-colors group-hover:text-accent" />
                  <div className="space-y-3">
                    <h4 className="text-xl font-black tracking-tight text-accent uppercase md:text-2xl">
                      지능형 보안 시스템
                    </h4>
                    <p className="text-sm font-medium leading-relaxed opacity-60 md:text-base">
                      IoT 기술을 활용하여 24시간 언제 어디서나 당신의 안전을 지킵니다.
                    </p>
                  </div>
                </div>

                <div className="group flex gap-8">
                  <LifeBuoy className="h-8 w-8 shrink-0 text-white/20 transition-colors group-hover:text-accent" />
                  <div className="space-y-3">
                    <h4 className="text-xl font-black tracking-tight text-accent uppercase md:text-2xl">
                      편리한 관리 서비스
                    </h4>
                    <p className="text-sm font-medium leading-relaxed opacity-60 md:text-base">
                      청소부터 공과금 납부까지, 생활에 필요한 모든 것을 앱 하나로 관리하세요.
                    </p>
                  </div>
                </div>

                <div className="group flex gap-8">
                  <Zap className="h-8 w-8 shrink-0 text-white/20 transition-colors group-hover:text-accent" />
                  <div className="space-y-3">
                    <h4 className="text-xl font-black tracking-tight text-accent uppercase md:text-2xl">
                      지속 가능한 공유 가치
                    </h4>
                    <p className="text-sm font-medium leading-relaxed opacity-60 md:text-base">
                      불필요한 낭비를 줄이고 자원을 효율적으로 공유하여 더 나은 미래를 만듭니다.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="relative aspect-square">
              <motion.div
                className="absolute inset-0 overflow-hidden rounded-[3rem] bg-white/5"
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758448500688-3ababa93fd67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3dvcmtpbmclMjBzcGFjZSUyMGxvdW5nZXxlbnwxfHx8fDE3NzQ0ODc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Smart Living Philosophy"
                  className="h-full w-full object-cover brightness-75 transition-all duration-1000"
                />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 select-none text-[30vw] font-bold whitespace-nowrap italic opacity-[0.02]">
          TOGETHERNESS. TOGETHERNESS.
        </div>
      </section>

      <Footer />
    </div>
  );
}
