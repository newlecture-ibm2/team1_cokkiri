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
            className="w-full h-full"
          >
            <ImageWithFallback
              src={listing.images[0]}
              alt={listing.title}
              className="object-cover w-full h-full transition-all duration-1000"
            />
          </motion.div>

          <div className="absolute top-6 right-6 pointer-events-none">
            <div className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -rotate-45 group-hover:rotate-0 translate-y-4 group-hover:translate-y-0 shadow-xl">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl flex justify-center items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg">
              <span className="text-xs font-black uppercase tracking-widest text-[#2C3424]">Available: {listing.availableFrom}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3 px-2">
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl font-black tracking-tighter group-hover:text-[#768064] transition-colors duration-500 text-[#2C3424]">{listing.title}</h3>
            <span className="text-base font-black opacity-10 text-[#2C3424]">/ {listing.id.padStart(2, '0')}</span>
          </div>
          <div className="flex justify-between items-center border-t border-[#2C3424]/10 pt-4">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#768064]">{listing.roomType === "Private Suite" ? "개인 전용" : listing.roomType === "Entire Space" ? "전체 독립형" : "공유 아틀리에"}</p>
            <p className="font-black text-lg text-[#2C3424]">₩{listing.price.toLocaleString()}<span className="text-xs opacity-30 ml-1">/월</span></p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
