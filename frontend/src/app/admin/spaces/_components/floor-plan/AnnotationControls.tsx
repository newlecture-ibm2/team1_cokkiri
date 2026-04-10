'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FloorAnnotation, ANNOTATION_PRESETS } from '../../_types/layout';

interface AnnotationControlsProps {
  onAddAnnotation: (annotation: FloorAnnotation) => void;
}

export function AnnotationControls({ onAddAnnotation }: AnnotationControlsProps) {
  const [selectedIcon, setSelectedIcon] = useState<FloorAnnotation['iconType']>('DOOR');
  const [selectedColor, setSelectedColor] = useState<string>('primary');
  const [labelText, setLabelText] = useState<string>('');

  const icons: FloorAnnotation['iconType'][] = ['DOOR', 'STAIRS', 'ELEVATOR', 'RESTROOM', 'GARDEN', 'CUSTOM'];

  const handleAdd = () => {
    onAddAnnotation({
      id: crypto.randomUUID(),
      label: labelText || selectedIcon,
      iconType: selectedIcon,
      positionX: 0, // 기본 위치 좌상단
      positionY: 0,
      positionW: 1, // 기본 크기 1x1
      positionH: 1,
      color: selectedColor,
    });
    setLabelText('');
  };

  return (
    <div className="flex flex-wrap items-center gap-4 py-2 border-b border-border mb-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)] w-24">
        요소 추가
      </h3>
      
      <div className="flex items-center gap-2">
        <select
          value={selectedIcon}
          onChange={(e) => setSelectedIcon(e.target.value as FloorAnnotation['iconType'])}
          className="h-9 px-3 border border-border rounded-lg text-sm bg-[var(--background)] text-[var(--foreground)] outline-none"
        >
          {icons.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="라벨 (선택)"
          value={labelText}
          onChange={(e) => setLabelText(e.target.value)}
          className="h-9 px-3 border border-border rounded-lg text-sm bg-[var(--background)] text-[var(--foreground)] outline-none w-28"
          maxLength={10}
        />
        
        <div className="flex items-center gap-1 mx-2">
          {Object.entries(ANNOTATION_PRESETS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedColor(key)}
              className={`w-6 h-6 rounded-full border-2 ${
                selectedColor === key ? 'border-[var(--foreground)]' : 'border-transparent'
              }`}
              style={{ backgroundColor: value.bg, borderColor: selectedColor === key ? 'var(--foreground)' : value.border }}
              title={key}
            />
          ))}
        </div>

        <Button onClick={handleAdd} size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> 추가
        </Button>
      </div>
    </div>
  );
}
