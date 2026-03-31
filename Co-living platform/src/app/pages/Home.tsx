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
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background text-foreground selection:bg-[#2C3424] selection:text-[#DADED8]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full pt-20">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[12vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter mb-12">
              CO-LIVING<br />
              <span className="inline-block translate-x-[5vw] md:translate-x-[10vw] italic font-light decoration-[#768064] underline-offset-[2vw]">REDEFINED.</span>
            </h1>
          </motion.div>

          <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <motion.p
              className="text-2xl md:text-3xl max-w-2xl leading-tight font-medium opacity-80"
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
                  className="h-32 w-32 md:h-44 md:w-44 flex flex-col items-center justify-center p-0 overflow-hidden relative border border-primary/20"
                  animate={{
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover="hover"
                >
                  {/* Filler Background */}
                  <motion.div
                    className="absolute inset-0 bg-primary origin-bottom"
                    initial={{ scaleY: 0 }}
                    variants={{
                      hover: { scaleY: 1 }
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />

                  {/* Button Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <motion.span
                      className="text-sm font-black uppercase tracking-[0.3em] mb-2"
                      variants={{
                        hover: { color: "#FFFFFF" }
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      EXPLORE
                    </motion.span>
                    <motion.div
                      variants={{
                        hover: { color: "#FFFFFF", y: -2 }
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
          className="absolute -right-20 top-1/4 w-[40vw] h-[40vw] bg-[#f5f5f5] rounded-full -z-10"
          style={{ y: useTransform(smoothProgress, [0, 1], [0, -200]) }}
        />
      </section>

      {/* Featured Grid Section - Asymmetric */}
      <section className="py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-baseline mb-24 border-b border-[#2C3424]/10 pb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">CURATED SPACES</h2>
            <p className="text-lg font-black uppercase tracking-widest opacity-40"></p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
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
      <section className="py-48 bg-[#030213] text-white overflow-hidden relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-16 underline-offset-[2vw]">SMART<br /><span className="text-accent underline">LIVING.</span></h2>
              <div className="space-y-12 max-w-xl border-t border-white/10 pt-16">
                <div className="flex gap-8">
                  <Globe className="h-8 w-8 shrink-0 opacity-40" />
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-widest mb-2 text-accent">지능형 보안 시스템</h4>
                    <p className="text-base opacity-60 leading-relaxed text-balance">IoT 기술을 활용하여 24시간 언제 어디서나 당신의 안전을 지킵니다.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <LifeBuoy className="h-8 w-8 shrink-0 opacity-40" />
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-widest mb-2 text-accent">편리한 관리 서비스</h4>
                    <p className="text-base opacity-60 leading-relaxed text-balance">청소부터 공과금 납부까지, 생활에 필요한 모든 것을 앱 하나로 관리하세요.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <Zap className="h-8 w-8 shrink-0 opacity-40" />
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-widest mb-2 text-accent">지속 가능한 공유 가치</h4>
                    <p className="text-base opacity-60 leading-relaxed text-balance">불필요한 낭비를 줄이고 자원을 효율적으로 공유하여 더 나은 미래를 만듭니다.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="relative aspect-square">
              <motion.div
                className="absolute inset-0 bg-white/5 rounded-[3rem] overflow-hidden"
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758448500688-3ababa93fd67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3dvcmtpbmclMjBzcGFjZSUyMGxvdW5nZXxlbnwxfHx8fDE3NzQ0ODc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Philosophy"
                  className="w-full h-full object-cover brightness-75 transition-all duration-1000"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Marquee Style Text Background */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[30vw] font-bold opacity-[0.02] whitespace-nowrap pointer-events-none select-none italic">
          TOGETHERNESS. TOGETHERNESS.
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ListingItem({ listing, size }: { listing: any, size: "large" | "medium" | "small" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, size === "small" ? -100 : size === "large" ? 100 : -50]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="group"
    >
      <Link to={`/listings/${listing.id}`}>
        <div className="overflow-hidden mb-8 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageWithFallback
              src={listing.images[0]}
              alt={listing.title}
              className={`w-full object-cover transition-all duration-700 ${size === "large" ? "aspect-[16/10]" : size === "medium" ? "aspect-[4/5]" : "aspect-square"
                }`}
            />
          </motion.div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <h3 className={`font-black tracking-tighter ${size === "large" ? "text-4xl" : "text-2xl"}`}>
              {listing.title}
            </h3>
            <span className="text-sm font-black opacity-10">/ {listing.id.padStart(2, '0')}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-[#768064]">
              <span>{listing.roomType === "Private Suite" ? "개인 전용 공간" : listing.roomType === "Entire Space" ? "전체 독립형" : "공유 아틀리에"}</span>
              <span className="opacity-40">보증금 상담 가능</span>
            </div>
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-foreground/40">
              <span>IoT 스마트 보안 포함</span>
              <span className="opacity-100 text-foreground">월 {listing.price.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
