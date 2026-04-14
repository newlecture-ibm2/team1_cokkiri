"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Home,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface PendingContract {
  contractId: number;
  userId: number;
  userName: string;
  spaceId: number;
  spaceName: string;
  status: string;
  desiredStartDate: string;
  desiredDurationMonths: number;
  address: string;
  bankAccount: string;
  usagePurpose: string;
  requestNote: string;
  createdAt: string;
}

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

export function ApplicationsTab({ refreshKey, onRefresh }: Props) {
  const [contracts, setContracts] = useState<PendingContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [approveForm, setApproveForm] = useState({
    startDate: "",
    endDate: "",
    monthlyRent: "",
    deposit: "",
    specialTerms: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  const selectedContract = contracts.find((c) => c.contractId === selectedId);

  useEffect(() => {
    if (modalType === "approve" && selectedContract) {
      const start = new Date(selectedContract.desiredStartDate);
      const end = new Date(start);
      end.setMonth(start.getMonth() + selectedContract.desiredDurationMonths);

      setApproveForm({
        startDate: selectedContract.desiredStartDate,
        endDate: end.toISOString().split("T")[0],
        monthlyRent: "",
        deposit: "",
        specialTerms: "",
      });

      // 방 데이터에서 월세/보증금 자동 조회
      fetch(`/api/rooms/${selectedContract.spaceId}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data) {
            setApproveForm((prev) => ({
              ...prev,
              monthlyRent: result.data.monthlyRent?.toString() || prev.monthlyRent,
              deposit: result.data.deposit?.toString() || prev.deposit,
            }));
          }
        })
        .catch((err) => console.error("방 정보 조회 실패:", err));
    }
  }, [modalType, selectedContract]);

  useEffect(() => {
    fetchApplications();
  }, [refreshKey]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/contracts/applications");
      const result = await res.json();
      if (result.success) setContracts(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/contracts/${selectedId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: approveForm.startDate,
          endDate: approveForm.endDate,
          monthlyRent: Number(approveForm.monthlyRent),
          deposit: Number(approveForm.deposit),
          specialTerms: approveForm.specialTerms,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setModalType(null);
        setSelectedId(null);
        onRefresh();
        fetchApplications();
      } else {
        alert(result.message || "오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/contracts/${selectedId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectedReason: rejectReason }),
      });
      const result = await res.json();
      if (result.success) {
        setModalType(null);
        setSelectedId(null);
        setRejectReason("");
        onRefresh();
        fetchApplications();
      } else {
        alert(result.message || "오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Stats ── */}
      <div className="flex items-center gap-6 mb-8">
        <div className="px-6 py-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-500 mb-1">
            Pending
          </p>
          <p className="text-3xl font-black tracking-tighter text-blue-700">
            {contracts.length.toString().padStart(2, "0")}
          </p>
        </div>
        <p className="text-sm font-bold text-muted max-w-md leading-relaxed">
          PENDING 상태의 입주 신청을 검토하고 승인 조건을 확정하거나 반려합니다.
        </p>
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
                {["ID", "신청자", "호실", "희망 시작일", "기간", "신청일", ""].map((h) => (
                  <th key={h} className="p-5 text-[10px] font-black uppercase tracking-widest text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-accent animate-spin" />
                      <p className="text-[10px] font-black tracking-widest uppercase text-muted">
                        Analyzing applications...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <AlertCircle className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">
                      No pending applications found.
                    </p>
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr
                    key={contract.contractId}
                    className="group border-b border-primary/5 hover:bg-background/50 transition-colors"
                  >
                    <td className="p-5">
                      <span className="text-xs font-black opacity-30">
                        #{contract.contractId}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-black">{contract.userName}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-muted" />
                        <span className="text-sm font-bold">{contract.spaceName}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        <span className="text-xs font-bold">
                          {new Date(contract.desiredStartDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-bold">{contract.desiredDurationMonths}개월</span>
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-medium text-muted">
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedId(contract.contractId);
                            setModalType("approve");
                          }}
                          className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-accent transition-colors"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => {
                            setSelectedId(contract.contractId);
                            setModalType("reject");
                          }}
                          className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-100 transition-colors"
                        >
                          반려
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Approve / Reject Modal ── */}
      <AnimatePresence>
        {modalType && selectedContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 pb-4 border-b border-primary/10 flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-accent mb-1">
                    {modalType === "approve" ? "Review Conditions" : "Rejection Details"}
                  </p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                    {modalType === "approve" ? "신청 승인" : "신청 반려"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setModalType(null);
                    setSelectedId(null);
                  }}
                  className="w-10 h-10 rounded-full hover:bg-muted/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 flex flex-col gap-6 overflow-y-auto flex-grow scrollbar-hide">
                {/* Applicant Info */}
                <div className="flex flex-col gap-1 p-4 bg-primary/[0.03] rounded-xl border border-primary/5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Target Applicant
                  </span>
                  <p className="text-sm font-black uppercase">
                    {selectedContract.userName} — {selectedContract.spaceName}
                  </p>
                </div>

                {/* Submitted Details */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-primary/[0.02] rounded-2xl border border-primary/5">
                  <div className="col-span-2 space-y-1">
                    <p className="text-[9px] font-black tracking-widest text-accent uppercase">
                      Submitted Details
                    </p>
                    <div className="h-px bg-accent/10 w-full" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted uppercase">Desired Schedule</p>
                    <p className="text-xs font-black">
                      {selectedContract.desiredStartDate} ({selectedContract.desiredDurationMonths}개월)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted uppercase">Bank Account</p>
                    <p className="text-xs font-black">{selectedContract.bankAccount}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-[9px] font-bold text-muted uppercase">Address</p>
                    <p className="text-xs font-black leading-tight">{selectedContract.address}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-[9px] font-bold text-muted uppercase">Usage Purpose</p>
                    <p className="text-xs font-bold italic opacity-70">
                      &quot;{selectedContract.usagePurpose || "Not specified"}&quot;
                    </p>
                  </div>
                  {selectedContract.requestNote && (
                    <div className="col-span-2 space-y-1 pt-2">
                      <p className="text-[9px] font-bold text-muted uppercase">Applicant Notes</p>
                      <div className="p-3 bg-white/50 rounded-lg border border-primary/5 text-xs font-medium italic leading-relaxed">
                        {selectedContract.requestNote}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form */}
                {modalType === "approve" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">시작일</label>
                      <input
                        type="date"
                        value={approveForm.startDate}
                        onChange={(e) => setApproveForm({ ...approveForm, startDate: e.target.value })}
                        className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">종료일</label>
                      <input
                        type="date"
                        value={approveForm.endDate}
                        onChange={(e) => setApproveForm({ ...approveForm, endDate: e.target.value })}
                        className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">월세</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={approveForm.monthlyRent}
                        onChange={(e) => setApproveForm({ ...approveForm, monthlyRent: e.target.value })}
                        className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">보증금</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={approveForm.deposit}
                        onChange={(e) => setApproveForm({ ...approveForm, deposit: e.target.value })}
                        className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">특약 사항</label>
                      <textarea
                        placeholder="특약 조건을 입력하세요..."
                        value={approveForm.specialTerms}
                        onChange={(e) => setApproveForm({ ...approveForm, specialTerms: e.target.value })}
                        className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold h-24 focus:ring-2 ring-accent outline-none resize-none border border-primary/5"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-red-500">
                      반려 사유
                    </label>
                    <textarea
                      placeholder="신청을 반려하는 사유를 입력하세요..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="bg-red-50/50 border border-red-100 p-4 rounded-xl text-sm font-bold h-32 focus:ring-2 ring-red-500 outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 pt-4 border-t border-primary/10 flex gap-4 flex-shrink-0">
                <button
                  onClick={() => {
                    setModalType(null);
                    setSelectedId(null);
                  }}
                  className="flex-1 px-6 py-4 bg-primary/5 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={modalType === "approve" ? handleApprove : handleReject}
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-4 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                    modalType === "approve"
                      ? "bg-primary hover:bg-accent"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {modalType === "approve" ? "승인 확정" : "반려 확정"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
