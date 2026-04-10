'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { usePublicFloorMap } from '../_hooks/usePublicFloorMap';
import { FloorSelector } from './FloorSelector';
import { GridCanvas } from './GridCanvas';
import { SpaceBlock } from './SpaceBlock';
import { AnnotationBlock } from './AnnotationBlock';
import { STATUS_COLORS } from '../_types';

export function FloorMapViewer() {
  const {
    floorNumbers,
    selectedFloor,
    setSelectedFloor,
    currentFloor,
    loading,
  } = usePublicFloorMap();

  const [cellSize, setCellSize] = useState(0);

  // ── 로딩 ──
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-16 bg-black/5 rounded-full" />
          ))}
        </div>
        <div className="h-[500px] bg-black/5 rounded-[2rem]" />
      </div>
    );
  }

  // ── 빈 상태 ──
  if (floorNumbers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <Map size={48} className="opacity-15 mb-4" />
        <p className="text-lg font-black tracking-tight opacity-40">
          등록된 평면도가 없습니다
        </p>
        <p className="text-sm font-bold opacity-30 mt-1">
          관리자가 공간을 배치하면 이곳에 표시됩니다
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* 층 선택 */}
      <div className="mb-6">
        <FloorSelector
          floors={floorNumbers}
          selectedFloor={selectedFloor}
          onSelectFloor={setSelectedFloor}
        />
      </div>

      {/* 캔버스 */}
      <GridCanvas
        blueprintUrl={currentFloor?.blueprintUrl}
        blueprintOpacity={currentFloor?.blueprintOpacity}
        onCellSizeChange={setCellSize}
      >
        {/* 어노테이션 (공간 블록 뒤) */}
        {currentFloor?.annotations.map((anno, idx) => (
          <AnnotationBlock key={`anno-${idx}`} annotation={anno} cellSize={cellSize} />
        ))}

        {/* 공간 블록 */}
        {currentFloor?.spaces.map((space) => (
          <SpaceBlock key={space.spaceId} block={space} cellSize={cellSize} />
        ))}
      </GridCanvas>

      {/* 범례 */}
      <div className="flex items-center gap-6 mt-4">
        {(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as const).map((status) => {
          const info = STATUS_COLORS[status];
          return (
            <div key={status} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: info.border }}
              />
              <span className="text-[10px] font-bold tracking-tight opacity-50">
                {info.label}
              </span>
            </div>
          );
        })}
        <span className="text-[10px] font-bold tracking-tight opacity-30 ml-auto">
          {currentFloor?.spaces.length ?? 0}개 공간
        </span>
      </div>

      {/* 안내 */}
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-25 mt-2">
        공간을 클릭하면 상세 정보를 확인할 수 있습니다
      </p>
    </motion.div>
  );
}
