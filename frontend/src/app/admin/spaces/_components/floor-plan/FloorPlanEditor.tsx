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
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Save, Loader2, Check } from 'lucide-react';
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
    updateBlockSize,
    saveLayout,
    loading,
    saving,
    dirty,
    saveMessage,
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

  const handleResizeEnd = useCallback(
    (spaceId: number, gridW: number, gridH: number) => {
      updateBlockSize(spaceId, gridW, gridH);
    },
    [updateBlockSize],
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
      {/* 상단: 층 선택 + 저장 버튼 */}
      <div className="flex items-center justify-between mb-2">
        <FloorSelector
          floors={floors}
          selectedFloor={selectedFloor}
          onSelectFloor={setSelectedFloor}
        />

        <button
          onClick={saveLayout}
          disabled={!dirty || saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm tracking-tight transition-all duration-300
            ${dirty
              ? 'bg-[var(--foreground)] text-[var(--background)] shadow-xl hover:scale-105'
              : 'bg-black/5 opacity-40 cursor-not-allowed'
            }`}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? '저장 중...' : '배치 저장'}
        </button>
      </div>

      {/* 안내 + 토스트 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
          {dirty
            ? '변경사항이 있습니다 · 저장 버튼을 눌러 주세요'
            : '블록을 드래그하여 배치를 변경하세요'}
        </p>

        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight"
            >
              <Check size={12} className="text-[var(--color-accent)]" />
              <span className="opacity-60">{saveMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 도면 격자 */}
      <DndContext
        sensors={sensors}
        modifiers={[snapModifier]}
        onDragEnd={handleDragEnd}
      >
        <GridCanvas onCellSizeChange={setCellSize}>
          {blocks.map((block) => (
            <SpaceBlock key={block.spaceId} block={block} cellSize={cellSize} onResizeEnd={handleResizeEnd} />
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
        {/* 디바이스 에러 범례 */}
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--color-destructive)' }}
          />
          <span className="text-[10px] font-bold tracking-tight opacity-50">
            기기장애
          </span>
        </div>
        <span className="text-[10px] font-bold tracking-tight opacity-30 ml-auto">
          {blocks.filter((b) => b.hasDeviceError).length > 0 && (
            <span className="opacity-80 mr-2" style={{ color: 'var(--color-destructive)' }}>
              ⚠ {blocks.filter((b) => b.hasDeviceError).length}개 장애
            </span>
          )}
          {blocks.length}개 공간
        </span>
      </div>
    </motion.div>
  );
}
