"use client";

import { useState, useEffect } from "react";
import type { ControlLogFilters, DeviceTypeOption } from "../_types";
import { fetchDeviceTypes } from "../_api";

const SPACE_TYPES = [
  { value: "", label: "전체" },
  { value: "PRIVATE", label: "개인 공간" },
  { value: "COMMON", label: "공용 공간" },
];

const RESULTS = [
  { value: "", label: "전체" },
  { value: "SUCCESS", label: "성공" },
  { value: "FAILURE", label: "실패" },
];

const PERIODS = [
  { label: "전체", days: null },
  { label: "1주일", days: 7 },
  { label: "1개월", days: 30 },
  { label: "3개월", days: 90 },
];

interface ControlLogFilterBarProps {
  onFilterChange: (filters: ControlLogFilters) => void;
}

export default function ControlLogFilterBar({ onFilterChange }: ControlLogFilterBarProps) {
  const [activePeriod, setActivePeriod] = useState<number | null>(null);
  const [spaceType, setSpaceType] = useState("");
  const [deviceTypeCode, setDeviceTypeCode] = useState("");
  const [result, setResult] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeOption[]>([]);

  useEffect(() => {
    fetchDeviceTypes()
      .then((res) => {
        if (res.data) setDeviceTypes(res.data);
      })
      .catch(() => {});
  }, []);

  function applyFilters(overrides: Partial<ControlLogFilters & { periodDays: number | null }> = {}) {
    const newSpaceType = overrides.spaceType ?? spaceType;
    const newDeviceTypeCode = overrides.deviceTypeCode ?? deviceTypeCode;
    const newResult = overrides.result ?? result;
    let newStartDate = overrides.startDate ?? startDate;
    const newEndDate = overrides.endDate ?? endDate;

    if ("periodDays" in overrides) {
      const days = overrides.periodDays;
      if (days !== null && days !== undefined) {
        const d = new Date();
        d.setDate(d.getDate() - days);
        newStartDate = d.toISOString().split("T")[0];
        setStartDate(newStartDate);
        setEndDate("");
      } else {
        newStartDate = "";
        setStartDate("");
        setEndDate("");
      }
    }

    onFilterChange({
      startDate: newStartDate || undefined,
      endDate: newEndDate || undefined,
      spaceType: newSpaceType || undefined,
      deviceTypeCode: newDeviceTypeCode || undefined,
      result: newResult || undefined,
    });
  }

  return (
    <div className="rounded-[2rem] border border-border bg-surface p-6 space-y-5">
      {/* ── 기간 필터 ── */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2.5">
          Period
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PERIODS.map((period) => (
            <button
              key={period.label}
              onClick={() => {
                setActivePeriod(period.days);
                applyFilters({ periodDays: period.days });
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 ${
                activePeriod === period.days
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/20 text-muted-foreground hover:bg-accent hover:text-white"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setActivePeriod(-1);
              applyFilters({ startDate: e.target.value });
            }}
            className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <span className="text-muted-foreground text-xs font-bold">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setActivePeriod(-1);
              applyFilters({ endDate: e.target.value });
            }}
            className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* ── 드롭다운 필터 ── */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1.5">
            Space
          </label>
          <select
            value={spaceType}
            onChange={(e) => {
              setSpaceType(e.target.value);
              applyFilters({ spaceType: e.target.value });
            }}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {SPACE_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1.5">
            Device Type
          </label>
          <select
            value={deviceTypeCode}
            onChange={(e) => {
              setDeviceTypeCode(e.target.value);
              applyFilters({ deviceTypeCode: e.target.value });
            }}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">전체</option>
            {deviceTypes.map((opt) => (
              <option key={opt.code} value={opt.code}>{opt.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1.5">
            Result
          </label>
          <select
            value={result}
            onChange={(e) => {
              setResult(e.target.value);
              applyFilters({ result: e.target.value });
            }}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {RESULTS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
