"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMyDevices, controlDevice } from "../_api";
import type { MyDevice } from "../_types";
import { ApiError } from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  ONLINE: { label: "동작중", color: "border-green-400/40 bg-green-50/80", dot: "bg-green-500" },
  OFFLINE: { label: "오프라인", color: "border-border bg-surface opacity-60", dot: "bg-gray-400" },
  ERROR: { label: "에러", color: "border-red-400/40 bg-red-50/80", dot: "bg-red-500" },
};

const DEVICE_ICONS: Record<string, string> = {
  DOOR_LOCK: "🔒",
  LIGHT: "💡",
  AIR_CONDITIONER: "❄️",
  WASHER: "🫧",
  DRYER: "🌀",
  HEATER: "🔥",
  CCTV: "📹",
};

export function DeviceGrid() {
  const [devices, setDevices] = useState<MyDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controllingId, setControllingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchMyDevices();
      setDevices(res.data ?? []);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("기기 목록을 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Polling — 30초마다 동기화
  useEffect(() => {
    const interval = setInterval(loadDevices, 30000);
    return () => clearInterval(interval);
  }, [loadDevices]);

  // 알림 자동 숨김
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 2500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const handleToggle = async (device: MyDevice) => {
    if (device.status !== "ONLINE") return;
    setControllingId(device.deviceId);

    try {
      // 현재 상태 파싱
      let currentState: Record<string, unknown> = {};
      try {
        currentState = JSON.parse(device.currentState || "{}");
      } catch { /* ignore */ }

      const isPowerOn = currentState.power === true || currentState.power === "ON";
      const command = isPowerOn ? "TURN_OFF" : "TURN_ON";

      await controlDevice(device.deviceId, { command });
      setFeedback(`"${device.name}" ${isPowerOn ? "OFF" : "ON"}`);
      loadDevices();
    } catch (err) {
      if (err instanceof ApiError) setFeedback(err.message);
      else setFeedback("제어에 실패했습니다");
    } finally {
      setControllingId(null);
    }
  };

  // ── 로딩 ──
  if (loading && devices.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-[2rem] bg-muted/30" />
        ))}
      </div>
    );
  }

  // ── 에러 ──
  if (error) {
    return (
      <div className="rounded-[2rem] border border-destructive/30 bg-destructive/10 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <button
          onClick={loadDevices}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // ── 빈 상태 ──
  if (devices.length === 0) {
    return (
      <div className="rounded-[2rem] border border-border bg-surface p-12 text-center">
        <p className="text-4xl">🏠</p>
        <p className="mt-4 text-sm font-semibold text-primary">
          등록된 기기가 없습니다
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          관리자에게 문의하여 기기를 등록해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 피드백 */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-secondary/40 bg-surface px-4 py-3 text-sm font-medium text-primary"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 기기 그리드 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {devices.map((device, idx) => {
          const status = STATUS_MAP[device.status] ?? STATUS_MAP.OFFLINE;
          const icon = DEVICE_ICONS[device.deviceTypeCode] ?? "📱";
          const isControlling = controllingId === device.deviceId;

          let currentState: Record<string, unknown> = {};
          try {
            currentState = JSON.parse(device.currentState || "{}");
          } catch { /* ignore */ }
          const isPowerOn = currentState.power === true || currentState.power === "ON";

          return (
            <motion.div
              key={device.deviceId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`group relative cursor-pointer rounded-[2rem] border p-5 transition-all
                duration-200 hover:shadow-md ${status.color}
                ${isControlling ? "animate-pulse" : ""}`}
              onClick={() => handleToggle(device)}
            >
              {/* 상태 점 */}
              <span className={`absolute right-4 top-4 h-2.5 w-2.5 rounded-full ${status.dot}`} />

              {/* 아이콘 */}
              <div className="text-3xl">{icon}</div>

              {/* 기기명 */}
              <p className="mt-3 text-sm font-bold tracking-tight text-primary">
                {device.name}
              </p>

              {/* 종류 */}
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {device.deviceTypeName}
              </p>

              {/* 전원 상태 */}
              {device.status === "ONLINE" && (
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className={`relative h-5 w-9 rounded-full transition-colors duration-200
                      ${isPowerOn ? "bg-accent" : "bg-muted/40"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow
                        transition-transform duration-200
                        ${isPowerOn ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {isPowerOn ? "ON" : "OFF"}
                  </span>
                </div>
              )}

              {/* 오프라인/에러 표시 */}
              {device.status !== "ONLINE" && (
                <p className="mt-3 text-[10px] font-semibold text-muted-foreground">
                  {status.label}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
