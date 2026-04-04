"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Globe, LifeBuoy, Zap } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { listings } from "@/data/landingListings";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { LandingFeaturedListing } from "@/components/shared/LandingFeaturedListing";

export default function Home() {
  const featuredListings = listings.slice(0, 3);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
    >
      <Header />

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
                      className="mb-2 text-sm font-black tracking-[0.3em] uppercase text-primary transition-colors duration-300 group-hover:text-secondary-foreground"
                      transition={{ duration: 0.4 }}
                    >
                      EXPLORE
                    </motion.span>
                    <motion.div
                      variants={{
                        hover: { y: -2 },
                      }}
                      transition={{ duration: 0.4 }}
                      className="text-primary transition-colors duration-300 group-hover:text-secondary-foreground"
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

      <section className="px-6 py-20 md:px-12 md:py-32 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            className="mb-24 flex flex-col items-baseline justify-between border-b border-primary/10 pb-8 md:flex-row"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black tracking-tighter md:text-7xl">CURATED SPACES</h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-24">
            <div className="md:col-span-8">
              <LandingFeaturedListing listing={featuredListings[0]} size="large" />
            </div>
            <div className="md:col-span-4 md:mt-48">
              <LandingFeaturedListing listing={featuredListings[1]} size="small" />
            </div>
            <div className="md:col-span-6 md:col-start-4">
              <LandingFeaturedListing listing={featuredListings[2]} size="medium" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-editorial py-24 text-secondary-foreground md:py-48">
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

              <div className="max-w-xl space-y-12 border-t border-secondary-foreground/10 pt-12 md:pt-20">
                <div className="group flex gap-8">
                  <Globe className="h-8 w-8 shrink-0 text-secondary-foreground/20 transition-colors group-hover:text-accent" />
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
                  <LifeBuoy className="h-8 w-8 shrink-0 text-secondary-foreground/20 transition-colors group-hover:text-accent" />
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
                  <Zap className="h-8 w-8 shrink-0 text-secondary-foreground/20 transition-colors group-hover:text-accent" />
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
                  alt="Philosophy"
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
