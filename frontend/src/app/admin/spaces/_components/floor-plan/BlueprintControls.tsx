'use client';

import { ChangeEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface BlueprintControlsProps {
  blueprintUrl: string | null;
  blueprintOpacity: number;
  onUpload: (file: File) => void;
  onDelete: () => void;
  onOpacityChange: (opacity: number) => void;
}

export function BlueprintControls({
  blueprintUrl,
  blueprintOpacity,
  onUpload,
  onDelete,
  onOpacityChange,
}: BlueprintControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center gap-4 py-2 border-b border-primary/10 mb-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)] w-24">
        배경 도면
      </h3>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!blueprintUrl ? (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> 도면 업로드
          </Button>
          <span className="text-[10px] opacity-40 tracking-tight">
            권장 비율 3:2 (예: 1200×800px). 비율이 다르면 여백이 생길 수 있습니다.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-6 flex-1">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> 도면 삭제
          </Button>

          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <ImageIcon className="w-4 h-4 text-[var(--foreground)]/50" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={blueprintOpacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="flex-1 w-full h-1 bg-[var(--foreground)]/20 rounded-lg appearance-none cursor-pointer"
              title="투명도 조절"
            />
            <span className="text-xs font-mono w-8 text-right opacity-80">
              {Math.round(blueprintOpacity * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
