"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight,
  LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";

export default function MyContractsPage() {
  const [filter, setFilter] = useState("all");

  // Mock data for initial UI
  const contracts = [
    {
      id: "CON-2024-001",
      spaceName: "성수 도란도란 1호점 - 201호",
      status: "applied",
      statusLabel: "심사 중",
      date: "2024.03.25",
      type: "입주 신청"
    },
    {
      id: "CON-2023-045",
      spaceName: "강남 코끼리 하우스 - 402호",
      status: "active",
      statusLabel: "거주 중",
      date: "2023.09.01",
      type: "임대 계약"
    }
  ];

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
                  우리는 당신의 새로운 시작을 가장 세련된 방식으로 관리합니다.
                </p>
              </div>

              <Link href="/contract-apply" className="group">
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
            { label: "TOTAL", value: "02", icon: FileText, desc: "전체 계약 건수" },
            { label: "PENDING", value: "01", icon: Clock, desc: "심사 대기 중" },
            { label: "ACTIVE", value: "01", icon: CheckCircle2, desc: "현재 거주 중" }
          ].map((stat, i) => (stat &&
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

        {/* Filter Bar with Metadata style */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12 py-8 border-y border-primary/10">
          <div className="flex items-center gap-12 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {["ALL", "PENDING", "COMPLETED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f.toLowerCase())}
                className={`text-[10px] font-black tracking-[0.3em] uppercase transition-all relative ${filter === f.toLowerCase() ? "text-primary" : "text-primary/40 hover:text-primary"
                  }`}
              >
                {f}
                {filter === f.toLowerCase() && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-4 left-0 right-0 h-1 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 group">
            <Search className="w-5 h-5 text-primary/30 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="SEARCH CONTRACTS..."
              className="bg-transparent text-[10px] font-black tracking-[0.2em] uppercase placeholder:text-primary/20 focus:outline-none w-full md:w-64"
            />
          </div>
        </div>

        {/* Contract List - Cards with rounded-[2rem] and premium feel */}
        <div className="space-y-8">
          {contracts.map((contract, index) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01, y: -4 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-white rounded-[2rem] p-10 border border-primary/5 shadow-xl shadow-primary/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-12 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className={`w-28 h-28 rounded-3xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 ${contract.status === 'active' ? 'bg-[#768064]/10 text-accent' : 'bg-[#4C583E]/10 text-muted'
                  }`}>
                  <FileText className="w-12 h-12" />
                </div>

                <div className="text-center md:text-left space-y-3">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
                      ID: {contract.id}
                    </span>
                    <span className={`text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full ${contract.status === 'active' ? 'bg-accent/20 text-accent' : 'bg-muted/20 text-muted'
                      }`}>
                      {contract.statusLabel}
                    </span>
                  </div>
                  <h4 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight group-hover:text-accent transition-colors">
                    {contract.spaceName}
                  </h4>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-xs font-bold tracking-tight opacity-50 uppercase">
                    <span>{contract.type}</span>
                    <span className="w-1 h-1 rounded-full bg-primary/20" />
                    <span>APPLIED ON {contract.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 relative z-10">
                <button className="px-10 py-5 bg-secondary/10 hover:bg-secondary/20 text-primary rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all">
                  DETAILS
                </button>
                <button className="px-10 py-5 bg-primary text-background rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all flex items-center gap-3 hover:bg-accent">
                  MANAGE <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Editorial background number */}
              <span className="absolute -right-10 -bottom-20 text-[25vw] font-black opacity-[0.02] select-none pointer-events-none group-hover:opacity-[0.04] transition-opacity">
                {String(index + 1).padStart(2, '0')}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {contracts.length === 0 && (
          <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-primary/10">
            <div className="mb-12">
              <span className="text-[15vw] font-black text-primary/5 uppercase leading-none">EMPTY</span>
            </div>
            <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">No Active Contracts.</h3>
            <p className="text-lg opacity-50 mb-12 tracking-tight">당신의 첫 번째 코끼리 공간을 찾아보세요.</p>
            <Link
              href="/"
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


