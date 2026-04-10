'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { LayoutConfig } from '../../_types/layout';
import { DEFAULT_LAYOUT } from '../../_types/layout';

interface GridCanvasProps {
  config?: LayoutConfig;
  children: React.ReactNode;
  onCellSizeChange: (cellSize: number) => void;
  blueprintUrl?: string | null;
  blueprintOpacity?: number;
}

export function GridCanvas({
  config = DEFAULT_LAYOUT,
  children,
  onCellSizeChange,
  blueprintUrl,
  blueprintOpacity = 0.3,
}: GridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(0);

  const recalculate = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const newCellSize = Math.floor(width / config.columns);
    setCellSize(newCellSize);
    onCellSizeChange(newCellSize);
  }, [config.columns, onCellSizeChange]);

  // 초기 계산 + ResizeObserver
  useEffect(() => {
    recalculate();

    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => recalculate());
    observer.observe(el);
    return () => observer.disconnect();
  }, [recalculate]);

  const canvasHeight = cellSize * config.rows;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-[2rem] border border-[var(--foreground)]/10"
      style={{
        height: canvasHeight > 0 ? canvasHeight : 600,
        backgroundSize: `${cellSize}px ${cellSize}px`,
        backgroundImage: `
          radial-gradient(circle, var(--foreground) 0.5px, transparent 0.5px)
        `,
        backgroundPosition: `${cellSize / 2}px ${cellSize / 2}px`,
        backgroundColor: 'var(--background)',
      }}
    >
      {/* 백그라운드 이미지 레이어 (격자 뒤) */}
      {blueprintUrl && (
        <div
          className="absolute inset-0 z-0 pointer-events-none bg-center bg-no-repeat bg-contain"
          style={{
            backgroundImage: `url(${blueprintUrl})`,
            opacity: blueprintOpacity,
          }}
        />
      )}

      {/* 격자 라벨 (좌상단) */}
      <div className="absolute top-3 left-4 text-[9px] font-black uppercase tracking-[0.2em] opacity-20 select-none pointer-events-none z-10">
        {config.columns}×{config.rows} GRID
      </div>
      
      {/* 칠드런 레이어 (블록, 어노테이션 등) */}
      <div className="relative z-20 w-full h-full pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
