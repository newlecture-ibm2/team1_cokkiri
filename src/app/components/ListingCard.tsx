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
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#f5f5f5]">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <ImageWithFallback 
              src={listing.images[0]} 
              alt={listing.title}
              className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000"
            />
          </motion.div>
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
            <span className="px-3 py-1 bg-white/90 backdrop-blur text-black text-[10px] font-black uppercase tracking-widest rounded-full">
              {listing.location.split(',')[0]}
            </span>
            <div className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 -rotate-45 group-hover:rotate-0 translate-y-4 group-hover:translate-y-0">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
             <div className="bg-white/90 backdrop-blur p-4 rounded-2xl flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Available from {listing.availableFrom.split('-')[1]} / {listing.availableFrom.split('-')[0].slice(2)}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-black" />
                  <span className="text-xs font-bold">{listing.rating}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl font-bold tracking-tight group-hover:text-black transition-colors">{listing.title}</h3>
            <span className="text-sm font-bold opacity-20">/ {listing.id.padStart(2, '0')}</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">{listing.roomType}</p>
            <p className="font-bold">₩{listing.price.toLocaleString()}<span className="text-[10px] opacity-40 ml-1">/{listing.priceUnit}</span></p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
