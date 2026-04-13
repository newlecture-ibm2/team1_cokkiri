'use client';

import {
  MapPin, DoorOpen, ArrowUpDown, TreePine, ArrowUpSquare, Bath,
  type LucideIcon,
} from 'lucide-react';
import type { FloorAnnotationBlock as AnnotationType } from '../_types';
import { ANNOTATION_PRESETS, GRID_CONFIG } from '../_types';

/** DB iconName → Lucide 컴포넌트 매핑 */
const ICON_REGISTRY: Record<string, LucideIcon> = {
  DoorOpen,
  ArrowUpDown,
  TreePine,
  ArrowUpSquare,
  Bath,
  MapPin,
};

function resolveIcon(iconName?: string): LucideIcon {
  if (!iconName) return MapPin;
  return ICON_REGISTRY[iconName] || MapPin;
}

interface AnnotationBlockProps {
  annotation: AnnotationType;
  cellSize: number;
}

export function AnnotationBlock({ annotation, cellSize }: AnnotationBlockProps) {
  const preset = ANNOTATION_PRESETS[annotation.color] || ANNOTATION_PRESETS.primary;
  const IconComponent = resolveIcon(annotation.iconName);

  return (
    <div
      style={{
        position: 'absolute',
        left: annotation.positionX * cellSize,
        top: annotation.positionY * cellSize,
        width: annotation.positionW * cellSize,
        height: annotation.positionH * cellSize,
        zIndex: 10,
        pointerEvents: 'none',
      }}
      className="border-2 border-dashed flex flex-col items-center justify-center"
    >
      {/* Background */}
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
    </div>
  );
}
