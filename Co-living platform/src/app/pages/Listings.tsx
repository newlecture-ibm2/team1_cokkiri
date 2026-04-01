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
      const matchesSearch =
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className="bg-background text-foreground min-h-screen pb-32 selection:bg-[#2C3424] selection:text-[#DADED8]">
      <Header />

      {/* Page Header */}
      <section className="px-6 pt-48 pb-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-end justify-between gap-12 border-b border-[#2C3424]/10 pb-16 md:flex-row"
          >
            <div className="max-w-2xl space-y-6">
              <h1 className="text-8xl leading-[0.85] font-black tracking-tighter md:text-[10rem]">
                SPACES.
              </h1>
              <p className="text-1xl leading-tight font-medium opacity-70 md:text-2xl">
                나만의 감각과 스마트한 일상이 공존하는 공간
              </p>
            </div>

            <div className="text-right">
              <p className="mb-2 text-[10px] font-black tracking-[0.3em] uppercase opacity-40"></p>
              <div className="text-2xl font-black"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-background/80 border-border sticky top-0 z-40 border-b px-6 py-8 backdrop-blur-md md:px-12 lg:px-24">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-full border px-6 py-2 text-xs font-black tracking-widest uppercase transition-all duration-500 ${
                  activeFilter === f
                    ? "border-[#2C3424] bg-[#2C3424] text-[#DADED8]"
                    : "border-[#2C3424]/20 bg-transparent text-[#2C3424]/70 hover:border-[#2C3424]/40"
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
                    className="min-w-[200px] bg-transparent text-sm font-bold tracking-widest uppercase focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 text-xs font-black tracking-widest uppercase transition-colors hover:text-black/60"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              )}
            </AnimatePresence>

            <button className="flex items-center gap-2 text-xs font-black tracking-widest uppercase transition-colors hover:text-black/60">
              <Filter className="h-4 w-4" />
              Sort
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mt-24 px-6 md:px-12 lg:px-24">
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
      <section className="mt-48 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px] space-y-12 rounded-[4rem] bg-[#030213] p-12 text-center text-white md:p-24">
          <h2 className="text-6xl leading-none font-black tracking-tighter md:text-8xl">
            READY TO <span className="text-accent underline underline-offset-8">EXPERIENCE?</span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl font-medium text-white/40 md:text-2xl">
            COKKIRI의 새로운 스페이스 소식을 가장 먼저 받아보세요.
          </p>
          <Button className="h-24 rounded-2xl border-none bg-[#2C3424] px-16 text-xl font-black tracking-[0.2em] text-white uppercase transition-all duration-500 hover:bg-[#768064] hover:text-white">
            Join Waitlist
          </Button>
        </div>
      </section>
    </div>
  );
}
