'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, CalendarCheck } from 'lucide-react';

interface ActionFABProps {
  spaceId: number;
  status: string;
  /** PRIVATE 방이면 "계약", 나머지(COMMON)는 "예약" */
  isPrivate: boolean;
}

export function ActionFAB({ spaceId, status, isPrivate }: ActionFABProps) {
  // AVAILABLE이 아니면 비활성
  const isAvailable = status === 'AVAILABLE';

  const label = isPrivate ? '계약 시작하기' : '이 시설 예약하기';
  const href = isPrivate ? `/contracts?spaceId=${spaceId}` : `/reservations?spaceId=${spaceId}`;
  const Icon = isPrivate ? FileText : CalendarCheck;

  if (!isAvailable) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <div className="px-6 py-4 rounded-full bg-muted text-muted-foreground font-bold tracking-tight text-sm shadow-lg flex items-center gap-2 cursor-not-allowed">
          <Icon size={18} />
          {status === 'OCCUPIED' ? '현재 사용 중' : '점검 중'}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-primary text-primary-foreground font-black tracking-tight text-sm shadow-xl hover:shadow-2xl transition-shadow"
        >
          <Icon size={18} />
          {label}
        </Link>
      </motion.div>
    </div>
  );
}
