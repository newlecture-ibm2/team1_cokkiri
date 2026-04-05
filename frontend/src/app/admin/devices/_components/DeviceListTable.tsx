"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchDevices,
  updateDeviceStatus,
  updateDeviceActive,
  deleteDevice,
} from "../_api";
import type { AdminDevice } from "../_types";
import { ApiError } from "@/lib/api";

const STATUS_OPTIONS = [
  { value: "ONLINE", label: "동작중", color: "bg-green-500" },
  { value: "OFFLINE", label: "오프라인", color: "bg-gray-400" },
  { value: "ERROR", label: "에러", color: "bg-red-500" },
] as const;

function getStatusBadge(status: string) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  return opt ?? { value: status, label: status, color: "bg-gray-400" };
}

export function DeviceListTable() {
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchDevices();
      setDevices(res.data ?? []);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("기기 목록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // 자동 알림 숨김
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleStatusChange = async (device: AdminDevice, newStatus: string) => {
    try {
      setError(null);
      await updateDeviceStatus(device.deviceId, newStatus);
      setSuccess(`"${device.name}" 상태가 변경되었습니다`);
      loadDevices();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("상태 변경에 실패했습니다");
    }
  };

  const handleActiveToggle = async (device: AdminDevice) => {
    try {
      setError(null);
      await updateDeviceActive(device.deviceId, !device.isActive);
      setSuccess(
        `"${device.name}" ${!device.isActive ? "활성화" : "비활성화"}되었습니다`
      );
      loadDevices();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("활성화 변경에 실패했습니다");
    }
  };

  const handleDelete = async (device: AdminDevice) => {
    if (!confirm(`"${device.name}" 기기를 삭제하시겠습니까?\n\n조건: 비활성 상태 + 제어 이력 없음`))
      return;

    try {
      setError(null);
      await deleteDevice(device.deviceId);
      setSuccess(`"${device.name}" 기기가 삭제되었습니다`);
      loadDevices();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("삭제에 실패했습니다");
    }
  };

  // ── 로딩 상태 ──
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/30" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 알림 */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-secondary/40 bg-surface px-4 py-3 text-sm font-medium text-primary"
          >
            ✅ {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 빈 상태 */}
      {devices.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-surface p-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            등록된 기기가 없습니다. 새 기기를 등록해 보세요.
          </p>
        </div>
      ) : (
        <>
          {/* 통계 바 */}
          <div className="flex gap-4">
            {STATUS_OPTIONS.map((opt) => {
              const count = devices.filter((d) => d.status === opt.value).length;
              return (
                <div
                  key={opt.value}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2"
                >
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${opt.color}`} />
                  <span className="text-xs font-semibold text-primary">{opt.label}</span>
                  <span className="text-xs font-black text-primary">{count}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2">
              <span className="text-xs font-semibold text-muted-foreground">비활성</span>
              <span className="text-xs font-black text-primary">
                {devices.filter((d) => !d.isActive).length}
              </span>
            </div>
          </div>

          {/* 테이블 */}
          <div className="overflow-hidden rounded-[2rem] border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-5 py-3 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      기기명
                    </th>
                    <th className="px-5 py-3 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      종류
                    </th>
                    <th className="px-5 py-3 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      공간 ID
                    </th>
                    <th className="px-5 py-3 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      상태
                    </th>
                    <th className="px-5 py-3 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      활성화
                    </th>
                    <th className="px-5 py-3 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      MAC
                    </th>
                    <th className="px-5 py-3 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device, idx) => {
                    const badge = getStatusBadge(device.status);
                    return (
                      <motion.tr
                        key={device.deviceId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`border-b border-border/50 transition-colors hover:bg-muted/10
                          ${!device.isActive ? "opacity-50" : ""}`}
                      >
                        {/* 기기명 */}
                        <td className="px-5 py-3">
                          <span className="font-semibold text-primary">{device.name}</span>
                          {device.modelName && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {device.modelName}
                            </span>
                          )}
                        </td>

                        {/* 종류 */}
                        <td className="px-5 py-3">
                          <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">
                            {device.deviceTypeName}
                          </span>
                        </td>

                        {/* 공간 ID */}
                        <td className="px-5 py-3 font-mono text-xs text-primary">
                          {device.spaceId}
                        </td>

                        {/* 상태 드롭다운 */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${badge.color}`} />
                            <select
                              value={device.status}
                              onChange={(e) => handleStatusChange(device, e.target.value)}
                              className="rounded-lg border border-border bg-background px-2 py-1 text-xs
                                font-medium text-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* 활성화 토글 */}
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleActiveToggle(device)}
                            className={`relative h-6 w-11 rounded-full transition-colors duration-200
                              ${device.isActive ? "bg-accent" : "bg-muted/40"}`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow
                                transition-transform duration-200
                                ${device.isActive ? "translate-x-5" : "translate-x-0"}`}
                            />
                          </button>
                        </td>

                        {/* MAC */}
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                          {device.macAddress || "—"}
                        </td>

                        {/* 삭제 */}
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleDelete(device)}
                            className="rounded-lg border border-destructive/30 px-3 py-1 text-xs
                              font-semibold text-destructive transition-colors hover:bg-destructive/10"
                          >
                            삭제
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
