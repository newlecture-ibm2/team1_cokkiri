'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Home, Users } from 'lucide-react';
import type { FloorPlanBlock } from '../../_types/layout';
import { STATUS_COLORS, DEFAULT_LAYOUT } from '../../_types/layout';
import { BlockTooltip } from './BlockTooltip';

interface SpaceBlockProps {
  block: FloorPlanBlock;
  cellSize: number;
}

export function SpaceBlock({ block, cellSize }: SpaceBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.spaceId,
  });

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
      : '0 2px 8px rgba(0,0,0,0.06)',
    opacity: isDragging ? 0.92 : 1,
  };

  const TypeIcon = block.type === 'PRIVATE' ? Home : Users;

  return (
    <BlockTooltip block={block}>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <div className="flex flex-col justify-between h-full p-2.5 select-none overflow-hidden">
          {/* 상단: 아이콘 + 상태 */}
          <div className="flex items-start justify-between">
            <TypeIcon size={14} className="opacity-50 shrink-0" />
            <span
              className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: statusInfo.border,
                color: 'var(--background)',
              }}
            >
              {statusInfo.label}
            </span>
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
      </div>
    </BlockTooltip>
  );
}
