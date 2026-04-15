"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ClipboardCheck,
  Plus,
  History,
} from "lucide-react";
import { ContractListTab } from "./_components/ContractListTab";
import { ApplicationsTab } from "./_components/ApplicationsTab";
import { TenantHistoryTab } from "./_components/TenantHistoryTab";
import { CreateContractModal } from "./_components/CreateContractModal";

type TabType = "all" | "applications" | "history";

export default function AdminContractsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "전체 계약", icon: FileText },
    { key: "applications", label: "신청 관리", icon: ClipboardCheck },
    { key: "history", label: "방별 변천사", icon: History },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 md:p-12 bg-background min-h-screen text-primary">
      {/* ── Header ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">
            Admin / Contract Management
          </p>
          <h1 className="text-[10vw] md:text-[6vw] font-black tracking-tighter leading-[0.85] uppercase">
            Contracts
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-8 py-5 bg-primary text-background rounded-full font-black tracking-widest uppercase text-[10px] flex items-center gap-3 transition-all hover:bg-accent shadow-lg"
        >
          <Plus className="w-4 h-4" />
          직접 등록
        </motion.button>
      </section>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-1.5 bg-primary/5 rounded-full w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeTab === tab.key
                ? "bg-primary text-background shadow-md"
                : "text-primary/60 hover:text-primary hover:bg-primary/5"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "all" && (
            <ContractListTab refreshKey={refreshKey} onRefresh={triggerRefresh} />
          )}
          {activeTab === "applications" && (
            <ApplicationsTab refreshKey={refreshKey} onRefresh={triggerRefresh} />
          )}
          {activeTab === "history" && (
            <TenantHistoryTab refreshKey={refreshKey} onRefresh={triggerRefresh} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Create Contract Modal ── */}
      <CreateContractModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          triggerRefresh();
        }}
      />
    </div>
  );
}
