import { Link } from "react-router";
import { Star, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Listing } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link to={`/listings/${listing.id}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white/5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
          >
            <ImageWithFallback
              src={listing.images[0]}
              alt={listing.title}
              className="h-full w-full object-cover transition-all duration-1000"
            />
          </motion.div>

          <div className="pointer-events-none absolute top-6 right-6">
            <div className="flex h-10 w-10 translate-y-4 -rotate-45 items-center justify-center rounded-full bg-black text-white opacity-0 shadow-xl transition-all duration-500 group-hover:translate-y-0 group-hover:rotate-0 group-hover:opacity-100">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          <div className="pointer-events-none absolute right-6 bottom-6 left-6">
            <div className="flex translate-y-4 items-center justify-center rounded-2xl bg-white/90 p-4 opacity-0 shadow-lg backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="text-xs font-black tracking-widest text-[#2C3424] uppercase">
                Available: {listing.availableFrom}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3 px-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black tracking-tighter text-[#2C3424] transition-colors duration-500 group-hover:text-[#768064]">
              {listing.title}
            </h3>
            <span className="text-base font-black text-[#2C3424] opacity-10 whitespace-nowrap">
              / {listing.id.padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[#2C3424]/10 pt-4">
            <p className="text-sm font-black tracking-[0.3em] text-[#768064] uppercase">
              {listing.roomType === "Private Suite"
                ? "개인 전용"
                : listing.roomType === "Entire Space"
                  ? "전체 독립형"
                  : "공유 아틀리에"}
            </p>
            <p className="text-lg font-black text-[#2C3424]">
              ₩{listing.price.toLocaleString()}
              <span className="ml-1 text-xs opacity-30">/월</span>
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
