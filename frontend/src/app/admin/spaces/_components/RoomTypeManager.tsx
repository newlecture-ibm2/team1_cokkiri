'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, Shield } from 'lucide-react';
import {
  fetchRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  RoomTypeDTO,
} from '../_api/spaceAdminApi';

export default function RoomTypeManager() {
  const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // 등록 폼
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 수정
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // 삭제 확인
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      const res = await fetchRoomTypes();
      setRoomTypes(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const handleCreate = async () => {
    if (!newCode.trim() || !newName.trim()) return;
    setIsCreating(true);
    try {
      await createRoomType({ code: newCode.trim().toUpperCase(), name: newName.trim() });
      setNewCode('');
      setNewName('');
      setShowCreateForm(false);
      await loadRoomTypes();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '등록에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (roomTypeId: number) => {
    if (!editName.trim()) return;
    try {
      await updateRoomType(roomTypeId, { name: editName.trim() });
      setEditingId(null);
      await loadRoomTypes();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '수정에 실패했습니다.');
    }
  };

  const handleDelete = async (roomTypeId: number) => {
    try {
      await deleteRoomType(roomTypeId);
      setDeletingId(null);
      await loadRoomTypes();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    }
  };

  const startEdit = (rt: RoomTypeDTO) => {
    setEditingId(rt.roomTypeId);
    setEditName(rt.name);
    setDeletingId(null);
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-bold opacity-50 tracking-tight">
            관리자가 방 유형을 자유롭게 등록·수정·삭제할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => { setShowCreateForm(true); setEditingId(null); setDeletingId(null); }}
          className="flex items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-5 py-3 rounded-full font-black tracking-tighter hover:scale-105 transition shadow-xl text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">유형 추가</span>
        </button>
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
              <h3 className="text-sm font-black tracking-tighter">새 방 유형 등록</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-60">코드 (영문 대문자)</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="예: PREMIUM"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-60">표시 이름</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="예: 프리미엄"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-muted)] text-[var(--foreground)] outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowCreateForm(false); setNewCode(''); setNewName(''); }}
                  className="px-4 py-2 rounded-full text-sm font-bold hover:bg-black/10 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !newCode.trim() || !newName.trim()}
                  className="px-5 py-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-bold hover:scale-105 transition disabled:opacity-50"
                >
                  {isCreating ? '등록 중...' : '등록'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-black/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : roomTypes.length === 0 ? (
        <div className="text-center py-20 opacity-40">
          <p className="text-lg font-black tracking-tighter">등록된 방 유형이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roomTypes.map((rt, idx) => (
            <motion.div
              key={rt.roomTypeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * idx }}
              className="flex items-center justify-between p-5 bg-black/5 rounded-2xl hover:bg-black/10 transition group"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* 코드 뱃지 */}
                <span className="px-3 py-1 bg-[var(--color-accent)] text-white text-xs font-black rounded-full tracking-wider">
                  {rt.code}
                </span>

                {/* 이름 (수정 모드 / 표시 모드) */}
                {editingId === rt.roomTypeId ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(rt.roomTypeId)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--color-muted)] outline-none text-sm font-bold flex-1 max-w-[200px]"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(rt.roomTypeId)}
                      className="p-1.5 bg-green-500 text-white rounded-full hover:scale-110 transition"
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
                  <span className="text-sm font-bold tracking-tight">{rt.name}</span>
                )}

                {/* 시스템 기본 뱃지 */}
                {rt.isSystemDefault && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full">
                    <Shield size={10} />
                    기본
                  </span>
                )}
              </div>

              {/* 액션 버튼 */}
              {editingId !== rt.roomTypeId && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => startEdit(rt)}
                    className="p-2 hover:bg-black/10 rounded-full transition"
                    title="수정"
                  >
                    <Pencil size={14} />
                  </button>
                  {!rt.isSystemDefault && (
                    deletingId === rt.roomTypeId ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(rt.roomTypeId)}
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
                        onClick={() => { setDeletingId(rt.roomTypeId); setEditingId(null); }}
                        className="p-2 hover:bg-red-100 text-red-500 rounded-full transition"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    )
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
