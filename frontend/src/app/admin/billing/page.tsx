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
    <div className="flex flex-col gap-8 p-6 md:p-12 bg-background min-h-screen text-primary">
      {/* ── Header ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-black tracking-[0.3em] uppercase text-accent">
            Admin / Billing Management
          </p>
          <h1 className="text-[10vw] md:text-[6vw] font-black tracking-tighter leading-[0.85] uppercase">
            Billing
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-8 py-5 bg-primary text-background rounded-full font-black tracking-widest uppercase text-xs flex items-center gap-3 transition-all hover:bg-accent shadow-lg"
        >
          <Plus className="w-4 h-4" />
          결제 등록
        </motion.button>
      </section>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-1.5 bg-primary/5 rounded-full w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all ${
              activeTab === tab.key
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
