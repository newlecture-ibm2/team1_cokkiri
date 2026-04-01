import { Link } from "react-router";
import { ArrowRight, Globe, LifeBuoy, Zap } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";
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
    <div ref={containerRef} className="relative min-h-screen bg-white text-[#030213] selection:bg-black selection:text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full pt-20">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[12vw] md:text-[10vw] font-bold leading-[0.85] tracking-tighter mb-12">
              CO-LIVING<br />
              <span className="inline-block translate-x-[5vw] md:translate-x-[10vw] italic font-light">REDEFINED.</span>
            </h1>
          </motion.div>
          
          <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <motion.p 
              className="text-xl md:text-2xl max-w-lg leading-tight font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              Beyond just a place to sleep. We curate architectural sanctuaries for the modern nomad, the creative mind, and the urban dweller.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link to="/listings">
                <Button size="lg" className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-black text-white hover:bg-[#030213] transition-all duration-500 hover:scale-110 flex flex-col items-center justify-center p-0 group">
                  <span className="text-xs font-bold uppercase tracking-widest mb-1">Explore</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
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
            className="flex flex-col md:flex-row justify-between items-baseline mb-24 border-b border-black/10 pb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">CURATED SPACES</h2>
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">Volume 01 / 2026</p>
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
              <h2 className="text-6xl md:text-8xl font-bold leading-none mb-12">LIVE BY<br />DESIGN.</h2>
              <div className="space-y-8 max-w-md">
                <div className="flex gap-6">
                  <Globe className="h-8 w-8 shrink-0 text-white/40" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Global Community</h4>
                    <p className="text-white/60 leading-relaxed">Connect with diverse perspectives in a culture of mutual respect and inspiration.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <LifeBuoy className="h-8 w-8 shrink-0 text-white/40" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Full Support</h4>
                    <p className="text-white/60 leading-relaxed">From cleaning to high-speed fiber, we handle the friction so you can focus on life.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <Zap className="h-8 w-8 shrink-0 text-white/40" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Sustainable Living</h4>
                    <p className="text-white/60 leading-relaxed">Optimized resource sharing that's better for the planet and your wallet.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="relative aspect-square">
              <motion.div
                className="absolute inset-0 bg-white/5 rounded-2xl overflow-hidden"
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1758448500688-3ababa93fd67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3dvcmtpbmclMjBzcGFjZSUyMGxvdW5nZXxlbnwxfHx8fDE3NzQ0ODc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Philosophy"
                  className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000"
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

      {/* Footer / CTA */}
      <footer className="py-24 px-6 md:px-12 lg:px-24 border-t border-black/5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-bold mb-4">Start your journey.</h3>
            <p className="text-black/40">© 2026 CoLiving. All rights reserved.</p>
          </div>
          <Link to="/listings">
            <Button variant="ghost" className="text-4xl md:text-6xl font-bold hover:bg-transparent hover:translate-x-4 transition-all group flex items-center gap-6">
              BOOK A TOUR <ArrowRight className="h-12 w-12" />
            </Button>
          </Link>
        </div>
      </footer>
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
              className={`w-full object-cover transition-all duration-700 ${
                size === "large" ? "aspect-[16/10]" : size === "medium" ? "aspect-[4/5]" : "aspect-square"
              }`}
            />
          </motion.div>
          <div className="absolute top-6 left-6">
            <span className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">
              {listing.location.split(',')[0]}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <h3 className={`font-bold tracking-tight ${size === "large" ? "text-4xl" : "text-2xl"}`}>
              {listing.title}
            </h3>
            <span className="text-sm font-bold opacity-30">/ {listing.id.padStart(2, '0')}</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-black/40 font-medium uppercase text-xs tracking-widest">{listing.roomType}</p>
            <p className="font-bold">₩{listing.price.toLocaleString()}<span className="text-xs opacity-40 ml-1">/{listing.priceUnit}</span></p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
