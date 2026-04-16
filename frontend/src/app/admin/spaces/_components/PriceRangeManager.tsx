'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, GripVertical, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  fetchAdminPriceRanges,
  createPriceRange,
  updatePriceRange,
  deletePriceRange,
  updatePriceRangeOrder,
  PriceRangePresetDTO,
} from '../_api/spaceAdminApi';

export default function PriceRangeManager() {
  const [priceRanges, setPriceRanges] = useState<PriceRangePresetDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // 등록 폼
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMinRent, setNewMinRent] = useState<number | ''>('');
  const [newMaxRent, setNewMaxRent] = useState<number | ''>('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // 수정
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editMinRent, setEditMinRent] = useState<number | ''>('');
  const [editMaxRent, setEditMaxRent] = useState<number | ''>('');
  const [editIsActive, setEditIsActive] = useState(true);

  // 삭제 확인
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 순서 저장 상태
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);

  const loadPriceRanges = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAdminPriceRanges();
      setPriceRanges(res.data || []);
      setOrderChanged(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPriceRanges();
  }, [loadPriceRanges]);

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    setIsCreating(true);
    try {
      await createPriceRange({ 
        label: newLabel.trim(), 
        minRent: newMinRent === '' ? null : newMinRent,
        maxRent: newMaxRent === '' ? null : newMaxRent,
        isActive: newIsActive
      });
      setNewLabel('');
      setNewMinRent('');
      setNewMaxRent('');
      setNewIsActive(true);
      setShowCreateForm(false);
      await loadPriceRanges();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '등록에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editLabel.trim()) return;
    try {
      await updatePriceRange(id, { 
        label: editLabel.trim(),
        minRent: editMinRent === '' ? null : editMinRent,
        maxRent: editMaxRent === '' ? null : editMaxRent,
        isActive: editIsActive
      });
      setEditingId(null);
      await loadPriceRanges();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '수정에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePriceRange(id);
      setDeletingId(null);
      await loadPriceRanges();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    }
  };

  const startEdit = (pr: PriceRangePresetDTO) => {
    setEditingId(pr.priceRangePresetId);
    setEditLabel(pr.label);
    setEditMinRent(pr.minRent ?? '');
    setEditMaxRent(pr.maxRent ?? '');
    setEditIsActive(pr.isActive);
    setDeletingId(null);
  };

  // === D&D 핸들러 ===
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reordered = Array.from(priceRanges);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setPriceRanges(reordered);
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const orderedIds = priceRanges.map((pr) => pr.priceRangePresetId);
      await updatePriceRangeOrder(orderedIds);
      setOrderChanged(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '순서 저장에 실패했습니다.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-bold opacity-50 tracking-tight">
            드래그하여 순서를 변경하고, 저장 버튼을 눌러 반영하세요.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 순서 저장 버튼 */}
          <AnimatePresence>
            {orderChanged && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleSaveOrder}
                disabled={isSavingOrder}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full font-black tracking-tighter hover:scale-105 transition shadow-xl text-sm disabled:opacity-50"
              >
                <Check size={16} />
                {isSavingOrder ? '저장 중...' : '순서 저장'}
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={() => { setShowCreateForm(true); setEditingId(null); setDeletingId(null); }}
            className="flex items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-5 py-3 rounded-full font-black tracking-tighter hover:scale-105 transition shadow-xl text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">가격대 추가</span>
          </button>
        </div>
      </div>

      {/* 등록 폼 */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-6 bg-black/5 rounded-[2rem] space-y-4">
              <h3 className="text-sm font-black tracking-tighter">새 가격대 등록</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-60">라벨 (표시 이름)</label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="예: ~ 50만 원"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-60">최소 월세 (숫자)</label>
                  <input
                    type="number"
                    value={newMinRent}
                    onChange={(e) => setNewMinRent(e.target.value ? Number(e.target.value) : '')}
                    placeholder="제한 없음"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-60">최대 월세 (숫자)</label>
                  <input
                    type="number"
                    value={newMaxRent}
                    onChange={(e) => setNewMaxRent(e.target.value ? Number(e.target.value) : '')}
                    placeholder="제한 없음"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none text-sm font-bold"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <label className="text-xs font-bold opacity-60">활성화</label>
                  <button onClick={() => setNewIsActive(!newIsActive)}>
                    {newIsActive ? <ToggleRight className="text-[var(--color-accent)]" size={32} /> : <ToggleLeft className="opacity-30" size={32} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowCreateForm(false); setNewLabel(''); setNewMinRent(''); setNewMaxRent(''); setNewIsActive(true); }}
                  className="px-4 py-2 rounded-full text-sm font-bold hover:bg-black/10 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !newLabel.trim()}
                  className="px-5 py-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-bold hover:scale-105 transition disabled:opacity-50"
                >
                  {isCreating ? '등록 중...' : '등록'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 목록 (D&D) */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-black/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : priceRanges.length === 0 ? (
        <div className="text-center py-20 opacity-40">
          <p className="text-lg font-black tracking-tighter">등록된 가격대 프리셋이 없습니다</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="price-ranges">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-3"
              >
                {priceRanges.map((pr, idx) => (
                  <Draggable
                    key={pr.priceRangePresetId}
                    draggableId={String(pr.priceRangePresetId)}
                    index={idx}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-5 bg-black/5 rounded-2xl hover:bg-black/10 transition group ${
                          snapshot.isDragging ? 'shadow-2xl ring-2 ring-[var(--color-accent)] bg-[var(--background)]' : ''
                        }`}
                      >
                        {/* 드래그 핸들 */}
                        <div
                          {...provided.dragHandleProps}
                          className="mr-3 cursor-grab active:cursor-grabbing p-1 hover:bg-black/10 rounded-lg transition opacity-40 hover:opacity-100"
                          title="드래그하여 순서 변경"
                        >
                          <GripVertical size={16} />
                        </div>

                        <div className="flex items-center gap-4 flex-1">
                          {/* 활성화 상태 배지 */}
                          <span className={`px-2 py-1 text-[10px] font-black rounded-full tracking-wider ${pr.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                            {pr.isActive ? 'ON' : 'OFF'}
                          </span>

                          {/* 이름 (수정 모드 / 표시 모드) */}
                          {editingId === pr.priceRangePresetId ? (
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                              <input
                                type="text"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                placeholder="라벨"
                                className="px-3 py-1.5 rounded-xl bg-[var(--color-muted)] outline-none text-sm font-bold w-32"
                              />
                              <input
                                type="number"
                                value={editMinRent}
                                onChange={(e) => setEditMinRent(e.target.value ? Number(e.target.value) : '')}
                                placeholder="최소"
                                className="px-3 py-1.5 rounded-xl bg-[var(--color-muted)] outline-none text-sm font-bold w-24"
                              />
                              <span className="font-bold opacity-50">~</span>
                              <input
                                type="number"
                                value={editMaxRent}
                                onChange={(e) => setEditMaxRent(e.target.value ? Number(e.target.value) : '')}
                                placeholder="최대"
                                className="px-3 py-1.5 rounded-xl bg-[var(--color-muted)] outline-none text-sm font-bold w-24"
                              />
                              <button onClick={() => setEditIsActive(!editIsActive)} className="ml-2">
                                {editIsActive ? <ToggleRight className="text-[var(--color-accent)]" size={24} /> : <ToggleLeft className="opacity-30" size={24} />}
                              </button>
                              
                              <button
                                onClick={() => handleUpdate(pr.priceRangePresetId)}
                                className="ml-2 p-1.5 bg-green-500 text-white rounded-full hover:scale-110 transition"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 hover:bg-black/10 rounded-full transition"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-sm font-bold tracking-tight">{pr.label}</span>
                              <span className="text-[10px] font-bold opacity-50">
                                {pr.minRent ? `${pr.minRent.toLocaleString()}원` : '제한 없음'} 
                                {' ~ '} 
                                {pr.maxRent ? `${pr.maxRent.toLocaleString()}원` : '제한 없음'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 액션 버튼 */}
                        {editingId !== pr.priceRangePresetId && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => startEdit(pr)}
                              className="p-2 hover:bg-black/10 rounded-full transition"
                              title="수정"
                            >
                              <Pencil size={14} />
                            </button>
                            {deletingId === pr.priceRangePresetId ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(pr.priceRangePresetId)}
                                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full hover:bg-red-600 transition"
                                  >
                                    확인
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="px-3 py-1.5 text-xs font-bold hover:bg-black/10 rounded-full transition"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setDeletingId(pr.priceRangePresetId); setEditingId(null); }}
                                  className="p-2 hover:bg-red-100 text-red-500 rounded-full transition"
                                  title="삭제"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
