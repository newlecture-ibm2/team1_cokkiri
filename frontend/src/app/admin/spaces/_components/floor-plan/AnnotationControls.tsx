'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import type { FloorAnnotation, AnnotationType } from '../../_types/layout';
import { ANNOTATION_PRESETS } from '../../_types/layout';
import { fetchAnnotationTypes } from '../../_api/spaceAdminApi';

interface AnnotationControlsProps {
  onAddAnnotation: (annotation: FloorAnnotation) => void;
}

export function AnnotationControls({ onAddAnnotation }: AnnotationControlsProps) {
  const [annotationTypes, setAnnotationTypes] = useState<AnnotationType[]>([]);
  const [selectedType, setSelectedType] = useState<AnnotationType | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('primary');
  const [labelText, setLabelText] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAnnotationTypes();
      const types = res.data || [];
      setAnnotationTypes(types);
      if (types.length > 0 && !selectedType) {
        setSelectedType(types[0]);
        setSelectedColor(types[0].defaultColor || 'primary');
      }
    } catch (e) {
      console.error('Failed to load annotation types:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTypeChange = (code: string) => {
    const found = annotationTypes.find((t) => t.code === code);
    if (found) {
      setSelectedType(found);
      setSelectedColor(found.defaultColor || 'primary');
    }
  };

  const handleAdd = () => {
    if (!selectedType) return;
    onAddAnnotation({
      id: crypto.randomUUID(),
      label: labelText || selectedType.name,
      iconType: selectedType.code,
      iconName: selectedType.iconName,
      positionX: 0,
      positionY: 0,
      positionW: 2,
      positionH: 2,
      color: selectedColor,
    });
    setLabelText('');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4 py-2 border-b border-primary/10 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)] w-24">
          요소 추가
        </h3>
        <span className="text-xs opacity-40 animate-pulse">유형 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4 py-2 border-b border-primary/10 mb-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)] w-24">
        요소 추가
      </h3>
      
      <div className="flex items-center gap-2">
        <select
          value={selectedType?.code || ''}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="h-9 px-3 border border-primary/10 rounded-lg text-sm bg-[var(--background)] text-[var(--foreground)] outline-none"
        >
          {annotationTypes.map((t) => (
            <option key={t.code} value={t.code}>
              {t.name} ({t.code})
            </option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="라벨 (선택)"
          value={labelText}
          onChange={(e) => setLabelText(e.target.value)}
          className="h-9 px-3 border border-primary/10 rounded-lg text-sm bg-[var(--background)] text-[var(--foreground)] outline-none w-28"
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

        <Button onClick={handleAdd} size="sm" className="flex items-center gap-1" disabled={!selectedType}>
          <Plus className="w-4 h-4" /> 추가
        </Button>

        <button
          onClick={loadTypes}
          className="p-1.5 rounded-md hover:bg-black/5 transition-colors"
          title="유형 새로고침"
        >
          <RefreshCw className="w-3.5 h-3.5 opacity-40" />
        </button>
      </div>
    </div>
  );
}
