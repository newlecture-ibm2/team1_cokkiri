'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2 } from 'lucide-react';
import { updateSpace, deleteSpace, SpaceDTO } from '../_api/spaceAdminApi';

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

  useEffect(() => {
    if (space) {
      setFormData({ ...space });
      setShowDeleteConfirm(false);
    }
  }, [space]);

  if (!isOpen || !space) return null;

  const handleUpdate = async () => {
    if (!space.spaceId) return;
    setIsSubmitting(true);
    try {
      await updateSpace(space.spaceId, formData);
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
            className="bg-[var(--background)] w-full max-w-xl rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tighter">공간 수정</h2>
              <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition">
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
              <div className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] opacity-60">
                {space.type === 'PRIVATE' ? '개인 공간 (PRIVATE)' : '공용 공간 (COMMON)'}
              </div>
            </div>

            {/* 공간명 */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">공간 이름</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none"
                value={formData.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* 상태 */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">상태</label>
              <select
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none"
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
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none"
                  value={formData.floor ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, floor: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">면적 (㎡)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none"
                  value={formData.area ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, area: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* 설명 */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">설명</label>
              <textarea
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none resize-none h-20"
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* PRIVATE 상세 */}
            {space.type === 'PRIVATE' && (
              <div className="mb-4 p-4 bg-black/5 rounded-2xl space-y-3">
                <h3 className="text-sm font-black tracking-tighter mb-2">개인 공간 상세</h3>
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
              <div className="mb-4 p-4 bg-black/5 rounded-2xl space-y-3">
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
                    className="px-4 py-3 rounded-full text-sm font-bold hover:bg-black/10 transition"
                  >
                    취소
                  </button>
                </div>
              )}

              {/* 저장 버튼 */}
              <button
                onClick={handleUpdate}
                disabled={isSubmitting || !formData.name?.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--foreground)] text-[var(--background)] font-black tracking-tighter hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
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
