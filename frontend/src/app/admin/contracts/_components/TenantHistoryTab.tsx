"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  User,
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Loader2,
  AlertCircle,
  Filter,
  SearchX,
  Search,
} from "lucide-react";

interface TenantContract {
  contractId: number;
  userId: number;
  userName: string;
  spaceId: number;
  spaceName: string;
  status: string;
  origin: string;
  desiredStartDate: string | null;
  desiredDurationMonths: number | null;
  startDate: string | null;
  endDate: string | null;
  monthlyRent: number | null;
  deposit: number | null;
  specialTerms: string | null;
  createdAt: string;
}

interface SpaceGroup {
  spaceId: number;
  spaceName: string;
  contracts: TenantContract[];
  activeCount: number;
  totalCount: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  ACTIVE: { label: "계약 중", color: "text-accent", bgColor: "bg-accent/15 border-accent/30", icon: CheckCircle2 },
  EXPIRED: { label: "만료", color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", icon: Clock },
  TERMINATED: { label: "해지", color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: Ban },
  APPROVED: { label: "승인", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200", icon: CheckCircle2 },
  PENDING: { label: "심사 중", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200", icon: Clock },
  REJECTED: { label: "반려", color: "text-red-600", bgColor: "bg-red-50 border-red-200", icon: XCircle },
  CANCELLED: { label: "취소", color: "text-gray-500", bgColor: "bg-gray-100 border-gray-200", icon: XCircle },
  DRAFT: { label: "임시저장", color: "text-gray-600", bgColor: "bg-gray-100 border-gray-200", icon: Clock },
};

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

export function TenantHistoryTab({ refreshKey }: Props) {
  const [allContracts, setAllContracts] = useState<TenantContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Expanded space groups
  const [expandedSpaces, setExpandedSpaces] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchAllContracts();
  }, [refreshKey, dateFrom, dateTo]);

  const fetchAllContracts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('startDate', dateFrom);
      if (dateTo) params.set('endDate', dateTo);
      const qs = params.toString();
      const url = `/api/admin/contracts${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("계약 데이터를 불러오는 데 실패했습니다.");
      const result = await res.json();
      if (result.success && result.data) {
        setAllContracts(result.data);
      } else {
        setError(result.message || "오류가 발생했습니다.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Group by space
  const spaceGroups: SpaceGroup[] = useMemo(() => {
    // Apply filters first
    const filtered = allContracts.filter((c) => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (
          !c.spaceName.toLowerCase().includes(q) &&
          !c.userName.toLowerCase().includes(q)
        )
          return false;
      }

      // Date range (based on startDate or createdAt)
      const refDate = c.startDate || c.createdAt?.split("T")[0];
      if (refDate) {
        if (dateFrom && refDate < dateFrom) return false;
        if (dateTo && refDate > dateTo) return false;
      }

      return true;
    });

    // Group
    const groupMap = new Map<number, SpaceGroup>();
    filtered.forEach((c) => {
      if (!groupMap.has(c.spaceId)) {
        groupMap.set(c.spaceId, {
          spaceId: c.spaceId,
          spaceName: c.spaceName,
          contracts: [],
          activeCount: 0,
          totalCount: 0,
        });
      }
      const group = groupMap.get(c.spaceId)!;
      group.contracts.push(c);
      group.totalCount++;
      if (c.status === "ACTIVE") group.activeCount++;
    });

    // Sort: spaces with ACTIVE contracts first, then by name
    return Array.from(groupMap.values()).sort((a, b) => {
      if (a.activeCount > 0 && b.activeCount === 0) return -1;
      if (a.activeCount === 0 && b.activeCount > 0) return 1;
      return a.spaceName.localeCompare(b.spaceName);
    });
  }, [allContracts, searchTerm, dateFrom, dateTo]);

  const toggleExpand = (spaceId: number) => {
    setExpandedSpaces((prev) => {
      const next = new Set(prev);
      if (next.has(spaceId)) {
        next.delete(spaceId);
      } else {
        next.add(spaceId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSpaces(new Set(spaceGroups.map((g) => g.spaceId)));
  };

  const collapseAll = () => {
    setExpandedSpaces(new Set());
  };

  // Overall stats
  const totalSpaces = spaceGroups.length;
  const occupiedSpaces = spaceGroups.filter((g) => g.activeCount > 0).length;

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "등록 공간", value: totalSpaces, color: "text-primary" },
          { label: "입주 중", value: occupiedSpaces, color: "text-accent" },
          { label: "공실", value: totalSpaces - occupiedSpaces, color: "text-muted" },
        ].map((s) => (
          <div key={s.label} className="p-6 bg-white rounded-2xl border border-primary/5 shadow-sm">
            <p className="text-xs font-black tracking-[0.2em] uppercase text-muted mb-2">{s.label}</p>
            <p className={`text-3xl font-black tracking-tighter ${s.color}`}>
              {s.value.toString().padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border border-primary/10 focus-within:border-accent/40 transition-colors">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="방 이름 또는 입주자 검색..."
            className="bg-transparent text-sm font-bold placeholder:text-muted/40 focus:outline-none w-48"
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-white px-3 py-2 rounded-xl text-sm font-bold border border-primary/10 focus:ring-2 ring-accent outline-none"
          />
          <span className="text-xs font-bold text-muted">~</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-white px-3 py-2 rounded-xl text-sm font-bold border border-primary/10 focus:ring-2 ring-accent outline-none"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline"
            >
              초기화
            </button>
          )}
        </div>

        {/* Expand/Collapse controls */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-primary/5 text-xs font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-colors"
          >
            모두 펼치기
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-primary/5 text-xs font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-colors"
          >
            모두 접기
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-xs font-black tracking-widest uppercase text-muted">
            Grouping contracts by space...
          </p>
        </div>
      ) : error ? (
        <div className="py-20 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-lg font-black tracking-tighter">{error}</p>
          <button
            onClick={fetchAllContracts}
            className="px-8 py-4 bg-primary text-background rounded-full text-xs font-black tracking-widest uppercase"
          >
            Retry
          </button>
        </div>
      ) : spaceGroups.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <SearchX className="w-10 h-10 text-muted/30 mx-auto" />
          <p className="text-lg font-black tracking-tighter uppercase">
            {allContracts.length === 0 ? "계약 이력이 없습니다" : "조건에 맞는 이력이 없습니다"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {spaceGroups.map((group, gIdx) => {
            const isExpanded = expandedSpaces.has(group.spaceId);
            return (
              <motion.div
                key={group.spaceId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gIdx * 0.04, duration: 0.4 }}
                className="bg-white rounded-[2rem] border border-primary/5 shadow-sm overflow-hidden"
              >
                {/* ── Space Header (Accordion) ── */}
                <button
                  onClick={() => toggleExpand(group.spaceId)}
                  className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-background/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      group.activeCount > 0 ? "bg-accent/15 text-accent" : "bg-primary/5 text-muted"
                    }`}>
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tighter leading-none mb-1">
                        {group.spaceName}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black tracking-widest uppercase text-primary/50">
                          {group.totalCount}건의 계약 이력
                        </span>
                        {group.activeCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/15 text-accent rounded-full text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" />
                            입주 중
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted" />
                  </motion.div>
                </button>

                {/* ── Tenant Timeline ── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-8 pt-2">
                        {/* Mini timeline */}
                        <div className="relative">
                          {/* Vertical line */}
                          <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-primary/10" />

                          {group.contracts.map((contract, cIdx) => {
                            const cfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.DRAFT;
                            const StatusIcon = cfg.icon;

                            return (
                              <div key={contract.contractId} className="relative pl-12 pb-6 last:pb-0">
                                {/* Timeline dot */}
                                <div className={`absolute left-[9px] top-2 w-3 h-3 rounded-full border-2 border-background z-10 ${
                                  contract.status === "ACTIVE" ? "bg-accent" : "bg-primary/30"
                                }`} />

                                <div className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                                  contract.status === "ACTIVE"
                                    ? "bg-accent/5 border-accent/20"
                                    : "bg-primary/[0.02] border-primary/5"
                                }`}>
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                        <User className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <span className="text-base font-black text-primary">{contract.userName}</span>
                                        <span className="text-xs font-bold text-primary/50 ml-2">
                                          #{contract.contractId}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black tracking-[0.15em] uppercase border ${cfg.bgColor} ${cfg.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {cfg.label}
                                      </span>
                                      <span className="text-[10px] font-bold text-primary/50 uppercase">
                                        {contract.origin === "ADMIN_INITIATED" ? "관리자" : "신청"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <p className="text-[10px] font-black tracking-widest text-primary/50 uppercase mb-0.5">기간</p>
                                      {contract.startDate && contract.endDate ? (
                                        <p className="text-sm font-bold text-primary">
                                          {contract.startDate} ~ {contract.endDate}
                                        </p>
                                      ) : contract.desiredStartDate ? (
                                        <p className="text-sm font-medium text-primary/50 italic">
                                          희망: {contract.desiredStartDate}
                                        </p>
                                      ) : (
                                        <p className="text-sm text-primary/30">—</p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black tracking-widest text-muted uppercase mb-0.5">월세</p>
                                      <p className="text-sm font-bold text-primary">
                                        {contract.monthlyRent ? `₩${Number(contract.monthlyRent).toLocaleString()}` : "—"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black tracking-widest text-muted uppercase mb-0.5">보증금</p>
                                      <p className="text-sm font-bold text-primary">
                                        {contract.deposit ? `₩${Number(contract.deposit).toLocaleString()}` : "—"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black tracking-widest text-muted uppercase mb-0.5">신청일</p>
                                      <p className="text-sm font-medium text-primary/50">
                                        {new Date(contract.createdAt).toLocaleDateString("ko-KR")}
                                      </p>
                                    </div>
                                  </div>

                                  {contract.specialTerms && (
                                    <div className="mt-3 p-3 bg-primary/[0.03] rounded-xl">
                                      <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-0.5">특약</p>
                                      <p className="text-sm font-medium text-primary/70">{contract.specialTerms}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}
