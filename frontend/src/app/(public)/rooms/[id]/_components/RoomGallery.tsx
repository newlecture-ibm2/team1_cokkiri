'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SpaceImageDTO } from '../../_types';

interface RoomGalleryProps {
  images: SpaceImageDTO[];
}

export function RoomGallery({ images }: RoomGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  return (
    <div className="space-y-6">
      <h3 className="text-sm md:text-base font-black tracking-[0.3em] uppercase opacity-30">
        Gallery
      </h3>
      
      <div className="p-4 md:p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.05]">
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground/5 aspect-[16/9] group mb-6">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex].imageUrl}
              alt={`Gallery ${currentIndex + 1}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 text-foreground backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 text-foreground backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold tracking-widest">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory flex-nowrap hide-scrollbar pb-2">
            {images.map((img, idx) => (
              <button
                key={img.spaceImageId || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden snap-center transition-all duration-300 ${
                  currentIndex === idx ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 scale-95 opacity-100' : 'opacity-40 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
