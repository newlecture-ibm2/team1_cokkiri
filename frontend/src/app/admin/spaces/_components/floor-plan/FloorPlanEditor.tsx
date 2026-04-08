'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { useFloorPlan } from '../../_hooks/useFloorPlan';
import { DEFAULT_LAYOUT } from '../../_types/layout';
import { FloorSelector } from './FloorSelector';
import { GridCanvas } from './GridCanvas';
import { SpaceBlock } from './SpaceBlock';

/** 드래그 중 격자 스냅 Modifier */
function createSnapModifier(gridSize: number): Modifier {
  return ({ transform }) => ({
    ...transform,
    x: Math.round(transform.x / gridSize) * gridSize,
    y: Math.round(transform.y / gridSize) * gridSize,
  });
}

/** 값을 min~max 범위로 제한 */
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function FloorPlanEditor() {
  const {
    blocks,
    floors,
    selectedFloor,
    setSelectedFloor,
    updateBlockPosition,
    loading,
  } = useFloorPlan();

  const [cellSize, setCellSize] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const snapModifier = useCallback(
    (args: Parameters<Modifier>[0]) => createSnapModifier(cellSize)(args),
    [cellSize],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const block = blocks.find((b) => b.spaceId === active.id);
      if (!block || cellSize === 0) return;

      const newGridX = clamp(
        block.gridX + Math.round(delta.x / cellSize),
        0,
        DEFAULT_LAYOUT.columns - block.gridW,
      );
      const newGridY = clamp(
        block.gridY + Math.round(delta.y / cellSize),
        0,
        DEFAULT_LAYOUT.rows - block.gridH,
      );

      updateBlockPosition(block.spaceId, newGridX, newGridY);
    },
    [blocks, cellSize, updateBlockPosition],
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-black/5 rounded-full mb-6" />
        <div className="h-[500px] bg-black/5 rounded-[2rem]" />
      </div>
    );
  }

  if (floors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <Map size={48} className="opacity-15 mb-4" />
        <p className="text-lg font-black tracking-tight opacity-40">
          등록된 공간이 없습니다
        </p>
        <p className="text-sm font-bold opacity-30 mt-1">
          &apos;공간 관리&apos; 탭에서 공간을 먼저 등록해 주세요
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* 층 선택 */}
      <FloorSelector
        floors={floors}
        selectedFloor={selectedFloor}
        onSelectFloor={setSelectedFloor}
      />

      {/* 안내 */}
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 mb-4">
        블록을 드래그하여 배치를 변경하세요 · 변경사항은 아직 저장되지 않습니다
      </p>

      {/* 도면 격자 */}
      <DndContext
        sensors={sensors}
        modifiers={[snapModifier]}
        onDragEnd={handleDragEnd}
      >
        <GridCanvas onCellSizeChange={setCellSize}>
          {blocks.map((block) => (
            <SpaceBlock key={block.spaceId} block={block} cellSize={cellSize} />
          ))}
        </GridCanvas>
      </DndContext>

      {/* 범례 */}
      <div className="flex items-center gap-6 mt-4">
        {(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as const).map((status) => {
          const info = {
            AVAILABLE: { label: '공실', color: 'rgba(118,128,100,0.6)' },
            OCCUPIED: { label: '사용중', color: 'rgba(44,52,36,0.7)' },
            MAINTENANCE: { label: '점검중', color: 'rgba(202,138,4,0.6)' },
          }[status];
          return (
            <div key={status} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: info.color }}
              />
              <span className="text-[10px] font-bold tracking-tight opacity-50">
                {info.label}
              </span>
            </div>
          );
        })}
        <span className="text-[10px] font-bold tracking-tight opacity-30 ml-auto">
          {blocks.length}개 공간
        </span>
      </div>
    </motion.div>
  );
}
