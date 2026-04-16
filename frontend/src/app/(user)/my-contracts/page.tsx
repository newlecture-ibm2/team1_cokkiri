"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  XCircle,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ContractStatusStepper } from "./_components/ContractStatusStepper";
import { ContractSignModal } from "./_components/ContractSignModal";
import { ContractDraftResult, ContractSignResponse } from "@/types/contract";
import { ApiResponse } from "@/types/api";
import { cn } from "@/lib/utils";

export default function MyContractsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [contracts, setContracts] = useState<ContractDraftResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingContractId, setSigningContractId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/contracts/my");
        if (!response.ok) throw new Error("계약 내역을 불러오는데 실패했습니다.");
        const result: ApiResponse<ContractDraftResult[]> = await response.json();
        if (result.success && result.data) {
          setContracts(result.data);
        } else {
          setError(result.message || "오류가 발생했습니다.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter(c => {
    if (filter === "all") return true;
    if (filter === "pending") return c.status === "PENDING" || c.status === "DRAFT" || c.status === "REJECTED";
    if (filter === "completed") return c.status === "ACTIVE" || c.status === "APPROVED";
    return true;
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: "임시저장",
      PENDING: "심사 중",
      APPROVED: "승인 완료",
      REJECTED: "신청 반려",
      CANCELLED: "취소됨",
      ACTIVE: "계약 중",
      EXPIRED: "만료됨",
      TERMINATED: "해지됨"
    };
    return labels[status] || status;
  };

  const handleSign = async (signatureData: string) => {
    if (!signingContractId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/contracts/${signingContractId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          termsAgreed: true,
          privacyPolicyAgreed: true,
          signatureData,
        }),
      });
      const result: ApiResponse<ContractSignResponse> = await response.json();
      if (result.success && result.data) {
        setSigningContractId(null);
        alert(result.data.message || "계약이 체결되었습니다!");
        router.push("/my-contracts");
        router.refresh();
      } else {
        alert(result.message || "계약 체결에 실패했습니다.");
        setSigningContractId(null);
      }
    } catch (err: any) {
      alert(err.message || "네트워크 오류가 발생했습니다.");
      setSigningContractId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-[clamp(2rem,5vw,5rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">
          <div className="flex flex-row flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="flex-shrink-0">
              <h1 className="text-[clamp(2.25rem,7vw,5.5rem)] font-black leading-none tracking-tight uppercase whitespace-nowrap text-primary">
                CONTRACT<span className="underline underline-offset-4 decoration-[var(--color-accent)]">S.</span>
                <span className="text-[clamp(1rem,3vw,2.5rem)] font-bold tracking-normal ml-3 align-baseline opacity-80">계약 내역</span>
              </h1>
            </div>
            <div className="flex items-center justify-end shrink-0 pb-1 ml-auto">
              <Link href="/rooms" className="group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-[clamp(1rem,3vw,2rem)] h-[clamp(2.5rem,5vw,3.5rem)] bg-primary text-background rounded-xl font-bold tracking-tight text-[clamp(0.75rem,1.5vw,1rem)] transition-all hover:bg-primary/95 shadow-xl shadow-primary/20 flex items-center gap-2"
                >
                  <Plus className="w-[clamp(1rem,2vw,1.25rem)] h-[clamp(1rem,2vw,1.25rem)]" />
                  신규 신청
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-12 md:pt-20">
        {/* Editorial Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { label: "TOTAL", value: contracts.length.toString().padStart(2, '0'), icon: FileText, desc: "전체 계약 건수" },
            { label: "PENDING", value: contracts.filter(c => c.status === 'PENDING').length.toString().padStart(2, '0'), icon: Clock, desc: "심사 대기 중" },
            { label: "ACTIVE", value: contracts.filter(c => c.status === 'ACTIVE').length.toString().padStart(2, '0'), icon: CheckCircle2, desc: "현재 거주 중" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative p-10 bg-primary/5 border border-primary/10 rounded-[2rem] overflow-hidden transition-all hover:bg-primary/10"
            >
              <div className="relative z-10">
                <stat.icon className="w-8 h-8 text-accent mb-8" />
                <span className="text-[14px] font-black tracking-[0.3em] uppercase opacity-40 mb-2">
                  {stat.label}
                </span>
                <h3 className="text-6xl font-black tracking-tighter leading-none mb-4">
                  {stat.value}
                </h3>
                <p className="text-sm font-bold tracking-tight opacity-60">{stat.desc}</p>
              </div>
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-32 h-32" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category Filter Section (Community Style) */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-primary/10 pb-8 mb-12">
          <div className="flex items-center gap-[clamp(1rem,3vw,2.5rem)] overflow-x-auto scrollbar-hide">
            {[
              { id: "all", label: "전체" },
              { id: "pending", label: "진행 중" },
              { id: "completed", label: "완료된 계약" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 text-[clamp(0.75rem,1.4vw,1.125rem)] font-black tracking-[0.2em] transition-all whitespace-nowrap pb-2 border-b-2 uppercase",
                  filter === f.id
                    ? "text-accent border-accent"
                    : "text-primary/40 border-transparent hover:text-primary/80"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 group px-5 py-2.5 bg-primary/5 rounded-xl border border-primary/5 focus-within:border-accent/40 transition-colors">
            <Search className="w-4 h-4 opacity-40" />
            <input
              type="text"
              placeholder="SEARCH..."
              className="bg-transparent text-[14px] font-black tracking-[0.2em] uppercase placeholder:text-primary/20 focus:outline-none w-40"
            />
          </div>
        </section>

        {/* Contract List */}
        <div className="space-y-12">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <p className="text-[14px] font-black tracking-[0.2em] uppercase opacity-40">FETCHING REAL-TIME CONTRACT DATA...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center space-y-6">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <h3 className="text-2xl font-black tracking-tighter uppercase italic">{error}</h3>
              <button
                onClick={() => window.location.reload()}
                className="px-10 py-5 bg-primary text-background rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-accent transition-all"
              >
                RETRY CONNECTION
              </button>
            </div>
          ) : filteredContracts.map((contract, index) => (
            <motion.div
              key={contract.contractId}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.002, borderColor: 'var(--accent)' }}
              onClick={() => router.push(`/rooms/${contract.spaceId}`)}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-white rounded-[2.5rem] p-10 md:p-14 border border-primary/5 shadow-2xl shadow-primary/5 transition-all relative overflow-hidden cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 relative z-10">
                <div className="flex flex-col gap-8 max-w-2xl w-full">
                  <div className="flex items-center gap-4">
                    <span className="text-[14px] font-black tracking-[0.3em] uppercase opacity-30">
                      ID: CTR-00{contract.contractId}
                    </span>
                    <span className={`text-[14px] font-black tracking-[0.2em] uppercase px-5 py-2 rounded-full ${contract.status === 'ACTIVE' ? 'bg-accent/20 text-accent' :
                      contract.status === 'APPROVED' ? 'bg-orange-100 text-orange-600' :
                        contract.status === 'PENDING' ? 'bg-blue-100 text-blue-600' :
                          contract.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                            'bg-muted/20 text-muted'
                      }`}>
                      {getStatusLabel(contract.status)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-5xl font-black tracking-tighter leading-tight group-hover:text-accent transition-colors uppercase">
                      {contract.spaceName || `ROOM ${contract.spaceId}`}
                    </h4>
                    <p className="mt-4 text-[14px] font-black tracking-widest text-muted uppercase leading-relaxed">
                      Applied at {new Date(contract.createdAt).toLocaleDateString()} — {contract.desiredDurationMonths} Months duration
                    </p>
                  </div>

                  {/* Stepper Integration */}
                  <div className="pt-8 border-t border-primary/5">
                    <ContractStatusStepper currentStatus={contract.status} />
                  </div>

                  {/* Active Contract Details Block */}
                  {contract.status === 'ACTIVE' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 p-6 md:p-8 bg-accent/5 border border-accent/10 rounded-3xl"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-3">
                          <p className="text-[14px] font-black uppercase tracking-widest opacity-40 h-11">Contract Period</p>
                          <div className="flex flex-col text-sm font-black tracking-tight leading-tight md:text-base">
                            <span>{contract.startDate || '—'}</span>
                            <span className="text-[14px] opacity-40 mt-1 mb-1 font-medium tracking-widest">TO</span>
                            <span>{contract.endDate || '—'}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[14px] font-black uppercase tracking-widest opacity-40">Monthly Rent</p>
                          <p className="text-sm font-black tracking-tight md:text-base">
                            ₩{(contract.monthlyRent || 0).toLocaleString()}
                            <span className="text-[14px] opacity-40 ml-1">/MONTH</span>
                          </p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[14px] font-black uppercase tracking-widest opacity-40">Deposit<br />&nbsp;</p>
                          <p className="text-sm font-black tracking-tight md:text-base">
                            ₩{(contract.deposit || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[14px] font-black uppercase tracking-widest opacity-40">Remaining<br />&nbsp;</p>
                          <p className="text-sm font-black tracking-tight md:text-base">
                            {Math.max(0, contract.desiredDurationMonths)} Months
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Rejection Reason Block */}
                  {contract.status === 'REJECTED' && contract.rejectedReason && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 p-6 md:p-8 bg-red-50 border border-red-100 rounded-3xl"
                    >
                      <div className="flex items-start gap-4 text-red-600">
                        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="space-y-3">
                          <p className="text-[14px] font-black uppercase tracking-widest">Reason for Rejection</p>
                          <p className="text-sm font-bold leading-relaxed md:text-base">{contract.rejectedReason}</p>
                          <p className="text-[14px] font-bold opacity-70 italic">신청 내용을 보완하여 다시 제출해주시기 바랍니다.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex flex-col gap-6 lg:items-end lg:justify-between h-full pt-4">
                  <div className="space-y-4">
                    {contract.status === 'APPROVED' ? (
                      <p className="text-[14px] font-black tracking-[0.2em] text-orange-600 uppercase animate-pulse">
                        Action Required: Please Review & Sign
                      </p>
                    ) : contract.status === 'PENDING' ? (
                      <p className="text-[14px] font-black tracking-[0.2em] text-blue-600 uppercase">
                        Document review in progress
                      </p>
                    ) : contract.status === 'REJECTED' ? (
                      <p className="text-[14px] font-black tracking-[0.2em] text-red-600 uppercase">
                        Application Declined
                      </p>
                    ) : contract.status === 'ACTIVE' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                        <p className="text-[14px] font-black tracking-[0.2em] text-green-600 uppercase">
                          Currently Living Here
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-4">
                    {contract.status !== 'ACTIVE' && (
                      <Link
                        href={`/contract-apply?id=${contract.contractId}&spaceId=${contract.spaceId}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="h-16 px-8 bg-muted/10 hover:bg-muted/20 text-primary rounded-2xl text-[14px] font-black tracking-[0.2em] uppercase transition-all whitespace-nowrap">
                          VIEW SUBMISSION
                        </button>
                      </Link>
                    )}
                    {(contract.status === 'APPROVED' || contract.status === 'REJECTED') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (contract.status === 'APPROVED') {
                            setSigningContractId(contract.contractId);
                          }
                        }}
                        className={`h-16 px-10 rounded-2xl text-[14px] font-black tracking-[0.2em] uppercase transition-all flex items-center gap-4 whitespace-nowrap shadow-xl ${contract.status === 'APPROVED' ? 'bg-accent text-white hover:bg-primary shadow-accent/20' :
                          contract.status === 'REJECTED' ? 'bg-red-500 text-white hover:bg-red-600' :
                            'bg-primary text-background'
                          }`}>
                        {contract.status === 'APPROVED' ? 'REVIEW & SIGN' : 'RE-APPLY'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Editorial background number */}
              <span className="absolute -right-10 -bottom-20 text-[25vw] font-black opacity-[0.02] select-none pointer-events-none group-hover:opacity-[0.04] transition-opacity">
                {String(index + 1).padStart(2, '0')}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && filteredContracts.length === 0 && (
          <div className="py-32 text-center rounded-[4rem] border-2 border-dashed border-primary/10">
            <div className="mb-12">
              <span className="text-[15vw] font-black text-primary/5 uppercase leading-none">EMPTY</span>
            </div>
            <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">No Active Contracts.</h3>
            <p className="text-lg opacity-50 mb-12 tracking-tight">당신의 첫 번째 코끼리 공간을 찾아보세요.</p>
            <Link
              href="/rooms"
              className="inline-block px-12 py-6 bg-accent text-white rounded-full font-black tracking-widest uppercase text-sm shadow-2xl shadow-accent/20 transition-all hover:scale-105"
            >
              EXPLORE SPACES
            </Link>
          </div>
        )}
      </main>

      {/* Contract Sign Modal */}
      <ContractSignModal
        isOpen={signingContractId !== null}
        onClose={() => setSigningContractId(null)}
        onSign={handleSign}
        contractId={signingContractId ?? 0}
        spaceId={contracts.find(c => c.contractId === signingContractId)?.spaceId ?? 0}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
