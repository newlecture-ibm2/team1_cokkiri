'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, CalendarCheck } from 'lucide-react';

interface ActionFABProps {
  spaceId: number;
  status: string;
  /** PRIVATE 방이면 "계약", 나머지(COMMON)는 "예약" */
  isPrivate: boolean;
  /** OCCUPIED일 때 현재 계약 종료일 */
  contractEndDate?: string;
}

export function ActionFAB({ spaceId, status, isPrivate, contractEndDate }: ActionFABProps) {
  const isAvailable = status === 'AVAILABLE';
  const canPreBook = status === 'OCCUPIED' && isPrivate && !!contractEndDate;

  const Icon = isPrivate ? FileText : CalendarCheck;

  if (canPreBook) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href={`/contract-apply?spaceId=${spaceId}&minStartDate=${contractEndDate}`}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-accent text-white font-black tracking-tight text-sm shadow-xl hover:shadow-2xl transition-shadow border border-accent"
          >
            <Icon size={18} />
            사전 예약하기
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <div className="px-6 py-4 rounded-full bg-foreground/10 backdrop-blur-sm text-foreground/50 font-black tracking-tight text-sm shadow-lg flex items-center gap-2 cursor-not-allowed border border-foreground/10">
          <Icon size={18} />
          {status === 'OCCUPIED' ? '현재 사용 중' : '점검 중'}
        </div>
      </div>
    );
  }

  const label = isPrivate ? '계약 시작하기' : '이 시설 예약하기';
  const href = isPrivate ? `/contract-apply?spaceId=${spaceId}` : `/facilities?spaceId=${spaceId}`;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-primary text-primary-foreground font-black tracking-tight text-sm shadow-xl hover:shadow-2xl transition-shadow border border-primary"
        >
          <Icon size={18} />
          {label}
        </Link>
      </motion.div>
    </div>
  );
}

