'use client';

import { useEffect, useState } from 'react';
import { fetchSpaces, SpaceDTO } from './_api/spaceAdminApi';
import SpaceCreateModal from './_components/SpaceCreateModal';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<SpaceDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSpaces = async () => {
    try {
      const res = await fetchSpaces();
      setSpaces(res.data?.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSpaces();
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] p-12 lg:p-24">
      <div className="flex items-end justify-between mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="text-[12vw] md:text-[8vw] lg:text-[5vw] font-black tracking-tighter leading-[0.85] uppercase"
          >
            SPACES
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="mt-4 text-[var(--color-secondary)] font-bold tracking-tight text-lg"
          >
            공간(Space) 리스트 및 생성
          </motion.p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-6 py-4 rounded-full font-black tracking-tighter hover:scale-105 transition shadow-xl"
        >
          <Plus />
          <span className="hidden sm:inline">새 공간 생성</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {spaces.map((space: SpaceDTO, idx: number) => (
          <motion.div 
            key={space.spaceId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * idx }}
            className="bg-black/5 p-6 rounded-[2rem] hover:bg-black/10 transition cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-3xl font-black tracking-tighter">{space.name}</h3>
              <span className="px-3 py-1 bg-[var(--color-accent)] text-white text-xs font-bold rounded-full">
                {space.type}
              </span>
            </div>
            <p className="text-sm font-bold opacity-70 mb-2">상태: {space.status}</p>
            {space.images && space.images.length > 0 ? (
              <div className="mt-4 w-full h-32 rounded-2xl overflow-hidden bg-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={space.images[0].imageUrl} alt={space.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="mt-4 w-full h-32 rounded-2xl bg-black/10 flex items-center justify-center font-bold tracking-tighter text-black/30">
                NO IMAGE
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <SpaceCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={loadSpaces} 
      />
    </div>
  );
}
