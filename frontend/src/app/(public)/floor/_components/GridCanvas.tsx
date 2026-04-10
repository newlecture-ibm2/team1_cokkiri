'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { GRID_CONFIG } from '../_types';

interface GridCanvasProps {
  children: React.ReactNode;
  blueprintUrl?: string | null;
  blueprintOpacity?: number;
  onCellSizeChange: (cellSize: number) => void;
}

export function GridCanvas({
  children,
  blueprintUrl,
  blueprintOpacity = 0.3,
  onCellSizeChange,
}: GridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(0);

  const recalculate = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const newCellSize = Math.floor(width / GRID_CONFIG.columns);
    setCellSize(newCellSize);
    onCellSizeChange(newCellSize);
  }, [onCellSizeChange]);

  useEffect(() => {
    recalculate();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => recalculate());
    observer.observe(el);
    return () => observer.disconnect();
  }, [recalculate]);

  const canvasHeight = cellSize * GRID_CONFIG.rows;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-[2rem] border border-[var(--foreground)]/10"
      style={{
        height: canvasHeight > 0 ? canvasHeight : 600,
        backgroundSize: `${cellSize}px ${cellSize}px`,
        backgroundImage: `radial-gradient(circle, var(--foreground) 0.5px, transparent 0.5px)`,
        backgroundPosition: `${cellSize / 2}px ${cellSize / 2}px`,
        backgroundColor: 'var(--background)',
      }}
    >
      {/* 배경 도면 레이어 */}
      {blueprintUrl && (
        <div
          className="absolute inset-0 z-0 pointer-events-none bg-center bg-no-repeat bg-contain"
          style={{
            backgroundImage: `url(${blueprintUrl})`,
            opacity: blueprintOpacity,
          }}
        />
      )}

      {/* 격자 라벨 */}
      <div className="absolute top-3 left-4 text-[9px] font-black uppercase tracking-[0.2em] opacity-20 select-none pointer-events-none z-10">
        {GRID_CONFIG.columns}×{GRID_CONFIG.rows} GRID
      </div>

      {/* 블록 + 어노테이션 */}
      <div className="relative z-20 w-full h-full">
        {children}
      </div>
    </div>
  );
}
