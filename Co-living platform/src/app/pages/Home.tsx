import { Link } from "react-router";
import { ArrowRight, Globe, LifeBuoy, Zap } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { listings } from "../data/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useRef } from "react";

export function Home() {
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
      className="bg-background text-foreground relative min-h-screen selection:bg-[#2C3424] selection:text-[#DADED8]"
    >
      <Header />

      {/* Hero Section */}
      <section className="relative flex h-screen flex-col justify-center overflow-hidden px-6 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-[1400px] pt-20">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mb-12 text-[12vw] leading-[0.85] font-black tracking-tighter md:text-[10vw]">
              CO-LIVING
              <br />
              <motion.span
                className="inline-block translate-x-[5vw] font-light italic decoration-[#768064] underline-offset-[2vw] md:translate-x-[10vw]"
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
                    key={index}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 },
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
                <motion.span
                  className="ml-2 inline-block h-[10.5vw] w-[1vw] bg-[#768064]/40 align-middle"
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

          <div className="flex flex-col items-end justify-between gap-12 md:flex-row">
            <motion.p
              className="max-w-2xl text-2xl leading-tight font-medium opacity-80 md:text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              More than just a place to stay.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link to="/listings" className="group relative inline-block">
                <motion.div
                  className="border-primary/20 relative flex h-32 w-32 flex-col items-center justify-center overflow-hidden border p-0 md:h-44 md:w-44"
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
                  {/* Filler Background */}
                  <motion.div
                    className="bg-primary absolute inset-0 origin-bottom"
                    initial={{ scaleY: 0 }}
                    variants={{
                      hover: { scaleY: 1 },
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />

                  {/* Button Content */}
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

        {/* Floating Abstract Element */}
        <motion.div
          className="absolute top-1/4 -right-20 -z-10 h-[40vw] w-[40vw] rounded-full bg-[#f5f5f5]"
          style={{ y: useTransform(smoothProgress, [0, 1], [0, -200]) }}
        />
      </section>

      {/* Featured Grid Section - Asymmetric */}
      <section className="px-6 py-32 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            className="mb-24 flex flex-col items-baseline justify-between border-b border-[#2C3424]/10 pb-8 md:flex-row"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black tracking-tighter md:text-7xl">CURATED SPACES</h2>
            <p className="text-lg font-black tracking-widest uppercase opacity-40"></p>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-24">
            {/* First Item - Large */}
            <div className="md:col-span-8">
              <ListingItem listing={featuredListings[0]} size="large" />
            </div>

            {/* Second Item - Small Offset */}
            <div className="md:col-span-4 md:mt-48">
              <ListingItem listing={featuredListings[1]} size="small" />
            </div>

            {/* Third Item - Centered Medium */}
            <div className="md:col-span-6 md:col-start-4">
              <ListingItem listing={featuredListings[2]} size="medium" />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative overflow-hidden bg-[#030213] py-48 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 items-center gap-24 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-16 text-7xl leading-none font-black tracking-tighter underline-offset-[2vw] md:text-9xl">
                SMART
                <br />
                <span className="text-accent underline">LIVING.</span>
              </h2>
              <div className="max-w-xl space-y-12 border-t border-white/10 pt-16">
                <div className="flex gap-8">
                  <Globe className="h-8 w-8 shrink-0 opacity-40" />
                  <div>
                    <h4 className="text-accent mb-2 text-lg font-black tracking-widest uppercase">
                      지능형 보안 시스템
                    </h4>
                    <p className="text-base leading-relaxed text-balance opacity-60">
                      IoT 기술을 활용하여 24시간 언제 어디서나 당신의 안전을 지킵니다.
                    </p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <LifeBuoy className="h-8 w-8 shrink-0 opacity-40" />
                  <div>
                    <h4 className="text-accent mb-2 text-lg font-black tracking-widest uppercase">
                      편리한 관리 서비스
                    </h4>
                    <p className="text-base leading-relaxed text-balance opacity-60">
                      청소부터 공과금 납부까지, 생활에 필요한 모든 것을 앱 하나로 관리하세요.
                    </p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <Zap className="h-8 w-8 shrink-0 opacity-40" />
                  <div>
                    <h4 className="text-accent mb-2 text-lg font-black tracking-widest uppercase">
                      지속 가능한 공유 가치
                    </h4>
                    <p className="text-base leading-relaxed text-balance opacity-60">
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

        {/* Marquee Style Text Background */}
        <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-[30vw] font-bold whitespace-nowrap italic opacity-[0.02] select-none">
          TOGETHERNESS. TOGETHERNESS.
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ListingItem({ listing, size }: { listing: any; size: "large" | "medium" | "small" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, size === "small" ? -100 : size === "large" ? 100 : -50],
  );

  return (
    <motion.div ref={ref} style={{ y }} className="group">
      <Link to={`/listings/${listing.id}`}>
        <div className="relative mb-8 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageWithFallback
              src={listing.images[0]}
              alt={listing.title}
              className={`w-full object-cover transition-all duration-700 ${
                size === "large"
                  ? "aspect-[16/10]"
                  : size === "medium"
                    ? "aspect-[4/5]"
                    : "aspect-square"
              }`}
            />
          </motion.div>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h3
              className={`font-black tracking-tighter ${size === "large" ? "text-4xl" : "text-2xl"}`}
            >
              {listing.title}
            </h3>
            <span className="text-sm font-black opacity-10">/ {listing.id.padStart(2, "0")}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-black tracking-widest text-[#768064] uppercase">
              <span>
                {listing.roomType === "Private Suite"
                  ? "개인 전용 공간"
                  : listing.roomType === "Entire Space"
                    ? "전체 독립형"
                    : "공유 아틀리에"}
              </span>
              <span className="opacity-40">보증금 상담 가능</span>
            </div>
            <div className="text-foreground/40 flex items-center justify-between text-xs font-black tracking-widest uppercase">
              <span>IoT 스마트 보안 포함</span>
              <span className="text-foreground opacity-100">
                월 {listing.price.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
