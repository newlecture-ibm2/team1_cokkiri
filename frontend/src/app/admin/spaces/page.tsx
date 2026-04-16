'use client';

import React, { useEffect, useState } from 'react';
import { fetchSpaces, SpaceDTO } from './_api/spaceAdminApi';
import SpaceCreateModal from './_components/SpaceCreateModal';
import SpaceEditModal from './_components/SpaceEditModal';
import RoomTypeManager from './_components/RoomTypeManager';
import PriceRangeManager from './_components/PriceRangeManager';
import AnnotationTypeManager from './_components/AnnotationTypeManager';
import { FloorPlanEditor } from './_components/floor-plan/FloorPlanEditor';
import { motion } from 'framer-motion';
import { Plus, Pencil, LayoutGrid, Tag, Map, Shapes, ArrowUpDown, Check, CircleDollarSign } from 'lucide-react';

type Tab = 'spaces' | 'room-types' | 'price-ranges' | 'floor-plan' | 'annotation-types';

export default function SpacesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('spaces');
  const [spaces, setSpaces] = useState<SpaceDTO[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<SpaceDTO | null>(null);

  // 필터 상태
  const [filterType, setFilterType] = useState<'ALL' | 'PRIVATE' | 'COMMON'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED'>('ALL');
  const [sortOption, setSortOption] = useState('name,asc');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 정렬 드롭다운 닫기
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadSpaces = async () => {
    try {
      const res = await fetchSpaces({ type: filterType, status: filterStatus, sort: sortOption });
      setSpaces(res.data?.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSpaces();
  }, [filterType, filterStatus, sortOption]);

  const getStatusDisplay = (space: SpaceDTO) => {
    if (space.type === 'PRIVATE') {
      return {
        AVAILABLE: { text: '계약 가능', color: 'bg-green-500' },
        OCCUPIED: { text: '입주 중', color: 'bg-blue-500' },
        MAINTENANCE: { text: '점검 중', color: 'bg-yellow-500' },
      }[space.status] || { text: space.status, color: 'bg-gray-500' };
    }
    return {
      AVAILABLE: { text: '이용 가능', color: 'bg-green-500' },
      OCCUPIED: { text: '사용 중', color: 'bg-blue-500' },
      MAINTENANCE: { text: '점검 중', color: 'bg-yellow-500' },
    }[space.status] || { text: space.status, color: 'bg-gray-500' };
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'spaces', label: '공간 관리', icon: <LayoutGrid size={16} /> },
    { key: 'room-types', label: '방 유형 관리', icon: <Tag size={16} /> },
    { key: 'price-ranges', label: '가격대 관리', icon: <CircleDollarSign size={16} /> },
    { key: 'floor-plan', label: '배치 관리', icon: <Map size={16} /> },
    { key: 'annotation-types', label: '배치 요소 관리', icon: <Shapes size={16} /> },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* 헤더 + 탭 */}
      <header className="mb-12">
        <div className="flex flex-col gap-6">
          <div className="border-b border-primary/10 pb-8 space-y-4">
            <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Admin · Spaces</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                ADMIN <span className="underline underline-offset-4 decoration-accent">SPACES.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">공간 관리</span>
              </h1>
              {activeTab === 'spaces' && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-black tracking-tight hover:scale-105 transition shadow-lg w-fit h-12"
                >
                  <Plus size={18} />
                  <span>새 공간 생성</span>
                </button>
              )}
            </div>
            <p className="font-medium tracking-tight text-foreground/70 text-sm md:text-base">
              시설 내 모든 공간(개인/공용)의 정보를 등록하고 관리하며, 도면 배치 및 유형 설정을 수행합니다.
            </p>
          </div>
        </div>
      </header>

      {/* 탭 전환 */}
      <div className="flex gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold tracking-tight transition-all duration-200
              ${activeTab === tab.key
                ? 'bg-[var(--foreground)] text-[var(--background)] shadow-lg'
                : 'bg-black/5 hover:bg-black/10'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 공간 관리 탭 */}
      {activeTab === 'spaces' && (
        <>
          {/* 타입 필터 칩 */}
          <div className="flex gap-2 mb-6">
            {['ALL', 'PRIVATE', 'COMMON'].map((type) => (
              <button
                key={type}
                onClick={() => { setFilterType(type as any); if (type !== 'PRIVATE') setFilterStatus('ALL'); }}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all
                  ${filterType === type 
                    ? 'bg-[var(--color-accent)] text-white shadow-md' 
                    : 'bg-black/5 text-foreground hover:bg-black/10'
                  }`}
              >
                {type === 'ALL' ? '전체 보기' : type}
              </button>
            ))}
          </div>

          {/* 상태 필터 칩 (PRIVATE 선택 시에만 노출) */}
          {filterType === 'PRIVATE' && (
          <div className="flex gap-2 mb-6">
            {(['ALL', 'AVAILABLE', 'OCCUPIED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all
                  ${filterStatus === st
                    ? 'bg-[var(--foreground)] text-[var(--background)] shadow-md'
                    : 'bg-black/5 text-foreground hover:bg-black/10'
                  }`}
              >
                {st === 'ALL' ? '전체' : st === 'AVAILABLE' ? '입주 가능' : '입주 중'}
              </button>
            ))}
          </div>
          )}


          {/* 정렬 드롭다운 */}
          <div ref={sortRef} className="relative inline-block mb-6">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-tight bg-black/5 hover:bg-black/10 transition"
            >
              <ArrowUpDown size={14} />
              {sortOption === 'name,asc' ? '이름순 (ㄱ→ㅎ)' : sortOption === 'name,desc' ? '이름순 (ㅎ→ㄱ)' : '최신 등록순'}
            </button>
            {isSortOpen && (
              <div className="absolute left-0 top-full mt-2 w-44 bg-[var(--background)] border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                {[
                  { value: 'name,asc', label: '이름순 (ㄱ→ㅎ)' },
                  { value: 'name,desc', label: '이름순 (ㅎ→ㄱ)' },
                  { value: 'spaceId,desc', label: '최신 등록순' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortOption(opt.value); setIsSortOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold tracking-tight hover:bg-black/5 transition cursor-pointer ${
                      sortOption === opt.value ? 'text-[var(--color-accent)]' : ''
                    }`}
                  >
                    {opt.label}
                    {sortOption === opt.value && <Check size={14} className="text-[var(--color-accent)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {spaces.map((space: SpaceDTO, idx: number) => {
            const status = getStatusDisplay(space);
            const thumbnailUrl = space.images?.find(img => img.isThumbnail)?.imageUrl || space.images?.[0]?.imageUrl;
            return (
              <motion.div 
                key={space.spaceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="group relative bg-black/5 p-6 rounded-[2rem] hover:bg-black/10 transition cursor-pointer"
                onClick={() => setEditingSpace(space)}
              >
                {/* 수정 아이콘 (hover 시 표출) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                  <div className="p-2 bg-[var(--foreground)] text-[var(--background)] rounded-full">
                    <Pencil size={14} />
                  </div>
                </div>

                <div className="flex justify-between items-start mb-4 pr-10">
                  <h3 className="text-3xl font-black tracking-tighter">{space.name}</h3>
                  <span className="px-3 py-1 bg-[var(--color-accent)] text-white text-xs font-bold rounded-full shrink-0">
                    {space.type}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${status.color}`} />
                  <p className="text-sm font-bold opacity-70">{status.text}</p>
                </div>

                {space.floor && (
                  <p className="text-xs font-bold opacity-50">{space.floor}층 · {space.area ? `${space.area}㎡` : ''}</p>
                )}

                {/* roomTypeName 표시 */}
                {space.roomTypeName && (
                  <p className="mt-1 text-xs font-bold text-[var(--color-accent)]">{space.roomTypeName}</p>
                )}

                {thumbnailUrl ? (
                  <div className="mt-4 w-full h-32 rounded-2xl overflow-hidden bg-black/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailUrl} alt={space.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="mt-4 w-full h-32 rounded-2xl bg-black/10 flex items-center justify-center font-bold tracking-tighter text-black/30">
                    NO IMAGE
                  </div>
                )}
              </motion.div>
            );
          })}
          </div>
        </>
      )}

      {/* 방 유형 관리 탭 */}
      {activeTab === 'room-types' && (
        <RoomTypeManager />
      )}

      {/* 가격대 관리 탭 */}
      {activeTab === 'price-ranges' && (
        <PriceRangeManager />
      )}

      {/* 배치 관리 탭 */}
      {activeTab === 'floor-plan' && (
        <FloorPlanEditor />
      )}

      {/* 배치 요소 관리 탭 */}
      {activeTab === 'annotation-types' && (
        <AnnotationTypeManager />
      )}

      {/* 생성 모달 */}
      <SpaceCreateModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreated={loadSpaces} 
      />

      {/* 수정 모달 */}
      <SpaceEditModal
        isOpen={editingSpace !== null}
        space={editingSpace}
        onClose={() => setEditingSpace(null)}
        onUpdated={loadSpaces}
      />
    </div>
  );
}
