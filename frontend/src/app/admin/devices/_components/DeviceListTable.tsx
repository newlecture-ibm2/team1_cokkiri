"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchDevices,
  fetchSpaces,
  updateDeviceActive,
  deleteDevice,
  updateDevice,
  controlAdminDevice,
} from "../_api";
import type { AdminDevice, UpdateDeviceRequest, Space } from "../_types";
import { ApiError } from "@/lib/api";
import { DeviceControlPanel } from "@/components/ui/DeviceControlPanel";

/* ── 상수 ── */

const CONTROL_COOLDOWN_MS = 1500; // 제어 Throttle 쿨다운

const STATUS_OPTIONS = [
  { value: "ONLINE", label: "동작중", color: "bg-green-500" },
  { value: "OFFLINE", label: "오프라인", color: "bg-gray-400" },
  { value: "ERROR", label: "에러", color: "bg-red-500" },
] as const;

const DEVICE_ICONS: Record<string, string> = {
  DOOR_LOCK: "🔒",
  LIGHT: "💡",
  AIR_CONDITIONER: "❄️",
  WASHER: "🫧",
  DRYER: "🌀",
  HEATER: "🔥",
  CCTV: "📹",
};

function getStatusBadge(status: string) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  return opt ?? { value: status, label: status, color: "bg-gray-400" };
}

