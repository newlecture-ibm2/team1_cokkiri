'use client';

import { useRef, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Home, Users, AlertTriangle, GripVertical } from 'lucide-react';
import type { FloorPlanBlock } from '../../_types/layout';
import { STATUS_COLORS, DEFAULT_LAYOUT } from '../../_types/layout';
import { BlockTooltip } from './BlockTooltip';

interface SpaceBlockProps {
  block: FloorPlanBlock;
  cellSize: number;
  onResizeEnd?: (spaceId: number, gridW: number, gridH: number) => void;
}

/** 값을 min~max 범위로 제한 */
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function SpaceBlock({ block, cellSize, onResizeEnd }: SpaceBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.spaceId,
  });

  const resizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: block.gridW, h: block.gridH });

  const statusInfo = STATUS_COLORS[block.status] || STATUS_COLORS.AVAILABLE;

  const left = block.gridX * cellSize;
  const top = block.gridY * cellSize;
  const width = block.gridW * cellSize - DEFAULT_LAYOUT.gap;
  const height = block.gridH * cellSize - DEFAULT_LAYOUT.gap;

  const style: React.CSSProperties = {
    position: 'absolute',
    left,
    top,
    width,
    height,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition: isDragging ? 'none' : 'transform 250ms ease, box-shadow 250ms ease',
    zIndex: isDragging ? 50 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    backgroundColor: statusInfo.bg,
    border: `2px solid ${statusInfo.border}`,
    borderRadius: '1rem',
    backdropFilter: 'blur(4px)',
    boxShadow: isDragging
      ? '0 20px 40px rgba(0,0,0,0.15), 0 0 0 2px var(--foreground)'
      : block.hasDeviceError
        ? '0 2px 12px color-mix(in srgb, var(--color-destructive) 40%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-destructive) 50%, transparent)'
        : '0 2px 8px rgba(0,0,0,0.06)',
    opacity: isDragging ? 0.92 : 1,
  };

  const TypeIcon = block.type === 'PRIVATE' ? Home : Users;

  // ── 리사이즈 핸들러 ──
  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (cellSize === 0) return;

      resizing.current = true;
      resizeStart.current = { x: e.clientX, y: e.clientY, w: block.gridW, h: block.gridH };

      const handlePointerMove = (ev: PointerEvent) => {
        if (!resizing.current) return;
        // 시각적 피드백은 드래그 중에는 제공하지 않음 (스냅은 종료 시 적용)
      };

      const handlePointerUp = (ev: PointerEvent) => {
        if (!resizing.current) return;
        resizing.current = false;

        const deltaX = ev.clientX - resizeStart.current.x;
        const deltaY = ev.clientY - resizeStart.current.y;

        const newW = clamp(
          resizeStart.current.w + Math.round(deltaX / cellSize),
          4,  // 최소 4칸 (48격자 기준, 이전 24격자의 2칸에 해당)
          Math.min(24, DEFAULT_LAYOUT.columns - block.gridX), // 최대 24칸 또는 캔버스 한도
        );
        const newH = clamp(
          resizeStart.current.h + Math.round(deltaY / cellSize),
          2,  // 최소 2칸 (48격자 기준, 이전 24격자의 1칸에 해당)
          Math.min(16, DEFAULT_LAYOUT.rows - block.gridY), // 최대 16칸 또는 캔버스 한도
        );

        if (newW !== block.gridW || newH !== block.gridH) {
          onResizeEnd?.(block.spaceId, newW, newH);
        }

        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [block.gridW, block.gridH, block.gridX, block.gridY, block.spaceId, cellSize, onResizeEnd],
  );

  return (
    <BlockTooltip block={block}>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <div className="flex flex-col justify-between h-full p-2.5 select-none overflow-hidden">
          {/* 상단: 아이콘 + 상태 */}
          <div className="flex items-start justify-between">
            <TypeIcon size={14} className="opacity-50 shrink-0" />
            <div className="flex items-center gap-1">
              {/* 디바이스 에러 마커 */}
              {block.hasDeviceError && (
                <span
                  className="flex items-center justify-center rounded-full animate-pulse"
                  style={{
                    width: 18,
                    height: 18,
                    backgroundColor: 'var(--color-destructive)',
                  }}
                  title="기기 장애 감지"
                >
                  <AlertTriangle size={10} color="#fff" strokeWidth={3} />
                </span>
              )}
              <span
                className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: statusInfo.border,
                  color: 'var(--background)',
                }}
              >
                {block.type === 'COMMON' ? '공용' : statusInfo.label}
              </span>
            </div>
          </div>

          {/* 하단: 이름 */}
          <div>
            <p className="text-xs font-black tracking-tight leading-tight truncate">
              {block.name}
            </p>
            {block.roomTypeName && (
              <p className="text-[9px] font-bold opacity-50 truncate">
                {block.roomTypeName}
              </p>
            )}
          </div>
        </div>

        {/* 리사이즈 핸들 (우하단 모서리) */}
        {onResizeEnd && (
          <div
            onPointerDown={handleResizePointerDown}
            className="absolute bottom-0 right-0 flex items-center justify-center rounded-tl-lg rounded-br-[0.875rem] transition-colors hover:bg-black/10"
            style={{
              width: 20,
              height: 20,
              cursor: 'nwse-resize',
              touchAction: 'none',
            }}
            title="크기 조절"
          >
            <GripVertical size={10} className="opacity-40 rotate-[-45deg]" />
          </div>
        )}
      </div>
    </BlockTooltip>
  );
}
