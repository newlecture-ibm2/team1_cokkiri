'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  RefreshCw,
  Search,
  SearchX,
} from 'lucide-react';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { approveReservation, cancelReservationByAdmin, fetchAdminReservations } from '../_api';
import type { AdminReservationItem, AdminReservationPage, AdminReservationStatus } from '../_types';
import { ReservationActionModal } from './ReservationActionModal';
import { ReservationStatusBadge } from './ReservationStatusBadge';

const PAGE_SIZE = 10;
const STATUS_FILTERS: Array<{ value: 'ALL' | AdminReservationStatus; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'APPROVED', label: '예약 확정' },
  { value: 'CANCELLED', label: '취소됨' },
  { value: 'COMPLETED', label: '이용 완료' },
];

const ACTIONABLE_STATUSES: Record<AdminReservationStatus, Array<'approve' | 'cancel'>> = {
  PENDING: ['approve', 'cancel'],
  APPROVED: ['cancel'],
  CANCELLED: [],
  COMPLETED: [],
};

type PendingAction = { type: 'approve' | 'cancel'; reservation: AdminReservationItem } | null;

const formatTime = (value: string) => value.slice(0, 5);

function getSearchableText(reservation: AdminReservationItem) {
  return [
    reservation.id,
    reservation.userName,
    reservation.spaceName,
    reservation.userId,
    reservation.spaceId,
  ]
    .join(' ')
    .toLowerCase();
}

