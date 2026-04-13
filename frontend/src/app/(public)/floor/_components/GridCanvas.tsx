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
  const measureRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(0);

  const recalculate = useCallback(() => {
    if (!measureRef.current) return;
    const width = measureRef.current.clientWidth;
    const newCellSize = Math.floor(width / GRID_CONFIG.columns);
    setCellSize(newCellSize);
    onCellSizeChange(newCellSize);
  }, [onCellSizeChange]);

  useEffect(() => {
    recalculate();
    const el = measureRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => recalculate());
    observer.observe(el);
    return () => observer.disconnect();
  }, [recalculate]);

  const canvasWidth = cellSize * GRID_CONFIG.columns;
  const canvasHeight = cellSize * GRID_CONFIG.rows;

  return (
    /* 측정용 래퍼: w-full로 부모 너비를 측정하되, 캔버스를 가운데 정렬 */
    <div ref={measureRef} className="w-full flex justify-center">
      <div
        className="relative overflow-hidden rounded-[2rem] border border-[var(--foreground)]/10"
        style={{
          width: canvasWidth > 0 ? canvasWidth : '100%',
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
            className="absolute inset-0 z-0 pointer-events-none bg-no-repeat"
            style={{
              backgroundImage: `url(${blueprintUrl})`,
              backgroundSize: `${canvasWidth}px ${canvasHeight}px`,
              backgroundPosition: '0 0',
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
    </div>
  );
}

