"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Home,
  ChevronRight,
  MoreVertical,
  X
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
  createdAt: string;
}

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<PendingContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);

  // Form states
  const [approveForm, setApproveForm] = useState({
    startDate: "",
    endDate: "",
    monthlyRent: "",
    deposit: "",
    specialTerms: ""
  });
  const [rejectReason, setRejectReason] = useState("");

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

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/admin/contracts/${selectedId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: approveForm.startDate,
          endDate: approveForm.endDate,
          monthlyRent: Number(approveForm.monthlyRent),
          deposit: Number(approveForm.deposit),
          specialTerms: approveForm.specialTerms
        })
      });
      const result = await res.json();
      if (result.success) {
        alert("계약이 성공적으로 승인되었습니다.");
        setModalType(null);
        fetchApplications();
      } else {
        alert(result.message || "오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/admin/contracts/${selectedId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectedReason: rejectReason })
      });
      const result = await res.json();
      if (result.success) {
        alert("계약 신청이 반려되었습니다.");
        setModalType(null);
        fetchApplications();
      } else {
        alert(result.message || "오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedContract = contracts.find(c => c.contractId === selectedId);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-12 bg-background min-h-screen">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-primary/10">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">Admin Dashboard</p>
          <h1 className="text-[10vw] md:text-[6vw] font-black tracking-tighter leading-[0.85] uppercase">
            Contracts <span className="text-accent underline underline-offset-[1vw] decoration-accent/30 tracking-tighter">Review</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black">{contracts.length}</span>
            <span className="text-[10px] font-black uppercase text-muted">Pending Total</span>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-primary/5 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-primary/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted">ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted">User</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted">Space</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted hidden md:table-cell">Desired Start</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted">Applied At</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black tracking-widest uppercase text-muted">Analyzing Applications...</p>
                    </div>
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">No pending applications found.</p>
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <motion.tr
                    layoutId={`row-${contract.contractId}`}
                    key={contract.contractId}
                    className="group border-b border-primary/5 hover:bg-background/50 transition-colors"
                  >
                    <td className="p-6">
                      <span className="text-xs font-black opacity-30">#CTR-{contract.contractId}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black uppercase">{contract.userName}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-muted" />
                        <span className="text-sm font-bold">{contract.spaceName}</span>
                      </div>
                    </td>
                    <td className="p-6 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted" />
                        <span className="text-sm font-bold">{new Date(contract.desiredStartDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-xs font-medium text-muted">{new Date(contract.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedId(contract.contractId); setModalType("approve"); }}
                          className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-full hover:bg-accent transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => { setSelectedId(contract.contractId); setModalType("reject"); }}
                          className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-full hover:bg-red-100 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modalType && selectedContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-4 border-b border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-accent mb-1">
                    {modalType === "approve" ? "Review Conditions" : "Rejection Details"}
                  </p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                    {modalType === "approve" ? "Accept Application" : "Decline Application"}
                  </h2>
                </div>
                <button
                  onClick={() => setModalType(null)}
                  className="w-10 h-10 rounded-full hover:bg-muted/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-1 p-4 bg-muted/20 rounded-xl">
                  <span className="text-[10px] font-black uppercase opacity-40">Target Applicant</span>
                  <p className="text-sm font-black uppercase">{selectedContract.userName} — {selectedContract.spaceName}</p>
                </div>

                {modalType === "approve" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">Start Date</label>
                      <input
                        type="date"
                        value={approveForm.startDate}
                        onChange={(e) => setApproveForm({ ...approveForm, startDate: e.target.value })}
                        className="bg-muted/30 p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">End Date</label>
                      <input
                        type="date"
                        value={approveForm.endDate}
                        onChange={(e) => setApproveForm({ ...approveForm, endDate: e.target.value })}
                        className="bg-muted/30 p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">Rent (Monthly)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={approveForm.monthlyRent}
                        onChange={(e) => setApproveForm({ ...approveForm, monthlyRent: e.target.value })}
                        className="bg-muted/30 p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">Deposit</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={approveForm.deposit}
                        onChange={(e) => setApproveForm({ ...approveForm, deposit: e.target.value })}
                        className="bg-muted/30 p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none"
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest">Special Terms</label>
                      <textarea
                        placeholder="Add any special conditions..."
                        value={approveForm.specialTerms}
                        onChange={(e) => setApproveForm({ ...approveForm, specialTerms: e.target.value })}
                        className="bg-muted/30 p-4 rounded-xl text-sm font-bold h-24 focus:ring-2 ring-accent outline-none resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-red-500">Reason for Rejection</label>
                    <textarea
                      placeholder="Explain why this application was declined..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="bg-red-50/50 border border-red-100 p-4 rounded-xl text-sm font-bold h-32 focus:ring-2 ring-red-500 outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="p-8 pt-0 flex gap-4">
                <button
                  onClick={() => setModalType(null)}
                  className="flex-1 px-8 py-4 bg-muted/30 text-[10px] font-black uppercase rounded-full hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={modalType === "approve" ? handleApprove : handleReject}
                  className={`flex-1 px-8 py-4 ${modalType === "approve" ? 'bg-primary' : 'bg-red-500'} text-white text-[10px] font-black uppercase rounded-full hover:opacity-90 transition-opacity`}
                >
                  {modalType === "approve" ? "Confirm & Issue" : "Confirm Rejection"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
