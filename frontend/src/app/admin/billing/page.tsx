'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
} from 'lucide-react';
import { Payment } from './_types';
import { BillingListTab } from './_components/BillingListTab';
import { CreatePaymentModal } from './_components/CreatePaymentModal';
import { ApprovePaymentModal } from './_components/ApprovePaymentModal';

type TabType = 'all';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [approveTarget, setApproveTarget] = useState<Payment | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: '전체 결제', icon: CreditCard },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <header className="mb-12">
        <div className="flex flex-col gap-6">
          <div className="border-b border-primary/10 pb-8 space-y-4">
            <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Admin · Billing Management</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                ADMIN <span className="underline underline-offset-4 decoration-accent">BILLING.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">결제 관리</span>
              </h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-primary text-white rounded-full font-black tracking-tight text-xs flex items-center gap-2 transition-all shadow-lg w-fit h-12"
              >
                <Plus className="w-4 h-4" />
                결제 등록
              </motion.button>
            </div>
            <p className="font-medium tracking-tight text-foreground/70 text-sm md:text-base">
              입주민의 월세, 보증금 및 기타 서비스 이용에 대한 결제 내역을 조회하고 수동 결제를 등록하거나 승인합니다.
            </p>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-1.5 bg-primary/5 rounded-full w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab.key
                ? 'bg-primary text-background shadow-md'
                : 'text-primary/60 hover:text-primary hover:bg-primary/5'
              }`}
          >
            <tab.icon className="w-4 h-4" />
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
          {activeTab === 'all' && (
            <BillingListTab
              refreshKey={refreshKey}
              onRefresh={triggerRefresh}
              onApproveRequest={(payment) => setApproveTarget(payment)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Create Payment Modal ── */}
      <CreatePaymentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          triggerRefresh();
        }}
      />

      {/* ── Approve Payment Modal ── */}
      <ApprovePaymentModal
        payment={approveTarget}
        onClose={() => setApproveTarget(null)}
        onSuccess={() => {
          setApproveTarget(null);
          triggerRefresh();
        }}
      />
    </div>
  );
}
