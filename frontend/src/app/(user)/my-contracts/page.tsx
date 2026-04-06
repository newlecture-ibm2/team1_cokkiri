"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  ArrowUpRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { ContractStatusStepper } from "./_components/ContractStatusStepper";
import { ContractDraftResult } from "@/types/contract";
import { ApiResponse } from "@/types/api";

export default function MyContractsPage() {
  const [filter, setFilter] = useState("all");
  const [contracts, setContracts] = useState<ContractDraftResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/bff/contracts/my");
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
    if (filter === "pending") return c.status === "PENDING" || c.status === "DRAFT";
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

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-primary selection:text-background">
      {/* Editorial Header Section */}
      <section className="px-6 pt-24 pb-12 md:px-12 md:pt-32 lg:px-24">
        <div className="max-w-[1400px] mx-auto border-b-2 border-primary pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
                  DASHBOARD / 01
                </span>
                <h1 className="text-[10vw] md:text-[8vw] lg:text-[6vw] font-black leading-[0.85] tracking-tighter uppercase whitespace-nowrap">
                  MY<br />CONTRACTS
                </h1>
                <p className="max-w-xl text-lg font-medium tracking-tight opacity-70 border-l-2 border-accent pl-6 mt-8">
                  관리 중인 계약 내역과 진행 중인 입주 신청을 한눈에 확인하고 제어하세요.
                </p>
              </div>

              <Link href="/rooms" className="group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-6 bg-primary text-background rounded-full font-black tracking-widest uppercase text-sm flex items-center gap-4 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  APPLY NEW SPACE
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 py-12 md:py-20">
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
                <span className="block text-[10px] font-black tracking-[0.3em] uppercase opacity-40 mb-2">
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

        {/* Filter Bar - RE-ENABLED WITHOUT LOOP FOR DIAGNOSIS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12 py-8 border-y border-red-500">
          <div className="flex items-center gap-12 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            <div role="button" onClick={() => setFilter("all")} className="text-[10px] font-black tracking-[0.3em] uppercase transition-all">ALL</div>
            <div role="button" onClick={() => setFilter("pending")} className="text-[10px] font-black tracking-[0.3em] uppercase transition-all">PENDING</div>
            <div role="button" onClick={() => setFilter("completed")} className="text-[10px] font-black tracking-[0.3em] uppercase transition-all">COMPLETED</div>
          </div>

          <div className="flex items-center gap-6 group">
            <input
              type="text"
              placeholder="SEARCH..."
              className="bg-transparent text-[10px] font-black tracking-[0.2em] uppercase placeholder:text-primary/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Contract List */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">FETCHING REAL-TIME CONTRACT DATA...</p>
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
              whileHover={{ scale: 1.005 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-white rounded-[2rem] p-10 border border-primary/5 shadow-xl shadow-primary/5 transition-all relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 relative z-10">
                <div className="flex flex-col gap-6 max-w-2xl">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
                      ID: CTR-00{contract.contractId}
                    </span>
                    <span className={`text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full ${contract.status === 'ACTIVE' ? 'bg-accent/20 text-accent' :
                      contract.status === 'APPROVED' ? 'bg-orange-100 text-orange-600' :
                        contract.status === 'PENDING' ? 'bg-blue-100 text-blue-600' :
                          'bg-muted/20 text-muted'
                      }`}>
                      {getStatusLabel(contract.status)}
                    </span>
                  </div>
                  <h4 className="text-4xl font-black tracking-tighter leading-tight group-hover:text-accent transition-colors">
                    PRIVATE SPACE - ROOM 00{contract.spaceId}
                  </h4>

                  {/* Stepper Integration */}
                  <div className="pt-4 border-t border-primary/5">
                    <ContractStatusStepper currentStatus={contract.status} />
                  </div>
                </div>

                <div className="flex flex-col gap-4 self-end">
                  {contract.status === 'APPROVED' ? (
                    <p className="text-[10px] font-black tracking-[0.2em] text-orange-600 uppercase mb-2 animate-pulse">
                      Action Required: Please Review & Sign
                    </p>
                  ) : contract.status === 'PENDING' ? (
                    <p className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase mb-2">
                      서류 검토 중입니다. 잠시만 기다려 주세요.
                    </p>
                  ) : null}
                  <div className="flex items-center gap-4">
                    <Link href={`/contract-apply?spaceId=${contract.spaceId}`}>
                      <button className="px-10 py-5 bg-secondary/10 hover:bg-secondary/20 text-primary rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all">
                        VIEW DETAILS
                      </button>
                    </Link>
                    <button className={`px-10 py-5 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all flex items-center gap-3 ${contract.status === 'APPROVED' ? 'bg-accent text-white hover:bg-primary shadow-xl shadow-accent/20' : 'bg-primary text-background'
                      }`}>
                      {contract.status === 'APPROVED' ? 'REVIEW & SIGN' : 'MANAGE'} <ArrowUpRight className="w-4 h-4" />
                    </button>
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
          <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-primary/10">
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
    </div>
  );
}
