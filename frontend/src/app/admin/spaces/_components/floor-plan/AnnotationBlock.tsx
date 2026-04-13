'use client';

import { useCallback, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  MapPin, X, DoorOpen, ArrowUpDown, TreePine, ArrowUpSquare, Bath,
  GripVertical, type LucideIcon,
} from 'lucide-react';
import type { FloorAnnotation } from '../../_types/layout';
import { ANNOTATION_PRESETS, DEFAULT_LAYOUT } from '../../_types/layout';

/** 자주 쓰는 Lucide 아이콘 매핑 (DB iconName → React 컴포넌트) */
const ICON_REGISTRY: Record<string, LucideIcon> = {
  DoorOpen,
  ArrowUpDown,
  TreePine,
  ArrowUpSquare,
  Bath,
  MapPin,
  GripVertical,
};

function resolveIcon(iconName?: string): LucideIcon {
  if (!iconName) return MapPin;
  return ICON_REGISTRY[iconName] || MapPin;
}

interface AnnotationBlockProps {
  annotation: FloorAnnotation;
  cellSize: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FloorAnnotation>) => void;
}

export function AnnotationBlock({ annotation, cellSize, onRemove, onUpdate }: AnnotationBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `anno-${annotation.id}`,
    data: {
      type: 'ANNOTATION',
      annotation,
    },
  });

  // ── 리사이즈 상태 ──
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);

      const startW = annotation.positionW;
      const startH = annotation.positionH;
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW,
        startH,
      };

      const handleMove = (ev: PointerEvent) => {
        if (!resizeRef.current || cellSize === 0) return;
        const dx = ev.clientX - resizeRef.current.startX;
        const dy = ev.clientY - resizeRef.current.startY;
        const newW = Math.max(1, resizeRef.current.startW + Math.round(dx / cellSize));
        const newH = Math.max(1, resizeRef.current.startH + Math.round(dy / cellSize));
        // 캔버스 범위 제한
        const maxW = DEFAULT_LAYOUT.columns - annotation.positionX;
        const maxH = DEFAULT_LAYOUT.rows - annotation.positionY;
        onUpdate(annotation.id, {
          positionW: Math.min(newW, maxW),
          positionH: Math.min(newH, maxH),
        });
      };

      const handleUp = () => {
        setIsResizing(false);
        resizeRef.current = null;
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
    },
    [annotation, cellSize, onUpdate],
  );

  const style = {
    position: 'absolute' as const,
    left: `${annotation.positionX * cellSize}px`,
    top: `${annotation.positionY * cellSize}px`,
    width: `${annotation.positionW * cellSize}px`,
    height: `${annotation.positionH * cellSize}px`,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : isResizing ? 45 : 20,
    opacity: isDragging ? 0.8 : 1,
    touchAction: 'none',
  };

  const preset = ANNOTATION_PRESETS[annotation.color] || ANNOTATION_PRESETS.primary;
  const IconComponent = resolveIcon(annotation.iconName);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        border-2 border-dashed flex flex-col items-center justify-center relative group
        transition-shadow cursor-grab active:cursor-grabbing hover:shadow-lg
      `}
    >
      {/* Background layer */}
      <div
        className="absolute inset-0 rounded opacity-80 pointer-events-none"
        style={{ backgroundColor: preset.bg, borderColor: preset.border }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pointer-events-none gap-1">
        <IconComponent className="w-4 h-4 opacity-70" />
        <span className="text-[10px] font-bold text-balance text-center uppercase px-1 leading-tight text-[var(--foreground)]">
          {annotation.label}
        </span>
      </div>

      {/* Hover action : Delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(annotation.id);
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto shadow-md"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <X className="w-3 h-3" />
      </button>

      {/* Resize handle (우하단) */}
      <div
        onPointerDown={handleResizePointerDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-30 pointer-events-auto
                   opacity-0 group-hover:opacity-100 transition-opacity
                   flex items-center justify-center"
        style={{ touchAction: 'none' }}
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className="text-[var(--foreground)] opacity-50"
        >
          <path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
