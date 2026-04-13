'use client';

import React from 'react';
import {
  FileText,
  ClipboardList,
  MessageSquare,
  PenLine,
  CheckCircle2,
  Clock,
  Ban,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { HistoryItem } from '../_api';

/* ── 타입별 설정 ── */
const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  CONTRACT: {
    label: '계약',
    icon: FileText,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  APPLICATION: {
    label: '신청',
    icon: ClipboardList,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  POST: {
    label: '게시글',
    icon: PenLine,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
  },
  COMMENT: {
    label: '댓글',
    icon: MessageSquare,
    color: 'text-muted',
    bgColor: 'bg-secondary/10',
  },
};

/* ── 상태별 설정 ── */
const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; border: string }
> = {
  ACTIVE: { label: '계약 중', icon: CheckCircle2, color: 'text-accent', border: 'border-accent/30 bg-accent/10' },
  EXPIRED: { label: '만료', icon: Clock, color: 'text-yellow-700', border: 'border-yellow-200 bg-yellow-50' },
  TERMINATED: { label: '해지', icon: Ban, color: 'text-red-700', border: 'border-red-200 bg-red-50' },
  APPROVED: { label: '승인', icon: CheckCircle2, color: 'text-orange-600', border: 'border-orange-200 bg-orange-50' },
  PENDING: { label: '심사 중', icon: Clock, color: 'text-blue-600', border: 'border-blue-200 bg-blue-50' },
  REJECTED: { label: '반려', icon: XCircle, color: 'text-red-600', border: 'border-red-200 bg-red-50' },
  CANCELLED: { label: '취소', icon: XCircle, color: 'text-gray-500', border: 'border-gray-200 bg-gray-100' },
  DRAFT: { label: '임시저장', icon: Clock, color: 'text-gray-600', border: 'border-gray-200 bg-gray-100' },
};

function getLink(item: HistoryItem): string | null {
  switch (item.historyType) {
    case 'CONTRACT':
      return '/my-contract-info';
    case 'APPLICATION':
      return '/my-contracts';
    case 'POST':
      return `/community/${item.referenceId}`;
    case 'COMMENT':
      return null; // 댓글은 상세 링크 없음
    default:
      return null;
  }
}

interface Props {
  items: HistoryItem[];
}

export function HistoryTimeline({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* 세로 타임라인 */}
      <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-primary/10" />

      <div className="space-y-4">
        {items.map((item, idx) => {
          const typeCfg = TYPE_CONFIG[item.historyType] || TYPE_CONFIG.POST;
          const statusCfg = item.status ? STATUS_CONFIG[item.status] : null;
          const TypeIcon = typeCfg.icon;
          const link = getLink(item);

          return (
            <motion.div
              key={`${item.historyType}-${item.referenceId}-${idx}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.35 }}
              className="relative pl-14"
            >
              {/* 타임라인 점 */}
              <div
                className={`absolute left-[13px] top-5 w-4 h-4 rounded-full border-2 border-background z-10 flex items-center justify-center ${typeCfg.bgColor}`}
              >
                <TypeIcon className={`w-2.5 h-2.5 ${typeCfg.color}`} />
              </div>

              <div className="p-5 bg-white rounded-2xl border border-primary/5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 유형 태그 */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-[0.15em] uppercase ${typeCfg.bgColor} ${typeCfg.color}`}
                    >
                      <TypeIcon className="w-3 h-3" />
                      {typeCfg.label}
                    </span>

                    {/* 상태 뱃지 */}
                    {statusCfg && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-[0.15em] uppercase border ${statusCfg.border} ${statusCfg.color}`}
                      >
                        <statusCfg.icon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    )}
                  </div>

                  {/* 링크 화살표 */}
                  {link && (
                    <a
                      href={link}
                      className="p-1.5 rounded-full hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ArrowUpRight className="w-4 h-4 text-accent" />
                    </a>
                  )}
                </div>

                {/* 제목 */}
                <h4 className="text-sm font-black tracking-tight leading-snug mb-1">
                  {item.title}
                </h4>

                {/* 설명 */}
                {item.description && (
                  <p className="text-xs font-medium text-muted leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* 날짜 */}
                <p className="text-[10px] font-bold text-muted/60 mt-2">
                  {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
