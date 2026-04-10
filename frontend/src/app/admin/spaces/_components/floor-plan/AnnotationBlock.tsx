'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, X } from 'lucide-react';
import type { FloorAnnotation } from '../../_types/layout';
import { ANNOTATION_PRESETS } from '../../_types/layout';

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

  const style = {
    position: 'absolute' as const,
    left: `${annotation.positionX * cellSize}px`,
    top: `${annotation.positionY * cellSize}px`,
    width: `${annotation.positionW * cellSize}px`,
    height: `${annotation.positionH * cellSize}px`,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 20,
    opacity: isDragging ? 0.8 : 1,
    touchAction: 'none',
  };

  const preset = ANNOTATION_PRESETS[annotation.color] || ANNOTATION_PRESETS.primary;

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
        <MapPin className="w-4 h-4 opacity-70" />
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
        onPointerDown={(e) => e.stopPropagation()} // 드래그 이벤트 방지
      >
        <X className="w-3 h-3" />
      </button>

      {/* Resize handle (간이 구현 - 여기서는 크기 조절 생략하거나 추후 추가) */}
    </div>
  );
}
