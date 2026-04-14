'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { SpaceImageDTO } from '../../_types';

interface HeroImageProps {
  images?: SpaceImageDTO[];
  roomName: string;
  selectedImage: number;
  onSelectImage: (index: number) => void;
}

export function HeroImage({ images, roomName, selectedImage, onSelectImage }: HeroImageProps) {
  const hasImages = images && images.length > 0;
  const currentSrc = hasImages ? images[selectedImage]?.imageUrl : null;

  if (!hasImages) {
    return (
      <section className="relative h-[80vh] w-full overflow-hidden bg-foreground/5 flex items-center justify-center">
        <Home size={64} className="opacity-10" />
        {/* Back button */}
        <div className="absolute right-0 bottom-0 left-0 p-6 md:p-12 lg:p-24">
          <div className="mx-auto max-w-[1400px]">
            <Link
              href="/rooms"
              className="group mb-8 inline-flex items-center gap-2 text-foreground/60 transition-all hover:text-foreground"
            >
              <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium tracking-[0.1em] uppercase">
                Return to Spaces
              </span>
            </Link>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-foreground tracking-tighter mb-4 leading-[0.85] max-w-[95%] md:max-w-[80%]">
              {roomName}
            </h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black">
      {/* Main image */}
      <motion.div
        className="absolute inset-0"
        key={selectedImage}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentSrc!}
          alt={`${roomName} 공간 대표 사진`}
          className="h-full w-full object-cover opacity-80"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Title overlay */}
      <div className="absolute right-0 bottom-0 left-0 p-6 md:p-12 lg:p-24">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <Link
              href="/rooms"
              className="group mb-8 inline-flex items-center gap-2 text-white/90 drop-shadow-lg transition-all hover:text-white"
            >
              <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium tracking-[0.1em] uppercase">
                Return to Spaces
              </span>
            </Link>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white tracking-tighter mb-4 leading-[0.85] max-w-[95%] md:max-w-[80%]">
              {roomName}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Desktop Image Navigation — right side thumbnails */}
      {images.length > 1 && (
        <div className="hidden md:flex absolute right-6 bottom-12 flex-col gap-4">
          {images.map((img, i) => (
            <button
              key={img.spaceImageId}
              onClick={() => onSelectImage(i)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                selectedImage === i
                  ? 'scale-110 border-white'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt={`${roomName} 공간 사진 ${i + 1} 미리보기`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Mobile Image Navigation */}
      {images.length > 1 && (
        <div className="flex md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectImage(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === selectedImage
                  ? 'bg-white w-4'
                  : 'bg-white/50'
              }`}
              aria-label={`이미지 ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
