"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { MessageSquare, Trash2, Search, X, Filter, CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";
import { ApiError } from "@/lib/api";
import {
  deleteAdminComment,
  deleteAdminPost,
  fetchAdminComments,
  fetchAdminPosts,
} from "../_api/communityAdminApi";
import type { AdminCommentItem, AdminPostItem } from "../_types/community-admin";

type TabKey = "posts" | "comments";

const POST_CATEGORIES = [
  { value: "", label: "전체" },
  { value: "NOTICE", label: "공지" },
  { value: "QUESTION", label: "질문" },
  { value: "SUGGESTION", label: "건의" },
  { value: "MEETUP", label: "모임" },
  { value: "FREE", label: "자유" },
] as const;

const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "최신순" },
  { value: "createdAt,asc", label: "오래된순" },
  { value: "viewCount,desc", label: "조회순" },
  { value: "likeCount,desc", label: "좋아요순" },
] as const;

function categoryLabel(code: string): string {
  const found = POST_CATEGORIES.find((c) => c.value === code);
  return found ? found.label : code;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function buildCalendarCells(viewMonth: Date): Array<{ date: Date; inCurrentMonth: boolean }> {
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      date,
      inCurrentMonth: date.getMonth() === viewMonth.getMonth(),
    };
  });
}

/** ─── Client Side Pagination Component ─── */
function CommunityPagination({ 
  current, 
  total, 
  onPageChange 
}: { 
  current: number; 
  total: number; 
  onPageChange: (p: number) => void 
}) {
  if (total <= 1) return null;

  const range = 2;
  const start = Math.max(0, current - range);
  const end = Math.min(total - 1, current + range);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const navBtnBase = "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5";
  const numBtnBase = "flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5";

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(0)}
        disabled={current === 0}
        className={cn(navBtnBase, current === 0 ? "opacity-20 cursor-not-allowed" : "border-primary/10 text-primary/60 bg-white shadow-sm hover:border-accent hover:text-accent")}
      >
        <ChevronsLeft className="size-4" />
      </button>
      <button
        onClick={() => onPageChange(Math.max(0, current - 1))}
        disabled={current === 0}
        className={cn(navBtnBase, current === 0 ? "opacity-20 cursor-not-allowed" : "border-primary/10 text-primary/60 bg-white shadow-sm hover:border-accent hover:text-accent")}
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="mx-2 flex items-center gap-1.5">
        {start > 0 && <span className="text-primary/20 px-1 font-black">...</span>}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(numBtnBase, p === current ? "border-accent bg-accent text-white shadow-md shadow-accent/20" : "border-primary/10 text-primary/70 bg-white shadow-sm hover:border-accent hover:text-accent")}
          >
            {p + 1}
          </button>
        ))}
        {end < total - 1 && <span className="text-primary/20 px-1 font-black">...</span>}
      </div>

      <button
        onClick={() => onPageChange(Math.min(total - 1, current + 1))}
        disabled={current === total - 1}
        className={cn(navBtnBase, current === total - 1 ? "opacity-20 cursor-not-allowed" : "border-primary/10 text-primary/60 bg-white shadow-sm hover:border-accent hover:text-accent")}
      >
        <ChevronRight className="size-4" />
      </button>
      <button
        onClick={() => onPageChange(total - 1)}
        disabled={current === total - 1}
        className={cn(navBtnBase, current === total - 1 ? "opacity-20 cursor-not-allowed" : "border-primary/10 text-primary/60 bg-white shadow-sm hover:border-accent hover:text-accent")}
      >
        <ChevronsRight className="size-4" />
      </button>
    </nav>
  );
}

