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
    <div className="bg-[var(--background)] rounded-2xl p-5 mb-6 border border-[var(--secondary)]">
      {/* 기간 필터 */}
      <div className="mb-4">
        <label className="block text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)] mb-2">
          기간
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PERIODS.map((period) => (
            <button
              key={period.label}
              onClick={() => {
                setActivePeriod(period.days);
                applyFilters({ periodDays: period.days });
              }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                activePeriod === period.days
                  ? "bg-[var(--primary)] text-[var(--background)]"
                  : "bg-[var(--secondary)]/30 text-[var(--muted)] hover:bg-[var(--accent)] hover:text-white"
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
            className="px-3 py-1.5 rounded-xl border border-[var(--secondary)] bg-white text-sm text-[var(--primary)]"
          />
          <span className="text-[var(--muted)] text-sm">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setActivePeriod(-1);
              applyFilters({ endDate: e.target.value });
            }}
            className="px-3 py-1.5 rounded-xl border border-[var(--secondary)] bg-white text-sm text-[var(--primary)]"
          />
        </div>
      </div>

      {/* 공간/기기/결과 필터 */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)] mb-1">
            공간
          </label>
          <select
            value={spaceType}
            onChange={(e) => {
              setSpaceType(e.target.value);
              applyFilters({ spaceType: e.target.value });
            }}
            className="px-3 py-1.5 rounded-xl border border-[var(--secondary)] bg-white text-sm text-[var(--primary)]"
          >
            {SPACE_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)] mb-1">
            기기 종류
          </label>
          <select
            value={deviceTypeCode}
            onChange={(e) => {
              setDeviceTypeCode(e.target.value);
              applyFilters({ deviceTypeCode: e.target.value });
            }}
            className="px-3 py-1.5 rounded-xl border border-[var(--secondary)] bg-white text-sm text-[var(--primary)]"
          >
            <option value="">전체</option>
            {deviceTypes.map((opt) => (
              <option key={opt.code} value={opt.code}>{opt.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)] mb-1">
            결과
          </label>
          <select
            value={result}
            onChange={(e) => {
              setResult(e.target.value);
              applyFilters({ result: e.target.value });
            }}
            className="px-3 py-1.5 rounded-xl border border-[var(--secondary)] bg-white text-sm text-[var(--primary)]"
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
