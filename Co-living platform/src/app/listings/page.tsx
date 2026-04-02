"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ListingCard } from "../components/ListingCard";
import { Button } from "../components/ui/button";
import { listings } from "../data/mockData";
import { Search, X, Filter } from "lucide-react";

export default function ListingsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 0.7]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const y = useTransform(scrollY, [0, 300], [0, -80]);
  const paddingTop = useTransform(scrollY, [0, 300], ["6rem", "2rem"]);
  const paddingBottom = useTransform(scrollY, [0, 300], ["1rem", "0rem"]);

  const filters = ["All", "Private Suite", "Entire Space", "Shared Atelier"];

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesFilter = activeFilter === "All" || listing.roomType === activeFilter;
      const matchesSearch =
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div
      ref={containerRef}
      className="bg-background text-foreground min-h-screen pb-32 selection:bg-[#2C3424] selection:text-[#DADED8]"
    >
      <Header />

      {/* Page Header */}
      <motion.section
        style={{ paddingTop, paddingBottom }}
        className="px-6 md:px-12 lg:px-24 overflow-hidden bg-background"
      >
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            style={{ scale, opacity, y }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-end justify-between gap-12 border-b border-[#2C3424]/10 pb-8 md:flex-row"
          >
            <div className="max-w-2xl space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85]">
                SPACES.
              </h1>
              <p className="text-sm leading-tight font-medium opacity-70 md:text-2xl">
                나만의 감각과 스마트한 일상이 공존하는 공간
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black"></div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Filter Bar */}
      <section className="bg-background px-6 md:px-12 lg:px-24 py-6 md:py-8 border-b border-[#2C3424]/05">
        <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-3">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 border ${activeFilter === f
                  ? "bg-[#2C3424] text-[#DADED8] border-[#2C3424]"
                  : "bg-transparent text-[#2C3424]/70 border-[#2C3424]/20 hover:border-[#2C3424]/40"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex items-center justify-end gap-6 self-end md:self-auto">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2 border-b border-black pb-2"
                >
                  <input
                    autoFocus
                    placeholder="Search locations..."
                    className="bg-transparent text-[10px] md:text-xs font-bold uppercase tracking-widest focus:outline-none min-w-[140px] md:min-w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-black/60 transition-colors"
                >
                  <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Search
                </button>
              )}
            </AnimatePresence>

            <button className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-black/60 transition-colors">
              <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Sort
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mt-12 md:mt-24 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          {filteredListings.length === 0 ? (
            <div className="space-y-8 py-48 text-center">
              <h3 className="text-4xl font-bold tracking-tight opacity-20">NO SPACES FOUND</h3>
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveFilter("All");
                  setSearchQuery("");
                }}
                className="text-sm font-black tracking-widest uppercase"
              >
                Reset Archive
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-24 md:mt-48 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px] space-y-6 md:space-y-12 rounded-[2rem] md:rounded-[4rem] bg-[#030213] p-8 py-8 md:p-24 text-center text-white">
          <h2 className="text-2xl md:text-8xl font-black tracking-tighter leading-none">
            READY TO <span className="text-accent underline underline-offset-8">EXPERIENCE?</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm md:text-2xl font-medium text-white/40">
            COKKIRI의 새로운 스페이스 소식을 가장 먼저 받아보세요.
          </p>
          <Button className="h-12 md:h-24 px-8 md:px-16 rounded-xl md:rounded-2xl bg-[#2C3424] text-white hover:bg-[#768064] hover:text-white transition-all duration-500 text-xs md:text-xl font-black uppercase tracking-[0.2em] border-none w-full md:w-auto">
            Join Waitlist
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
