"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  User,
  Home,
  ChevronDown,
  AlertCircle,
  Edit3,
  X,
  Clock,
  Ban,
  Loader2,
  XCircle,
  CheckCircle2,
} from "lucide-react";

interface Contract {
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

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "임시저장",
  PENDING: "심사 중",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  CANCELLED: "취소됨",
  ACTIVE: "계약 중",
  EXPIRED: "만료",
  TERMINATED: "해지",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING: "bg-blue-50 text-blue-600",
  APPROVED: "bg-orange-50 text-orange-600",
  REJECTED: "bg-red-50 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-500",
  ACTIVE: "bg-accent/15 text-accent",
  EXPIRED: "bg-yellow-50 text-yellow-700",
  TERMINATED: "bg-red-100 text-red-700",
};

export function ContractListTab({ refreshKey, onRefresh }: Props) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Edit Modal
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    startDate: "",
    endDate: "",
    monthlyRent: "",
    deposit: "",
    specialTerms: "",
  });

  // Action Modal (expire / terminate)
  const [actionModal, setActionModal] = useState<{
    id: number;
    type: "expire" | "terminate";
    spaceName: string;
    userName: string;
  } | null>(null);

  // Reject Modal
  const [rejectModal, setRejectModal] = useState<{
    id: number;
    spaceName: string;
    userName: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Approve Modal
  const [approveModal, setApproveModal] = useState<{
    id: number;
    spaceName: string;
    userName: string;
  } | null>(null);
  const [approveForm, setApproveForm] = useState({
    startDate: "",
    endDate: "",
    monthlyRent: "",
    deposit: "",
    specialTerms: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch ──

  useEffect(() => {
    fetchContracts();
  }, [refreshKey, statusFilter]);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/contracts${query}`);
      const result = await res.json();
      if (result.success) setContracts(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Edit ──

  const openEdit = (c: Contract) => {
    setEditId(c.contractId);
    setEditForm({
      startDate: c.startDate || "",
      endDate: c.endDate || "",
      monthlyRent: c.monthlyRent?.toString() || "",
      deposit: c.deposit?.toString() || "",
      specialTerms: c.specialTerms || "",
    });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/contracts/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: editForm.startDate,
          endDate: editForm.endDate,
          monthlyRent: Number(editForm.monthlyRent),
          deposit: Number(editForm.deposit),
          specialTerms: editForm.specialTerms,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setEditId(null);
        onRefresh();
      } else {
        alert(result.message || "수정에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Expire / Terminate ──

  const handleAction = async () => {
    if (!actionModal) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/contracts/${actionModal.id}/${actionModal.type}`,
        { method: "POST" }
      );
      const result = await res.json();
      if (result.success) {
        setActionModal(null);
        onRefresh();
      } else {
        alert(result.message || "처리에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reject ──

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/contracts/${rejectModal.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectedReason: rejectReason }),
      });
      const result = await res.json();
      if (result.success) {
        setRejectModal(null);
        setRejectReason("");
        onRefresh();
      } else {
        alert(result.message || "반려에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Approve ──

  const handleApprove = async () => {
    if (!approveModal) return;
    if (!approveForm.startDate || !approveForm.endDate || !approveForm.monthlyRent || !approveForm.deposit) {
      alert("시작일, 종료일, 월세, 보증금은 필수 입력입니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/contracts/${approveModal.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: approveForm.startDate,
          endDate: approveForm.endDate,
          monthlyRent: Number(approveForm.monthlyRent),
          deposit: Number(approveForm.deposit),
          specialTerms: approveForm.specialTerms || null,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setApproveModal(null);
        setApproveForm({ startDate: "", endDate: "", monthlyRent: "", deposit: "", specialTerms: "" });
        onRefresh();
      } else {
        alert(result.message || "승인에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Filter ──

  const filtered = contracts.filter((c) => {
    // Text search
    const matchesSearch =
      searchTerm === "" ||
      c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.spaceName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Date range filter (based on startDate, fallback to createdAt)
    const refDate = c.startDate || c.createdAt?.split("T")[0];
    if (refDate) {
      if (dateFrom && refDate < dateFrom) return false;
      if (dateTo && refDate > dateTo) return false;
    }

    return true;
  });

  const statuses = ["ALL", "ACTIVE", "PENDING", "APPROVED", "EXPIRED", "TERMINATED", "REJECTED", "CANCELLED", "DRAFT"];

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {[
          { label: "전체", value: contracts.length, color: "text-primary" },
          { label: "계약 중", value: contracts.filter((c) => c.status === "ACTIVE").length, color: "text-accent" },
          { label: "심사 중", value: contracts.filter((c) => c.status === "PENDING").length, color: "text-blue-600" },
          { label: "임시저장", value: contracts.filter((c) => c.status === "DRAFT").length, color: "text-gray-500" },
          { label: "반려", value: contracts.filter((c) => c.status === "REJECTED").length, color: "text-red-500" },
          { label: "만료/해지", value: contracts.filter((c) => c.status === "EXPIRED" || c.status === "TERMINATED").length, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="p-6 bg-white rounded-2xl border border-primary/5 shadow-sm">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-muted mb-2">{s.label}</p>
            <p className={`text-3xl font-black tracking-tighter ${s.color}`}>
              {s.value.toString().padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Status chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                statusFilter === s
                  ? "bg-primary text-background"
                  : "bg-primary/5 text-muted hover:bg-primary/10"
              }`}
            >
              {s === "ALL" ? "전체" : STATUS_LABELS[s] || s}
            </button>
          ))}
        </div>

        {/* Date range + Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white px-3 py-2.5 rounded-xl text-xs font-bold border border-primary/10 focus:ring-2 ring-accent outline-none"
            />
            <span className="text-xs font-bold text-muted">~</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-white px-3 py-2.5 rounded-xl text-xs font-bold border border-primary/10 focus:ring-2 ring-accent outline-none"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
              >
                초기화
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border border-primary/10 focus-within:border-accent/40 transition-colors ml-auto">
            <Search className="w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름 또는 호실 검색..."
              className="bg-transparent text-xs font-bold placeholder:text-muted/40 focus:outline-none w-40"
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-primary/5 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/[0.03] border-b border-primary/5">
                {["ID", "사용자", "호실", "상태", "유형", "계약기간", "월세", ""].map((h) => (
                  <th key={h} className="p-5 text-[10px] font-black uppercase tracking-widest text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-accent animate-spin" />
                      <p className="text-[10px] font-black tracking-widest uppercase text-muted">Loading contracts...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <AlertCircle className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">No contracts found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.contractId}
                    className="border-b border-primary/5 hover:bg-background/50 transition-colors group"
                  >
                    <td className="p-5">
                      <span className="text-xs font-black opacity-30">#{c.contractId}</span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-black">{c.userName}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-muted" />
                        <span className="text-sm font-bold">{c.spaceName}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`text-[10px] font-black tracking-[0.15em] uppercase px-3 py-1.5 rounded-full ${
                          STATUS_COLORS[c.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-[10px] font-bold uppercase text-muted">
                        {c.origin === "ADMIN_INITIATED" ? "관리자" : "신청"}
                      </span>
                    </td>
                    <td className="p-5">
                      {c.startDate && c.endDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted" />
                          <span className="text-xs font-bold">
                            {c.startDate} ~ {c.endDate}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted/50">—</span>
                      )}
                    </td>
                    <td className="p-5">
                      {c.monthlyRent ? (
                        <span className="text-xs font-black">
                          ₩{Number(c.monthlyRent).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-muted/50">—</span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.status !== "TERMINATED" && c.status !== "CANCELLED" && (
                          <button
                            onClick={() => openEdit(c)}
                            className="p-2 rounded-lg hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                            title="수정"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {(c.status === "PENDING" || c.status === "APPROVED") && (
                          <>
                            {c.status === "PENDING" && (
                              <button
                                onClick={() => {
                                  setApproveModal({
                                    id: c.contractId,
                                    spaceName: c.spaceName,
                                    userName: c.userName,
                                  });
                                  setApproveForm({
                                    startDate: "",
                                    endDate: "",
                                    monthlyRent: "",
                                    deposit: "",
                                    specialTerms: "",
                                  });
                                }}
                                className="p-2 rounded-lg hover:bg-green-50 text-muted hover:text-green-600 transition-colors"
                                title="승인"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setRejectModal({
                                  id: c.contractId,
                                  spaceName: c.spaceName,
                                  userName: c.userName,
                                });
                                setRejectReason("");
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                              title="반려"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {c.status === "ACTIVE" && (
                          <>
                            <button
                              onClick={() => {
                                setRejectModal({
                                  id: c.contractId,
                                  spaceName: c.spaceName,
                                  userName: c.userName,
                                });
                                setRejectReason("");
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors"
                              title="반려"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setActionModal({
                                  id: c.contractId,
                                  type: "expire",
                                  spaceName: c.spaceName,
                                  userName: c.userName,
                                })
                              }
                              className="p-2 rounded-lg hover:bg-yellow-50 text-muted hover:text-yellow-700 transition-colors"
                              title="만료"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setActionModal({
                                  id: c.contractId,
                                  type: "terminate",
                                  spaceName: c.spaceName,
                                  userName: c.userName,
                                })
                              }
                              className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                              title="해지"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 pb-4 border-b border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-accent mb-1">Modify #CTR-{editId}</p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Edit Contract</h2>
                </div>
                <button onClick={() => setEditId(null)} className="w-10 h-10 rounded-full hover:bg-muted/30 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">시작일</label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">종료일</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">월세</label>
                    <input
                      type="number"
                      value={editForm.monthlyRent}
                      onChange={(e) => setEditForm({ ...editForm, monthlyRent: e.target.value })}
                      className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">보증금</label>
                    <input
                      type="number"
                      value={editForm.deposit}
                      onChange={(e) => setEditForm({ ...editForm, deposit: e.target.value })}
                      className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">특약 사항</label>
                  <textarea
                    value={editForm.specialTerms}
                    onChange={(e) => setEditForm({ ...editForm, specialTerms: e.target.value })}
                    placeholder="특약 조건을 입력하세요..."
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold h-24 focus:ring-2 ring-accent outline-none resize-none border border-primary/5"
                  />
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-primary/10 flex gap-4">
                <button
                  onClick={() => setEditId(null)}
                  className="flex-1 px-6 py-4 bg-primary/5 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  저장
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Expire/Terminate Modal ── */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div
                  className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    actionModal.type === "expire"
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {actionModal.type === "expire" ? (
                    <Clock className="w-8 h-8" />
                  ) : (
                    <Ban className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                  {actionModal.type === "expire" ? "계약 만료" : "계약 해지"}
                </h3>
                <p className="text-sm font-bold text-muted leading-relaxed mb-1">
                  <strong className="text-primary">
                    {actionModal.userName}
                  </strong>{" "}
                  /{" "}
                  <strong className="text-primary">
                    {actionModal.spaceName}
                  </strong>
                </p>
                <p className="text-xs text-muted mb-8">
                  {actionModal.type === "expire"
                    ? "계약을 만료 처리합니다. 공간은 AVAILABLE로 복원되며 입주자 권한이 해제됩니다."
                    : "계약을 해지 처리합니다. 공간은 AVAILABLE로 복원되며 입주자 권한이 해제됩니다."}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setActionModal(null)}
                    className="flex-1 px-6 py-4 bg-primary/5 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={isSubmitting}
                    className={`flex-1 px-6 py-4 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                      actionModal.type === "expire"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    확인
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-red-50 text-red-600">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-center">신청 반려</h3>
                <p className="text-sm font-bold text-muted leading-relaxed mb-1 text-center">
                  <strong className="text-primary">{rejectModal.userName}</strong>{" / "}
                  <strong className="text-primary">{rejectModal.spaceName}</strong>
                </p>
                <p className="text-xs text-muted mb-6 text-center">
                  신청을 반려합니다. 반려 사유를 필수로 입력해 주세요.
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-[10px] font-black uppercase tracking-widest">반려 사유</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요..."
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-medium h-28 focus:ring-2 ring-accent outline-none resize-none border border-primary/5"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setRejectModal(null)}
                    className="flex-1 px-6 py-4 bg-primary/5 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting || !rejectReason.trim()}
                    className="flex-1 px-6 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    반려
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Approve Modal ── */}
      <AnimatePresence>
        {approveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 pb-4 border-b border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-accent mb-1">Approve Application</p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">신청 승인</h2>
                </div>
                <button onClick={() => setApproveModal(null)} className="w-10 h-10 rounded-full hover:bg-muted/30 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 pb-4">
                <p className="text-sm font-bold text-muted mb-6">
                  <strong className="text-primary">{approveModal.userName}</strong>{" / "}
                  <strong className="text-primary">{approveModal.spaceName}</strong> — 계약 조건을 확정하세요.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">시작일 *</label>
                    <input
                      type="date"
                      value={approveForm.startDate}
                      onChange={(e) => setApproveForm({ ...approveForm, startDate: e.target.value })}
                      className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">종료일 *</label>
                    <input
                      type="date"
                      value={approveForm.endDate}
                      onChange={(e) => setApproveForm({ ...approveForm, endDate: e.target.value })}
                      className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">월세 *</label>
                    <input
                      type="number"
                      value={approveForm.monthlyRent}
                      onChange={(e) => setApproveForm({ ...approveForm, monthlyRent: e.target.value })}
                      placeholder="예: 500000"
                      className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">보증금 *</label>
                    <input
                      type="number"
                      value={approveForm.deposit}
                      onChange={(e) => setApproveForm({ ...approveForm, deposit: e.target.value })}
                      placeholder="예: 5000000"
                      className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest">특약 사항</label>
                  <textarea
                    value={approveForm.specialTerms}
                    onChange={(e) => setApproveForm({ ...approveForm, specialTerms: e.target.value })}
                    placeholder="특약 조건을 입력하세요 (선택)..."
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-medium h-24 focus:ring-2 ring-accent outline-none resize-none border border-primary/5"
                  />
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-primary/10 flex gap-4">
                <button
                  onClick={() => setApproveModal(null)}
                  className="flex-1 px-6 py-4 bg-primary/5 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  승인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
