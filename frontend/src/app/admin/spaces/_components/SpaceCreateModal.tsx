'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';
import { createSpace, uploadSpaceImage, fetchRoomTypes, SpaceDTO, RoomTypeDTO } from '../_api/spaceAdminApi';

export default function SpaceCreateModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [formData, setFormData] = useState<Partial<SpaceDTO>>({
    type: 'PRIVATE',
    status: 'AVAILABLE',
    amenities: [],
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchRoomTypes()
        .then((res) => setRoomTypes(res.data || []))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), amenityInput.trim()],
      });
      setAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities?.filter((_, i) => i !== index),
    });
  };

  const submit = async () => {
    try {
      setIsSubmitting(true);
      // 1. 공간 데이터 생성
      const result = await createSpace(formData as SpaceDTO);
      const spaceId = result.data.spaceId;

      // 2. 이미지 모아서 전송
      for (const [idx, file] of files.entries()) {
        await uploadSpaceImage(spaceId, file, idx === 0);
      }

      onCreated();
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('생성에 실패했습니다: ' + e.message);
      } else {
        alert('생성에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[var(--background)] text-[var(--foreground)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl space-y-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black tracking-tighter">새로운 공간 등록</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 flex-1 gap-4">
            {/* 기본 정보 */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold mb-2">공간 이름</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none border border-transparent focus:border-[var(--color-accent)] transition"
                placeholder="예: 301호"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold mb-2">유형</label>
              <select
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PRIVATE' | 'COMMON' })}
                value={formData.type}
              >
                <option value="PRIVATE">개인 공간 (PRIVATE)</option>
                <option value="COMMON">공용 시설 (COMMON)</option>
              </select>
            </div>

            {/* 방 유형 (PRIVATE만) */}
            {formData.type === 'PRIVATE' && roomTypes.length > 0 && (
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-bold mb-2">방 유형</label>
                <select
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none border border-transparent focus:border-[var(--color-accent)] transition"
                  value={formData.roomTypeId || ''}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="">유형 선택</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.roomTypeId} value={rt.roomTypeId}>{rt.name} ({rt.code})</option>
                  ))}
                </select>
              </div>
            )}

            {/* 예약 가능 여부 (COMMON만) */}
            {formData.type === 'COMMON' && (
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-bold mb-2">예약 가능 여부</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isReservable: !formData.isReservable })}
                  className={`w-full px-4 py-3 rounded-2xl font-bold tracking-tight transition-all duration-300 border ${
                    formData.isReservable
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                      : 'bg-[var(--color-muted)] text-[var(--foreground)]/60 border-transparent'
                  }`}
                >
                  {formData.isReservable ? '✓ 예약제 (시설 예약 필요)' : '자유 이용 (예약 불필요)'}
                </button>
              </div>
            )}
            <div className="col-span-1">
              <label className="block text-sm font-bold mb-2">해당 층</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] outline-none"
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-bold mb-2">면적 (㎡)</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] outline-none"
                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2">옵션 / 부대시설 (어메니티)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAmenity()}
                  className="flex-1 px-4 py-2 rounded-2xl bg-[var(--color-muted)] outline-none"
                  placeholder="예: 에어컨 (입력 후 엔터)"
                />
                <button onClick={addAmenity} className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-2xl font-bold">
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities?.map((am, i) => (
                  <span key={i} className="flex items-center gap-1 bg-black/10 px-3 py-1 rounded-full text-sm font-bold tracking-tight">
                    {am} <button onClick={() => removeAmenity(i)}><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="col-span-2 border-t border-[var(--color-border)] pt-4 mt-2">
              <label className="block text-sm font-bold mb-2">이미지 업로드 (드래그 앤 드롭)</label>
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-[var(--color-border)] rounded-3xl flex flex-col items-center justify-center text-[var(--color-secondary)] hover:bg-black/5 transition cursor-pointer"
              >
                <UploadCloud size={32} className="mb-2" />
                <p className="text-sm font-bold tracking-tighter cursor-pointer">사진을 이곳에 놓거나 클릭하세요</p>
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>
              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {files.map((f, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-2xl bg-black/10 flex items-center justify-center overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="absolute bg-red-500 text-white p-1 rounded-full top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={submit}
              disabled={isSubmitting || !formData.name}
              className="group relative px-6 py-3 rounded-2xl text-[var(--background)] bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 font-black tracking-tighter disabled:opacity-50 transition overflow-hidden"
            >
               {isSubmitting ? '진행 중...' : '공간 등록 완료'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