export function CommunityModerationPanel() {
  const [tab, setTab] = useState<TabKey>("posts");
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortValue, setSortValue] = useState("createdAt,desc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [openDatePicker, setOpenDatePicker] = useState<"from" | "to" | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  
  const [posts, setPosts] = useState<AdminPostItem[]>([]);
  const [comments, setComments] = useState<AdminCommentItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        if (createdFrom && createdTo && createdFrom > createdTo) {
          setError("기간 설정이 올바르지 않습니다. 시작일은 종료일보다 이후일 수 없습니다.");
          setLoading(false);
          return;
        }
        const from = createdFrom || undefined;
        const to = createdTo || undefined;
        if (tab === "posts") {
          const res = await fetchAdminPosts({
            p: page,
            s: pageSize,
            createdFrom: from,
            createdTo: to,
            category: category || undefined,
            keyword: activeKeyword || undefined,
            sort: sortValue,
          });
          if (mounted) {
            setPosts(res.data?.content ?? []);
            setTotalPages(res.data?.totalPages ?? 0);
          }
        } else {
          const res = await fetchAdminComments({
            p: page,
            s: pageSize,
            createdFrom: from, 
            createdTo: to,
            sort: sortValue
          });
          if (mounted) {
            setComments(res.data?.content ?? []);
            setTotalPages(res.data?.totalPages ?? 0);
          }
        }
      } catch (e) {
        if (e instanceof ApiError && (e.errorCode === "UNAUTHORIZED" || e.errorCode === "FORBIDDEN")) {
          setShowAuthModal(true);
        }
        if (mounted) setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [tab, createdFrom, createdTo, category, activeKeyword, sortValue, page, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [tab, createdFrom, createdTo, category, activeKeyword, sortValue]);

  function handleDeletePost(postId: number) {
    startTransition(async () => {
      try {
        await deleteAdminPost(postId);
        setPosts((prev) => prev.filter((p) => p.postId !== postId));
      } catch (e) {
        if (e instanceof ApiError && (e.errorCode === "UNAUTHORIZED" || e.errorCode === "FORBIDDEN")) {
          setShowAuthModal(true);
        }
        setError(e instanceof Error ? e.message : "게시글 삭제에 실패했습니다.");
      }
    });
  }

  function handleDeleteComment(commentId: number) {
    startTransition(async () => {
      try {
        await deleteAdminComment(commentId);
        setComments((prev) => prev.filter((c) => c.commentId !== commentId));
      } catch (e) {
        if (e instanceof ApiError && (e.errorCode === "UNAUTHORIZED" || e.errorCode === "FORBIDDEN")) {
          setShowAuthModal(true);
        }
        setError(e instanceof Error ? e.message : "댓글 삭제에 실패했습니다.");
      }
    });
  }

  const handleSearch = useCallback(() => {
    setActiveKeyword(keyword);
  }, [keyword]);

  const handleClearSearch = useCallback(() => {
    setKeyword("");
    setActiveKeyword("");
    setIsSearchOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  const handleSort = useCallback((value: string) => {
    setSortValue(value);
    setIsSortOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setCategory("");
    setActiveKeyword("");
    setKeyword("");
    setCreatedFrom("");
    setCreatedTo("");
    setSortValue("createdAt,desc");
    setIsSearchOpen(false);
    setPage(0);
  }, []);

  const hasActiveFilters = category || activeKeyword || createdFrom || createdTo || sortValue !== "createdAt,desc";
  const fromDate = parseDateInput(createdFrom);
  const toDate = parseDateInput(createdTo);
  const calendarCells = buildCalendarCells(viewMonth);

  const tabBase = "shrink-0 text-[15px] font-bold uppercase tracking-wider transition-all whitespace-nowrap pb-1.5 border-b-2 border-transparent cursor-pointer";

  function openPicker(target: "from" | "to") {
    const current = target === "from" ? fromDate : toDate;
    setViewMonth(current ?? new Date());
    setOpenDatePicker(target);
  }

  function moveMonth(offset: number) {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }

  function applyDate(target: "from" | "to", date: Date) {
    const value = toDateInputValue(date);
    if (target === "from") setCreatedFrom(value);
    else setCreatedTo(value);
    setOpenDatePicker(null);
  }

  return (
    <section className="space-y-6">
      <LoginRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="관리자 권한이 필요합니다."
        description="관리자 계정으로 로그인 후 다시 시도해 주세요."
      />

      {/* ─── Filter Section: Posts / Comments ─── */}
      <div className="flex flex-col gap-4 border-b border-primary/10 pb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[13px] font-bold uppercase tracking-widest text-primary">글 종류</span>
            <span className="text-primary/10 select-none">|</span>
          </div>
          <button
            type="button"
            onClick={() => setTab("posts")}
            className={cn(tabBase, tab === "posts" ? "text-accent border-accent" : "text-primary/40 hover:text-primary")}
          >
            게시글
          </button>
          <button
            type="button"
            onClick={() => setTab("comments")}
            className={cn(tabBase, tab === "comments" ? "text-accent border-accent" : "text-primary/40 hover:text-primary")}
          >
            댓글
          </button>
        </div>

        {tab === "posts" && (
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[13px] font-bold uppercase tracking-widest text-primary">유형별</span>
              <span className="text-primary/10 select-none">|</span>
            </div>
            {POST_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={cn(tabBase, category === c.value ? "text-accent border-accent" : "text-primary/40 hover:text-primary")}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[13px] font-bold uppercase tracking-widest text-primary">날짜별</span>
              <span className="text-primary/10 select-none">|</span>
            </div>
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => openPicker("from")}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-xs font-semibold text-foreground/80 shadow-sm transition-colors hover:border-primary/40"
              >
                <CalendarDays className="h-4 w-4 text-stone-400" />
                {createdFrom || "시작일"}
              </button>
              <span className="text-foreground/30 text-xs text-center">~</span>
              <button
                type="button"
                onClick={() => openPicker("to")}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-xs font-semibold text-foreground/80 shadow-sm transition-colors hover:border-primary/40"
              >
                <CalendarDays className="h-4 w-4 text-stone-400" />
                {createdTo || "종료일"}
              </button>

              <AnimatePresence>
                {openDatePicker && (
                  <>
                    <motion.button
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-30 cursor-default bg-transparent"
                      onClick={() => setOpenDatePicker(null)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full z-40 mt-3 w-[280px] rounded-3xl border border-stone-200 bg-white p-4 shadow-xl"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <button type="button" onClick={() => moveMonth(-1)} className="p-1 hover:bg-stone-100 rounded-full"><ChevronLeft className="h-4 w-4" /></button>
                        <p className="text-sm font-bold">{getMonthLabel(viewMonth)}</p>
                        <button type="button" onClick={() => moveMonth(1)} className="p-1 hover:bg-stone-100 rounded-full"><ChevronRight className="h-4 w-4" /></button>
                      </div>
                      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 uppercase">
                        {WEEKDAY_LABELS.map(d => <span key={d}>{d}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {calendarCells.map(({ date, inCurrentMonth }) => {
                          const selected = openDatePicker === "from" ? 
                            (createdFrom === toDateInputValue(date)) : 
                            (createdTo === toDateInputValue(date));
                          return (
                            <button
                              key={date.toISOString()}
                              type="button"
                              onClick={() => applyDate(openDatePicker, date)}
                              className={cn(
                                "h-8 rounded-lg text-xs font-semibold transition-colors",
                                !inCurrentMonth && "text-stone-200",
                                inCurrentMonth && !selected && "text-stone-700 hover:bg-stone-100",
                                selected && "bg-primary text-white"
                              )}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            {hasActiveFilters && (
              <button onClick={handleResetFilters} className="text-xs font-bold text-stone-400 hover:text-accent underline underline-offset-4">초기화</button>
            )}
          </div>

          <div className="flex items-center gap-6 justify-end">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="flex items-center gap-1.5 border-b border-foreground pb-1">
                  <input
                    autoFocus
                    placeholder="검색..."
                    className="bg-transparent text-[13px] font-bold focus:outline-none min-w-[120px]"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button onClick={handleClearSearch}><X className="h-3.5 w-3.5" /></button>
                </motion.div>
              ) : (
                <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-1.5 text-[13px] font-black tracking-widest hover:opacity-60 transition-opacity">
                  <Search className="h-4 w-4" /> SEARCH
                </button>
              )}
            </AnimatePresence>

            <div className="relative">
              <button onClick={() => setIsSortOpen(!isSortOpen)} className="flex items-center gap-1.5 text-[13px] font-black tracking-widest hover:opacity-60 transition-opacity">
                <Filter className="h-4 w-4" /> SORT
              </button>
              <AnimatePresence>
                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full z-20 mt-3 flex flex-col gap-1 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl min-w-[140px]">
                      {SORT_OPTIONS.map((opt) => (
                        <button key={opt.value} onClick={() => handleSort(opt.value)} className={cn("px-4 py-2 text-left text-xs font-bold rounded-xl transition-colors", sortValue === opt.value ? "bg-primary/10 text-primary" : "text-primary/60 hover:bg-stone-50")}>
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-xs font-bold text-destructive">{error}</div>}

      {/* ─── Table List ─── */}
      <div className="bg-white rounded-[2rem] border border-primary/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-primary/[0.03] border-b border-primary/10">
                {tab === "posts" ? (
                  <>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60 text-center w-16">No.</th>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60 text-center w-24">유형</th>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60">제목</th>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60 text-center w-28">작성자</th>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60 text-center w-36">등록일</th>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60 text-center w-20">관리</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60 text-center w-16">No.</th>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60">원문 제목</th>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60">댓글 내용</th>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60 text-center w-28">작성자</th>
                    <th className="px-5 py-4 text-[13px] font-black uppercase tracking-widest text-primary/60 text-center w-20">관리</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className={cn(loading && "opacity-40 animate-pulse")}>
              {tab === "posts" ? (
                posts.length === 0 && !loading ? (
                  <tr><td colSpan={6} className="px-6 py-20 text-center"><div className="flex flex-col items-center gap-4"><div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center"><LayoutList className="w-7 h-7 text-primary/20" /></div><p className="text-sm font-bold text-primary/30">게시글이 없습니다.</p></div></td></tr>
                ) : (
                  posts.map((item, idx) => (
                    <tr key={item.postId} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-5 py-4 text-center font-mono text-[15px] font-medium text-primary/40">{page * pageSize + idx + 1}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-[15px] font-medium text-primary/70">{categoryLabel(item.category)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/admin/community/posts/${item.postId}`} className="text-lg font-normal text-primary hover:text-accent transition-colors line-clamp-1">
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-primary/30">
                          <span>조회 {item.viewCount}</span> · <span>좋아요 {item.likeCount}</span> · <span>댓글 {item.commentCount}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center text-[15px] font-medium text-primary/70">회원 #{item.authorUserId}</td>
                      <td className="px-5 py-4 text-center text-sm font-normal text-primary/40">{item.createdAt.split("T")[0]}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          disabled={isPending}
                          onClick={() => confirm("삭제하시겠습니까?") && handleDeletePost(item.postId)}
                          className="p-2 text-primary/20 hover:text-destructive transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                comments.length === 0 && !loading ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center"><div className="flex flex-col items-center gap-4"><div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center"><LayoutList className="w-7 h-7 text-primary/20" /></div><p className="text-sm font-bold text-primary/30">댓글이 없습니다.</p></div></td></tr>
                ) : (
                  comments.map((item, idx) => (
                    <tr key={item.commentId} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-5 py-4 text-center font-mono text-[15px] font-medium text-primary/40">{page * pageSize + idx + 1}</td>
                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="text-sm font-medium text-primary/40 truncate">{item.postTitle}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/admin/community/comments/${item.commentId}`} className="text-lg font-normal text-primary hover:text-accent transition-colors line-clamp-1">
                          {item.content}
                        </Link>
                        <p className="text-[11px] font-bold text-primary/30 mt-1">{item.createdAt.split("T")[0]}</p>
                      </td>
                      <td className="px-5 py-4 text-center text-[15px] font-medium text-primary/70">회원 #{item.authorUserId}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          disabled={isPending}
                          onClick={() => confirm("댓글을 삭제하시겠습니까?") && handleDeleteComment(item.commentId)}
                          className="p-2 text-primary/20 hover:text-destructive transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CommunityPagination current={page} total={totalPages} onPageChange={setPage} />
    </section>
  );
}
