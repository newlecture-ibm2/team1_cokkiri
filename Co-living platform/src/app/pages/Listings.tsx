import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ListingCard } from "../components/ListingCard";
import { Button } from "../components/ui/button";
import { listings } from "../data/mockData";
import { Search, X, Filter } from "lucide-react";

export function Listings() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filters = ["All", "Private Suite", "Entire Space", "Shared Atelier"];

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesFilter = activeFilter === "All" || listing.roomType === activeFilter;
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#2C3424] selection:text-[#DADED8] pb-32">
      <Header />

      {/* Page Header */}
      <section className="pt-48 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-[#2C3424]/10 pb-16"
          >
            <div className="space-y-6 max-w-2xl">
              <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-[0.85]">
                SPACES.
              </h1>
              <p className="text-1xl md:text-2xl font-medium leading-tight opacity-70">
                나만의 감각과 스마트한 일상이 공존하는 공간
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2"></p>
              <div className="text-2xl font-black"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 md:px-12 lg:px-24 py-8 border-b border-border">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 border ${activeFilter === f
                  ? "bg-[#2C3424] text-white border-[#2C3424]"
                  : "bg-transparent text-[#2C3424]/40 border-[#2C3424]/10 hover:border-[#2C3424]/40"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex items-center gap-6">
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
                    className="bg-transparent text-sm font-bold uppercase tracking-widest focus:outline-none min-w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}>
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-black/60 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              )}
            </AnimatePresence>

            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-black/60 transition-colors">
              <Filter className="h-4 w-4" />
              Sort
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mt-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          {filteredListings.length === 0 ? (
            <div className="py-48 text-center space-y-8">
              <h3 className="text-4xl font-bold tracking-tight opacity-20">NO SPACES FOUND</h3>
              <Button
                variant="ghost"
                onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                className="text-sm font-black uppercase tracking-widest"
              >
                Reset Archive
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
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
      <section className="mt-48 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto p-12 md:p-24 bg-[#030213] text-white rounded-[4rem] text-center space-y-12">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            READY TO <span className="text-accent underline underline-offset-8">EXPERIENCE?</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto font-medium">
            COKKIRI의 새로운 스페이스 소식을 가장 먼저 받아보세요.
          </p>
          <Button className="h-24 px-16 rounded-2xl bg-[#2C3424] text-white hover:bg-[#768064] hover:text-white transition-all duration-500 text-xl font-black uppercase tracking-[0.2em] border-none">
            Join Waitlist
          </Button>
        </div>
      </section>
    </div>
  );
}