export function AdminReservationManager() {
  const [pageData, setPageData] = useState<AdminReservationPage | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | AdminReservationStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [idSortOrder, setIdSortOrder] = useState<'asc' | 'desc'>('desc');
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    const loadReservations = async () => {
      if (hasLoadedOnceRef.current) {
        setIsReloading(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await fetchAdminReservations({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          p: currentPage,
          s: PAGE_SIZE,
        });
        setPageData(response.data);
        hasLoadedOnceRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '예약 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
        setIsReloading(false);
      }
    };

    void loadReservations();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    setCurrentPage(0);
  }, [statusFilter]);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => setFeedback(null), 2800);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const reservations = useMemo(() => pageData?.content ?? [], [pageData]);

  const filteredReservations = useMemo(() => {
    if (!deferredSearchTerm) {
      return reservations;
    }

    return reservations.filter((reservation) =>
      getSearchableText(reservation).includes(deferredSearchTerm),
    );
  }, [deferredSearchTerm, reservations]);

  const sortedReservations = useMemo(() => {
    return [...filteredReservations].sort((a, b) =>
      idSortOrder === 'asc' ? a.id - b.id : b.id - a.id,
    );
  }, [filteredReservations, idSortOrder]);

  const summaryItems = useMemo(() => {
    return [
      {
        label: 'Current Page',
        value: String(filteredReservations.length).padStart(2, '0'),
        description: '현재 화면에 보이는 예약',
      },
      {
        label: 'Pending',
        value: String(reservations.filter((item) => item.status === 'PENDING').length).padStart(
          2,
          '0',
        ),
        description: '즉시 검토가 필요한 예약',
      },
      {
        label: 'Approved',
        value: String(reservations.filter((item) => item.status === 'APPROVED').length).padStart(
          2,
          '0',
        ),
        description: '승인 완료된 예약',
      },
      {
        label: 'Total',
        value: String(pageData?.totalElements ?? 0).padStart(2, '0'),
        description: '현재 필터 기준 전체 예약 수',
      },
    ];
  }, [filteredReservations.length, pageData?.totalElements, reservations]);

  const handleRefresh = async () => {
    setIsReloading(true);
    setError(null);

    try {
      const response = await fetchAdminReservations({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        p: currentPage,
        s: PAGE_SIZE,
      });
      setPageData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약 목록을 새로고침하지 못했습니다.');
    } finally {
      setIsReloading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (pendingAction.type === 'approve') {
        await approveReservation(pendingAction.reservation.id);
        setFeedback({
          type: 'success',
          text: `예약 #${pendingAction.reservation.id}을 승인했습니다.`,
        });
      } else {
        await cancelReservationByAdmin(pendingAction.reservation.id);
        setFeedback({
          type: 'success',
          text: `예약 #${pendingAction.reservation.id}을 취소 처리했습니다.`,
        });
      }

      setPendingAction(null);
      await handleRefresh();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : '예약 상태 변경에 실패했습니다.';
      setFeedback({ type: 'error', text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-12">
          <div className="flex flex-col gap-6">
            <div className="border-b border-primary/10 pb-8 space-y-4">
              <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Admin · Reservation</p>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                  RESERVATION <span className="underline underline-offset-4 decoration-accent">CONTROL.</span>
                  <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">예약 관리</span>
                </h1>
                <Button
                  variant="outline"
                  className="rounded-full px-5 border-primary/20 hover:bg-primary/5 h-11"
                  onClick={() => void handleRefresh()}
                  disabled={isReloading}
                >
                  {isReloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  새로고침
                </Button>
              </div>
              <p className="font-medium tracking-tight text-foreground/70 text-sm md:text-base max-w-3xl">
                현재 페이지 데이터 안에서 빠르게 검색하고, 승인 대기 예약을 검토하거나 예약을 즉시 취소할 수 있는 관리자용 운영 보드입니다.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="border-border bg-background rounded-[2rem] border p-6 shadow-sm"
            >
              <p className="text-muted-foreground text-[10px] font-black tracking-[0.24em] uppercase">
                {item.label}
              </p>
              <p className="text-foreground mt-4 text-4xl font-black tracking-tighter">
                {item.value}
              </p>
              <p className="text-muted-foreground mt-3 text-sm font-medium tracking-tight">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <section className="border-border bg-background mt-10 rounded-[2rem] border p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full px-4 py-2 text-[10px] font-black tracking-[0.18em] uppercase transition-all ${
                    statusFilter === filter.value
                      ? 'bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground border'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="border-border bg-muted/20 focus-within:border-primary/25 flex w-full max-w-md items-center gap-3 rounded-full border px-4 py-3 xl:w-[360px]">
              <Search className="text-muted-foreground size-4" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="현재 페이지에서 예약 ID, 신청자, 시설명 검색"
                className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm font-medium outline-none"
              />
            </div>
          </div>

          <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-3 text-sm font-medium">
            <span>
              페이지 {pageData ? pageData.number + 1 : 1} / {pageData?.totalPages ?? 1}
            </span>
            <span className="text-border">·</span>
            <span>서버 필터 기준 전체 {pageData?.totalElements ?? 0}건</span>
            {deferredSearchTerm ? (
              <>
                <span className="text-border">·</span>
                <span>현재 페이지 검색 결과 {filteredReservations.length}건</span>
              </>
            ) : null}
          </div>
        </section>

        <AnimatePresence>
          {feedback ? (
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-lg ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {feedback.text}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <section className="border-border bg-background mt-8 overflow-hidden rounded-[2rem] border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-border bg-muted/20 border-b">
                  <th className="text-muted-foreground px-6 py-4 text-[10px] font-black tracking-[0.28em] uppercase">
                    <button
                      type="button"
                      onClick={() =>
                        setIdSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))
                      }
                      className="hover:text-foreground flex items-center gap-2 transition"
                    >
                      예약 ID
                      <ChevronsUpDown className="size-3.5" />
                      <span className="text-muted-foreground text-[9px] tracking-[0.2em]">
                        {idSortOrder === 'asc' ? 'ASC' : 'DESC'}
                      </span>
                    </button>
                  </th>
                  {['신청자', '시설', '예약 일시', '상태', '액션'].map((header) => (
                    <th
                      key={header}
                      className="text-muted-foreground px-6 py-4 text-[10px] font-black tracking-[0.28em] uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24">
                      <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <Loader2 className="text-primary size-10 animate-spin" />
                        <p className="text-muted-foreground text-[10px] font-black tracking-[0.28em] uppercase">
                          Loading reservations
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24">
                      <div className="mx-auto max-w-md rounded-[2rem] border border-red-200 bg-red-50/80 p-8 text-center">
                        <p className="text-foreground text-lg font-black tracking-tighter">
                          예약 목록을 불러오지 못했습니다
                        </p>
                        <p className="text-muted-foreground mt-3 text-sm font-medium">{error}</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24">
                      <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <SearchX className="text-primary/60 size-10" />
                        <p className="text-foreground text-2xl font-black tracking-tighter">
                          {deferredSearchTerm
                            ? '현재 페이지 검색 결과가 없습니다'
                            : '표시할 예약이 없습니다'}
                        </p>
                        <p className="text-muted-foreground max-w-md text-sm font-medium">
                          {deferredSearchTerm
                            ? '검색어를 바꾸거나 다른 페이지, 다른 상태 필터에서 다시 확인해보세요.'
                            : '선택한 조건에 해당하는 예약이 아직 없습니다.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedReservations.map((reservation) => {
                    const actions = ACTIONABLE_STATUSES[reservation.status];

                    return (
                      <tr
                        key={reservation.id}
                        className="border-border/70 hover:bg-muted/10 border-b last:border-b-0"
                      >
                        <td className="px-6 py-5 align-top">
                          <div className="text-foreground font-black tracking-tight">
                            #{reservation.id}
                          </div>
                          <div className="text-muted-foreground mt-1 text-xs font-medium">
                            USER #{reservation.userId}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="text-foreground font-black tracking-tight">
                            {reservation.userName}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="text-foreground font-black tracking-tight">
                            {reservation.spaceName}
                          </div>
                          <div className="text-muted-foreground mt-1 text-xs font-medium">
                            SPACE #{reservation.spaceId}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/8 text-primary mt-0.5 rounded-full p-2">
                              <CalendarDays className="size-4" />
                            </div>
                            <div>
                              <div className="text-foreground font-black tracking-tight">
                                {reservation.reservationDate}
                              </div>
                              <div className="text-muted-foreground mt-1 text-xs font-medium">
                                {formatTime(reservation.startTime)} -{' '}
                                {formatTime(reservation.endTime)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <ReservationStatusBadge status={reservation.status} />
                        </td>
                        <td className="px-6 py-5 align-top">
                          {actions.length === 0 ? (
                            <span className="text-muted-foreground text-xs font-semibold">
                              처리 완료
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {actions.includes('approve') ? (
                                <Button
                                  size="sm"
                                  className="rounded-full"
                                  onClick={() => setPendingAction({ type: 'approve', reservation })}
                                >
                                  승인
                                </Button>
                              ) : null}
                              {actions.includes('cancel') ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => setPendingAction({ type: 'cancel', reservation })}
                                >
                                  취소
                                </Button>
                              ) : null}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-border bg-muted/10 flex flex-col gap-4 border-t px-6 py-5 md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground text-sm font-medium">
              검색은 현재 페이지에 로드된 예약만 대상으로 동작합니다.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                disabled={!pageData || pageData.first || isReloading}
              >
                <ChevronLeft className="size-4" />
                이전
              </Button>
              <div className="text-foreground min-w-24 text-center text-sm font-black tracking-tight">
                {pageData
                  ? `${pageData.number + 1} / ${Math.max(pageData.totalPages, 1)}`
                  : '1 / 1'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((page) =>
                    pageData ? Math.min(page + 1, Math.max(pageData.totalPages - 1, 0)) : page + 1,
                  )
                }
                disabled={!pageData || pageData.last || isReloading}
              >
                다음
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      {pendingAction ? (
        <ReservationActionModal
          action={pendingAction.type}
          reservation={pendingAction.reservation}
          isSubmitting={isSubmitting}
          onClose={() => setPendingAction(null)}
          onConfirm={() => void handleConfirmAction()}
        />
      ) : null}
    </>
  );
}
