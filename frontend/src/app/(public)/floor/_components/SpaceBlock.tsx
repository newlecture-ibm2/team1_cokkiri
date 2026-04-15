'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Users } from 'lucide-react';
import type { FloorSpaceBlock } from '../_types';
import { STATUS_COLORS, GRID_CONFIG } from '../_types';

interface SpaceBlockProps {
  block: FloorSpaceBlock;
  cellSize: number;
}

export function SpaceBlock({ block, cellSize }: SpaceBlockProps) {
  const router = useRouter();
  const statusInfo = STATUS_COLORS[block.status] || STATUS_COLORS.AVAILABLE;

  const left = block.positionX * cellSize;
  const top = block.positionY * cellSize;
  const width = block.positionW * cellSize - GRID_CONFIG.gap;
  const height = block.positionH * cellSize - GRID_CONFIG.gap;

  const handleClick = () => {
    if (block.type === 'PRIVATE') {
      router.push(`/rooms/${block.spaceId}`);
    } else {
      router.push(`/experience/${block.spaceId}`);
    }
  };

  const TypeIcon = block.type === 'PRIVATE' ? Home : Users;

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.03, zIndex: 30 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        backgroundColor: statusInfo.bg,
        border: `2px solid ${statusInfo.border}`,
        borderRadius: '1rem',
        backdropFilter: 'blur(4px)',
        cursor: 'pointer',
        zIndex: 1,
      }}
      className="group transition-shadow duration-200 hover:shadow-xl"
    >
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
            {block.type === 'COMMON' ? '공용' : statusInfo.label}
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

      {/* 호버 시 "상세 보기" 오버레이 */}
      <div className="absolute inset-0 flex items-center justify-center rounded-[0.875rem] bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-md">
          상세 보기
        </span>
      </div>
    </motion.div>
  );
}
