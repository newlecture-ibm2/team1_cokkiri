"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createDevice, discoverIotDevices, fetchDeviceTypes, fetchSpaces, updateDeviceType } from "../_api";
import type { CreateDeviceRequest, DeviceType, Space, IotDeviceInfo, DeviceCapability } from "../_types";
import { ApiError } from "@/lib/api";
import { parseCommands, type DeviceCommand } from "@/components/ui/DeviceControlPanel";

interface FieldError {
  [key: string]: string;
}

export function DeviceRegisterForm() {
  // ── 기본 데이터 ──
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);

  // ── IoT 기기 발견 ──
  const [hostFilter, setHostFilter] = useState("");
  const [iotDevices, setIotDevices] = useState<IotDeviceInfo[]>([]);
  const [iotLoading, setIotLoading] = useState(false);
  const [iotError, setIotError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<IotDeviceInfo | null>(null);

  // ── 등록 폼 ──
  const [form, setForm] = useState<CreateDeviceRequest>({
    macAddress: "",
    name: "",
    spaceId: 0,
    deviceTypeId: 0,
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── 새 capabilities 발견 모달 ──
  interface NewCapEntry {
    cap: DeviceCapability;
    uiType: "toggle" | "slider" | "button" | "select";
    label: string;
  }

  const inferUiType = (cap: DeviceCapability): "toggle" | "slider" | "button" | "select" => {
    if (cap.stateValue === true || cap.stateValue === false) return "toggle";
    if (cap.min !== undefined && cap.max !== undefined) return "slider";
    if (cap.options && cap.options.length > 0) return "select";
    return "button";
  };

  const [newCapsModalOpen, setNewCapsModalOpen] = useState(false);
  const [newCapEntries, setNewCapEntries] = useState<NewCapEntry[]>([]);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // ── 초기 데이터 로드 ──
  const loadDeviceTypes = useCallback(async () => {
    try {
      const res = await fetchDeviceTypes();
      setDeviceTypes(res.data ?? []);
    } catch {
      // 로드 실패
    }
  }, []);

  const loadSpaces = useCallback(async () => {
    try {
      const res = await fetchSpaces();
      const data = res.data;
      if (Array.isArray(data)) {
        setSpaces(data);
      } else if (data && Array.isArray((data as Record<string, unknown>).content)) {
        setSpaces((data as Record<string, unknown>).content as Space[]);
      }
    } catch {
      // 로드 실패
    }
  }, []);

  useEffect(() => {
    loadDeviceTypes();
    loadSpaces();
  }, [loadDeviceTypes, loadSpaces]);

  // ── IoT 기기 조회 ──
  const handleDiscover = async () => {
    setIotLoading(true);
    setIotError(null);
    setSelectedDevice(null);
    try {
      const res = await discoverIotDevices(hostFilter || undefined);
      setIotDevices(res.data?.devices ?? []);
      if ((res.data?.devices ?? []).length === 0) {
        setIotError("조회된 기기가 없습니다");
      }
    } catch {
      setIotError("IoT 서버 연결에 실패했습니다");
      setIotDevices([]);
    } finally {
      setIotLoading(false);
    }
  };

  // ── 기기 선택 ──
  const handleSelectDevice = (device: IotDeviceInfo) => {
    setSelectedDevice(device);
    setForm((prev) => ({
      ...prev,
      macAddress: device.macAddress,
    }));
    setErrors({});
    setApiError(null);
    setSuccess(false);
  };

  // ── 공간 분류 ──
  const sortSpaces = (list: Space[]) =>
    [...list].sort((a, b) => {
      const floorDiff = (a.floor ?? 0) - (b.floor ?? 0);
      if (floorDiff !== 0) return floorDiff;
      return (a.name ?? "").localeCompare(b.name ?? "", "ko", { numeric: true });
    });
  const privateSpaces = sortSpaces(spaces.filter((s) => s.type === "PRIVATE"));
  const commonSpaces = sortSpaces(spaces.filter((s) => s.type === "COMMON"));

  // ── 검증 ──
  const validate = (): boolean => {
    const newErrors: FieldError = {};
    if (!form.macAddress) newErrors.macAddress = "IoT 기기를 선택해 주세요";
    if (!form.name.trim()) newErrors.name = "기기명은 필수입니다";
    else if (form.name.length > 100) newErrors.name = "기기명은 100자 이내여야 합니다";
    if (!form.spaceId || form.spaceId <= 0) newErrors.spaceId = "설치 공간을 선택해 주세요";
    if (!form.deviceTypeId || form.deviceTypeId <= 0) newErrors.deviceTypeId = "기기 종류를 선택해 주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateDeviceRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    setApiError(null);
    setSuccess(false);
  };

  // ── 새 capabilities 비교 ──
  const findNewCapabilities = (): DeviceCapability[] => {
    if (!selectedDevice?.capabilities?.length || !form.deviceTypeId) return [];
    const selectedType = deviceTypes.find(dt => dt.deviceTypeId === form.deviceTypeId);
    if (!selectedType) return [];

    const existingCommands = parseCommands(selectedType.commands || "[]");
    const existingSet = new Set(existingCommands.map(c => c.command));

    return selectedDevice.capabilities.filter(cap => !existingSet.has(cap.command));
  };

  // ── 타입 commands 병합 (합집합) — 관리자가 설정한 uiType/label 적용 ──
  const mergeCapabilitiesToType = async (entries: NewCapEntry[]) => {
    const selectedType = deviceTypes.find(dt => dt.deviceTypeId === form.deviceTypeId);
    if (!selectedType) return;

    const existingCommands: DeviceCommand[] = parseCommands(selectedType.commands || "[]");
    const merged = [
      ...existingCommands,
      ...entries.map(entry => ({
        command: entry.cap.command,
        uiType: entry.uiType,
        stateKey: entry.cap.stateKey,
        label: entry.label,
        ...(entry.cap.stateValue !== undefined && { stateValue: entry.cap.stateValue }),
        ...(entry.cap.min !== undefined && { min: entry.cap.min }),
        ...(entry.cap.max !== undefined && { max: entry.cap.max }),
        ...(entry.cap.unit && { unit: entry.cap.unit }),
        ...(entry.cap.options && { options: entry.cap.options }),
      })),
    ];

    await updateDeviceType(form.deviceTypeId, {
      code: selectedType.code,
      name: selectedType.name,
      commands: JSON.stringify(merged),
      uiType: selectedType.uiType,
    });

    setDeviceTypes(prev => prev.map(dt =>
      dt.deviceTypeId === form.deviceTypeId
        ? { ...dt, commands: JSON.stringify(merged) }
        : dt
    ));
  };

  // ── 기기 등록 실행 ──
  const executeRegister = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      await createDevice(form);
      setSuccess(true);
      const submittedMac = form.macAddress;
      setForm({ macAddress: "", name: "", spaceId: 0, deviceTypeId: 0 });
      setSelectedDevice(null);
      setIotDevices((prev) => prev.filter((d) => d.macAddress !== submittedMac));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorCode === "DUPLICATE_MAC_ADDRESS") {
          setErrors((prev) => ({ ...prev, macAddress: err.message || "이미 등록된 MAC 주소입니다" }));
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError("기기 등록에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── 제출 (새 capabilities 확인 후 등록) ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newCaps = findNewCapabilities();
    if (newCaps.length > 0) {
      // 새 동작 발견 → 스마트 기본값 + 관리자 확인 모달
      const entries: NewCapEntry[] = newCaps.map(cap => ({
        cap,
        uiType: inferUiType(cap),
        label: cap.command,
      }));
      setNewCapEntries(entries);
      setNewCapsModalOpen(true);
    } else {
      await executeRegister();
    }
  };

  // ── 모달 확인 (새 capabilities 추가 + 기기 등록) ──
  const handleConfirmNewCaps = async () => {
    setPendingSubmit(true);
    try {
      await mergeCapabilitiesToType(newCapEntries);
      setNewCapsModalOpen(false);
      setNewCapEntries([]);
      await executeRegister();
    } catch {
      setApiError("기기 종류 업데이트에 실패했습니다.");
    } finally {
      setPendingSubmit(false);
    }
  };

  // ── 모달 건너뛰기 (새 capabilities 무시, 기기만 등록) ──
  const handleSkipNewCaps = async () => {
    setNewCapsModalOpen(false);
    setNewCapEntries([]);
    await executeRegister();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* 성공 메시지 */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-secondary/40 bg-surface px-5 py-4 text-sm font-medium text-primary"
        >
          ✅ 기기가 성공적으로 등록되었습니다.
        </motion.div>
      )}

      {/* API 에러 메시지 */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm font-medium text-destructive"
        >
          {apiError}
        </motion.div>
      )}

      {/* ── Step 1: IoT 기기 발견 ── */}
      <fieldset className="space-y-4">
        <legend className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Step 1 — IoT 기기 발견
        </legend>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="게이트웨이 IP (예: 192.168.1.101) — 비우면 전체 조회"
            value={hostFilter}
            onChange={(e) => setHostFilter(e.target.value)}
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-primary
              bg-surface placeholder:text-muted-foreground/50 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
          />
          <motion.button
            type="button"
            onClick={handleDiscover}
            disabled={iotLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white
              transition-colors duration-200 hover:bg-accent/80 disabled:opacity-50 whitespace-nowrap"
          >
            {iotLoading ? "조회 중..." : "🔍 기기 조회"}
          </motion.button>
        </div>

        {iotError && (
          <p className="text-xs text-muted-foreground pl-1">{iotError}</p>
        )}

        {/* 발견된 기기 목록 */}
        <AnimatePresence>
          {iotDevices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 max-h-80 overflow-y-auto"
            >
              <p className="text-xs text-muted-foreground pl-1">
                {iotDevices.length}개 기기 발견 — 등록할 기기를 선택하세요
              </p>
              {iotDevices.map((device) => (
                <motion.div
                  key={device.macAddress}
                  whileHover={{ y: -2 }}
                  onClick={() => handleSelectDevice(device)}
                  className={`cursor-pointer rounded-xl border px-4 py-3 transition-all duration-200
                    ${selectedDevice?.macAddress === device.macAddress
                      ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                      : "border-border bg-surface hover:border-secondary"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary font-mono">{device.modelName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        MAC: {device.macAddress} · GW: {device.host} · Local: {device.localIp}
                      </p>
                      {device.capabilities?.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          지원: {device.capabilities.map(c => c.command).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        device.status === "ONLINE" ? "bg-green-500" :
                        device.status === "ERROR" ? "bg-red-500" : "bg-gray-400"
                      }`} />
                      <span className="text-xs text-muted-foreground">{device.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {errors.macAddress && <p className="text-xs font-medium text-destructive pl-1">{errors.macAddress}</p>}
      </fieldset>

      {/* ── Step 2: 선택된 기기 + 관리자 설정 ── */}
      <AnimatePresence>
        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* 선택된 기기 정보 */}
            <fieldset className="space-y-4 mb-8">
              <legend className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                선택된 기기
              </legend>
              <div className="rounded-xl border border-accent/40 bg-accent/5 px-5 py-4 space-y-1">
                <p className="text-sm font-bold text-primary font-mono">{selectedDevice.modelName}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  MAC: {selectedDevice.macAddress}
                </p>
                <p className="text-xs text-muted-foreground">
                  게이트웨이: {selectedDevice.host} · 로컬IP: {selectedDevice.localIp}
                </p>
                {selectedDevice.capabilities?.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {selectedDevice.capabilities
                      .filter((c, i, a) => a.findIndex(x => x.command === c.command) === i)
                      .map(cap => (
                        <span key={cap.command} className="inline-block rounded-lg bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-semibold text-muted uppercase tracking-wider">
                          {cap.command}
                        </span>
                      ))
                    }
                  </div>
                )}
              </div>
            </fieldset>

            {/* Step 2: 관리자 설정 */}
            <fieldset className="space-y-6 mb-8">
              <legend className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Step 2 — 관리자 설정
              </legend>

              {/* 기기명 (관리자 입력) */}
              <div className="space-y-2">
                <label htmlFor="device-name" className="block text-sm font-semibold text-primary">
                  기기명 <span className="text-destructive">*</span>
                </label>
                <input
                  id="device-name"
                  type="text"
                  placeholder="예: 101호 메인 조명, 세탁실 세탁기 1"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-primary
                    bg-surface placeholder:text-muted-foreground/50 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-ring/40
                    ${errors.name ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-secondary"}`}
                />
                <p className="text-xs text-muted-foreground pl-1">관리자가 부여하는 기기 식별 이름입니다</p>
                {errors.name && <p className="text-xs font-medium text-destructive pl-1">{errors.name}</p>}
              </div>

              {/* 기기 종류 */}
              <div className="space-y-2">
                <label htmlFor="device-type" className="block text-sm font-semibold text-primary">
                  기기 종류 <span className="text-destructive">*</span>
                </label>
                <select
                  id="device-type"
                  value={form.deviceTypeId}
                  onChange={(e) => handleChange("deviceTypeId", Number(e.target.value))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-primary
                    bg-surface transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-ring/40
                    ${errors.deviceTypeId ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-secondary"}`}
                >
                  <option value={0} disabled>종류를 선택하세요</option>
                  {deviceTypes.map((dt) => (
                    <option key={dt.deviceTypeId} value={dt.deviceTypeId}>
                      {dt.name} ({dt.code})
                    </option>
                  ))}
                </select>
                {errors.deviceTypeId && <p className="text-xs font-medium text-destructive pl-1">{errors.deviceTypeId}</p>}
              </div>

              {/* 설치 공간 */}
              <div className="space-y-2">
                <label htmlFor="space-select" className="block text-sm font-semibold text-primary">
                  설치 공간 <span className="text-destructive">*</span>
                </label>
                <select
                  id="space-select"
                  value={form.spaceId}
                  onChange={(e) => handleChange("spaceId", Number(e.target.value))}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-primary
                    bg-surface transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-ring/40
                    ${errors.spaceId ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-secondary"}`}
                >
                  <option value={0} disabled>공간을 선택하세요</option>
                  {privateSpaces.length > 0 && (
                    <optgroup label="🏠 개인 공간 (PRIVATE)">
                      {privateSpaces.map((s) => (
                        <option key={s.spaceId} value={s.spaceId}>
                          {s.name} · {s.floor}층 · {s.status === "AVAILABLE" ? "공실" : s.status === "OCCUPIED" ? "입주중" : "정비중"}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {commonSpaces.length > 0 && (
                    <optgroup label="🏢 공용 공간 (COMMON)">
                      {commonSpaces.map((s) => (
                        <option key={s.spaceId} value={s.spaceId}>
                          {s.name} · {s.floor}층
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {spaces.length === 0 && (
                  <p className="text-xs text-muted-foreground pl-1">공간 목록을 불러오는 중...</p>
                )}
                {errors.spaceId && <p className="text-xs font-medium text-destructive pl-1">{errors.spaceId}</p>}
              </div>
            </fieldset>

            {/* 제출 버튼 */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-primary py-4 text-sm font-bold uppercase tracking-[0.2em]
                text-primary-foreground transition-colors duration-200
                hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "등록 중..." : "기기 등록"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 새 capabilities 발견 모달 ── */}
      <AnimatePresence>
        {newCapsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => { setNewCapsModalOpen(false); setNewCapEntries([]); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <h3 className="font-black text-sm uppercase tracking-[0.2em] text-primary mb-2">
                새로운 동작 발견
              </h3>
              <p className="text-xs text-muted-foreground mb-5">
                선택한 기기 모델(<span className="font-bold">{selectedDevice?.modelName}</span>)에서
                현재 기기 종류에 없는 제어 동작이 발견되었습니다.
                각 동작의 <span className="font-bold">UI 타입</span>과 <span className="font-bold">라벨</span>을 설정한 후 기기 종류에 추가하세요.
              </p>

              <div className="space-y-3 mb-6">
                {newCapEntries.map((entry, idx) => (
                  <div
                    key={entry.cap.command}
                    className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                        {entry.cap.command}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {entry.cap.stateKey}
                        {entry.cap.min !== undefined && entry.cap.max !== undefined && ` (${entry.cap.min}~${entry.cap.max}${entry.cap.unit || ""})`}
                        {entry.cap.options && ` [${entry.cap.options.join(", ")}]`}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-muted-foreground mb-1">UI 타입</label>
                        <select
                          value={entry.uiType}
                          onChange={(e) => {
                            setNewCapEntries(prev => prev.map((en, i) =>
                              i === idx ? { ...en, uiType: e.target.value as NewCapEntry["uiType"] } : en
                            ));
                          }}
                          className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-primary focus:outline-none focus:ring-1 focus:ring-ring/40"
                        >
                          <option value="toggle">토글 (Toggle)</option>
                          <option value="slider">슬라이더 (Slider)</option>
                          <option value="select">선택 (Select)</option>
                          <option value="button">버튼 (Button)</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-muted-foreground mb-1">라벨</label>
                        <input
                          type="text"
                          value={entry.label}
                          onChange={(e) => {
                            setNewCapEntries(prev => prev.map((en, i) =>
                              i === idx ? { ...en, label: e.target.value } : en
                            ));
                          }}
                          placeholder="예: 전원, 밝기, 온도"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring/40"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={pendingSubmit}
                  onClick={handleConfirmNewCaps}
                  className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pendingSubmit ? "처리 중..." : "추가 후 등록"}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={pendingSubmit}
                  onClick={handleSkipNewCaps}
                  className="flex-1 rounded-xl border border-border bg-surface py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  건너뛰고 등록
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
