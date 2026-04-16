"use client";

import { motion } from "framer-motion";
import { FileText, CalendarDays, Users, Eye } from "lucide-react";
import type { DashboardSummary } from "../_api";

interface Props {
  data: DashboardSummary | null;
  isLoading: boolean;
}

export default function SummaryStatusCards({ data, isLoading }: Props) {
  const sections = [
    {
      title: "계약 현황",
      icon: FileText,
      mainValue: data?.contract.active ?? 0,
      mainLabel: "체결됨",
      items: [
        { label: "신청 대기", value: data?.contract.pending ?? 0 },
        { label: "전체 계약", value: data?.contract.total ?? 0 },
      ],
      color: "#4f46e5", // Indigo
    },
    {
      title: "예약 현황",
      icon: CalendarDays,
      mainValue: data?.reservation.today ?? 0,
      mainLabel: "오늘 예약",
      items: [
        { label: "대기 중", value: data?.reservation.pending ?? 0 },
        { label: "전체 건수", value: data?.reservation.total ?? 0 },
      ],
      color: "#0891b2", // Cyan
    },
    {
      title: "입주자 현황",
      icon: Users,
      mainValue: data?.resident.total ?? 0,
      mainLabel: "현재 입주",
      items: [
        { label: "활동 회원", value: data?.resident.total ?? 0 }, // Placeholder for more details
      ],
      color: "#059669", // Emerald
    },
    {
      title: "방문자수",
      icon: Eye,
      mainValue: data?.visitor.today ?? 0,
      mainLabel: "오늘 방문",
      items: [
        { label: "실시간", value: Math.floor((data?.visitor.today ?? 0) / 10) },
      ],
      color: "#d97706", // Amber
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {sections.map((section, idx) => (
        <motion.div
           key={section.title}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 * idx }}
           className="bg-white rounded-[2rem] border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted/20 rounded w-1/3" />
              <div className="h-10 bg-muted/20 rounded w-1/2" />
              <div className="h-12 bg-muted/20 rounded w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: `${section.color}10`, color: section.color }}
                  >
                    <section.icon className="size-5" />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">
                    {section.title}
                  </h3>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight text-foreground">
                    {section.mainValue}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {section.title === "방문자수" ? "명" : (section.title === "입주자 현황" ? "명" : "건")}
                  </span>
                </div>
                <p className="text-xs font-bold text-muted-foreground/60 mt-1">
                  {section.mainLabel}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed border-border">
                {section.items.map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}