export function DeviceListTable() {
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminDevice | null>(null);

  // 제어 Throttle
  const [controllingId, setControllingId] = useState<number | null>(null);
  const cooldownRef = useRef<Set<number>>(new Set());
  const [, forceUpdate] = useState(0);

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchDevices();
      setDevices(res.data?.content ?? []);
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

  const handleUpdate = async (data: UpdateDeviceRequest) => {
    if (!editing) return;
    try {
      setError(null);
      await updateDevice(editing.deviceId, data);
      setSuccess(`"${data.name}" 기기 정보가 수정되었습니다`);
      setEditing(null);
      loadDevices();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("수정에 실패했습니다");
    }
  };

  /**
   * 기기 제어 (ADM-DEV-04) — DeviceControlPanel 콜백
   * commands 기반 동적 UI에서 호출됨
   */
  const handleControl = async (
    deviceId: number,
    deviceName: string,
    command: string,
    params: Record<string, unknown>
  ) => {
    if (controllingId !== null) return;
    if (cooldownRef.current.has(deviceId)) return;

    setControllingId(deviceId);

    try {
      await controlAdminDevice(deviceId, { command, params });
      setSuccess(`"${deviceName}" ${command} 제어 완료`);
      loadDevices();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("기기 제어에 실패했습니다");
    } finally {
      setControllingId(null);

      // Throttle 쿨다운 적용
      cooldownRef.current.add(deviceId);
      forceUpdate((n) => n + 1);
      setTimeout(() => {
        cooldownRef.current.delete(deviceId);
        forceUpdate((n) => n + 1);
      }, CONTROL_COOLDOWN_MS);
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
      {/* 알림 — fixed position으로 레이아웃 밀림 방지 */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] rounded-xl border px-5 py-3 text-sm font-bold shadow-2xl"
            style={{
              backgroundColor: "#2C3424",
              color: "#ffffff",
              borderColor: "#768064",
            }}
          >
            ✅ {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] rounded-xl border px-5 py-3 text-sm font-bold shadow-2xl"
            style={{
              backgroundColor: "#dc2626",
              color: "#ffffff",
              borderColor: "#b91c1c",
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 수정 모달 */}
      {editing && (
        <EditDeviceModal
          device={editing}
          onSave={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}

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
                      설치 위치
                    </th>
                    <th className="px-5 py-3 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      상태
                    </th>
                    <th className="px-5 py-3 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      제어
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
                    const icon = DEVICE_ICONS[device.deviceTypeCode] ?? "📱";
                    const isThisControlling = controllingId === device.deviceId;
                    const isCooldown = cooldownRef.current.has(device.deviceId);

                    const canControl = device.status === "ONLINE" && device.isActive;

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
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            <div>
                              <span className="font-semibold text-primary">{device.name}</span>
                              {device.modelName && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {device.modelName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 종류 */}
                        <td className="px-5 py-3">
                          <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">
                            {device.deviceTypeName}
                          </span>
                        </td>

                        {/* 설치 공간 */}
                        <td className="px-5 py-3 text-sm">
                          <span className="font-semibold text-primary">{device.spaceName ?? "알 수 없음"}</span>
                          <span className="ml-1 text-xs text-muted-foreground">({device.spaceFloor ?? "-"}층)</span>
                        </td>

                        {/* 상태 표시 (시스템 자동 관리) */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${badge.color}`} />
                            <span className="text-xs font-medium text-primary">
                              {badge.label}
                            </span>
                          </div>
                        </td>

                        {/* 제어 패널 (ADM-DEV-04) — commands 기반 동적 UI */}
                        <td className="px-5 py-3">
                          {canControl ? (
                            <DeviceControlPanel
                              commandsJson={device.deviceTypeCommands ?? "[]"}
                              currentStateJson={device.currentState}
                              disabled={isThisControlling || isCooldown}
                              onControl={async (cmd, params) => {
                                await handleControl(device.deviceId, device.name, cmd, params);
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {!device.isActive ? "비활성" : device.status === "OFFLINE" ? "오프라인" : "에러"}
                            </span>
                          )}
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

                        {/* 수정 + 삭제 */}
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditing(device)}
                              className="rounded-lg border border-border px-3 py-1 text-xs
                                font-semibold text-primary transition-colors hover:bg-muted/20"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(device)}
                              className="rounded-lg border border-destructive/30 px-3 py-1 text-xs
                                font-semibold text-destructive transition-colors hover:bg-destructive/10"
                            >
                              삭제
                            </button>
                          </div>
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

/* ── 기기 수정 모달 (ADM-DEV-05) ── */

function EditDeviceModal({
  device,
  onSave,
  onClose,
}: {
  device: AdminDevice;
  onSave: (data: UpdateDeviceRequest) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(device.name);
  const [spaceId, setSpaceId] = useState(device.spaceId);
  const [modelName, setModelName] = useState(device.modelName || "");
  const [macAddress, setMacAddress] = useState(device.macAddress || "");
  const [mockEndpoint, setMockEndpoint] = useState(device.mockEndpoint || "");
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchSpaces();
        const data = res.data;
        if (Array.isArray(data)) setSpaces(data);
        else if (data && Array.isArray((data as Record<string, unknown>).content))
          setSpaces((data as Record<string, unknown>).content as Space[]);
      } catch { /* ignore */ }
    })();
  }, []);

  const sortSpaces = (list: Space[]) =>
    [...list].sort((a, b) => {
      const floorDiff = (a.floor ?? 0) - (b.floor ?? 0);
      if (floorDiff !== 0) return floorDiff;
      return (a.name ?? "").localeCompare(b.name ?? "", "ko", { numeric: true });
    });
  const privateSpaces = sortSpaces(spaces.filter((s) => s.type === "PRIVATE"));
  const commonSpaces = sortSpaces(spaces.filter((s) => s.type === "COMMON"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, spaceId, modelName, macAddress, mockEndpoint });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[2rem] border border-border bg-background p-8 shadow-xl"
      >
        <h3 className="mb-1 text-lg font-black tracking-tight text-primary">기기 수정</h3>
        <p className="mb-6 text-xs text-muted-foreground">
          기기 종류({device.deviceTypeName})는 변경할 수 없습니다.
          종류 변경이 필요하면 삭제 후 재등록하세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-primary">기기명 *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2
                text-sm text-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-primary">설치 공간 *</span>
            <select
              value={spaceId}
              onChange={(e) => setSpaceId(Number(e.target.value))}
              required
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2
                text-sm text-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value={0} disabled>공간을 선택하세요</option>
              {privateSpaces.length > 0 && (
                <optgroup label="🏠 개인 공간">
                  {privateSpaces.map((s) => (
                    <option key={s.spaceId} value={s.spaceId}>
                      {s.name} · {s.floor}층 · {s.status === "AVAILABLE" ? "공실" : s.status === "OCCUPIED" ? "입주중" : "정비중"}
                    </option>
                  ))}
                </optgroup>
              )}
              {commonSpaces.length > 0 && (
                <optgroup label="🏢 공용 공간">
                  {commonSpaces.map((s) => (
                    <option key={s.spaceId} value={s.spaceId}>
                      {s.name} · {s.floor}층
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-primary">모델명</span>
            <input
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              maxLength={100}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2
                text-sm text-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-primary">MAC 주소</span>
            <input
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value)}
              maxLength={50}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2
                text-sm text-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-primary">Mock Endpoint</span>
            <input
              value={mockEndpoint}
              onChange={(e) => setMockEndpoint(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2
                text-sm text-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground
                transition-colors hover:bg-muted/20"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground
                transition-colors hover:bg-primary/90"
            >
              저장
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
