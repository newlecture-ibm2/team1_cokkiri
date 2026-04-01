import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "../components/Header";
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
    <div className="min-h-screen bg-white text-[#030213] selection:bg-black selection:text-white pb-32">
      <Header />
      
      {/* Page Header */}
      <section className="pt-48 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-black/10 pb-16"
          >
            <div className="space-y-6 max-w-2xl">
              <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85]">
                THE ARCHIVE.
              </h1>
              <p className="text-xl md:text-2xl font-medium leading-tight">
                A curated selection of {listings.length} architectural residences designed for modern life. Each space is vetted for design integrity and community spirit.
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Volume 01</p>
              <div className="text-2xl font-black">2026 EDITION</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 md:px-12 lg:px-24 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 border ${
                  activeFilter === f 
                    ? "bg-black text-white border-black" 
                    : "bg-transparent text-black/40 border-black/5 hover:border-black/40"
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
                  initial={{ opacity: 0, w: 0 }}
                  animate={{ opacity: 1, w: "auto" }}
                  exit={{ opacity: 0, w: 0 }}
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
           <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
             READY TO MOVE IN?
           </h2>
           <p className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto font-medium">
             Join our waitlist for upcoming residences in Tokyo, Berlin, and London.
           </p>
           <Button className="h-20 px-12 rounded-2xl bg-white text-black hover:bg-white/90 text-lg font-black uppercase tracking-[0.2em]">
             JOIN THE WAITLIST
           </Button>
        </div>
      </section>
    </div>
  );
}
