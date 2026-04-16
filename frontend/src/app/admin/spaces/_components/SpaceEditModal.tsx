'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, UploadCloud } from 'lucide-react';
import { updateSpace, deleteSpace, deleteSpaceImage, uploadSpaceImage, fetchRoomTypes, SpaceDTO, RoomTypeDTO } from '../_api/spaceAdminApi';

interface SpaceEditModalProps {
  isOpen: boolean;
  space: SpaceDTO | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function SpaceEditModal({ isOpen, space, onClose, onUpdated }: SpaceEditModalProps) {
  const [formData, setFormData] = useState<Partial<SpaceDTO>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (space) {
      setFormData({ ...space });
      setShowDeleteConfirm(false);
      setNewFiles([]);
      setAmenityInput('');
    }
  }, [space]);

  useEffect(() => {
    if (isOpen) {
      fetchRoomTypes()
        .then((res) => setRoomTypes(res.data || []))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !space) return null;

  const handleUpdate = async () => {
    if (!space.spaceId) return;
    
    if (!formData.name?.trim()) {
      alert('공간 이름을 입력해 주세요.');
      return;
    }
    if (formData.type === 'PRIVATE' && !formData.roomTypeId) {
      alert('방 유형을 선택해 주세요. (등록된 방 유형이 없다면 방 유형 관리 메뉴에서 먼저 생성해야 합니다.)');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSpace(space.spaceId, formData);

      for (const [idx, file] of newFiles.entries()) {
        await uploadSpaceImage(space.spaceId, file, !formData.images?.length && idx === 0);
      }

      onUpdated();
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('수정에 실패했습니다: ' + e.message);
      } else {
        alert('수정에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveExistingImage = async (imageId?: number) => {
    if (!space?.spaceId || !imageId) return;
    if (confirm('이 이미지를 즉시 삭제하시겠습니까?')) {
      try {
        await deleteSpaceImage(space.spaceId, imageId);
        setFormData(prev => ({
          ...prev,
          images: prev.images?.filter(img => img.spaceImageId !== imageId)
        }));
      } catch (e) {
        alert('이미지 삭제에 실패했습니다.');
      }
    }
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

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) setNewFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!space.spaceId) return;
    setIsDeleting(true);
    try {
      await deleteSpace(space.spaceId);
      onUpdated();
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('삭제에 실패했습니다: ' + e.message);
      } else {
        alert('삭제에 실패했습니다.');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isOccupied = space.status === 'OCCUPIED';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-xl rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tighter">공간 수정</h2>
              <button onClick={onClose} className="p-2 hover:bg-primary/[0.05] rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* OCCUPIED 경고 */}
            {isOccupied && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold">
                ⚠️ 입주 중인 공간입니다. 상태 변경 및 삭제가 제한됩니다.
              </div>
            )}

            {/* 유형 (읽기 전용) */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">유형 (변경 불가)</label>
              <div className="w-full px-4 py-3 rounded-2xl bg-primary/[0.05] text-primary opacity-60">
                {space.type === 'PRIVATE' ? '개인 공간 (PRIVATE)' : '공용 공간 (COMMON)'}
              </div>
            </div>

            {/* 예약 가능 여부 (COMMON만) */}
            {space.type === 'COMMON' && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">예약 가능 여부</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isReservable: !formData.isReservable })}
                  className={`w-full px-4 py-3 rounded-2xl font-bold tracking-tight transition-all duration-300 border ${formData.isReservable
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                      : 'bg-primary/[0.05] text-primary/60 border-transparent'
                    }`}
                >
                  {formData.isReservable ? '✓ 예약제 (시설 예약 필요)' : '자유 이용 (예약 불필요)'}
                </button>
              </div>
            )}

            {/* 공간명 */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">공간 이름</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-2xl bg-primary/[0.05] text-primary outline-none"
                value={formData.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* 상태 */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">상태</label>
              <select
                className="w-full px-4 py-3 rounded-2xl bg-primary/[0.05] text-primary outline-none"
                value={formData.status || 'AVAILABLE'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, status: e.target.value as 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' })}
                disabled={isOccupied}
              >
                <option value="AVAILABLE">이용 가능 (AVAILABLE)</option>
                <option value="OCCUPIED">사용 중 (OCCUPIED)</option>
                <option value="MAINTENANCE">점검 중 (MAINTENANCE)</option>
              </select>
            </div>

            {/* 층수 & 면적 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2">층수</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-2xl bg-primary/[0.05] text-primary outline-none"
                  value={formData.floor ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, floor: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">면적 (㎡)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-2xl bg-primary/[0.05] text-primary outline-none"
                  value={formData.area ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, area: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* 설명 */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">설명</label>
              <textarea
                className="w-full px-4 py-3 rounded-2xl bg-primary/[0.05] text-primary outline-none resize-none h-20"
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* 옵션 / 부대시설 */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">옵션 / 부대시설 (어메니티)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAmenity()}
                  className="flex-1 px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none"
                  placeholder="예: 에어컨 (입력 후 엔터)"
                />
                <button type="button" onClick={addAmenity} className="px-4 py-3 bg-[var(--color-accent)] text-white rounded-2xl font-bold">
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities?.map((am, i) => (
                  <span key={i} className="flex items-center gap-1 bg-primary/[0.08] px-3 py-1 rounded-full text-sm font-bold tracking-tight">
                    {am} <button type="button" onClick={() => removeAmenity(i)}><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* PRIVATE 상세 */}
            {space.type === 'PRIVATE' && (
              <div className="mb-4 p-4 bg-primary/[0.03] rounded-2xl space-y-3">
                <h3 className="text-sm font-black tracking-tighter mb-2">개인 공간 상세</h3>
                {/* 방 유형 드롭다운 */}
                {roomTypes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold mb-1">방 유형</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl bg-[var(--color-muted)] text-sm outline-none"
                      value={formData.roomTypeId || ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, roomTypeId: e.target.value ? Number(e.target.value) : undefined })}
                    >
                      <option value="">유형 선택</option>
                      {roomTypes.map((rt) => (
                        <option key={rt.roomTypeId} value={rt.roomTypeId}>{rt.name} ({rt.code})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">보증금</label>
                    <input type="number" className="w-full px-3 py-2 rounded-xl bg-[var(--color-muted)] text-sm outline-none" value={formData.deposit ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, deposit: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">월세</label>
                    <input type="number" className="w-full px-3 py-2 rounded-xl bg-[var(--color-muted)] text-sm outline-none" value={formData.monthlyRent ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, monthlyRent: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">관리비</label>
                    <input type="number" className="w-full px-3 py-2 rounded-xl bg-[var(--color-muted)] text-sm outline-none" value={formData.maintenanceFee ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maintenanceFee: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">방 수</label>
                    <input type="number" className="w-full px-3 py-2 rounded-xl bg-[var(--color-muted)] text-sm outline-none" value={formData.roomCount ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, roomCount: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                </div>
              </div>
            )}

            {/* COMMON 상세 */}
            {space.type === 'COMMON' && (
              <div className="mb-4 p-4 bg-primary/[0.03] rounded-2xl space-y-3">
                <h3 className="text-sm font-black tracking-tighter mb-2">공용 공간 상세</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">최대 수용 인원</label>
                    <input type="number" className="w-full px-3 py-2 rounded-xl bg-[var(--color-muted)] text-sm outline-none" value={formData.maxCapacity ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxCapacity: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">이용 요금</label>
                    <input type="number" className="w-full px-3 py-2 rounded-xl bg-[var(--color-muted)] text-sm outline-none" value={formData.usageFee ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, usageFee: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">운영 시간</label>
                    <input type="text" className="w-full px-3 py-2 rounded-xl bg-[var(--color-muted)] text-sm outline-none" value={formData.operatingHours ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, operatingHours: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* 이미지 관리 */}
            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <label className="block text-sm font-bold mb-2">이미지 관리</label>

              {/* 기존 이미지 */}
              {formData.images && formData.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold mb-2 opacity-60">기존 업로드된 이미지 (삭제 시 즉시 반영됩니다)</p>
                  <div className="flex flex-wrap gap-3">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-2xl bg-primary/[0.08] flex items-center justify-center overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.imageUrl} alt="Space image" className="w-full h-full object-cover" />
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveExistingImage(img.spaceImageId); }} className="absolute bg-red-500 text-white p-1 rounded-full top-1 right-1 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                          <X size={12} />
                        </button>
                        {img.isThumbnail && (
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded">대표</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 새 이미지 드래그앤드롭 업로드 */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center text-primary/40 hover:bg-primary/[0.03] transition cursor-pointer mb-4"
              >
                <UploadCloud size={32} className="mb-2" />
                <p className="text-sm font-bold tracking-tighter cursor-pointer">여기를 클릭하거나 파일을 끌어다 놓아 새 이미지를 추가하세요</p>
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>

              {/* 새 이미지 미리보기 */}
              {newFiles.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {newFiles.map((f, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-2xl bg-black/10 flex items-center justify-center overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); removeNewFile(i); }} className="absolute bg-red-500 text-white p-1 rounded-full top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 영역 */}
            <div className="flex items-center justify-between mt-6 gap-3">
              {/* 삭제 버튼 */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isOccupied}
                  className="flex items-center gap-2 px-5 py-3 rounded-full text-red-500 border border-red-200 font-bold text-sm hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  삭제
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-5 py-3 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {isDeleting ? '삭제 중...' : '정말 삭제'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-3 rounded-full text-sm font-bold hover:bg-primary/[0.05] transition"
                  >
                    취소
                  </button>
                </div>
              )}

              {/* 저장 버튼 */}
              <button
                onClick={handleUpdate}
                disabled={isSubmitting || !formData.name?.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-black tracking-tighter hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                <Save size={16} />
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
