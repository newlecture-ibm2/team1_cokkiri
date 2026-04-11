"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { fetchMyDevices, controlDevice } from "../_api";
import type { MyDevice } from "../_types";
import { ApiError } from "@/lib/api";
import { DeviceControlPanel } from "@/components/ui/DeviceControlPanel";

/* ── 상수 ── */

const COOLDOWN_MS = 1500; // Throttle 쿨다운 (1.5초)

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

/* ── 컴포넌트 ── */

export function DeviceGrid() {
  const router = useRouter();
  const [devices, setDevices] = useState<MyDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controllingId, setControllingId] = useState<number | null>(null);

  // Throttle: 쿨다운 중인 기기 ID
  const cooldownRef = useRef<Set<number>>(new Set());
  const [, forceUpdate] = useState(0);

  // Toast 피드백
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");

  // 예약 안내 모달
  const [reservationModal, setReservationModal] = useState<{
    open: boolean;
    device: MyDevice | null;
  }>({ open: false, device: null });

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

  // Toast 자동 숨김 (2.5초)
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 2500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const showFeedback = (msg: string, type: "success" | "error") => {
    setFeedbackType(type);
    setFeedback(msg);
  };

  const handleControl = async (
    device: MyDevice,
    command: string,
    params: Record<string, unknown>
  ) => {
    // 공용 기기는 제어 차단 → 예약 안내 모달 표시
    if (device.spaceType === "COMMON") {
      setReservationModal({ open: true, device });
      return;
    }

    // 상태 검증
    if (device.status !== "ONLINE") return;
    if (controllingId !== null) return;
    if (cooldownRef.current.has(device.deviceId)) return;

    setControllingId(device.deviceId);

    try {
      await controlDevice(device.deviceId, { command, params });

      // Optimistic UI: 로컬 상태 즉시 반영
      let currentState: Record<string, unknown> = {};
      try {
        currentState = JSON.parse(device.currentState || "{}");
      } catch { /* ignore */ }
      const newState = { ...currentState, ...params };
      setDevices((prev) =>
        prev.map((d) =>
          d.deviceId === device.deviceId
            ? { ...d, currentState: JSON.stringify(newState) }
            : d
        )
      );
      showFeedback(`"${device.name}" ${command}`, "success");
    } catch (err) {
      if (err instanceof ApiError) showFeedback(err.message, "error");
      else showFeedback("제어에 실패했습니다", "error");
    } finally {
      setControllingId(null);

      // Throttle 쿨다운 적용
      cooldownRef.current.add(device.deviceId);
      forceUpdate((n) => n + 1);
      setTimeout(() => {
        cooldownRef.current.delete(device.deviceId);
        forceUpdate((n) => n + 1);
      }, COOLDOWN_MS);
    }
  };

  // 예약 페이지로 이동
  const handleGoToReservation = () => {
    const spaceId = reservationModal.device?.spaceId;
    setReservationModal({ open: false, device: null });
    router.push(spaceId ? `/facilities?spaceId=${spaceId}` : "/facilities");
  };

  /* ── 기기 분류 ── */
  const privateDevices = devices.filter((d) => d.spaceType === "PRIVATE");
  const commonDevices = devices.filter((d) => d.spaceType === "COMMON");

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
    <div className="space-y-6">
      {/* Toast 피드백 — fixed position으로 레이아웃 밀림 방지 */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] rounded-xl border px-5 py-3 text-sm font-bold shadow-2xl"
            style={{
              backgroundColor: feedbackType === "error" ? "#dc2626" : "#2C3424",
              color: "#ffffff",
              borderColor: feedbackType === "error" ? "#b91c1c" : "#768064",
            }}
          >
            {feedbackType === "error" ? "⚠️ " : "✅ "}
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 예약 안내 모달 ── */}
      <AnimatePresence>
        {reservationModal.open && reservationModal.device && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
            onClick={() => setReservationModal({ open: false, device: null })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-[2rem] border border-border bg-background p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 아이콘 */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-3xl">
                  📅
                </div>
              </div>

              {/* 제목 */}
              <h3 className="text-center text-lg font-black tracking-tighter text-primary">
                예약이 필요합니다
              </h3>

              {/* 설명 */}
              <p className="text-center text-sm text-muted-foreground mt-2 leading-relaxed">
                <span className="font-bold text-primary">{reservationModal.device.spaceName}</span>의{" "}
                <span className="font-bold text-primary">{reservationModal.device.name}</span>은(는)
                공용 시설 기기입니다.
              </p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                해당 시설을 <span className="font-semibold text-accent">예약한 시간대</span>에만 제어할 수 있습니다.
              </p>

              {/* 버튼 */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setReservationModal({ open: false, device: null })}
                  className="flex-1 rounded-xl border border-border bg-surface py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted/20"
                >
                  닫기
                </button>
                <button
                  onClick={handleGoToReservation}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent"
                >
                  예약하러 가기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 개인 공간 기기 */}
      {privateDevices.length > 0 && (
        <section>
          <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            🏠 내 공간
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {privateDevices.map((device, idx) => (
              <DeviceCard
                key={device.deviceId}
                device={device}
                idx={idx}
                isControlling={controllingId === device.deviceId}
                isCooldown={cooldownRef.current.has(device.deviceId)}
                onControl={handleControl}
              />
            ))}
          </div>
        </section>
      )}

      {/* 공용 공간 기기 */}
      {commonDevices.length > 0 && (
        <section>
          <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            🏢 공용 공간
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {commonDevices.map((device, idx) => (
              <DeviceCard
                key={device.deviceId}
                device={device}
                idx={idx}
                isControlling={controllingId === device.deviceId}
                isCooldown={cooldownRef.current.has(device.deviceId)}
                onControl={handleControl}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── 기기 카드 (하위 컴포넌트) ── */

function DeviceCard({
  device,
  idx,
  isControlling,
  isCooldown,
  onControl,
}: {
  device: MyDevice;
  idx: number;
  isControlling: boolean;
  isCooldown: boolean;
  onControl: (device: MyDevice, command: string, params: Record<string, unknown>) => void;
}) {
  const isCommon = device.spaceType === "COMMON";
  const status = STATUS_MAP[device.status] ?? STATUS_MAP.OFFLINE;
  const icon = DEVICE_ICONS[device.deviceTypeCode] ?? "📱";

  // 공용 기기: 회색 계열 스타일 (제어 불가)
  const cardColor = isCommon
    ? "border-border bg-muted/10 opacity-75"
    : status.color;

  const dotColor = isCommon ? "bg-gray-400" : status.dot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`group relative rounded-[2rem] border p-5 transition-all
        duration-200 hover:shadow-md ${cardColor}
        ${isControlling ? "animate-pulse pointer-events-none" : ""}
        ${isCooldown ? "opacity-70 pointer-events-none" : ""}`}
    >
      {/* 상태 점 */}
      <span className={`absolute right-4 top-4 h-2.5 w-2.5 rounded-full ${dotColor}`} />

      {/* 아이콘 */}
      <div className={`text-3xl ${isCommon ? "grayscale opacity-60" : ""}`}>{icon}</div>

      {/* 기기명 */}
      <p className={`mt-3 text-sm font-bold tracking-tight ${isCommon ? "text-muted-foreground" : "text-primary"}`}>
        {device.name}
      </p>

      {/* 공간명 + 층 */}
      {device.spaceName && (
        <p className="text-[10px] font-medium text-muted-foreground">
          {device.spaceName}
          {device.spaceFloor != null && (
            <span className="ml-0.5">({device.spaceFloor}층)</span>
          )}
        </p>
      )}

      {/* 종류 */}
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        {device.deviceTypeName}
      </p>

      {/* ── 개인 기기: commands 기반 동적 제어 UI ── */}
      {!isCommon && device.status === "ONLINE" && (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <DeviceControlPanel
            commandsJson={device.commands ?? "[]"}
            currentStateJson={device.currentState}
            disabled={isControlling || isCooldown}
            onControl={async (cmd, params) => {
              onControl(device, cmd, params);
            }}
          />
        </div>
      )}

      {/* ── 개인 기기: 오프라인/에러 표시 ── */}
      {!isCommon && device.status !== "ONLINE" && (
        <p className="mt-3 text-[10px] font-semibold text-muted-foreground">
          {status.label}
        </p>
      )}

      {/* ── 공용 기기: 제어 불가 라벨 ── */}
      {isCommon && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span className="text-[10px] font-bold text-muted-foreground">
            예약 후 이용 가능
          </span>
        </div>
      )}
    </motion.div>
  );
}
