"use client";

// #78: 시설 카드 컴포넌트
// ui-guideline: Moss & Aloe 디자인 시스템, 시맨틱 클래스만 사용

import { motion } from "framer-motion";
import {
  WashingMachine,
  Coffee,
  BookOpen,
  Dumbbell,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { Facility } from "../_types";

const STATUS_MAP: Record<string, { label: string; dot: string; border: string }> = {
  AVAILABLE: {
    label: "이용 가능",
    dot: "bg-green-500",
    border: "border-green-400/30 bg-green-50/50",
  },
  OCCUPIED: {
    label: "사용 중",
    dot: "bg-accent",
    border: "border-accent/30 bg-accent/5",
  },
  MAINTENANCE: {
    label: "점검 중",
    dot: "bg-muted-foreground",
    border: "border-border bg-muted/20 opacity-60",
  },
};

const FACILITY_ICON_MAP: Array<{ key: string; icon: LucideIcon }> = [
  { key: "세탁실", icon: WashingMachine },
  { key: "라운지", icon: Coffee },
  { key: "회의실", icon: BookOpen },
  { key: "헬스장", icon: Dumbbell },
];

function getFacilityIcon(name: string): LucideIcon {
  for (const { key, icon } of FACILITY_ICON_MAP) {
    if (name.includes(key)) return icon;
  }
  return Building2;
}

interface FacilityCardProps {
  facility: Facility;
  selected: boolean;
  onSelect: (facility: Facility) => void;
  index: number;
}

export function FacilityCard({ facility, selected, onSelect, index }: FacilityCardProps) {
  const status = STATUS_MAP[facility.status] ?? STATUS_MAP.AVAILABLE;
  const Icon = getFacilityIcon(facility.name);
  const [openTime, closeTime] = facility.operatingHours?.split("-") ?? ["?", "?"];

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(facility)}
      className={`relative w-full rounded-[2rem] border p-5 text-left transition-all duration-200
        ${selected
          ? "border-primary/60 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          : `${status.border} hover:shadow-md hover:border-primary/30`
        }`}
    >
      {/* 상태 점 */}
      <span
        className={`absolute right-4 top-4 h-2.5 w-2.5 rounded-full ${
          selected ? "bg-primary-foreground/70" : status.dot
        }`}
      />

      {/* 아이콘 */}
      <div className={`${
        selected ? "text-primary-foreground/90" : "text-primary"
      }`}>
        <Icon size={28} strokeWidth={1.5} />
      </div>

      {/* 시설명 */}
      <p className={`mt-3 text-sm font-bold tracking-tight ${
        selected ? "text-primary-foreground" : "text-primary"
      }`}>
        {facility.name}
      </p>

      {/* 운영 정보 */}
      <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.2em] ${
        selected ? "text-primary-foreground/70" : "text-muted-foreground"
      }`}>
        {openTime} – {closeTime}
      </p>

      {/* 수용 인원 / 요금 */}
      <div className={`mt-3 flex items-center gap-3 text-[10px] font-semibold ${
        selected ? "text-primary-foreground/80" : "text-muted-foreground"
      }`}>
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {facility.maxCapacity}명
        </span>
        {facility.usageFee > 0 && (
          <span>₩{facility.usageFee.toLocaleString()}/시간</span>
        )}
      </div>

      {/* 예약 필요 배지 */}
      {facility.isReservable && (
        <span className={`mt-3 inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
          selected
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-primary/10 text-primary"
        }`}>
          예약제
        </span>
      )}
    </motion.button>
  );
}
