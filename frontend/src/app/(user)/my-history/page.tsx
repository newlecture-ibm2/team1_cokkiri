'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  FileText,
  ClipboardList,
  PenLine,
  MessageSquare,
  Loader2,
  SearchX,
  AlertCircle,
  Zap,
  Activity,
  Router,
  CalendarCheck,
} from 'lucide-react';
import { fetchMyHistory, type HistoryItem } from './_api';
import { HistoryTimeline } from './_components/HistoryTimeline';

type TabType = 'ALL' | 'CONTRACT' | 'APPLICATION' | 'POST' | 'COMMENT';

const TABS: { key: TabType; label: string; apiValue?: string; icon: React.ElementType }[] = [
  { key: 'ALL', label: '전체', icon: Layers },
  { key: 'CONTRACT', label: '계약 이력', apiValue: 'CONTRACT', icon: FileText },
  { key: 'APPLICATION', label: '신청 이력', apiValue: 'APPLICATION', icon: ClipboardList },
  { key: 'POST', label: '게시글', apiValue: 'POST', icon: PenLine },
  { key: 'COMMENT', label: '댓글', apiValue: 'COMMENT', icon: MessageSquare },
];

/* ── 네비게이션 링크: 기기 이력 / 예약 이력 ── */
const SUB_LINKS = [
  { href: '/my-history/device', label: '기기 제어 이력', icon: Router },
  { href: '/my-history/reservation', label: '예약 이력', icon: CalendarCheck },
];

export default function MyHistoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadHistory = useCallback(
    async (tab: TabType, pageNum: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const apiType = TABS.find((t) => t.key === tab)?.apiValue;
        const res = await fetchMyHistory(apiType, pageNum, 20);
        if (res.success && res.data) {
          setItems(res.data.content);
          setPage(res.data.page);
          setTotalPages(res.data.totalPages);
          setTotalElements(res.data.totalElements);
        } else {
          setError(res.message || '이력을 불러올 수 없습니다.');
        }
      } catch (err: any) {
        setError(err.message || '네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadHistory(activeTab, 0);
  }, [activeTab, loadHistory]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(0);
  };

  /* ── 통계 카운트 ── */
  const statCards = [
    { label: '전체', value: totalElements, icon: Activity, color: 'text-primary' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-10"
    >
      {/* ── 헤더 ── */}
      <header className="border-b-2 border-primary pb-8">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-accent mb-2">
          My Activity
        </p>
        <h1 className="text-[10vw] md:text-[6vw] font-black tracking-tighter leading-[0.85] uppercase">
          활동 <span className="underline underline-offset-[1vw] decoration-accent">이력</span>
        </h1>
        <p className="mt-4 text-sm font-medium tracking-tight text-muted text-balance max-w-xl">
          계약, 신청, 게시글, 댓글 등 나의 활동 기록을 한눈에 확인하세요.
        </p>
      </header>

      {/* ── 기기 / 예약 이력 바로가기 ── */}
      <div className="grid grid-cols-2 gap-4">
        {SUB_LINKS.map((link) => (
          <motion.a
            key={link.href}
            href={link.href}
            whileHover={{ y: -4 }}
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-primary/5 hover:border-accent/30 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent/20 transition-colors">
              <link.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">{link.label}</p>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                View Details →
              </p>
            </div>
          </motion.a>
        ))}
      </div>

      {/* ── 통계 카드 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="p-6 bg-white rounded-2xl border border-primary/5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-muted">
                {s.label}
              </p>
            </div>
            <p className={`text-3xl font-black tracking-tighter ${s.color}`}>
              {s.value.toString().padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>

      {/* ── 탭 네비게이션 ── */}
      <div className="flex items-center gap-1 p-1.5 bg-primary/5 rounded-full w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-background shadow-md'
                : 'text-muted hover:text-primary hover:bg-primary/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-[10px] font-black tracking-widest uppercase text-muted">
                Loading history...
              </p>
            </div>
          ) : error ? (
            <div className="py-20 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <p className="text-lg font-black tracking-tighter">{error}</p>
              <button
                onClick={() => loadHistory(activeTab, page)}
                className="px-8 py-4 bg-primary text-background rounded-full text-[10px] font-black tracking-widest uppercase"
              >
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <SearchX className="w-10 h-10 text-muted/30 mx-auto" />
              <p className="text-lg font-black tracking-tighter uppercase">
                이력이 없습니다
              </p>
              <p className="text-xs font-medium text-muted">
                활동하면 이곳에 기록이 남습니다.
              </p>
            </div>
          ) : (
            <>
              <HistoryTimeline items={items} />

              {/* ── 페이지네이션 ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    disabled={page === 0}
                    onClick={() => loadHistory(activeTab, page - 1)}
                    className="px-5 py-2.5 bg-primary/5 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-colors"
                  >
                    이전
                  </button>
                  <span className="text-xs font-black tracking-tight">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => loadHistory(activeTab, page + 1)}
                    className="px-5 py-2.5 bg-primary/5 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
