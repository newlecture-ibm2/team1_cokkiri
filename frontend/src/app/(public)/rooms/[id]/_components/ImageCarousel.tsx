'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Home, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SpaceImageDTO } from '../../_types';

interface ImageCarouselProps {
  images?: SpaceImageDTO[];
  roomName: string;
}

export function ImageCarousel({ images, roomName }: ImageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalImages = images?.length || 0;

  // IntersectionObserver로 현재 보이는 이미지 인덱스 추적
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || totalImages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) setCurrentIndex(index);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    const slides = container.querySelectorAll('[data-index]');
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [totalImages]);

  const scrollTo = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const target = container.children[index] as HTMLElement;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    },
    []
  );

  const handlePrev = () => {
    const next = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
    scrollTo(next);
  };

  const handleNext = () => {
    const next = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    scrollTo(next);
  };

  // 이미지가 없을 때 플레이스홀더
  if (!images || images.length === 0) {
    return (
      <div className="relative h-64 md:h-96 rounded-[2rem] bg-muted flex items-center justify-center">
        <Home size={48} className="opacity-20" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-[2rem]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, idx) => (
          <div
            key={img.spaceImageId}
            data-index={idx}
            className="min-w-full snap-start"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={`${roomName} - ${idx + 1}`}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        ))}
      </div>

      {/* 좌우 화살표 버튼 */}
      {totalImages > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary/60 backdrop-blur-sm text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
            aria-label="이전 이미지"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary/60 backdrop-blur-sm text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
            aria-label="다음 이미지"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* 인디케이터 닷 + 카운터 */}
      {totalImages > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary/50 backdrop-blur-sm rounded-full px-4 py-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-primary-foreground w-4'
                  : 'bg-primary-foreground/50'
              }`}
              aria-label={`이미지 ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
