'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchRoom } from '../_api/roomApi';
import type { RoomDTO } from '../_types';
import { ImageCarousel } from './_components/ImageCarousel';
import { SpecTable } from './_components/SpecTable';
import { AmenityBadges } from './_components/AmenityBadges';
import { ActionFAB } from './_components/ActionFAB';

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  AVAILABLE: { text: '공실', className: 'bg-green-600/80 text-white' },
  OCCUPIED: { text: '사용중', className: 'bg-red-600/80 text-white' },
  MAINTENANCE: { text: '점검중', className: 'bg-yellow-600/80 text-white' },
};

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchRoom(Number(params.id));
        setRoom(res.data);
      } catch (e) {
        console.error(e);
        setError('방 정보를 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  // 로딩 중
  if (loading) {
    return <DetailSkeleton />;
  }

  // 에러 또는 데이터 없음
  if (error || !room) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <p className="text-lg font-bold opacity-50 mb-6">{error || '방을 찾을 수 없습니다'}</p>
        <Link href="/rooms" className="text-sm font-bold text-accent underline underline-offset-4">
          ← 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[room.status] || STATUS_LABELS.AVAILABLE;
  const isPrivate = room.roomTypeId !== undefined && room.roomTypeId !== null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-8 md:py-16 pb-32">
        {/* 뒤로가기 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity tracking-tight"
          >
            <ArrowLeft size={16} />
            목록으로
          </Link>
        </motion.div>

        {/* 이미지 캐러셀 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <ImageCarousel images={room.images} roomName={room.name} />
        </motion.div>

        {/* 제목 + 상태 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-[8vw] md:text-[4vw] lg:text-[3vw] font-black tracking-tighter leading-[0.9]">
              {room.name}
            </h1>
            <span className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.className}`}>
              {statusInfo.text}
            </span>
          </div>
          {room.description && (
            <p className="text-sm font-medium tracking-tight text-balance opacity-60 leading-relaxed">
              {room.description}
            </p>
          )}
        </motion.div>

        {/* 스펙 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <SpecTable room={room} />
        </motion.div>

        {/* 편의시설 배지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AmenityBadges amenities={room.amenities} />
        </motion.div>
      </div>

      {/* FAB */}
      <ActionFAB
        spaceId={room.spaceId}
        status={room.status}
        isPrivate={isPrivate}
      />
    </div>
  );
}

/** 인라인 Skeleton — loading.tsx와 동일하지만 클라이언트 내부 로딩 시 사용 */
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-8 md:py-16 animate-pulse">
        <div className="h-4 w-20 bg-muted rounded-lg mb-6" />
        <div className="h-64 md:h-96 bg-muted rounded-[2rem] mb-8" />
        <div className="h-10 w-48 bg-muted rounded-xl mb-3" />
        <div className="h-4 w-full bg-muted rounded-lg mb-2" />
        <div className="h-4 w-2/3 bg-muted rounded-lg mb-8" />
        <div className="rounded-[2rem] bg-muted/30 border border-border overflow-hidden mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between px-6 py-3.5 border-b border-border last:border-0">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-20 bg-muted rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
