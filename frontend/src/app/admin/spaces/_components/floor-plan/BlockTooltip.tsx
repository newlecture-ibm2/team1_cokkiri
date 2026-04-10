'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { FloorPlanBlock } from '../../_types/layout';
import { STATUS_COLORS } from '../../_types/layout';

interface BlockTooltipProps {
  block: FloorPlanBlock;
  children: React.ReactNode;
}

export function BlockTooltip({ block, children }: BlockTooltipProps) {
  const [show, setShow] = useState(false);
  const statusInfo = STATUS_COLORS[block.status] || STATUS_COLORS.AVAILABLE;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && (
        <div
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none"
          style={{ minWidth: 180 }}
        >
          <div className="bg-[var(--foreground)] text-[var(--background)] rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-xs font-black tracking-tight mb-1">{block.name}</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                {block.type === 'PRIVATE' ? '개인공간' : '공용공간'}
              </span>
              {block.roomTypeName && (
                <>
                  <span className="opacity-30">·</span>
                  <span className="text-[9px] font-bold opacity-70">
                    {block.roomTypeName}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-wider" style={{ opacity: 0.8 }}>
                {statusInfo.label}
              </span>
              {block.hasDeviceError && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--color-destructive-foreground)' }}>
                  <AlertTriangle size={10} strokeWidth={3} />
                  기기 장애
                </span>
              )}
            </div>
          </div>
          {/* 말풍선 꼬리 */}
          <div className="flex justify-center">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid var(--foreground)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
